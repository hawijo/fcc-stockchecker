'use strict';


let mongodb = require('mongodb')
let mongoose = require('mongoose')
var expect = require('chai').expect;
let XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest

var pw = 'M0ngoDB123'

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
     let findOrUpdateStock = async (stockName, documentUpdate, nextStep) => {
      try {
          let stockDocument = await Stock.findOneAndUpdate(
              { name: stockName },
              documentUpdate,
              { new: true, upsert: true }
          );
  
          if (stockDocument) {
              if (twoStocks === false) {
                  return nextStep(stockDocument, processOneStock);
              }
          }
      } catch (error) {
          console.error(error);
      }
  };
  
    
      /* Like Stock */
      let likeStock = (stockName, nextStep) => {
      
      }
    
      /* Get Price */
      let getPrice = (stockDocument, nextStep) => {
        let xhr = new XMLHttpRequest()
        let requestUrl = 'https://stock-price-checker-proxy--freecodecamp.repl.co/v1/stock/' + stockDocument['name'] + '/quote'
        xhr.open('GET', requestUrl, true)
        xhr.onload = () => {
            let apiResponse = JSON.parse(xhr.responseText)
            stockDocument['price'] = apiResponse['latestPrice'].toFixed(2)
            nextStep(stockDocument, outputResponse)
        }
        xhr.send()
}
    
      /* Build Response for 1 Stock */
      let processOneStock = (stockDocument, nextStep) => {
        responseObject['stockData']['stock'] = stockDocument['name']
        responseObject['stockData']['price'] = stockDocument['price']
        responseObject['stockData']['likes'] = stockDocument['likes']
        nextStep()          
      }
    
     let stocks = []        
      /* Build Response for 2 Stocks */
      let processTwoStocks = (stockDocument, nextStep) => {
      
     }

		 /* Process Input */
    if(typeof (req.query.stock) === 'string'){
      /* One Stock */
      let stockName = req.query.stock
    
      let documentUpdate = {}
      findOrUpdateStock(stockName, documentUpdate, getPrice)
    
  


     } else if (Array.isArray(req.query.stock)){
		  	twoStocks = true
       /* Stock 1 */


       /* Stock 2 */


     }
});
    
};
