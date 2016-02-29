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
      const blockBuffer = new Buffer(rootBlock, "utf8");
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
    mintGiveBlock(parentBlockDigest, receiverKeyJSON, giveWallet) {
      const blockData = [URLSafeBase64.encode(parentBlockDigest), receiverKeyJSON];
      return jose.JWS.createSign({ format: 'compact' }, giveWallet.signingKey).
        update(JSON.stringify(blockData), "utf8").
        final()
    }
    give(holder, receiverKeyJSON) {
      return this.findHeldBlockNode(holder).then((heldBlockNode) => {
        // console.log("heldBlockNode", heldBlockNode)
        const rawBlock = heldBlockNode[0];
        const children = heldBlockNode[1];
        console.log(" found give", rawBlock, children)
        // TODO validate children.length and coin policy
        const blockBuffer = new Buffer(rawBlock, "utf8");
        return jose.JWA.digest("SHA-256", blockBuffer).then((rawBlockDigest)=>{
          return this.mintGiveBlock(rawBlockDigest, receiverKeyJSON, holder).then((block) => {
            children.push([block,[]])
          })
        })
        // heldBlockNode[0]
        // heldBlockNode[1] append block signed by holder wallet, gives to reciver wallet
      }).catch((e)=>{
        console.log("held block not found", e)
      })
    }
    decodeBlock(block, key) {
      return jose.JWS.createVerify(key).
        verify(block).
        then(function(decoded) {
          // console.log(" decodeBlock", decoded)
          return decoded;
        })
    }
    findHeldBlockNode (holder) {
      // fold over blocks to find those signed to holder's key\
      console.log("findHeldBlock need to implement fold", holder.signingKey)
      return Promise.resolve()
      .then( () => {
        var myblocks = [];
        return this.foldBlockNodes((decodedBlock, rawBlock, children) => {
          console.log("decodedBlock", decodedBlock[1].kid, holder.signingKey.kid)
          if (decodedBlock[1].kid == holder.signingKey.kid) {
            console.log("held Block")
            myblocks.push(Promise.resolve([rawBlock, children]))
          }
        }).then(()=>{
          console.log("myblocks", myblocks)
          if (myblocks[0]) {
            return myblocks[0];
          } else {
            throw new Error("no held block")
          }
        })
      })
    }
    foldBlockNodes(callback) {
      return this.foldRootNode(callback).then((results) => {
        // const {rootPayload, block, children} = results;
        return this.foldBlockNode(callback, results.rootPayload, results.block, results.children)

      })
    }
    foldBlockNode(callback, parentPayload, rawParentBlock, children) {
      console.log("foldBlockNode", parentPayload, children, rawParentBlock)

      callback(parentPayload, rawParentBlock, children)
      // now for each child, decode the child and call foldBlockNode on it
      if (children.length > 0) {
        return jose.JWK.asKey(parentPayload[1]).then((holderKey) => {
          // {result} is a jose.JWK.Key
          // {result.keystore} is a unique jose.JWK.KeyStore
          var decoders = children.map((childNode)=>{
            const rawChildBlock = childNode[0];
            const childChildren = childNode[1];
            return this.decodeBlock(rawChildBlock, holderKey).then((decoded) => {
              var childPayload = JSON.parse(decoded.payload.toString())
              return this.foldBlockNode(callback, childPayload, rawChildBlock, childChildren)
            })
          })
          console.log("decoders", decoders)
          return Promise.all(decoders);
        });
      } else {
        return true;
      }
    }
    foldRootNode(callback) {
      var holderKey = this.mintKey;
      var node = this.givetree;
      var block = node[0];
      var children = node[1];
      // console.log("raw BLOCK", block, children)
      return this.decodeBlock(block, holderKey).then((decoded) => {
        var rootPayload = JSON.parse(decoded.payload.toString())
        return {rootPayload:rootPayload, block:block, children:children};
      })
      // this needs to decode blocks into the decoded tree so we can use the signing
      // key to verify child blocks
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
}

module.exports = Coin;


// validate/decode the entire tree? decode until we find our wallet

// root block

// find blocks wallet X can sign
