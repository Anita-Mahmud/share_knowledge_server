const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();
const jwt = require('jsonwebtoken');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();

//middleware
app.use(express.json());
app.use(cors());

//jwt
// function verifyJWT(req, res, next) {

//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//       return res.status(401).send('Unauthorized Access');
//   }

//   const token = authHeader.split(' ')[1];

//   jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
//       if (err) {
//           return res.status(403).send({ message: 'Forbidden Access' })
//       }
//       req.decoded = decoded;
//       next();
//   })

// }

//mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qspwkqa.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//db
async function run() {
    try {
      const db = client.db("shareKnowledge");
      const categoriesCollection = db.collection("categories");
      const productsCollection = db.collection("products");
      const usersCollection = db.collection("users");
      const bookingsCollection = db.collection("bookings");
      const paymentsCollection = db.collection('payments');

      //categoris
      app.get('/categories',async(req,res)=>{
        const query = {};
        const categories = await categoriesCollection.find(query).toArray();
        res.send(categories)
      });
      app.get('/category/:id',async(req,res)=>{
        const cat_name = req.params.id;
        const query = {cat_name};
        const categories = await productsCollection.find(query).toArray();
        res.send(categories)
      });
     //users
     app.get('/users',async(req,res)=>{
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users)
    });
    //all sellers
    app.get('/users/sellers',async(req,res)=>{
      const query = {role: 'Seller'};
      const sellers = await usersCollection.find(query).toArray();
      res.send(sellers)
    });
    //all buyers
    app.get('/users/buyers',async(req,res)=>{
      const query = {role: 'Buyer'};
      const buyers = await usersCollection.find(query).toArray();
      res.send(buyers)
    });
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(filter);
      res.send(result);
  })
    //admin
    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === 'admin' });
  })
  //seller
  app.get('/users/seller/:email', async (req, res) => {
    const email = req.params.email;
    const query = { email }
    const user = await usersCollection.findOne(query);
    res.send({ isSeller: user?.role === 'Seller' });
})
     app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
  });
    //booking
    app.post('/bookings',async (req, res) => {
      const booking = req.body;
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
  });
  app.get('/bookings/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const booking = await bookingsCollection.findOne(query);
    res.send(booking);
})
  app.get('/bookings', async (req, res) => {
    const email = req.query.email;
    const query = { user_email: email };
    const bookings = await bookingsCollection.find(query).toArray();
    res.send(bookings);
});
// app.get('/jwt', async (req, res) => {
//   const email = req.query.email;
//   const query = { email: email };
//   const user = await usersCollection.findOne(query);
//   if (user) {
//       const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '10h' })
//       return res.send({ accessToken: token });
//   }
//   res.status(403).send({ accessToken: '' })
// });

app.get('/allproducts',async(req,res)=>{
  const query = {};
  const products = await productsCollection.find(query).toArray();
  res.send(products)
});
app.get('/report',async(req,res)=>{
  const query = {report:'reported'};
  const buyers = await productsCollection.find(query).toArray();
  res.send(buyers)
});
app.get('/products', async (req, res) => {
  const name = req.query.name;
  const query = { seller_name: name  };
  const user = await productsCollection.find(query).toArray();
  res.send(user);
})
app.post('/products', async (req, res) => {
  const products = req.body;
  const result = await productsCollection.insertOne(products);
  res.send(result);
});
app.delete('/products/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: ObjectId(id) };
  const result = await productsCollection.deleteOne(filter);
  res.send(result);
})
app.put('/users/:email', async (req, res) => {
  const email = req.params.email;
  // console.log(email);
  const filter = { email }
  const options = { upsert: true };
  const updatedDoc = {
      $set: {
        verified: 'verified'
      }
  }
  
  const result = await usersCollection.updateOne(filter, updatedDoc, options);
  const updateProDoc = {
    $set: {
      verified: 'verified'
    }
}
const proFilter = {seller_email:email}
const updatedResult = await productsCollection.updateOne(proFilter, updateProDoc)
  res.send(result);
});

app.put('/products/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: ObjectId(id) }
  const options = { upsert: true };
  const updatedDoc = {
      $set: {
        report: 'reported'
      }
  }
  const result = await productsCollection.updateOne(filter, updatedDoc, options);
  res.send(result);
});
app.put('/allproducts/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: ObjectId(id) }
  const options = { upsert: true };
  const updatedDoc = {
      $set: {
        advertise: 'advertise'
      }
  }
  const result = await productsCollection.updateOne(filter, updatedDoc, options);
  res.send(result);
});
app.get('/advertise',async(req,res)=>{
  const query = {advertise:'advertise'};
  const buyers = await productsCollection.find(query).toArray();
  res.send(buyers)
});
app.post('/create-payment-intent', async (req, res) => {
  const booking = req.body;
  const price = booking.price;
  const amount = price * 100;

  const paymentIntent = await stripe.paymentIntents.create({
      currency: 'usd',
      amount: amount,
      "payment_method_types": [
          "card"
      ]
  });
  res.send({
      clientSecret: paymentIntent.client_secret,
  });
});

app.post('/payments', async (req, res) =>{
  const payment = req.body;
  const result = await paymentsCollection.insertOne(payment);
  const id = payment.bookingId
  const filter = {_id: ObjectId(id)}
  const updatedDoc = {
      $set: {
          paid: true,
          transactionId: payment.transactionId
      }
  }
  const updatedResult = await bookingsCollection.updateOne(filter, updatedDoc)
  const pro_id = payment.product_id;
  const profilter = {_id: ObjectId(pro_id)};
  const updatedProDoc = {
    $set: {
        paid: true,
        transactionId: payment.transactionId
    }
}
const updatedProResult = await productsCollection.updateOne(profilter, updatedProDoc)
  res.send(result);
})

    } finally {
      
    }
  }
  run().catch(console.dir);

app.get('/',async(req,res)=>{
    res.send('Share Knowledge Server is running' );
});
app.listen(port,()=>{
    console.log(`Share Knowledge Server is running on port ${port}` );
})