const express = require('express'),
// const bodyParser = require('body-parser');
const cors = require('cors');
// const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const app = express();
const port = 4000;
app.use(cors());
// app.use(bodyParser.json);


app.get("/", (req, res) => {
    res.send('hello wold...')
})





app.listen(port);