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

      let responseObject = {}
      responseObject['stockData'] = {}

		  // Variable to determine number of stocks
      let twoStocks = false
  
      /* Output Response */
      let outputResponse = () => {
         return res.json(responseObject)
     }
    
      /* Find/Update Stock Document */
      let findOrUpdateStock = (stockName, documentUpdate, nextStep) => {
      
      }
    
      /* Like Stock */
      let likeStock = (stockName, nextStep) => {
      
      }
    
      /* Get Price */
      let getPrice = (stockDocument, nextStep) => {
      
     }
    
      /* Build Response for 1 Stock */
      let processOneStock = (stockDocument, nextStep) => {
      
     }
    
     let stocks = []        
      /* Build Response for 2 Stocks */
      let processTwoStocks = (stockDocument, nextStep) => {
      
     }

		  /* Process Input*/  
      if(typeof (req.query.stock) === 'string'){
       /* One Stock */


     } else if (Array.isArray(req.query.stock)){
		  	twoStocks = true
       /* Stock 1 */


       /* Stock 2 */


     }
});
    
};
