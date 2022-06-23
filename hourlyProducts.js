const axios = require('axios');
const { json } = require('express/lib/response');
const Stations = require('./models/Stations');

async function getZFP(station) {
  const stationdb = await Stations.findOne({sid: station});
  var returnproduct = '';

  for (i = 0; i < stationdb.zfp.length; i++) {
    returnproduct = returnproduct + stationdb.zfp[i].intro + '\n\n';
    await axios.get('https://tgftp.nws.noaa.gov/data/forecasts/zone/' + stationdb.zfp[i].state + '/' + stationdb.zfp[i].zone + '.txt')
    .then(res => {
      product = res.data;
      product = product.split(/20..\n\n/)[2];
      product = product.split('$$\n\n')[0];
      returnproduct = returnproduct + product;
    })
    .catch(error => {
      console.log(error);
    })
  }
  return returnproduct;
}

async function getRWS(station) {
  const stationdb = await Stations.findOne({sid: station});

  axios.get('https://tgftp.nws.noaa.gov/data/raw/aw/awus81.kctp.rws.ctp.txt')
    .then(res => {
      product = res.data;
      product = product.split(/20..\n\n/)[1];
      product = product.split('$$\n\n')[0];
      console.log(product);
      return product;
    })
    .catch(error => {
      console.log(error);
      return '';
    })
}

module.exports = { getZFP, getRWS };
