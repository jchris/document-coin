var test = require('prova')
var jwt = require('webcrypto-jwt');

test('jwt test', function (t) {
  t.plan(3)

  // token signed using 'secret' as secret
  var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.' +
  'TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';

  jwt.verifyJWT(token, 'secret', 'HS256', function (err, isValid) {
    console.log("verifyJWT",isValid); // true
    t.equal(isValid, true)
  });

  jwt.verifyJWT(token, 'nosecret', 'HS256', function (err, isValid) {
    console.log("verifyJWT",isValid); // false
    t.equal(isValid, false)
  });

  // var decoded = jwt.decodeJWT(token); // '{"sub":"1234567890","name":"John Doe","admin":true}'

  var parsed = jwt.parseJWT(token) // Object {sub: "1234567890", name: "John Doe", admin: true}

  t.equal(parsed.name, "John Doe")
  t.equal(parsed.admin, true)

})

// test("")