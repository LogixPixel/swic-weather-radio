const axios = require('axios');
const Stations = require('./models/Stations');

async function getNWSAlerts(station) {
  const stationdb = await Stations.findOne({sid: station});
  var returnproduct = '';
  var appendZoneLocs = '';

  for (i = 0; i < stationdb.locs.length; i++) {
    if (i < (stationdb.locs.length - 1)) {
      appendZoneLocs = appendZoneLocs + stationdb.locs[i].zone + ',' + stationdb.locs[i].czone + ',';
    } else {
      appendZoneLocs = appendZoneLocs + stationdb.locs[i].zone + ',' + stationdb.locs[i].czone;
    }
  }

  await axios.get('https://api.weather.gov/alerts?zone=' + appendZoneLocs + '&limit=3')
    .then(async res => {
      for (i = 0; i < res.data.features.length; i++) {
        if (res.data.features[i].properties.parameters.NWSheadline != null) {
          for (a = 0; a < res.data.features[i].properties.parameters.NWSheadline.length; a++) {
            product = res.data.features[i].properties.parameters.NWSheadline[a] + '. ';
          }
        }
        product = product + res.data.features[i].properties.description + ' ';
        product = product + res.data.features[i].properties.instruction + ' ';
        product = product.replace(/\n/g, ' ');
        returnproduct = returnproduct + product + '\n<vtml_pause time="2000"/>\n\n';
      }
    })
    .catch(error => {
      console.log(error);
    })

  return returnproduct.replace(/\.\.\./g, ', ') + '\n\n';
}

module.exports = { getNWSAlerts };
