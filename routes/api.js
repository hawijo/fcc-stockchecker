'use strict';

const mongoose = require('mongoose');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)); // Fix for Node < 18

var pw = 'M0ngoDB123';

module.exports = function (app) {
  let uri = `mongodb+srv://joshuahawi24:${process.env.PW}@w3-tutorial.q90bo.mongodb.net/?retryWrites=true&w=majority&appName=W3-Tutorial`;
  
  // Removed deprecated options
  mongoose.connect(uri);

  let stockSchema = new mongoose.Schema({
    name: { type: String, required: true },
    likes: { type: Number, default: 0 },
    ips: [String],
  });

  let Stock = mongoose.model('Stock', stockSchema);

  app.route('/api/stock-prices').get(async function (req, res) {
    let responseObject = { stockData: [] };
    let twoStocks = false;

    /* Output Response */
    let outputResponse = () => res.json(responseObject);

    /* Find/Update Stock Document */
    let findOrUpdateStock = async (stockName, documentUpdate) => {
      try {
        let stockDocument = await Stock.findOneAndUpdate(
          { name: stockName },
          documentUpdate,
          { new: true, upsert: true }
        );
        return stockDocument;
      } catch (error) {
        console.error(error);
        return null;
      }
    };

    /* Get Price */
    let getPrice = async (stockName) => {
      try {
        let requestUrl = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockName}/quote`;
        let response = await fetch(requestUrl);
        let apiResponse = await response.json();
        return apiResponse.latestPrice ? apiResponse.latestPrice.toFixed(2) : null;
      } catch (error) {
        console.error('Error fetching stock price:', error);
        return null;
      }
    };

    /* Process Single Stock */
    let processOneStock = async (stockName) => {
      let documentUpdate = {};
      let stockDocument = await findOrUpdateStock(stockName, documentUpdate);
      if (!stockDocument) return res.json({ error: 'Stock not found' });

      let stockPrice = await getPrice(stockName);
      if (!stockPrice) return res.json({ error: 'Stock price not found' });

      responseObject.stockData = {
        stock: stockDocument.name,
        price: stockPrice,
        likes: stockDocument.likes,
      };

      outputResponse();
    };

    /* Process Two Stocks */
    let processTwoStocks = async (stockNames) => {
      let stocksData = [];

      for (let stockName of stockNames) {
        let documentUpdate = {};
        let stockDocument = await findOrUpdateStock(stockName, documentUpdate);
        if (!stockDocument) return res.json({ error: `Stock ${stockName} not found` });

        let stockPrice = await getPrice(stockName);
        if (!stockPrice) return res.json({ error: `Stock price for ${stockName} not found` });

        stocksData.push({
          stock: stockDocument.name,
          price: stockPrice,
          rel_likes: stockDocument.likes, // We'll calculate relative likes later
        });
      }

      if (stocksData.length === 2) {
        let like1 = stocksData[0].rel_likes;
        let like2 = stocksData[1].rel_likes;
        stocksData[0].rel_likes = like1 - like2;
        stocksData[1].rel_likes = like2 - like1;
      }

      responseObject.stockData = stocksData;
      outputResponse();
    };

    /* Process Input */
    if (typeof req.query.stock === 'string') {
      /* One Stock */
      await processOneStock(req.query.stock);
    } else if (Array.isArray(req.query.stock) && req.query.stock.length === 2) {
      twoStocks = true;
      await processTwoStocks(req.query.stock);
    } else {
      res.json({ error: 'Invalid stock query' });
    }
  });
};
