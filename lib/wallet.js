"use strict";
const jose = require("node-jose");
const Coin = require("./coin");

class Wallet {
    constructor(name) {
        this.name = name;
    }
    setupKeys() {
      this.keystore = jose.JWK.createKeyStore();

      // const props = {
      //   kid: 'gBdaS-G8RLax2qgObTD94w',
      //   alg: 'A256GCM',
      //   use: 'enc'
      // };
      return this.keystore.generate("EC", "P-256").then((key) => {
        this.signingKey = key;
      })
    }
    mint(content) {
      const mintedCoin = new Coin ();
      return mintedCoin.mint(content, this);
    }
    // signCoin(coinToSign) {
    //   return jose.JWS.createSign(this.signingKey).
    //     update(coinToSign.signingContent(), "utf8").
    //     final().
    //     then((result) => {
    //       // console.log("signed result", result)
    //       coinToSign.addMintSignature(result)
    //     })
    // }

    getName() {
        return this.name;
    }
};



module.exports = Wallet;
