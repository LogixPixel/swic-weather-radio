const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
require('dotenv/config');

var intervalSec = 10;

//import routes
const alertsRoute = require('./routes/alert');
const { getZFP, getRWS } = require('./hourlyProducts');
const { speak } = require('./speak');

//middleware
app.use(express.json());
app.use(cors());
//middleware routes
//app.use('/api/v1/alerts', alertsRoute);

//connect to db
mongoose.connect(process.env.DB_CONNECTION, () => 
    console.log('connected to db')
);

async function test() {
  await getZFP('WXM59')
    .then(res => {
      speak(res);
    })
}

test()

//run web server
app.listen(
    process.env.PORT,
    () => console.log(`alive on  http://localhost:${process.env.PORT}`)
);
