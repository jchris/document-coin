"use strict";
const jose = require("node-jose");

class Block {
  constructor(content, pubkey) {
    this.content = content;
    this.pubkey = pubkey;
  }
  signingContent() {
    return this.content + this.pubkey;
  }
}

module.exports = Block;
