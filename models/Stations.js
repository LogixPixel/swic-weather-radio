const mongoose = require('mongoose');

const StationsSchema = mongoose.Schema({
  sid: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  locs: {
    type: Array,
    required: true
  },
  tones: {
    type: Array,
    required: true
  },
  obs: {
    type: Array,
    required: true
  },
  zfp: {
    type: Array,
    required: true
  },
  cycle: {
    type: Array,
    required: true
  }
})

module.exports = mongoose.model('Stations', StationsSchema);
