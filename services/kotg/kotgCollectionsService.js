define(['httpClient', 'underscore', 'Q','services/encryptionService'], function(httpClient, _, Q,encryptionService) {
    var ex_tag = 'friend-share';
    var fetchCollections = function(tag,offset,limit,sortType,order,keywords) {
        var queryParams = '?limit=' + limit + "&offset="+offset+"&tag=" + tag;
        if(tag && tag.indexOf("note") != -1){
            queryParams += "&ex_tag=friend-share"; 
        }
        if(sortType) {
            queryParams += "&sortby=" + sortType;
        } else {
            queryParams += "&sortby=id";
        }
        if(order) {
            queryParams += "&orderDesc=true";
        } else {
            queryParams += "&orderDesc=false";
        }
        if(keywords){
            queryParams += "&query="+keywords;
        }
        var deferred = Q.defer();
        $.ajax({
            type: "GET",
            url: '/knowledgecenter/kotg/search/asset/' + queryParams,
            dataType: 'json',
            crossDomain: true,
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Accept", "application/json");
                xhr.setRequestHeader("Content-Type", "application/json");
                // xhr.setRequestHeader('Authorization', "Bearer " + localStorage.getItem("account_token"));
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
                    deferred.resolve(response);
                }
            },
            error: function(xhr, errorInfo, exception) {
                deferred.reject(errorInfo);
            }
        });

        return deferred.promise;
    };

    var domainName = function(url) {
        return url.replace(/.+[\.\/]([A-z]+\.[A-z]+)\/[^\/].+/, "$1");
    };


    var shareAutotag = function(data, shares) {
        var elt = $('#form-field-mask-2');
        elt.tagsinput({
            itemValue: "id",
            itemText: "name"
        });
        if (shares != null && shares.length > 0) {
            elt.tagsinput('removeAll');
            _.each(shares, function(share, key) {
                elt.tagsinput('add', {
                    id: share.share + '|' + share.display,
                    name: share.display
                })
            })
        }
        elt.tagsinput('input').typeahead({
            valueKey: 'name',
            local: data
        }).bind('typeahead:selected', $.proxy(function(obj, datum) {
            this.tagsinput('add', datum);
            this.tagsinput('input').typeahead('setQuery', '');
        }, elt));
        setTimeout(function(){$(".tt-query").focus()}, 500); 
    };

    var setAlreadySharedData = function(shares) {
        var elt = $('#form-field-mask-2');
        elt.tagsinput('removeAll');
        if (shares != null && shares.length > 0) {
            _.each(shares, function(share, key) {
                elt.tagsinput('add', {
                    id: share.share + '|' + share.display,
                    name: share.display
                })
            })
        }
        setTimeout(function(){$(".tt-query").focus()}, 500); 
    };


    var crawlUrl = function(crawlUrl, fetchAsImage) {
        var deferred = Q.defer();
        // if (domainName(crawlUrl) == domainName(location.href)) {
        //     alert("Cannot do this on" + domainName(crawlUrl));
        // } else {

            var data = new Object();
            data.type = fetchAsImage?"WebClipImage": "Web";
            data.url = crawlUrl;

            var tags = sessionStorage.getItem("tempUrlTags");
            if (tags != null && tags.length != 0) {
                data.tags = JSON.parse(tags);
            } else {
                data.tags = new Array();
            }

            $.ajax({
                url: "/knowledgecenter/kotg/asset",
                type: "POST",
                contentType: "application/json",
                dataType: "text",
                data: JSON.stringify(data),
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("Accept", "application/json");
                    xhr.setRequestHeader("Content-Type", "application/json");
                    // xhr.setRequestHeader('Authorization', "Bearer " + localStorage.getItem("account_token"));
                    var tagValue = App.getCookie('auth-token');
                    if(typeof(headers) ==='undefined') var headers = {}
                    headers["XSS-Tag"] = encryptionService.assymEncrypt(tagValue)
                    _.each(_.keys(headers || {}), function (key) {
                        xhr.setRequestHeader(key, headers[key]);
                    });
                },
                success: function(response, status, xhr) {
                    if (xhr.status == 201 || xhr.status == 200) {
                        //alert("Done");

                        deferred.resolve("");
                    } else if (xhr.status == 401) {

                        deferred.reject(statusText);
                    } else {

                        deferred.reject(statusText);
                    }
                },
                error: function(xhr, error, exception) {
                    deferred.reject(xhr.status);
                    if (xhr.status == 413) {
                        alert("Your account space is full");
                    }
                }
            });
            return deferred.promise;
        // }
    }

    var deleteCollection = function(id) {
        var deferred = Q.defer();
        $.ajax({
            url: "/knowledgecenter/kotg/asset/" + id,
            dataType: "text",
            type: "DELETE",

            beforeSend: function(xhr) {
                xhr.setRequestHeader("Accept", "application/json");
                // xhr.setRequestHeader('Authorization', "Bearer " + localStorage.getItem("account_token"));
                xhr.setRequestHeader("Content-Type", "application/json");
                var tagValue = App.getCookie('auth-token');
                if(typeof(headers) ==='undefined') var headers = {}
                headers["XSS-Tag"] = encryptionService.assymEncrypt(tagValue)
                _.each(_.keys(headers || {}), function (key) {
                    xhr.setRequestHeader(key, headers[key]);
                });
            },

            success: function(response, statusText, xhr) {
                if (xhr.status == 204) {
                    deferred.resolve("{id:" + id + "}");
                }

            },

            error: function(xhr, errorInfo, exception) {
                console.log("error" + xhr.status);
                deferred.reject(statusText);
                //$.growlUI("Can't create tag");
            }
        });
        return deferred.promise;
    };

    var createFileCollection = function(location_url,tags){
        var deferred = Q.defer();
        var data = new Object();
        data.type = 'File';
        data.id = location_url;

        if(tags){
            data.tags = tags;
        }else{
            data.tags = new Array();
        }

        $.ajax({
            url:'/knowledgecenter/kotg/asset/',
            type:'POST',
            dataType:'JSON',
            data:JSON.stringify(data),
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Accept", "application/json");
                xhr.setRequestHeader("Content-Type", "application/json");
                // xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("account_token"));
                var tagValue = App.getCookie('auth-token');
                if(typeof(headers) ==='undefined') var headers = {}
                headers["XSS-Tag"] = encryptionService.assymEncrypt(tagValue)
                _.each(_.keys(headers || {}), function (key) {
                    xhr.setRequestHeader(key, headers[key]);
                });
            },
            success: function (response, status, xhr) {
                if (xhr.status == 201 || xhr.status == 200) {
                    deferred.resolve(new Object({status:status,response:response}));
                } else {
                    deferred.reject(new Object({status:status,response:response}));
                }


            },
            error: function (xhr, error, exception) {
                if (xhr.status == 413) {
                    deferred.reject(new Object({status:status,response:error, error:""}));
                } else {
                    deferred.reject(new Object({status:status,response:error, error:""}));
                }
            }
        });
        return deferred.promise;
    };

    return {
        fetchCollections: fetchCollections,
        deleteCollection: deleteCollection,
        crawlUrl: crawlUrl,
        shareAutotag: shareAutotag,
        setAlreadySharedData: setAlreadySharedData,
        createFileCollection: createFileCollection
    }
});