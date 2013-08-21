var theClient = require("./theapi");
var client = new theClient("my_key", "my_secret");


//View market depth
client.seeDepth(function(err, json) {
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
