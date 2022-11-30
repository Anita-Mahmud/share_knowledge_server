const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();

//middleware
app.use(express.json());
app.use(cors());

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

      //categoris
      app.get('/categories',async(req,res)=>{
        const query = {};
        const categories = await categoriesCollection.find(query).toArray();
        res.send(categories)
      });
      app.get('/category/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {cat_id:id};
        const categories = await productsCollection.find(query).toArray();
        res.send(categories)
      });
     //users
     app.get('/users',async(req,res)=>{
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users)
    });
     app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
  });
    //booking
    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
  });
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