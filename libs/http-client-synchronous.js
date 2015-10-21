"use strict";

define(["services/encryptionService"], function (encryptionService) {
    var getCookie = function(name) {
        var parts = document.cookie.split(name + '=');
        var value;
        if (parts.length == 2) {
            value = parts.pop().split(';').shift();
            return decodeURIComponent(value.replace(/\"/g, ""));
        }
    };

    var setHeaders = function(tagValue, http) {
        var headers = {};
        headers["XSS-Tag"] = encryptionService.assymEncrypt(tagValue)
        headers["X-Source-Host"] = window.location.host
        _.each(_.keys(headers || {}), function (key) {
            http.setRequestHeader(key, headers[key]);
        });
        http.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    };

    var post = function (remoteResource, body) {
        var http = new XMLHttpRequest();
        http.open('POST', remoteResource, false);
        setHeaders(getCookie("auth-token"), http);

        var responseJson = {};
        http.onreadystatechange = function () {
            if (http.readyState == 4 && http.status == 200) {
                responseJson = JSON.parse(http.responseText);
            }
        };
        http.send(JSON.stringify(body));
        return responseJson;
    };
    
    return {
        post: post
    };
});
