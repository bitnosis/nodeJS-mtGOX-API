var query = require("querystring"),
  crypt = require("crypto"),
  request = require("request"),
  JSONStr = require("JSONstream");

function theClient(key, secret, currency) {
  var self = this;
  self.key = key;
  self.secret = secret;
  self._currency = currency || "BTCUSD";

  function pubReq(path, args, callback) {
    var parameters = query.stringify(args);
    if (parameters) path = path + "?" + parameters;
    return execReq(theOptions(path), callback);
  }

  function makeReq(path, args, callback) {
    if (!self.key || !self.secret) {
      throw new Error("Must provide key and secret in order to access the mtGOX API");
    }
    args.nonce = (new Date()).getTime() * 1000;
    var postData = query.stringify(args);
    var msg = path + "\0" + postData;
    // compute the sha512 signature of the msg
    var hm = crypt.createHmac("sha512", new Buffer(self.secret, "base64"));
    hm.update(msg);
    var options = theOptions(path);

    options.method = "POST";
    options.body = postData;
    options.headers["Rest-Key"] = self.key;
    options.headers["Rest-Sign"] = hm.digest("base64");
    options.headers["Content-Length"] = postData.length;

    return execReq(options, callback);
  }

  function execReq(options, callback) {
    if (typeof callback == "function") {
      request(options, function (err, res, body) {
        if (res && res.statusCode == 200) {
          callback(null, JSON.parse(body));
        } else if(res){
          callback(new Error("Request failed with " + res.statusCode));
        } else {
          callback(new Error("Request failed"));
        }
      });
    } else {
      var parser = JSONStr.parse(["data", true]);
      request.get(options).pipe(parser);
      return parser;
    }
  }

  function theOptions(path) {
    return {
      uri: "https://data.mtgox.com/api/2/" + path,
      agent: false,
      headers: {
        "User-Agent": "Mozilla/4.0 (compatible; MtGox node.js client)",
        "Content-type": "application/x-www-form-urlencoded"
      }
    };
  }


  //The individual API requests
  self.info = function(callback) {
    makeReq(self._currency + "/money/info", {}, callback);
  };

  self.idKey = function(callback) {
    makeReq(self._currency + "/money/idkey", {}, callback);
  };

  self.currency = function(callback) {
    pubReq(self._currency + "/money/currency", {}, callback);
  };

  self.setCurrency = function(currency) {
    self._currency = currency;
  };

   self.ticker = function(callback) {
    pubReq(self._currency + "/money/ticker", {}, callback);
  };

  self.tickerFast = function(callback) {
    pubReq(self._currency + "/money/ticker_fast", {}, callback);
  };
 
  //View orders
  self.orders = function(callback) {
    makeReq(self._currency + "/money/orders", {}, callback);
  };
  

  self.quote = function(type, amount, callback) {
    pubReq(self._currency + "/money/order/quote", {
      "type": type,
      "amount": amount
    }, callback);
  };

  // price is an optional argument (must be null if not used)
  //Add New Order to mtGOX system
  self.add = function(type, amount, price, callback) {
    var args = {
      "type": type,
      "amount": amount
    };
    if (price) args.price = price;
    makeReq(self._currency + "/money/order/add", args, callback);
  };
  //Cancel an order
  self.cancel = function(id, callback) {
    makeReq(self._currency + "/money/order/cancel", {
      "oid": id
    }, callback);
  };

  // not currently implemented
  self.result = function(type, order, callback) {
    makeReq(self._currency + "/money/order/result", {
      "type": type,
      "order": order
    }, callback);
  };

  self.lag = function(callback) {
    pubReq(self._currency + "/money/order/lag", {}, callback);
  };



  self.seeTrades = function(since, callback) {
    var args = {};
    if (typeof since != undefined) args.since = since;
    return pubReq(self._currency + "/money/trades/fetch", args, callback);
  };

  //Get depth of market
  self.seeDepth = function(callback) {
    pubReq(self._currency + "/money/depth/fetch", {}, callback);
  };

  //Get full depth of market
  self.seeFullDepth = function(callback) {
    pubReq(self._currency + "/money/depth/full", {}, callback);
  };

  // page is optionsl (must be set to NULL if not used)
  self.seeHistory = function(currency, page, callback) {
    var args = { "currency": currency };
    if (page) args.page = page;
    makeReq("money/wallet/history", args, callback);
  };

}

module.exports = theClient;
