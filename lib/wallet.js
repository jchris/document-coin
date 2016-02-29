"use strict";
const jose = require("node-jose");
const Coin = require("./coin");

class Wallet {
    constructor(name) {
        this.name = name;
    }
    setupKeys() {
      this.keystore = jose.JWK.createKeyStore();
      return this.keystore.generate("EC", "P-256").then((key) => {
        this.signingKey = key;
      })
    }
    mint(content) {
      const mintedCoin = new Coin ();
      return mintedCoin.mint(content, this);
    }
    getName() {
        return this.name;
    }
}

module.exports = Wallet;
