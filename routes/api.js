'use strict';


let mongodb = require('mongodb')
let mongoose = require('mongoose')
var expect = require('chai').expect;

var pw = 'M0ngoDB'

module.exports = function (app) {

  let uri = 'mongodb+srv://joshuahawi24:' + pw + '@w3-tutorial.q90bo.mongodb.net/?retryWrites=true&w=majority&appName=W3-Tutorial'
	mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })

  let stockSchema = new mongoose.Schema({
    name: {type: String, required: true},
    likes: {type: Number, default: 0},
    ips: [String]
  })
  let Stock = mongoose.model('Stock', stockSchema)

  app.route('/api/stock-prices')
    .get(function (req, res){
      
    });
    
};
