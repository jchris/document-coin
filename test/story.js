var test = require('prova')
const jose = require("node-jose");

require("babel-register");
// var jwt = require('webcrypto-jwt');
// var jose = require("node-jose");
var dc = require("..");

test("create a wallet", function (t) {
  t.plan(2)
  var wallet = new dc.Wallet("test");
  t.equals(wallet.name, "test")

// ensure the wallet has keys
  wallet.setupKeys().then(function(){
    t.assert(wallet.signingKey)
  })
})

test("mint a coin", function (t) {
  t.plan(5)
  var wallet = new dc.Wallet("test");
  wallet.setupKeys().then(function(){
    var content = new Buffer("The word is the coin.", "utf8")
    wallet.mint(content).then(function (coin) {
      t.equals(coin.content, content)
      t.equals(coin.coinID.length, "_u2e46oaAUyKVTVGHVaPC_Y4EKL3la7CTvXPLoU3QrY".length)
      t.assert(coin.givetree[0], "jose signature")

      jose.JWS.createVerify(coin.mintKey).
        verify(coin.givetree[0]).
        then(function(decoded) {
          t.equals(JSON.parse(decoded.payload)[0], "izwuMySz5A-xSRguhHo42LPqN_39f4osW6ITxUsVxa4")
          t.equals(decoded.key, coin.mintKey)
        })
    })
  })
})

test("give a coin", function (t) {
  t.plan(3)
  var wallet = new dc.Wallet("Alice");
  wallet.setupKeys().then(function(){
    var wallet2 = new dc.Wallet("Bob");
    wallet2.setupKeys().then(function() {
      var content = new Buffer("The coin is the word.", "utf8")
      wallet.mint(content).then(function (coin) {
        wallet.give(coin, wallet2).then(()=>{
          t.assert(coin.givetree[0], "jose signature")
          t.assert(coin.givetree[1], "children")
          t.assert(coin.givetree[1][0], "first child")
          t.equals(coin.givetree[1][0][0], "first child jose signature")
        })
      })
    })
  })
})
//
// test("wallet sign a wallet", function (t) {
//
// })
