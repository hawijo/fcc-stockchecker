'use strict';

const mongoose = require('mongoose');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)); // Fix for Node < 18

module.exports = function (app) {
  let uri = `mongodb+srv://joshuahawi24:${process.env.PW}@w3-tutorial.q90bo.mongodb.net/?retryWrites=true&w=majority&appName=W3-Tutorial`;

  mongoose.connect(uri);

  let stockSchema = new mongoose.Schema({
    name: { type: String, required: true },
    likes: { type: Number, default: 0 },
    ips: [String],
  });

  let Stock = mongoose.model('Stock', stockSchema);

  app.route('/api/stock-prices').get(async function (req, res) {
    let responseObject = { stockData: [] };

    /* Output Response */
    let outputResponse = () => res.json(responseObject);

    /* Find/Update Stock Document */
    let findOrUpdateStock = async (stockName, documentUpdate) => {
      try {
        return await Stock.findOneAndUpdate(
          { name: stockName },
          documentUpdate,
          { new: true, upsert: true }
        );
      } catch (error) {
        console.error(error);
        return res.json({ error: 'Database error' });
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

    /* Like Stock */
    let likeStock = async (stockName) => {
      try {
        let stockDocument = await Stock.findOne({ name: stockName });

        if (!stockDocument) return res.json({ error: 'Stock not found' });

        if (stockDocument.ips.includes(req.ip)) {
          return res.json({ error: 'Only 1 like per IP allowed' });
        }

        return await findOrUpdateStock(stockName, { $inc: { likes: 1 }, $push: { ips: req.ip } });
      } catch (error) {
        console.error('Error updating likes:', error);
        return res.json({ error: 'Like update failed' });
      }
    };

    /* Process One Stock */
    let processOneStock = async (stockName, like) => {
      let stockDocument;
      if (like === 'true') {
        stockDocument = await likeStock(stockName);
      } else {
        stockDocument = await findOrUpdateStock(stockName, {});
      }
      
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
    let processTwoStocks = async (stockNames, like) => {
      let stocksData = [];

      for (let stockName of stockNames) {
        let stockDocument;
        if (like === 'true') {
          stockDocument = await likeStock(stockName);
        } else {
          stockDocument = await findOrUpdateStock(stockName, {});
        }

        if (!stockDocument) return res.json({ error: `Stock ${stockName} not found` });

        let stockPrice = await getPrice(stockName);
        if (!stockPrice) return res.json({ error: `Stock price for ${stockName} not found` });

        stocksData.push({
          stock: stockDocument.name,
          price: stockPrice,
          likes: stockDocument.likes,
        });
      }

      if (stocksData.length === 2) {
        let like1 = stocksData[0].likes;
        let like2 = stocksData[1].likes;
        stocksData[0].rel_likes = like1 - like2;
        stocksData[1].rel_likes = like2 - like1;
      }

      responseObject.stockData = stocksData;
      outputResponse();
    };

    /* Process Input */
    if (typeof req.query.stock === 'string') {
      processOneStock(req.query.stock, req.query.like);
    } else if (Array.isArray(req.query.stock)) {
      processTwoStocks(req.query.stock, req.query.like);
    }
  });
};
