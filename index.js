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

    //#home page || post home pages All data
    app.post('/homePagesAllData', (req, res) => {
        homePageData.insertMany(req.body)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    });

    //#home page||get the user-specific destination 
    app.get("/destination:name", (req, res) => {
        const destinationName = req.params.name.toLowerCase();
        homePageData.find(
            { "countryAndCity": { $regex: destinationName } }
        ).limit(1)
            .toArray((err, document) => {
                res.send(document);
            });
    });

    //#home page || post members and date
    app.post('/membersAndDates', (req, res) => {
        membersAndDate.insertMany(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            });
    });

    //#shred > DivisionNavbar page || get specific member & date 
    app.get('/gustsAndDates:id', (req, res) => {
        membersAndDate.find({ "id": req.params.id })
            .toArray((err, document) => {
                res.send(document);
            })

    })

    // #SelectRoom page || post Rooms Info 
    app.post('/roomsInfo', (req, res) => {
        roomsInfo.insertMany(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            });
    });

    // #SelectRoom page || get Room specific data
    app.get('/roomsByData:city', (req, res) => {
        const room = req.params.city.toLowerCase();
        roomsInfo.find({ "city": room })
            .toArray((err, document) => {
                res.send(document);
            });
    });

    // #SelectRoom page || Type of place
    app.post('/allPlace', (req, res) => {
        allPlace.insertMany(req.body)
            .then(result => res.send(result.insertedCount > 0));
    });

    // #SelectRoom page || specific Type of place
    app.get('/place:name', (req, res) => {
        allPlace.find({ "place": req.params.name })
            .toArray((err, document) => {
                res.send(document);
            });
    });

    //#roomDetail page || get specific room Detail
    app.get('/roomDetail:id', (req, res) => {
        roomsInfo.find({
            rooms: { $elemMatch: { id: req.params.id } }
        })
            .toArray((err, document) => {
                res.send(document)
            })
    });

    // #RoomDetail page || post service And countryInfo
    app.post('/serviceAndCountry', (req, res) => {
        serviceAndCountryInfo.insertMany(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            });
    });

    // #RoomDetail page || get specific service And countryInfo
    app.get('/specificCountryInfo:countryName', (req, res) => {
        serviceAndCountryInfo.find({
            "country": req.params.countryName
        })
            .toArray((err, document) => {
                res.send(document)
            });
    });

    // #WhoComing page || post why user coming
    app.post('/WhyComing', (req, res) => {
        whoComing.insertOne(req.body)
            .then(result => res.send(result.insertedCount > 0))
    })

    // #SignUp page || verify SignUp 
    app.get('/verifySignUp:number', (req, res) => {
        signUp.find({
            "number": req.params.number
        })
            .toArray((err, document) => {
                res.send(document);
            })
    })

    // #SignUp page || post SignUp data
    app.post('/signUp', (req, res) => {
        signUp.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0);
            });
    });

    // #login page || verify Login Number
    app.get('/verifyLoginNumber:number', (req, res) => {
        signUp.find({
            "number": req.params.number
        })
            .toArray((err, document) => {
                res.send(document)
            })
    });

    //#SearchDestination page || post autocomplete data
    app.post('/autocompleteData', (req, res) => {
        autocomplete.insertMany(req.body)
            .then(result => res.send(result.insertedCount > 0));
    });

    //#SearchDestination page || get autocomplete info
    app.get('/autocomplete/info:countryAndCity', (req, res) => {
        const convertData = req.params.countryAndCity.toLowerCase();
        autocomplete.find({
            "countryAndCity": { $regex: convertData }
        })
            .toArray((err, document) => {
                res.send(document);
            });
    });
});

// stripe payment gateWay==========================>
app.post("/stripe/charge", cors(), async (req, res) => {
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