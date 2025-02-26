var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       this.timeout(5000);
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          assert.property(res.body, 'stockData');
          assert.property(res.body.stockData, 'stock');
          assert.property(res.body.stockData, 'price');
          assert.property(res.body.stockData, 'likes');
          assert.equal(res.body.stockData.stock, 'goog');
          done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'aapl', like: true})
        .end(function(err, res){
          assert.property(res.body, 'stockData');
          assert.property(res.body.stockData, 'stock');
          assert.property(res.body.stockData, 'likes');
          assert.equal(res.body.stockData.stock, 'aapl');
          assert.isAtLeast(res.body.stockData.likes, 1);
          done();
        });
      });
      

      
      test('2 stocks', function(done) {
        this.timeout(5000); // Increase timeout to 5s
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['aapl', 'amzn']})
        .end(function(err, res){
          assert.property(res.body, 'stockData');
          assert.isArray(res.body.stockData);
          
          let aapl = res.body.stockData.find(s => s.stock === 'aapl');
          let amzn = res.body.stockData.find(s => s.stock === 'amzn');
          
          assert.isObject(aapl);
          assert.isObject(amzn);
          
          assert.property(aapl, 'likes');
          assert.property(amzn, 'likes');
          
          assert.equal(aapl.stock, 'aapl');
          assert.isNumber(aapl.rel_likes);
          
          assert.equal(amzn.stock, 'amzn');
          assert.isNumber(amzn.rel_likes);
          done();
        });
      });
      
      test('2 stocks with like', function(done) {
        this.timeout(5000); // Increase timeout to 5s
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['spot', 'amzn'], like: true})
        .end(function(err, res){
          assert.property(res.body, 'stockData', 'Response should have stockData property');
          assert.isArray(res.body.stockData, 'stockData should be an array');
          
          let spot = res.body.stockData.find(s => s.stock === 'spot');
          let amzn = res.body.stockData.find(s => s.stock === 'amzn');
          
          assert.isObject(spot, 'Spot stock data should be an object');
          assert.isObject(amzn, 'Amazon stock data should be an object');
          
          assert.property(spot, 'likes');
          assert.property(amzn, 'likes');
          
          assert.equal(spot.stock, 'spot');
          assert.isAtLeast(spot.likes, 1);
          assert.isNumber(spot.rel_likes);
          
          assert.equal(amzn.stock, 'amzn');
          assert.isAtLeast(amzn.likes, 1);
          assert.isNumber(amzn.rel_likes);
          done();
        });
      });
      
    });
});
