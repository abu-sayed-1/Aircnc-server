const express = require('express'),
    bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const port = 4000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uj2jz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const homePageData = client.db(process.env.DB_NAME).collection("homePageData");
    const membersAndDate = client.db(process.env.DB_NAME).collection("membersAndDate");
    const roomsInfo = client.db(process.env.DB_NAME).collection("roomsInfo");
    //#home|| post home pages All data
    app.post('/homePagesAllData', (req, res) => {
        const homeData = req.body;
        homePageData.insertMany(homeData)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    //#home||get the user-specific destination 
    app.get("/destination:name", (req, res) => {
        const destinationName = req.params.name;
        const convert = destinationName.toLowerCase();
        homePageData.find(
            { "name": { $regex: convert } }
        ).limit(1)
            .toArray((err, document) => {
                res.send(document);
            });
    });

    //#home|| post members and startAnd date
    app.post('/membersAndDates', (req, res) => {
        const membersAndDatesData = req.body;
        console.log(membersAndDatesData)
        membersAndDate.insertOne(membersAndDatesData)
            .then(result => {
                res.send(result.insertedCount > 0)
            });

    });
    // #SelectRoom|| post Rooms Info 
    app.post('/roomsInfo', (req, res) => {
        const rooms = req.body;
        roomsInfo.insertMany(rooms)
            .then(result => {
                res.send(result.insertedCount > 0)
            });
    });

    // #SelectRoom|| get Room specific data
    app.get('/roomsByData:city', (req, res) => {
        const room = req.params.city;
        roomsInfo.find({ "city": room })
            .toArray((err, document) => {
                res.send(document);
            })
    })


});

app.get("/", (req, res) => {
    res.send('Hello wold ,node working... ')
})

app.listen(port);