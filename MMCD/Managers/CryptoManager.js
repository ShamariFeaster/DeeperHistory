//------------CRYPTO MANAGER----------------
MMCD.managers.Crypto = (function(){
    //private members
    var _this,
    initManager,
    Encrypt;
    function isDef(obj){
      return (typeof obj != 'undefined');
    }
  (initManager = function(){
    _this = {};
    Encrypt = new JSEncrypt();
    Encrypt.setPublicKey('-----BEGIN PUBLIC KEY-----\
    MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDlOJu6TyygqxfWT7eLtGDwajtN\
    FOb9I5XRb6khyfD1Yt3YiCgQWMNW649887VGJiGr/L5i2osbl8C9+WJTeucF+S76\
    xFxdU6jE0NQ+Z+zEdhUTooNRaY5nZiu5PgDB0ED/ZKBUSLKL7eibMxZtMlUDHjm4\
    gwQco1KRMDSmXSMkDwIDAQAB\
    -----END PUBLIC KEY-----');

    Encrypt.setPrivateKey('-----BEGIN RSA PRIVATE KEY-----\
    MIICXQIBAAKBgQDlOJu6TyygqxfWT7eLtGDwajtNFOb9I5XRb6khyfD1Yt3YiCgQ\
    WMNW649887VGJiGr/L5i2osbl8C9+WJTeucF+S76xFxdU6jE0NQ+Z+zEdhUTooNR\
    aY5nZiu5PgDB0ED/ZKBUSLKL7eibMxZtMlUDHjm4gwQco1KRMDSmXSMkDwIDAQAB\
    AoGAfY9LpnuWK5Bs50UVep5c93SJdUi82u7yMx4iHFMc/Z2hfenfYEzu+57fI4fv\
    xTQ//5DbzRR/XKb8ulNv6+CHyPF31xk7YOBfkGI8qjLoq06V+FyBfDSwL8KbLyeH\
    m7KUZnLNQbk8yGLzB3iYKkRHlmUanQGaNMIJziWOkN+N9dECQQD0ONYRNZeuM8zd\
    8XJTSdcIX4a3gy3GGCJxOzv16XHxD03GW6UNLmfPwenKu+cdrQeaqEixrCejXdAF\
    z/7+BSMpAkEA8EaSOeP5Xr3ZrbiKzi6TGMwHMvC7HdJxaBJbVRfApFrE0/mPwmP5\
    rN7QwjrMY+0+AbXcm8mRQyQ1+IGEembsdwJBAN6az8Rv7QnD/YBvi52POIlRSSIM\
    V7SwWvSK4WSMnGb1ZBbhgdg57DXaspcwHsFV7hByQ5BvMtIduHcT14ECfcECQATe\
    aTgjFnqE/lQ22Rk0eGaYO80cc643BXVGafNfd9fcvwBMnk0iGX0XRsOozVt5Azil\
    psLBYuApa66NcVHJpCECQQDTjI2AQhFc1yRnCU/YgDnSpJVm1nASoRUnU8Jfm3Oz\
    uku7JUXcVpt08DFSceCEX9unCuMcT72rAQlLpdZir876\
    -----END RSA PRIVATE KEY-----');
  })();
  return {
    
    chunkPlainText : function(input, chunkLength){
      if( !isDef(chunkLength) )
        chunkLength = 116;//Maximum length for plaintext string
      var chunk = '';
      var chunks = [];
      for(var i = 1; i <= input.length; i++){
        chunk += input[i-1];
        if(i % chunkLength == 0){
          chunks.push(chunk);
          chunk = '';
        }
      }
      if(chunk.length > 0)
        chunks.push(chunk);
      //console.log(chunks);
      return chunks;
    },
    
    encryptChunks : function(chunks){
      var cypher = '';
      for(var i = 0; i < chunks.length; i++){
        cypher += Encrypt.encrypt(chunks[i]);
      }
      return cypher;
    },

    decryptChunks : function(chunks){
      var plainText = '';
      for(var i = 0; i < chunks.length; i++){
        plainText += Encrypt.decrypt(chunks[i]);
      }
      return plainText;
    },

    chunkCypher : function(input, chunkLength){
      return this.chunkPlainText(input, 172);//172 is magic # of chars decrypt expects
    },

    encrypt : function(plainText){
      var chunks = this.chunkPlainText(plainText);
      return this.encryptChunks(chunks);
    },

    decrypt : function(cypher){
      var chunks = this.chunkCypher(cypher);
      return this.decryptChunks(chunks);
    }
  };
})();