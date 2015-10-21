define(["app"], function(app) {

	var kotgService = {
		/*
		*  type: favorite, note, stared ...
		*  sortType: title, type, id, syncKey
		*/
        searchXHR: null,

		search: function(type,offset,limit,sortType,isDescending,keywords) {
            if(this.searchXHR && this.searchXHR.readyStatus != 4) {this.searchXHR.abort();}
			var ex_tag = "friend-share";
	        var queryParams = '?limit=' + limit + "&offset="+offset+"&tag=" + type;
	        if(type && type.indexOf("note") != -1){
	            queryParams += "&ex_tag=friend-share"; 
	        }
            queryParams += "&sortby=" + (sortType? sortType: "id");
            queryParams += "&orderDesc=" + (isDescending? true: false);
	        if(keywords){
	            queryParams += "&query="+keywords;
	        }
            var deferred = $.Deferred();
            this.searchXHR = $.ajax({
	            type: "GET",
	            url: '/knowledgecenter/kotg/search/asset/' + queryParams,
	            dataType: 'json',
	            beforeSend: function(xhr) {
	                xhr.setRequestHeader("Accept", "application/json");
	                xhr.setRequestHeader("Content-Type", "application/json");
                    app.encryptionService(xhr);
                },
                success: function (response, statusText, xhr) {
	                if (xhr.status == 200) {
	                    deferred.resolve(response);
	                } else {
	                	deferred.reject();
	                }
	            },
	            error: function(xhr, errorInfo, exception) {
	                deferred.reject(errorInfo);
	            }
            });
            return deferred.promise();
		},

		findOneDocument: function(documentId) {
            var deferred = $.Deferred();
            $.ajax({
	            type: "GET",
	            url: '/knowledgecenter/kotg/document/' + documentId,
	            dataType: 'json',
	            beforeSend: function(xhr) {
	                xhr.setRequestHeader("Accept", "application/json");
	                xhr.setRequestHeader("Content-Type", "application/json");
                    app.encryptionService(xhr);
                },
                success: function (response, statusText, xhr) {
	                if (xhr.status == 200) {
	                    deferred.resolve(response);
	                } else {
	                	deferred.reject();
	                }
	            },
	            error: function(xhr, errorInfo, exception) {
	                deferred.reject(errorInfo);
	            }
            });
            return deferred.promise();
		},

		findOneAsset: function(documentId) {
            var deferred = $.Deferred();
            $.ajax({
	            type: "GET",
	            url: '/knowledgecenter/kotg/asset/' + documentId,
	            dataType: 'json',
	            beforeSend: function(xhr) {
	                xhr.setRequestHeader("Accept", "application/json");
	                xhr.setRequestHeader("Content-Type", "application/json");
                    app.encryptionService(xhr);
                },
                success: function (response, statusText, xhr) {
	                if (xhr.status == 200) {
	                    deferred.resolve(response);
	                } else {
	                	deferred.reject();
	                }
	            },
	            error: function(xhr, errorInfo, exception) {
	                deferred.reject(errorInfo);
	            }
            });
            return deferred.promise();
		},

		/*
		*  url: "http://www.example.com"
		*  asImage: true, false
		*  tags: ["id1", "id2"]
		*/
		addWebDocument: function(url, asImage, tags) {
            var deferred = $.Deferred();
            var data = new Object();
            data.type = asImage?"WebClipImage": "Web";
            data.url = url;

            if (tags && tags.length > 0) {
                data.tags = tags;
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
                    app.encryptionService(xhr);
                },
                success: function(response, status, xhr) {
                    if (xhr.status == 201 || xhr.status == 200) {
                        deferred.resolve(response);
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
            return deferred.promise();
		},

		addFileDocument: function(fileId, tags) {
            var deferred = $.Deferred();
            var data = new Object();
	        data.type = 'File';
	        data.id = fileId;

            if (tags && tags.length > 0) {
	            data.tags = tags;
	        }else{
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
                    app.encryptionService(xhr);
                },
                success: function(response, status, xhr) {
                    if (xhr.status == 201 || xhr.status == 200) {
                        deferred.resolve(JSON.parse(response));
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
            return deferred.promise();
		},

		addOrUpdateNoteDocument: function(title, content, plainTxt, noteId, tags) {
            var deferred = $.Deferred();
            var data = new Object();
	        data.type = "Note";
	        data.title = title;
	        data.body = plainTxt;
	        data.htmlbody = content;
	        if(noteId) {data.id = noteId;}
            if (tags && tags.length > 0) {
	            data.tags = tags;
	        }else{
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
                    app.encryptionService(xhr);
                },
                success: function(response, status, xhr) {
                    if (xhr.status == 201 || xhr.status == 200) {
                        deferred.resolve(response);
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
            return deferred.promise();
		},

		deleteOne: function(documentId) {
            var deferred = $.Deferred();

            $.ajax({
                url: "/knowledgecenter/kotg/asset/" + documentId,
	            type: "DELETE",
                dataType: "text",
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("Accept", "application/json");
                    xhr.setRequestHeader("Content-Type", "application/json");
                    app.encryptionService(xhr);
                },
                success: function(response, status, xhr) {
	                if (xhr.status == 204) {
	                    deferred.resolve();
	                }
                },
                error: function(xhr, error, exception) {
                    deferred.reject(xhr.status);
                }
            });
            return deferred.promise();
		},

        deleteBatch: function(idArray) {
            var deferred = $.Deferred();

            $.ajax({
                url: "/knowledgecenter/kotg/batch/deleted/asset",
                type: "POST",
                data: JSON.stringify(idArray),
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("Accept", "application/json");
                    xhr.setRequestHeader("Content-Type", "application/json");
                    app.encryptionService(xhr);
                },
                success: function(response, status, xhr) {
                    if (xhr.status == 200) {
                        deferred.resolve();
                    }
                },
                error: function(xhr, error, exception) {
                    deferred.reject(xhr.status);
                }
            });
            return deferred.promise();
        },

        shareDocument: function(documentId, recipients, comment){
            var deferred = $.Deferred();
            var body = new Object();
            body.documentId = documentId;
            body.recipient = recipients;
            body.comment = comment;
            $.ajax({
                url: "/knowledgecenter/kotg/share/document",
                dataType: "text",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(body),

                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Accept", "application/json");
                    xhr.setRequestHeader("Content-Type", "application/json");
                    app.encryptionService(xhr);
                },
                success: function (response, statusText, xhr) {
                    deferred.resolve(response);
                },
                error: function (xhr, error, exception) {
                    deferred.reject(xhr.status);
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
                    app.encryptionService(xhr);
                },
                success:function(response, status, xhr){
                    deferred.resolve(response.result);
                },
                error:function(xhr, errorInfo, exception){
                    deferred.reject(xhr.status);
                }
            });
            return deferred.promise();
        },

        /**
         * 创建TAG
         * @param tag_label
         * @returns {*}
         */
        createTag: function (tag_label) {
            var deferred = $.Deferred();
            var that = this;
            $.ajax({
                url: "/knowledgecenter/kotg/tag",
                dataType: "json",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    label: tag_label
                }),
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Accept", "application/json");
                    xhr.setRequestHeader("Content-Type", "application/json");
                    app.encryptionService(xhr);
                },

                success: function (response, statusText, xhr) {
                    //201才是创建成功
                    if (xhr.status == 201) {
                        that.saveTagInfo(response.id,response.label);
                        deferred.resolve(response);
                    } else {
                        deferred.reject(response);
                    }
                },

                error: function (xhr, errorInfo, exception) {
                    deferred.reject(errorInfo);
                }
            });

            return deferred.promise();
        },

        /**
         * 获取所有的TAG
         * @returns {*}
         */
        fetchAllTags: function () {
            var deferred = $.Deferred();
            var that = this;

            $.ajax({
                url: "/knowledgecenter/kotg/tag/",
                dataType: "json",
                type: "GET",
                // cache: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Content-Type", "application/json");
                    xhr.setRequestHeader("Accept", "application/json");
                    app.encryptionService(xhr);
                },
                success: function (response, statusText, xhr) {

                    if (xhr.status == 200) {

                        var tags = response.result;
                        //这里需要事先直接把内容放入Session中去
                        var alltags = [];
                        $.each(tags, function (index, tag){
                            if (!tag.immutable){
                                alltags.push(tag);
                            }
                        });
                        sessionStorage.setItem("alltags", JSON.stringify(alltags));
                        deferred.resolve(alltags);
                    } else {
                        deferred.reject(response);
                    }
                },
                error: function (xhr, errorInfo, exception) {
                    deferred.reject(errorInfo);
                }
            });

            return deferred.promise();
        },

        /**
         *
         * @param tag_id
         */
        removeTag:function(id){
            var deferred = $.Deferred();
            var that = this;
            $.ajax({
                url: "/knowledgecenter/kotg/tag/" + id,
                dataType: "text",
                type: "DELETE",
                beforeSend: function (xhr) {
                    app.encryptionService(xhr);
                },
                success: function (response, statusText, xhr) {
                    if (xhr.status == 204) {
                        //在session中删除
                        sessionStorage.removeItem(id);
                        that.removeTagInfo(id);
                        deferred.resolve(response);
                    } else {
                        deferred.reject(response);
                    }
                },
                error: function (xhr, errorInfo, exception) {
                    deferred.reject(response);
                }
            });

            return deferred.promise();
        },

        /**
         *
         * @param tag_id, label
         */
        modTagName:function(id, replacename){
            var deferred = $.Deferred();
            var that = this;
            $.ajax({
                url: "/knowledgecenter/kotg/tag/" + id + "/label",
                dataType: "text",
                type: "PUT",
                data: replacename,
                beforeSend: function (xhr) {
                    app.encryptionService(xhr);
                    xhr.setRequestHeader("Content-Type", "text/plain");
                },
                success: function (response, statusText, xhr) {
                    if (xhr.status == 204) {
                        sessionStorage.setItem(id, replacename);
                        that.saveTagInfo(id, replacename);
                        deferred.resolve(response);
                    } else {
                        deferred.reject(response);
                    }
                },

                error: function (xhr, errorInfo, exception) {
                    deferred.reject(errorInfo);
                }

            });

            return deferred.promise();
        },

        /*
        *
        *  @param documentId, tagId
        */
        bindTag: function (documentId, tagId) {
            var deferred = $.Deferred();
            $.ajax({
                url: "/knowledgecenter/kotg/asset/" + documentId + "/tags/" + tagId,
                dataType: "text",
                type: "PUT",
                beforeSend: function (xhr) {
                    app.encryptionService(xhr);
                },
                success: function (response, statusText, xhr) {
                    deferred.resolve(response);
                },
                error: function (xhr, errorInfo, exception) {
                    deferred.reject(errorInfo);
                }
            });
            return deferred.promise();
        },

        /*
        *
        * @param documentId, tagId
        */
        unBindTag:function(documentId, tagId){
            var deferred = $.Deferred();
            $.ajax({
                url: "/knowledgecenter/kotg/asset/" + documentId + "/tags/" + tagId,
                dataType: "text",
                type: "DELETE",
                beforeSend: function (xhr) {
                    app.encryptionService(xhr);
                },
                success: function (response, statusText, xhr) {
                    if (xhr.status == 204) {
                        deferred.resolve(response);
                    } else {
                        deferred.reject(errorInfo);
                    }

                },
                error: function (xhr, errorInfo, exception) {
                    deferred.reject(response);
                }

            });
            return deferred.promise();
        },

        // 辅助函数
        saveTagInfo:function(id, label){
            var alltags = sessionStorage.getItem("alltags");
            if (!alltags){
                alltags = new Array();
                alltags.push(new Object({id:id,label:label}));
                sessionStorage.setItem("alltags", JSON.stringify(alltags));
            }else {
                alltags = JSON.parse(alltags);
                var alltagsMod = alltags;
                var isSameId = false;
                $.each(alltags,function(index,value){
                    if (value.id==id){
                        isSameId = true;
                        alltagsMod.splice(index,1,new Object({id:id,label:label}));

                        return false;
                    }
                });

                if (!isSameId){
                    alltagsMod.push(new Object({id:id,label:label}));
                }

                sessionStorage.setItem("alltags", JSON.stringify(alltagsMod));
            }
        },

        removeTagInfo:function(id){
            var alltags = sessionStorage.getItem("alltags");
            if (alltags){
                alltags = JSON.parse(alltags);
                var alltagsMod = alltags;

                $.each(alltags,function(index,value){
                    if (value.id==id){
                        alltagsMod.splice(index,1);

                        return false;
                    }
                });

                sessionStorage.setItem("alltags", JSON.stringify(alltagsMod));
            }
        },

        // get upload file size's limit
        getUploadLimit: function() {
            return $.ajax({
                url: "/knowledgecenter/kotg/adminsystem/uploadlimit",
                dataType: "text",
                type: "GET",
                beforeSend: function (xhr) {
                    app.encryptionService(xhr);
                }
            });
        },

        // update upload file size's limit
        postUploadLimit: function(size) {
            var data = {size: size};
            return $.ajax({
                url: "/knowledgecenter/kotg/adminsystem/uploadlimit",
                type: "POST",
                dataType: "text",
                contentType: "application/json",
                data: JSON.stringify(data),
                beforeSend: function (xhr) {
                    app.encryptionService(xhr);
                }
            });
        }

	};

    return kotgService;
});
