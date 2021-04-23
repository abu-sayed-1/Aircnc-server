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
const stripe = require("stripe")(process.env.DB_STRIPE);
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uj2jz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const homePageData = client.db(process.env.DB_NAME).collection("homePageData");
    const membersAndDate = client.db(process.env.DB_NAME).collection("membersAndDate");
    const roomsInfo = client.db(process.env.DB_NAME).collection("roomsInfo");
    const serviceAndCountryInfo = client.db(process.env.DB_NAME).collection("serviceAndCountryInfo");
    const allPlace = client.db(process.env.DB_NAME).collection("allPlace");
    const signUp = client.db(process.env.DB_NAME).collection("signUp");
    const autocomplete = client.db(process.env.DB_NAME).collection("autocomplete");
    const whoComing = client.db(process.env.DB_NAME).collection("whoComing");
    //#home|| post home pages All data
    app.post('/homePagesAllData', (req, res) => {
        const homeData = req.body;
        console.log(homeData)
        homePageData.insertMany(homeData)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    });

    //#home||get the user-specific destination 
    app.get("/destination:name", (req, res) => {
        const destinationName = req.params.name;
        const convert = destinationName.toLowerCase();
        homePageData.find(
            { "countryAndCity": { $regex: convert } }
        ).limit(1)
            .toArray((err, document) => {
                res.send(document);
            });
    });

    //#home|| post members and startAnd date
    app.post('/membersAndDates', (req, res) => {
        const membersAndDatesData = req.body;
        membersAndDate.insertMany(membersAndDatesData)
            .then(result => {
                res.send(result.insertedCount > 0)
            });

    });
    //#shred || get specific member & date 
    app.get('/gustsAndDates:id', (req, res) => {
        const uniqueId = req.params.id;
        membersAndDate.find({ "id": uniqueId })
            .toArray((err, document) => {
                res.send(document);
            })

    })

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
        const room = req.params.city.toLowerCase();
        roomsInfo.find({ "city": room })
            .toArray((err, document) => {
                res.send(document);
            });
    });

    // #SelectRoom || Type of place
    app.post('/allPlace', (req, res) => {
        allPlace.insertMany(req.body)
            .then(result => res.send(result.insertedCount > 0));
    });

    // #SelectRoom ||specific Type of place
    app.get('/place:name', (req, res) => {
        allPlace.find({ "place": req.params.name })
            .toArray((err, document) => {
                res.send(document);
            });
    });


    app.get('/roomDetail:id', (req, res) => {
        const id = req.params.id;
        roomsInfo.find({
            rooms: { $elemMatch: { id: id } }
        })
            .toArray((err, document) => {
                res.send(document)
            })
    });

    // #RoomDetail || post service And countryInfo
    app.post('/serviceAndCountry', (req, res) => {
        // console.log(req);
        serviceAndCountryInfo.insertMany(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            });
    });

    // #RoomDetail || get specific service And countryInfo
    app.get('/specificCountryInfo:countryName', (req, res) => {
        const country = req.params.countryName;
        // console.log(country);
        serviceAndCountryInfo.find({
            "country": country
        })
            .toArray((err, document) => {
                res.send(document)
            });
    });

    // #WhoComing || post why user coming
    app.post('/WhyComing', (req, res) => {
        console.log(req)
        whoComing.insertOne(req.body)
            .then(result => res.send(result.insertedCount > 0))
    })

    // #SignUp || verify SignUp 
    app.get('/verifySignUp:number', (req, res) => {
        console.log(req.params.number);
        signUp.find({
            "number": req.params.number
        })
            .toArray((err, document) => {
                res.send(document);
            })
    })
    // #SignUp || post SignUp data
    app.post('/signUp', (req, res) => {
        console.log(req)
        signUp.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    });

    // #login || verify Login Number
    app.get('/verifyLoginNumber:number', (req, res) => {
        signUp.find({
            "number": req.params.number
        })
            .toArray((err, document) => {
                res.send(document)
            })
    });

    //#search destination || autocomplete data
    app.post('/autocompleteData', (req, res) => {
        autocomplete.insertMany(req.body)
            .then(result => res.send(result.insertedCount > 0));
    });

    app.get('/autocompleteChange:countryAndCity', (req, res) => {
        const convertData = req.params.countryAndCity.toLowerCase();
        console.log(convertData);
        autocomplete.find({
            "countryAndCity": { $regex: convertData }
        })
            .toArray((err, document) => {
                res.send(document);
            })
    });

});

// stripe payment gateWay==========================>
app.post("/stripe/charge", cors(), async (req, res) => {
    console.log(req)
    let { amount, id } = req.body;
    try {
        const payment = await stripe.paymentIntents.create({
            amount: amount,
            currency: "USD",
            description: "project Name: aircnc",
            payment_method: id,
            confirm: true,
        });
        res.json({
            confirm: "Payment Successful",
            success: true,
        });
    } catch (error) {
        res.json({
            message: error.message,
            success: false,
        });
    }
});

app.get("/", (req, res) => {
    res.send('Hello wold ,node working... ')
})

app.listen(port);