"use strict";

define(["jsEncrypt"], function (jsEncrypt) {
  var kcPublicKey = "-----BEGIN PUBLIC KEY-----\n" +
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1StxIsOENUctVgW2ZqB8\n" +
    "n5zBvbtCsaP2ZTmdqJ0chtsq2HDKT3DtC5OG2ut37oLUw5yV7sV4Rib1T9XlDpQA\n" +
    "dnSAYe4gRr4dIgDk/OIKOwqHmwMWLw+QdZnYPRfKAkgYBqJo2oTZ0GjpTT2GPGae\n" +
    "tyfpnwPGwprYBDYt5OKk8bnTzMID/vo8rakJUW/qvkKZHtfPNCWBsRvt1e5uSDB+\n" +
    "m9KEjy+SBYHfnv+CdDJHR47sgtsmytYBi83UdkGmVvY/QqEMFnCOxEomJ0SkzpIZ\n" +
    "IllWAMFmiq0kzvW7ESaJLrfS38pbDz/OhV1vllzx9wiIXtyL5ywr+/jpOZeU4i0T\n" +
    "bQIDAQAB\n" +
    "-----END PUBLIC KEY-----\n";

  var assymEncrypt = function (text, publicKey) {
    if (typeof(publicKey) === 'undefined') publicKey = kcPublicKey;
    var cryptor = new JSEncrypt();
    cryptor.setPublicKey(publicKey);
    return cryptor.encrypt(text);
  }


  return {
    kcPublicKey: kcPublicKey,
    assymEncrypt: assymEncrypt
  }
})