define(['app', 'httpClient', 'underscore', 'Q','services/encryptionService'], function(app, httpClient, _, Q,encryptionService) {

    // var fetchSharedItems = function(data) {
    //     var endPoint = "/kotg_service/v2/search/batch-retrive/ ";
    //     var header = {
    //         "Authorization": "Bearer " + localStorage.getItem("account_token"),
    //         "Content-Type": "application/json",
    //         "Accept": "application/json",
    //         "Cache-Control": "no-cache"
    //     }
    //     return httpClient.post(endPoint, data, header);
    // };

    // var fetchsSharedId = function() {
    //     var endPoint = "/cclom/shared/documents/" + app.getUsername();
    //     return httpClient.get(endPoint);
    // };

    // var deleteSharedItem = function(documentId) {
    //     var endPoint = "/cclom/shared/removeDocument/" + documentId + "/" + app.getUsername();
    //     return httpClient.remove(endPoint);
    // };

    var shareService = {
        fetchShareds: function(tag,offset,limit,sortType,order,keywords) {
            var ex_tag = 'friend-share';
            if(!tag) { tag = ex_tag;}

            var queryParams = '?limit=' + limit + "&offset="+offset+"&tag=" + tag;
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
                    xhr.setRequestHeader("XSS-Tag", encryptionService.assymEncrypt(App.getCookie("auth-token")));
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
        },

        deleteShared: function(id){
            var deferred = Q.defer();
            $.ajax({
                url: "/knowledgecenter/kotg/asset/" + id,
                dataType: "text",
                type: "DELETE",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Accept", "application/json");
                    xhr.setRequestHeader("Content-Type", "application/json");
                    xhr.setRequestHeader("XSS-Tag", encryptionService.assymEncrypt(App.getCookie("auth-token")));
                },
                success: function (response, statusText, xhr) {
                    if (xhr.status == 204) {
                        deferred.resolve("{id:"+id+"}");
                        //$.growlUI("tag was create");
                        //deleteService.renderWebPage(null, id);
                    }
                },
                error: function (xhr, errorInfo, exception) {
                    console.log("error" + xhr.status);
                    deferred.reject(statusText);
                    //$.growlUI("Can't create tag");
                }
            });
            return deferred.promise;
        },

        shareDocument: function(documentId, recipients, comment){
            var deferred = $.Deferred();
            if(!sessionStorage.getItem(documentId)){
                return deferred.reject(new Object({response:null, status:404}));
            }
            documentId = (JSON.parse(sessionStorage.getItem(documentId))).document.id;

            var body = new Object();
            body.recipient = recipients;
            body.comment = comment;
            body.documentId = documentId;
            $.ajax({
                url: "/knowledgecenter/kotg/share/document",
                dataType: "text",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(body),

                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Accept", "application/json");
                    xhr.setRequestHeader("Content-Type", "application/json");
                    xhr.setRequestHeader("XSS-Tag", encryptionService.assymEncrypt(App.getCookie("auth-token")));
                },
                success: function (response, statusText, xhr) {
                    deferred.resolve(new Object({response:response.result, status:xhr.status}));
                },
                error: function (xhr, errorInfo, exception) {
                    deferred.reject(new Object({response:xhr.responseText, status:xhr.status}));
                }
            });
            return deferred.promise();
        },

        getAllContact:function(){
            var deferred = $.Deferred();
            $.ajax({
                type:"GET",
                dataType:"json",
                url:"/knowledgecenter/kotg/contact/",
                beforeSend:function(xhr){
                    xhr.setRequestHeader("Accept", "application/json");
                    xhr.setRequestHeader("Content-Type","application/json");
                    xhr.setRequestHeader("XSS-Tag", encryptionService.assymEncrypt(App.getCookie("auth-token")));
                },
                success:function(response, status, xhr){
                    // localStorage.setItem("contactCacheItem", JSON.stringify(response.result));
                    deferred.resolve(new Object({response:response.result,status:xhr.status}));
                },
                error:function(xhr, errorInfo, exception){
                    deferred.reject(new Object({response:errorInfo,status:xhr.status}));
                }
            });
            return deferred.promise();
        }
    }

    return shareService;
});