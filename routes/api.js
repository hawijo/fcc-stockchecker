'use strict';

const mongoose = require('mongoose');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)); // Fix for Node < 18

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
    let findOrUpdateStock = async (stockName, documentUpdate, nextStep) => {
      try {
        let stockDocument = await Stock.findOneAndUpdate(
          { name: stockName },
          documentUpdate,
          { new: true, upsert: true }
        );
        return nextStep(stockDocument);
      } catch (error) {
        console.error(error);
        return res.json({ error: 'Database error' });
      }
    };

    /* Get Price */
    let getPrice = async (stockDocument) => {
      try {
        let requestUrl = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockDocument.name}/quote`;
        let response = await fetch(requestUrl);
        let apiResponse = await response.json();

        if (!apiResponse.latestPrice) return res.json({ error: 'Stock price not found' });

        responseObject.stockData = {
          stock: stockDocument.name,
          price: apiResponse.latestPrice.toFixed(2),
          likes: stockDocument.likes,
        };

        outputResponse();
      } catch (error) {
        console.error('Error fetching stock price:', error);
        return res.json({ error: 'Stock price fetch failed' });
      }
    };

    /* Like Stock */
    let likeStock = async (stockName, nextStep) => {
      try {
        let stockDocument = await Stock.findOne({ name: stockName });

        if (!stockDocument) {
          return res.json({ error: 'Stock not found' });
        }

        if (stockDocument.ips.includes(req.ip)) {
          return res.json({ error: 'Only 1 like per IP allowed' });
        }

        let documentUpdate = { $inc: { likes: 1 }, $push: { ips: req.ip } };
        findOrUpdateStock(stockName, documentUpdate, nextStep);
      } catch (error) {
        console.error('Error updating likes:', error);
        return res.json({ error: 'Like update failed' });
      }
    };

    /* Process Single Stock */
    if (typeof req.query.stock === 'string') {
      let stockName = req.query.stock;

      if (req.query.like === 'true') {
        likeStock(stockName, getPrice);
      } else {
        findOrUpdateStock(stockName, {}, getPrice);
      }
    }
  });
};
