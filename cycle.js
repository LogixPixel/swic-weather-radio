fs = require('fs');
const { getZFP, getRWS, getOBS, getHWO, getSID, getTME } = require('./hourlyProducts');
const { getNWSAlerts } = require('./nwsAlerts');
const { speak } = require('./speak');

async function cycle() {
  fs.writeFile('readSID.txt', await getSID('WXM59'), function (err) {if (err) return console.log(err)});
  await speak('readSID.txt');
  fs.writeFile('readTME.txt', await getTME('WXM59'), function (err) {if (err) return console.log(err)});
  await speak('readTME.txt');
  fs.writeFile('readNWSAlerts.txt', await getNWSAlerts('WXM59'), function (err) {if (err) return console.log(err)});
  await speak('readNWSAlerts.txt');
  fs.writeFile('readHWO.txt', await getHWO('WXM59'), function (err) {if (err) return console.log(err)});
  await speak('readHWO.txt');
  fs.writeFile('readRWS.txt', await getRWS('WXM59'), function (err) {if (err) return console.log(err)});
  await speak('readRWS.txt');
  fs.writeFile('readOBS.txt', await getOBS('WXM59'), function (err) {if (err) return console.log(err)});
  await speak('readOBS.txt');
  fs.writeFile('readZFP.txt', await getZFP('WXM59'), function (err) {if (err) return console.log(err)});
  await speak('readZFP.txt');
}

module.exports = { cycle };
