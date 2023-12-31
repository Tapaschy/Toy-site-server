const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json())






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.y4h6mjt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const toyscollection = client.db('disneytoys').collection('toys');


        app.post('/toys', async (req, res) => {
            const body = req.body;
            const result = await toyscollection.insertOne(body);
            console.log(result)
            res.send(result)
        })

        app.get('/toys', async (req, res) => {
          const limit = 20;
          const sort = { length: -1 };
            const result = await toyscollection.find().sort(sort).limit(limit).toArray();
            res.send(result)
        })
        // get my toys
        app.get('/mytoys/:email', async (req, res) => {
            const result = await toyscollection.find({ email: req.params.email }).toArray();
            res.send(result)
        })

        // sorting by asencing and decending
        app.get('/mytoys/:email/data', async (req, res) => {
            try {
                const { sortOrder } = req.query;
                console.log(sortOrder);
            
                let sortOptions;
                if (sortOrder === 'asc') {
                  sortOptions = { price: 1 };
                } else if (sortOrder === 'desc') {
                  sortOptions = { price: -1 };
                }
            
                const data = await toyscollection.find({ email: req.params.email }).sort(sortOptions).toArray();
                res.send(data);
              } catch (error) {
                console.log('Error fetching data:', error);
                res.status(500).json({ error: 'Internal Server Error' });
              }
        })

        // for update data
        app.put("/toys/:id", async (req, res) => {
          const id = req.params.id;
          const filter = { _id: new ObjectId(id) };
            const body = req.body;
            console.log(body);
            
            const updateDoc = {
              $set: {
                price: body.price,
                quantity: body.quantity,
                description: body.description,
              },
            };
            const result = await toyscollection.updateOne(filter, updateDoc);
            res.send(result);
          });

        //   for delete
        app.delete('/toys/:id', async (req, res) => {
          const id = req.params.id;
          const filter = { _id: new ObjectId(id) };
            const result = await toyscollection.deleteOne(filter);
            res.send(result);
        })




        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Disney toy running")
})

app.listen(port, () => {
    console.log(`server running on port,${port}`)
})