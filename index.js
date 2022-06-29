const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
require('dotenv/config');

var intervalSec = 10;

//import routes
const alertsRoute = require('./routes/alert');
const { getZFP, getRWS, getOBS, getHWO, getSID, getTME } = require('./hourlyProducts');
const { getNWSAlerts } = require('./nwsAlerts');
const { speak } = require('./speak');
const { cycle } = require('./cycle');

//middleware
app.use(express.json());
app.use(cors());
//middleware routes
//app.use('/api/v1/alerts', alertsRoute);

//connect to db
mongoose.connect(process.env.DB_CONNECTION, () => 
    console.log('connected to db')
);

cycle();

//run web server
app.listen(
    process.env.PORT,
    () => console.log(`alive on  http://localhost:${process.env.PORT}`)
);
