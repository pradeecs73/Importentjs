define(['httpClient', 'underscore', 'Q','services/encryptionService'], function(httpClient, _, Q,encryptionService) {

  var appID = 'd1ce2e011c78a2fe66a6464ba3cfb13767ccac71',
    Secret = '0a314df21066500';
  var loginService = {

    callSyncUserApi : function (email) {
      var deferred = Q.defer();
      $.ajax({
        type: "POST",
        url: '/knowledgecenter/cclom/syncUser', 
        crossDomain: true,
        data: "email=" + email ,
        beforeSend: function(xhr) {
        	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        	var tagValue = App.getCookie('auth-token');
        	if(typeof(headers) ==='undefined') var headers = {}
        	headers["XSS-Tag"] = encryptionService.assymEncrypt(tagValue)
        	_.each(_.keys(headers || {}), function (key) {
        		xhr.setRequestHeader(key, headers[key]);
        	});
        },
        success: function(response, status, xhr) {     
             deferred.resolve(response); 
        },
        error: function(xhr, errorInfo, exception) {
         deferred.reject(errorInfo); 
        }
      });
      return deferred.promise;
    },
    callLoginService: function(email, password, savetype) {
      var deferred = Q.defer();
      $.ajax({
        type: "POST",
        url: '/knowledgecenter/kotg/account/moodle/token',
        dataType: 'json',
        crossDomain: true,
        data: "scope=" + encodeURIComponent("userid=" + email + "&email=" + email) + "&" + "grant_type=client_credentials",
        beforeSend: function(xhr) {
        	xhr.setRequestHeader("Accept", "application/json");
        	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        	var authStr = make_base_auth(appID, Secret); 
        	// xhr.setRequestHeader('Authorization', "Basic ZDhkOGgzaGFoaGRoaDQ4OGFoNTU1a2FrYWR1dTg4MTExZDg4aDRoOToxMGQ3aDRoYTdhYTJhYTIy");
        	var tagValue = App.getCookie('auth-token');
        	if(typeof(headers) ==='undefined') var headers = {}
        	headers["XSS-Tag"] = encryptionService.assymEncrypt(tagValue)
        	_.each(_.keys(headers || {}), function (key) {
        		xhr.setRequestHeader(key, headers[key]);
        	});
        },
        success: function(response, status, xhr) {
          //  $.unblockUI();
          if (xhr.status == 200) {
           
            localStorage.setItem("account_token", response.access_token);
            localStorage.setItem("token_type", response.token_type);
            if (savetype) {
              var myDate = new Date();
              localStorage.setItem("login_date", myDate.toLocaleDateString());
            }
             deferred.resolve(response); 
          }  

        },
        error: function(xhr, errorInfo, exception) {
         deferred.reject(errorInfo);
          if (xhr.status == 400) {
      
           }
        }
      });
      return deferred.promise;
    }
  }

    function make_base_auth(appID, Secret) {
      var token = appID + ':' + Secret;
      var hash = base64encode(token);
      return "Basic " + hash;
    }

  var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
    52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

  function base64encode(str) {
    var out, i, len;
    var c1, c2, c3;

    len = str.length;
    i = 0;
    out = "";
    while (i< len) {
      c1 = str.charCodeAt(i++) & 0xff;
      if (i == len) {
        out += base64EncodeChars.charAt(c1 >> 2);
        out += base64EncodeChars.charAt((c1 & 0x3)<< 4);
        out += "==";
        break;
      }
      c2 = str.charCodeAt(i++);
      if (i == len) {
        out += base64EncodeChars.charAt(c1 >> 2);
        out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
        out += base64EncodeChars.charAt((c2 & 0xF)<< 2);
        out += "=";
        break;
      }
      c3 = str.charCodeAt(i++);
      out += base64EncodeChars.charAt(c1 >> 2);
      out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
      out += base64EncodeChars.charAt(((c2 & 0xF)<< 2) | ((c3 & 0xC0) >> 6));
      out += base64EncodeChars.charAt(c3 & 0x3F);
    }
    return out;
  }

  function base64decode(str) {
    var c1, c2, c3, c4;
    var i, len, out;

    len = str.length;
    i = 0;
    out = "";
    while (i< len) {
      /* c1 */
      do {
        c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
      } while (i < len && c1 == -1);
      if (c1 == -1)
        break;

      /* c2 */
      do {
        c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
      } while (i < len && c2 == -1);
      if (c2 == -1)
        break;

      out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

      /* c3 */
      do {
        c3 = str.charCodeAt(i++) & 0xff;
        if (c3 == 61)
          return out;
        c3 = base64DecodeChars[c3];
      } while (i < len && c3 == -1);
      if (c3 == -1)
        break;

      out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));

      /* c4 */
      do {
        c4 = str.charCodeAt(i++) & 0xff;
        if (c4 == 61)
          return out;
        c4 = base64DecodeChars[c4];
      } while (i < len && c4 == -1);
      if (c4 == -1)
        break;
      out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
    }
    return out;
  }

  var moodleAuth = function(email, password, savetype) {
    // if(localStorage.getItem("account_token") !=null){
      var deferred = Q.defer(); 
      deferred.resolve(); 
      return deferred.promise;
    // }
   //console.log('/cclom/syncUser has been commented out. please locate this at js/service/kotg/kotgLoginService.js'); 
    // return loginService.callSyncUserApi(email).then(function(){
         // return loginService.callLoginService(email, password, savetype);
    // },function(err){
      // console.log("Kotg Authentication Failed.");
    // });
  };

  return {
    moodleAuth: moodleAuth
  }
});
