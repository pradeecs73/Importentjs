define(['app', 'httpClient', 'underscore', 'Q'], function(app, httpClient, _, Q) {

    var tagService = {
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
                        sessionStorage.setItem(response.id,response.label);
                        that.saveTagInfo(response.id,response.label);
                        deferred.resolve(new Object({status: xhr.status, response: response}));
                    } else {
                        deferred.reject(new Object({status: xhr.status, response: response}));
                    }
                },

                error: function (xhr, errorInfo, exception) {
                    deferred.reject(new Object({status: xhr.status, response: errorInfo}));
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
                        var availableTags = [];
                        var alltags = sessionStorage.getItem("alltags");
                        if (!alltags){
                            sessionStorage.setItem("alltags", "[]");
                        }
                        $.each(tags, function (index, value){
                            if (!value.immutable){
                                availableTags.push(value);
                                sessionStorage.setItem(value.id, value.label);
                                that.saveTagInfo(value.id, value.label);
                            }
                        });
                        deferred.resolve(new Object({status: xhr.status, response: availableTags}));
                    } else {
                        deferred.reject(new Object({status: xhr.status, response: response}));
                    }
                },
                error: function (xhr, errorInfo, exception) {
                    deferred.reject(new Object({status: xhr.status, response: errorInfo}));
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
                        deferred.resolve(new Object({status:xhr.status, response:response}));
                    } else {
                        deferred.reject(new Object({status:xhr.status, response:response}));
                    }
                },
                error: function (xhr, errorInfo, exception) {
                    deferred.reject(new Object({status:xhr.status, response:response}));
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
                        deferred.resolve(new Object({status: xhr.status, response: response}));
                    } else {
                        deferred.reject(new Object({status: xhr.status, response: response}));
                    }
                },

                error: function (xhr, errorInfo, exception) {
                    deferred.reject(new Object({status: xhr.status, response: errorInfo}));
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
                    deferred.resolve(new Object({status: xhr.status, response: response}));
                },
                error: function (xhr, errorInfo, exception) {
                    deferred.reject(new Object({status: xhr.status, response: errorInfo}));
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
                        deferred.resolve(new Object({status: xhr.status, response: response}));
                    } else {
                        deferred.reject(new Object({status: xhr.status, response: errorInfo}));
                    }

                },
                error: function (xhr, errorInfo, exception) {
                    deferred.reject(new Object({status: xhr.status, response: errorInfo}));
                }

            });
            return deferred.promise();
        },

        // 辅助函数
        saveTagInfo:function(id, name){
            var alltags = sessionStorage.getItem("alltags");
            if (!alltags){
                alltags = new Array();
                alltags.push(new Object({id:id,name:name}));
                sessionStorage.setItem("alltags", JSON.stringify(alltags));
            }else {
                alltags = JSON.parse(alltags);
                var alltagsMod = alltags;
                var isSameId = false;
                $.each(alltags,function(index,value){
                    if (value.id==id){
                        isSameId = true;
                        alltagsMod.splice(index,1,new Object({id:id,name:name}));

                        return false;
                    }
                });

                if (!isSameId){
                    alltagsMod.push(new Object({id:id,name:name}));
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

        findNameById:function(id){
            var allTags = sessionStorage.getItem("alltags");
            allTags = JSON.parse(allTags);

            var tagName = "";
            for(var i=0; i<allTags.length; i++){
                if (allTags[i].id == id){
                    tagName = allTags[i].name;
                }
            }
            return tagName;
        }
    }

    return tagService;

});
