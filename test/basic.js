var test = require('tape')
// var jwt = require('webcrypto-jwt');
var jose = require("node-jose");

test("create a signing keypair and sign/verify an input", function (t) {
  t.plan(4)
  var keystore = jose.JWK.createKeyStore();

  var props = {
    kid: 'gBdaS-G8RLax2qgObTD94w',
    alg: 'A256GCM',
    use: 'enc'
  };
  keystore.generate("oct", 256).
    then(function(key) {
      t.equals(key.keystore, keystore, "the keystore")
      var input = "Hello Alice";
      jose.JWS.createSign(key).
        update(input, "utf8").
        final().
        then(function(result) {
          console.log("result", result)
          t.equals(result.payload, "SGVsbG8gQWxpY2U")

          jose.JWS.createVerify(key).
            verify(result).
            then(function(decoded) {
              t.equals(decoded.payload.toString(), "Hello Alice")
              t.equals(decoded.key, key)
            // {result} is a Object with:
            // *  header: the combined 'protected' and 'unprotected' header members
            // *  payload: Buffer of the signed content
            // *  signature: Buffer of the verified signature
            // *  key: The key used to verify the signature
            });

        }).catch(function (error) {
          t.error(error)
        });
    });
})
