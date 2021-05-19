const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  city1: {
    type: String,
    required: false
  }
});

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;
