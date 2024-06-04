const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')


const port = process.env.PORT || 5000

// middleware
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6irp4bx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

async function run() {
  try {
    // auth related app
    const districtCollection = client.db('Diagnostic').collection('district')
    const upazilaCollection = client.db('Diagnostic').collection('upazila')
    const usersCollection = client.db('Diagnostic').collection('users')
    const bannerCollection = client.db('Diagnostic').collection('banner')
    const personalizedCollection = client.db('Diagnostic').collection('personalized')
    const testCollection = client.db('Diagnostic').collection('all-test')
    const paymentCollection = client.db('Diagnostic').collection('payment')



    app.get('/district', async (req, res) => {
      const result = await districtCollection.find().toArray()
      res.send(result)
    })
    app.get('/upazila', async (req, res) => {
      const result = await upazilaCollection.find().toArray()
      res.send(result)
    })

    // users create
    app.post('/users', async (req, res) => {
      const userData = req.body
      const result = await usersCollection.insertOne(userData)
      res.send(result)
    })



    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray()
      res.send(result)
    })



    app.put('/users/:email', async (req, res) => {
      const item = req.body
      const email = req.params.email
      console.log('item',item)
      // const filter = { _id: new ObjectId(id) }
      const filter = {email: email}
      console.log('filter',filter)
      const updateDoc = {
        $set: {
          ...item
        }
      }
      const result = await usersCollection.updateOne(filter, updateDoc)
      res.send(result)
    })



    app.get('/user/:email', async (req, res) => {
      const email = req.params.email
      const result = await usersCollection.findOne({ email })
      res.send(result)
    })


    app.get('/banner', async (req, res) => {
      const result = await bannerCollection.find().toArray()
      res.send(result)
    })


    // admin



    app.get('/admin/:email', async (req, res) => {
      const email = req.params.email;

      // if (email !== req.decoded.email) {
      //   return res.status(403).send({ message: 'forbidden access' })
      // }

      const query = { email: email };
      const user = await usersCollection.findOne(query);
      // console.log(user)
      let admin = false;
      if (user) {
        // console.log('called')
        admin = user?.role == 'admin';
      }
      // console.log(admin)
      res.send({ admin })

    })


    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await usersCollection.updateOne(filter, updateDoc)
      res.send(result)

    })


    app.post('/addBanner', async (req, res) => {
      const bannerData = req.body
      const result = await bannerCollection.insertOne(bannerData)
      res.send(result)
    })


    app.patch('/banners/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          isActive: req.body.isActive
        }
      }
      // console.log(updateDoc)
      const result = await bannerCollection.updateOne(filter, updateDoc)
      res.send(result)

    })

    app.get('/bannerDisplay', async (req, res) => {
      const result = await bannerCollection.find().toArray()
      res.send(result)
    })


    app.get('/personalized', async (req, res) => {
      const result = await personalizedCollection.find().toArray()
      res.send(result)
    })


    app.get('/all-tests', async (req, res) => {
      const result = await testCollection.find().toArray()
      res.send(result)
    })


    app.get('/all-test', async (req, res) => {
      const filter = req.query;
      // console.log('filter', filter)
      const today = new Date()
      const date = { date:  { $gte: today } }
      console.log('date',date)
      const query = {
        date: { $regex: filter.search, $options: 'i' },
      };
      // console.log(query)
      const result = await testCollection.find(query ,date).toArray()
      res.send(result)
    })



    app.post('/allTest', async (req, res) => {
      const testData = req.body
      const result = await testCollection.insertOne(testData)
      res.send(result)
    })



    

    app.delete('/all-test/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await testCollection.deleteOne(query)
      res.send(result)
    })


    app.put('/allTests/:id', async (req, res) => {
      const item = req.body
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          ...item
        }
      }
      const result = await testCollection.updateOne(filter, updateDoc)
      res.send(result)
    })

    app.get('/all-tests/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await testCollection.findOne(query)
      res.send(result)
    })


    app.get('/test-features', async (req, res) => {
      const result = await testCollection.find().sort({count: -1}).toArray()
     
      res.send(result)
    }) 



    app.get('/details/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await testCollection.findOne(query)
      res.send(result)
    })

    app.get('/payment/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await testCollection.findOne(query)
      res.send(result)
    })





    // payment api
    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: parseInt(price) * 100,
        currency: "usd",
        payment_method_types: [
          "card"
        ],
      });
      console.log(paymentIntent)
      res.send({ clientSecret: paymentIntent.client_secret });
    });




    app.post('/booked-payment', async (req, res) => {
      const data = req.body
      const result = await paymentCollection.insertOne(data)
      res.send({ result, message: 'payment success' });
      // res.send(result)
    })





    // user
    app.get('/appoint/:email', async (req, res) => {
      const email = req.params.email
      const today = new Date()
      const date = { date:  { $gte: today } }
      const query = {email:email}
      const result = await paymentCollection.find(query, date).toArray()
      res.send(result)

    })



    app.delete('/appoints/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await paymentCollection.deleteOne(query)
      res.send(result)
    })

    app.patch('/reduceQuantity/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await testCollection.updateOne(query, {
        $inc: { slots: -1 }
      })
      res.send(result)
    })

    app.patch('/increment/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await testCollection.updateOne(query, {
        $inc: { count: 1 } 
      })
      res.send(result)
    })

    app.get('/reservation', async (req, res) => {
      const result = await paymentCollection.find().toArray()
      res.send(result)
    }) 

    app.patch('/update-status/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await paymentCollection.updateOne(query, {
        $set:{
          report:'Delivered'
        }
      })
      res.send(result)
    })


    





    // Send a ping to confirm a successful connection
    // await client.db('admin').command({ ping: 1 })
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Hello from My Server..')
})

app.listen(port, () => {
  console.log(`My server is running on port ${port}`)
})