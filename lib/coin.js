"use strict";
const jose = require("node-jose");
const URLSafeBase64 = require('urlsafe-base64');

class Coin {
    // create a coin with:
    // content
    // content hash
    // create root block
    // sign content hash

    constructor() {
      // to load a coin that I didn't mint, maybe we load
      // from the database and pass in the document here?
    }
    validate() {
      // decrypt content and verify root(s)

    }
    mint(content, mintWallet) {
      this.content = content;
      // todo encrypt content
      this.mintKey = mintWallet.signingKey;

      return jose.JWA.digest("SHA-256", this.content).then((contentDigest)=>{
         return this.mintRootBlock(contentDigest, mintWallet).then(()=>{
           return this.rootDigest().then((signatureDigest)=>{
             // The id validates that the coin can only be minted by
             // someone who controls the minter keys.
             // If the minter mints the same content multiple times the
             // history can be merged at the level of the first give.
             this.coinID = URLSafeBase64.encode(signatureDigest);
             return this;
           })
         })
      })
    }
    rootDigest() {
      const rootBlock = this.givetree[0];
      // console.log("rootBlock",rootBlock,this.givetree);
      var blockString = JSON.stringify(rootBlock);
      const blockBuffer = new Buffer(blockString, "utf8");
      return jose.JWA.digest("SHA-256", blockBuffer)
    }
    validateRoot() {
      this.rootDigest().then((signatureDigest) => {
        if (this.coinID !== signatureDigest) {
          throw new Error("invalid coinID")
        }
      })
    }
    mintRootBlock(contentDigest, mintWallet) {
      const blockData = [URLSafeBase64.encode(contentDigest), mintWallet.signingKey.toJSON()];
      return jose.JWS.createSign({ format: 'compact' }, mintWallet.signingKey).
        update(JSON.stringify(blockData), "utf8").
        final().
        then((signedBlock) => {
          // The coinID is derived from the root block, and validated,
          // so any change in the root block would be a differnt coin.
          // There can only be one root
          // console.log("signedBlock", signedBlock)
          this.givetree = [signedBlock,[]];
        });
    }
    give(holder, receiver) {
      return this.findHeldBlockNode(holder).then((heldBlockNode) => {
        // heldBlockNode[0]
        // heldBlockNode[1] append block signed by holder wallet, gives to reciver wallet
        return validateBlock(heldBlockNode[0], holder.signingKey)
      })
    }
    validateBlock(block, holderKey) {
      return jose.JWS.createVerify(holderKey).
        verify(block).
        then(function(decoded) {
          console.log("validateBlock", decoded)
          return true;
        })
    }
    findHeldBlockNode (holder) {
      // fold over blocks to find those signed to holder's key\
      console.log("findHeldBlock need to implement fold", holder.signingKey)
      return Promise.resolve()
      .then( () => {
        var myblocks;
        this.foldBlockNodes((node) => {
          const block = node[0]
          console.log(block.to)
          if (block.to == holder.signingKey) {
            myblocks.push(block)
          }
        });
        return myblocks[0];
      })
    }
    foldBlockNodes(callback) {
      callback(this.givetree)
    }
    // blockToSign()
    // signCoin(coinToSign) {
    //   return jose.JWS.createSign(this.signingKey).
    //     update(coinToSign.signingContent(), "utf8").
    //     final().
    //     then((result) => {
    //       // console.log("signed result", result)
    //       coinToSign.addMintSignature(result)
    //     })
    // }
};

module.exports = Coin;


// validate/decode the entire tree? decode until we find our wallet

// root block

// find blocks wallet X can sign
