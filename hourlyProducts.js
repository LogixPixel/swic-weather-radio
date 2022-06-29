const axios = require('axios');
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
      product = product.split('$$')[0];
      product = product.replace(/\n\./g, ' ');
      product = product.replace(/\.\.\./g, ', ');
      product = product.replace(/\n/g, ' ');
      returnproduct = returnproduct + product;
    })
    .catch(error => {
      console.log(error);
    })
  }
  returnproduct = returnproduct + '\n<vtml_pause time="2000"/>\n\n';
  return returnproduct;
}

async function getOBS(station) {
  const stationdb = await Stations.findOne({sid: station});
  var returnproduct = 'And now for some local conditions. ';

  for (i = 0; i < stationdb.zfp.length; i++) {
    await axios.get('https://tgftp.nws.noaa.gov/data/observations/state_roundup/' + stationdb.zfp[i].state + '/' + stationdb.zfp[i].zone + '.txt')
    .then(res => {
      product = res.data;
      product = product.split(/\n/g).filter(s => s.includes(stationdb.obs[i].toUpperCase()) && !s.includes('NATIONAL WEATHER SERVICE'))[0];
      cond = product.substring(14, 23).replace(' ', '').replace('CLOUDY', 'it was Cloudy').replace('MOCLDY', 'it was Mostly Cloudy').replace('PTCLDY', 'it was Partly Cloudy').replace('PTSUNNY', 'it was Partly Sunny').replace('MOSUNNY', 'it was Mostly Sunny').replace('CLEAR', 'it was Clear').replace('FAIR', 'it was Fair').replace('FOG', 'Fog, <vtml_pause time="0"/> was reported');
      temp = product.substring(25, 29).replace(' ', '');
      dp = product.substring(29, 32).replace(' ', '');
      rh = product.substring(32, 35).replace(' ', '');
      wind = product.substring(35, 43).replace(' VRB', 'Variable at ').replace(' NE', 'Northeast, at ').replace(' SE', 'Southeast, at ').replace(' SW', 'Southwest, at ').replace(' NW', 'Northwest, at ').replace(' E', 'East, at ').replace(' N', 'North, at ').replace(' W', 'West, at ').replace(' S', 'South, at ').replace('G', ' Miles per hour Gusting to ');
      if (wind == 'CALM') {
        wind = 'calm';
      } else {
        wind = wind + ' Miles per hour'
      }
      pres = product.substring(43, 53).replace(' ', '').replace('F', ' inches and Falling.').replace('R', ' inches and Rising.').replace('S', ' inches and steady.')
      observation = 'At ' + stationdb.obs[i] + ', ' + cond + '. The temperature was ' + temp + 'degrees, dewpoint ' + dp + ', and the relative humidity ' + rh + ' percent. The wind was ' + wind + '. The pressure was ' + pres;
      if (cond == 'NOT AVBL') {
        observation = 'At ' + stationdb.obs[i] + ', the report was not available'
      }
      returnproduct = returnproduct + observation;
    })
    .catch(error => {
      console.log(error);
    })
  }

  await axios.get('https://tgftp.nws.noaa.gov/data/observations/state_roundup/' + stationdb.zfp[0].state + '/' + stationdb.zfp[0].zone + '.txt')
    .then(res => {
      product = res.data;
      product = product.split(/\n  \n/g)[1].split('\n$$')[0].split('\n').filter(s => !s.includes('SKY/WX'));
      otherlocs = 'And now for some other conditions. ';
      for (i = 0; i < product.length; i++) {
        otherlocs = otherlocs + product[i].substring(0, 14) + ' ' + product[i].substring(14, 23).replace('  ', ' ').replace('NOT AVBL', 'The report was not available').replace('MOCLDY', 'Mostly Cloudy').replace('PTCLDY', 'Partly Cloudy').replace('PTSUNNY', 'Partly Sunny').replace('MOSUNNY', 'Mostly Sunny').replace('CLEAR', 'Clear').replace('FAIR', 'Fair').replace('FOG', 'Fog') + ' ' + product[i].substring(25, 29) + ', ';
      }
      returnproduct = returnproduct + otherlocs;
    })
    .catch(error => {
      console.log(error);
    })
  returnproduct = returnproduct + '\n<vtml_pause time="2000"/>\n\n';
  return returnproduct;
}

async function getRWS(station) {
  const stationdb = await Stations.findOne({sid: station});
  var returnproduct = '';

  await axios.get('https://tgftp.nws.noaa.gov/data/raw/aw/awus81.kctp.rws.ctp.txt')
    .then(res => {
      product = res.data;
      product = product.split(/20..\n\n/).filter(s => !s.includes('Regional Weather Summary'))[(product.split(/20..\n\n/).filter(s => !s.includes('Regional Weather Summary')).length - 1)];
      product = product.split('$$')[0];
      product = product.replace(/\n/g, ' ');
      returnproduct = product;
    })
    .catch(error => {
      console.log(error);
      return '';
    })
  returnproduct = returnproduct + '\n<vtml_pause time="2000"/>\n\n';
  
  return returnproduct;
}

async function getHWO(station) {
  const stationdb = await Stations.findOne({sid: station});
  var returnproduct = '';

  await axios.get('https://api.weather.gov/products?office=' + stationdb.office + '&wmoid=FLUS41')
    .then(async res => {
      await axios.get(res.data['@graph'][0]['@id'])
        .then(res => {
          product = res.data.productText.split('$$');

          for (i = 0; i < product.length; i++) {
            var hwoIntro = '';
            var zz = [];

            for (a = 0; a < stationdb.locs.length; a++) {
              if (product[i].includes(stationdb.locs[a].county + '-') && (a < stationdb.locs.length )) {
                zz.push(stationdb.locs[a].county)
              }
            }

            if (zz.length == 1) {
              hwoIntro = 'Heres the hazardous weather outlook, for the following county. ' + zz[0] + '.\n\n';
            } else if (zz.length == 0) {

            } else if (zz.length > 1) {
              hwoIntro = 'Heres the hazardous weather outlook, for the following counties. ';

              for (a = 0; a < zz.length; a++) {
                if (a < (zz.length - 1)) {
                  hwoIntro = hwoIntro + zz[a] + ', '
                } else {
                  hwoIntro = hwoIntro + 'and ' + zz[a] + '.\n\n'
                }
              }
            }

            var hwoText = product[i].split(/20..\n\n/)[(product[i].split(/20..\n\n/).length - 1)].replace(/This Hazardous Weather Outlook is for .*\n\n/g, '');
            if (hwoIntro != '') {
              returnproduct = returnproduct + hwoIntro + hwoText;
              
            }
          }
        })
        .catch(error => {
          console.log(error);
        })
    })
    .catch(error => {
      console.log(error);
    })
  returnproduct = returnproduct + '\n<vtml_pause time="2000"/>\n\n';

  return returnproduct.replace(/\n/g, ' ').replace(/\.\.\./g, ', ') + '\n\n';
}

async function getSID(station) {
  const stationdb = await Stations.findOne({sid: station});
  
  return stationdb.intro + '\n<vtml_pause time="2000"/>\n\n';
}

async function getTME(station) {
  const stationdb = await Stations.findOne({sid: station});
  let date = new Date();
  let hour = date.getHours();
  let min = date.getMinutes();
  let ampm = 'AM';
  if (hour > 12) {
    hour = hour - 12;
    ampm = 'PM';
  }
  if (min < 10) {
    min = 'oh ' + min;
  }
  return 'The current time is ' + hour  + ' ' + min + ' ' + ampm + '. \n<vtml_pause time="2000"/>\n\n';
}

module.exports = { getZFP, getRWS, getOBS, getHWO, getSID, getTME };
