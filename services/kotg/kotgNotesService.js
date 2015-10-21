define(['httpClient', 'underscore', 'Q','services/encryptionService'], function(httpClient, _, Q,encryptionService) {
  var ex_tag='friend-share';
  var fetchNotes = function(tag, offset, limit, sortType, order, keywords) {
    var queryParams = '?limit='+ limit + '&offset=' + offset + '&ex_tag=' + ex_tag + "&tag=" + tag;
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
    if(keywords) {
      queryParams += "&query=" + keywords;
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
  var saveNote= function (title, body, textBody, id) {
        var deferred = Q.defer();
        var note_body = new Object();
        note_body.type = "Note";
        if (id) {
            note_body.id = id;
        }
        note_body.title = title;
        note_body.body = textBody;
        note_body.htmlbody = body;

        $.ajax({
            url: "/knowledgecenter/kotg/asset",
            dataType: "text",
            type: "POST",
            data: JSON.stringify(note_body),
            beforeSend: function (xhr) {
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
            success: function (response, statusText, xhr) {
                 deferred.resolve(response); 
            },
            error: function (xhr, statusText, response) {
                if (xhr.status==413){
                    alert("Your account space is full");
                }
                deferred.reject(statusText); 
            }
        });
        return deferred.promise;
    };

  var deleteNote = function(id){
    var deferred = Q.defer();
    $.ajax({
            url: "/knowledgecenter/kotg/asset/" + id,
            dataType: "text",
            type: "DELETE",

            beforeSend: function (xhr) {
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
  };

  var fetchURL = function(url) {
    var deferred = Q.defer();
    $.ajax({
            url: url,
            dataType: "text",
            type: "GET",
            cache:false,
            success: function (response, statusText, xhr) {
                 deferred.resolve(response); 
            },
            error: function (xhr, statusText, response) {
                deferred.reject(statusText); 
            }
        });
    return deferred.promise;
  }

  return {
    fetchNotes: fetchNotes,
    saveNote: saveNote,
    deleteNote:deleteNote,
    fetchURL:fetchURL
  }
});