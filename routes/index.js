
/*
 * GET home page.
 */
var theClient = require("../mtgox");
var bitcoin = new theClient("my_key", "my_secret");

exports.index = function(req, res){
bitcoin.seeDepth(function(err, json) {
    if (err) { throw err; }
    console.log("---------------Asksh:--------------");
    json.data.asks.forEach(function(el) {
        console.log(el.price + " | "+el.amount);
    });
     console.log("---------------Bids:--------------");
      json.data.bids.forEach(function(el) {
        console.log(el.price + " | "+el.amount);
    });
});	
  res.render('index', { title: 'Testins' });
};