"use strict";

define(["Q", "services/encryptionService", "underscore"], function (Q, encryptionService, _) {
    var getCookie = function(name) {
        var parts = document.cookie.split(name + '=');
        var value;
        if (parts.length == 2) {
            value = parts.pop().split(';').shift();
            return decodeURIComponent(value.replace(/\"/g, ""));
        }
    };
    var callRemoteMethod = function (endPoint, httpMethod, params, headers, dataType) {
        var request = constructRequest(httpMethod, endPoint, params, headers, dataType);
        return makeNetworkCall(request);
    };

    var makeNetworkCall = function (request) {
        var deferred = Q.defer();
        $.ajax(request).
            done(function (data, textStatus, jqXHR) {
                console.log('done: ' + jqXHR.status)
                // To know whether the session has expired.
                var clientType = jqXHR.getResponseHeader('AM_CLIENT_TYPE') || ''
                if (clientType === "genericHTML")
                    window.location = "/knowledgecenter/logout"
                else
                    deferred.resolve(data);
            }).fail(function (error) {
              if (error.status === 401) {
                  console.log(request)
                  console.log(error)
                    // TODO: too specific to application?
                    console.log("Network call failed: " + error.status)
                    window.location = "/knowledgecenter/logout?url="+ window.location;
              }
                deferred.reject(error);
            });
        return deferred.promise;
    };

    var constructRequest = function (httpMethod, endPoint, params, headers, dataType) {
        var request = {
            url: endPoint,
            type: httpMethod,
            data: headers ? !headers['stringify'] ? JSON.stringify(params) : params : JSON.stringify(params),
            dataType: dataType
        };
      var tagValue = getCookie("auth-token");
      if(typeof(headers) ==='undefined') headers = {}
      headers["XSS-Tag"] = encryptionService.assymEncrypt(tagValue)
      headers["X-Source-Host"] = window.location.host
        request.beforeSend = function (xhr) {
            _.each(_.keys(headers || {}), function (key) {
                xhr.setRequestHeader(key, headers[key]);
            });
            if(!headers['Content-Type'])
            xhr.setRequestHeader('Content-Type', "application/json");
        };
        return request;
    };

    var get = function (remoteResource, params, headers) {
        return callRemoteMethod(remoteResource, "get", params, headers);
    };

    var getJson = function (remoteResource, params, headers) {
        return callRemoteMethod(remoteResource, "get", params, headers, "json");
    };

    var post = function (remoteResource, params, headers) {
        return callRemoteMethod(remoteResource, "post", params, headers);
    };

    var remove = function (remoteResource, params, headers) {
        return callRemoteMethod(remoteResource, "delete", params, headers);
    };

    var put = function (remoteResource, params, headers) {
        return callRemoteMethod(remoteResource, "put", params, headers);
    };

    var setRequestHeadersData = function(xhr){
    	var tagValue = getCookie('auth-token');
    	if(typeof(headers) ==='undefined') var headers = {}
    	headers["XSS-Tag"] = encryptionService.assymEncrypt(tagValue)
        headers["X-Source-Host"] = window.location.host
    	_.each(_.keys(headers || {}), function (key) {
    		xhr.setRequestHeader(key, headers[key]);
    	});
    };
    
    return {
        get: get,
        post: post,
        put: put,
        remove: remove, // cannot use delete as its a operator in javascript
        getJson: getJson,
        setRequestHeadersData: setRequestHeadersData
    };
});
