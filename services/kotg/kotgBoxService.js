define(['app', 'httpClient', 'underscore', 'Q','services/encryptionService'], function(app, httpClient, _, Q,encryptionService) {

	var boxDriveService = {
	    domainUrl:location.origin+'/indexPostLogin.html',//"https://localhost",
	    authUrl:"https://app.box.com/api/oauth2/authorize?response_type=code" +
	        "&client_id=wjohaq5upj5u4c0847tselaevrm6n49g" +
	        "&redirect_uri=https://ciscomobileknowledge.com/oauth/box-redirect.html" +
	        "&state=",
	    login: function () {
	        var deferred = $.Deferred();

	        //做一个监听器一直监听当前的状态
	        localStorage.removeItem("box_oauth_status");

	        var interval = setInterval(function(){
	            var token = localStorage.getItem("box_token");
	            var exptime = localStorage.getItem("box_exptime");
	            var createtime = localStorage.getItem("box_createtime");
	            var reftoken = localStorage.getItem("box_reftoken");

	            var oauthstatus = localStorage.getItem("box_oauth_status");
	            if (oauthstatus){
	                clearInterval(interval);
	                if (token && exptime && createtime && reftoken){
	                    deferred.resolve();
	                } else {
	                    deferred.reject();
	                }
	            }
	        }, 1000);
	        //监听当前postmessage的状态
	        //这里要传递promise，但是在 ember里面只有这样才行，如果有什么好方法就直接替换掉吧

	        return deferred.promise();
	    },
	    listFolders: function (path, sortby) {
	        console.log("list api");
	        var deferred = $.Deferred();
	        var that = this;
	        this.checkToken().done(function(result){
	            //这里包含了全部的文件
	            var allEntries = new Array();
	            var offset = 0;

	            if (!path){
	                path=0;
	            }
	            that.fetchAllFolder(path,1000,offset,allEntries).done(function(response){
	                //var folderListItem = folderListItem.clone();

	                folderListItem = allEntries;

	                //allEntries = allEntries.reverse();

	                if (sortby == "date" && sortby){
	                    var dateOrder = allEntries.sort(
	                        function(a, b)
	                        {
	                            var dateA = a.createDate;
	                            var dateB = b.createDate;

	                            dateA = new Date(dateA).getTime();
	                            dateB = new Date(dateB).getTime();
	                            if(dateA < dateB) return -1;
	                            if(dateA > dateB) return 1;
	                            return 0;
	                        }
	                    );
	                    allEntries = dateOrder;
	                } else if (sortby && sortby=="name"){
	                    var nameOrder = allEntries.sort(
	                        function(a, b)
	                        {
	                            if(a.name < b.name) return -1;
	                            if(a.name > b.name) return 1;
	                            return 0;
	                        }
	                    );
	                    allEntries = nameOrder;
	                } else if (sortby && sortby == "size"){
	                    var typeOrder = allEntries.sort(
	                        function(a, b)
	                        {
	                            if(a.size < b.size) return -1;
	                            if(a.size > b.size) return 1;
	                            return 0;
	                        }
	                    );
	                    allEntries = typeOrder;
	                }

	                folderListItem.entries = allEntries;

	                folderListItem.name = response.name;

	                var needFolderCount = false;
	                //下面一步是搜索这个文件夹看看内部有多少文件
	                $.each(folderListItem.entries, function(index,value){
	                    if (value.type == "folder"){
	                        needFolderCount = true;
	                        that.fetchItemCountByFolder(value.id).done(function(count){
	                            folderListItem.entries[index].count = count;
	                            deferred.resolve(folderListItem);
	                        }).fail(function(){
	                            deferred.resolve(folderListItem);
	                        });
	                    }
	                });

	                if (!needFolderCount){
	                    deferred.resolve(folderListItem);
	                }
	            }).fail(function(errorItem){
	                deferred.reject(errorItem);
	            });
	        }).fail(function(result){
	            console.log("check token fail at listFolder");
	            console.log("fail at listFolder result ", result);
	            deferred.reject(result);
	        });
	        return deferred.promise();
	    },
	    search: function (keyword, sortby) {
	        var deferred = $.Deferred();
	        var that = this;
	        this.checkToken().done(function(result){
	            var allEntries = new Array();
	            var offset = 0;
	            that.searchItemMethod(keyword,200,offset, allEntries).done(function(){
	                //var folderListItem = folderListItem.clone();
	                folderListItem.entries = allEntries;
	                if (sortby == "date" && sortby){
	                    var dateOrder = allEntries.sort(
	                        function(a, b)
	                        {
	                            var dateA = a.createDate;
	                            var dateB = b.createDate;

	                            dateA = new Date(dateA).getTime();
	                            dateB = new Date(dateB).getTime();
	                            if(dateA < dateB) return -1;
	                            if(dateA > dateB) return 1;
	                            return 0;
	                        }
	                    );
	                    allEntries = dateOrder;
	                } else if (sortby && sortby=="name"){
	                    var nameOrder = allEntries.sort(
	                        function(a, b)
	                        {
	                            if(a.name < b.name) return -1;
	                            if(a.name > b.name) return 1;
	                            return 0;
	                        }
	                    );
	                    allEntries = nameOrder;
	                } else if (sortby && sortby == "type"){
	                    var typeOrder = allEntries.sort(
	                        function(a, b)
	                        {
	                            if(a.type < b.type) return -1;
	                            if(a.type > b.type) return 1;
	                            return 0;
	                        }
	                    );
	                    allEntries = typeOrder;
	                }

	                folderListItem.count = allEntries.length;
	                deferred.resolve(folderListItem);
	            }).fail(function(errorItem){
	                deferred.reject(errorItem);
	            });
	        }).fail(function(result){
	            deferred.reject(result);
	        });

	        return deferred.promise();
	    },
	    share:function(id, type, name){
	        var deferred = $.Deferred();
	        this.checkToken().done(function(result){
	            var request = {
	                shared_link: {access: null}
	            };

	            $.ajax({
	                type:"PUT",
	                url:"/box_restful_api/2.0/"+type+"s/"+id,
	                dataType:"json",
	                data:JSON.stringify(request),
	                beforeSend: function (xhr) {
	                    xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("box_token"));
	                },
	                success:function(response, status, xhr){
	                    //这里其实需要返回只有连接，不过需要在前段显示所以需要连接和名字
	                    var result = new Object();
	                    result.shared_link = response.shared_link.url;
	                    result.name = name;
	                    deferred.resolve(result);
	                },
	                error: function (xhr, errorInfo, exception) {
	                    //转换输出格式
	                    var errorItem = new Object();

	                    errorItem.requestType = "share";
	                    errorItem.statusCode = xhr.status;
	                    deferred.reject(errorItem);
	                }
	            })
	        }).fail(function(result){
	            deferred.reject(result);
	        });

	        return deferred.promise();
	    },
	    fetchFileItem: function (fileId) {

	    },
	    downloadFileItem:function(fileUrl){
	        var deferred = $.Deferred();
	        $.ajax({
	            type: "GET",
	            url: "/knowledgecenter/kotg/box/dl/"+fileUrl,
	            dataType:"json",
	            beforeSend: function (xhr) {
	            	app.encryptionService(xhr);
	                // xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("account_token"));
	                xhr.setRequestHeader("X-Box-Token", "Bearer " + localStorage.getItem("box_token"));
	            },
	            success:function(response, status, xhr){
	                //转换输出格式
	                response.statusCode = response.status;
	                if (response.status == 401){
	                    response.attach.loginUrl = this.authUrl+this.domainUrl;
	                }
	                deferred.resolve(response);
	            },
	            error: function (xhr, errorInfo, exception) {
	                //转换输出格式
	                var errorItem = new Object();
	                errorItem.requestType = "downloadFileItem";
	                errorItem.statusCode = xhr.status;
	                deferred.reject(errorItem);
	            }
	        });

	        return deferred.promise();
	    },
	    //下面是与接口无关，与具体实现有关的一些方法

	    checkToken:function(){
	        var deferred = $.Deferred();
	        var that = this;
	        //先判断是否有token
	        if (!localStorage.getItem("box_token")){
	            errorItem.statusCode = 401;
	            errorItem.requestType = "checkToken";
	            errorItem.attach.loginUrl = this.authUrl+this.domainUrl;
	            deferred.reject(errorItem);
	        } else {
	            //判断时间
	            var date = localStorage.getItem("box_createtime");
	            var exptime = localStorage.getItem("box_exptime");
	            var reftoken = localStorage.getItem("box_reftoken");
	            if (date && exptime && reftoken){
	                var currentNow = new Date();

	                var passTime = new Date(date).getTime()+(exptime*1000);
	                if (passTime<=currentNow.getTime()){
	                    //需要重新获取
	                    //那么首先呢，去刷新下
	                    this.refreshToken().done(function(response, status, xhr){
	                        //记录下刷新的Token继续登录
	                        localStorage.setItem("box_token", response.access_token);
	                        localStorage.setItem("box_exptime", response.expires_in);
	                        localStorage.setItem("box_createtime", new Date());
	                        localStorage.setItem("box_reftoken", response.refresh_token);
	                        errorItem.statusCode = 200;
	                        errorItem.requestType = "checkToken";
	                        deferred.resolve(errorItem);
	                    }).fail(function(xhr, errorInfo, exception){
	                        //直接报错去重新登录
	                        errorItem.statusCode = 401;
	                        errorItem.requestType = "checkToken";
	                        errorItem.attach.loginUrl = that.authUrl+that.domainUrl;
	                        deferred.reject(errorItem);
	                    });
	                } else {
	                    errorItem.statusCode = 200;
	                    errorItem.requestType = "checkToken";
	                    errorItem.attach.loginUrl = that.authUrl+that.domainUrl;
	                    deferred.resolve(errorItem);
	                }
	            } else {
	                //直接报错去重新登录
	                errorItem.statusCode = 401;
	                errorItem.requestType = "checkToken";
	                errorItem.attach.loginUrl = that.authUrl+that.domainUrl;
	                deferred.reject(errorItem);
	            }
	        }

	        return deferred.promise();
	    },

	    refreshToken:function(){
	        var authData = "grant_type=refresh_token&refresh_token="+localStorage.getItem("box_reftoken")+"&client_id=wjohaq5upj5u4c0847tselaevrm6n49g&client_secret=B3YVG2uGH1cRdFHt6uOg6Cma5L9eJcTV";
	        var reftoken = localStorage.getItem("box_reftoken");
	        return $.ajax({
	            type:"POST",
	            dataType:"json",
	            url:"/boxapi/api/oauth2/token",
	            data:authData
	        });
	    },

	    fetchItemCountByFolder:function(id){
	        var deferred = $.Deferred();
	        $.ajax({
	            type: "GET",
	            dataType: "json",
	            url: "/box_restful_api/2.0/folders/"+id+"/items?limit=1",
	            beforeSend: function (xhr) {
	                xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("box_token"));
	            },
	            success:function(response, status, xhr){
	                //转换输出格式
	                var entries = response.entries;
	                deferred.resolve(response.total_count);
	            },
	            error: function (xhr, errorInfo, exception) {
	                //转换输出格式
	                //var errorItem = errorItem.clone();
	                errorItem.requestType = "listFolders";
	                errorItem.statusCode = xhr.status;
	                deferred.reject(errorItem);
	            }
	        });

	        return deferred.promise();
	    },

	    fetchAllFolder:function(id, limit, offset, allEntries){
	        var deferred = $.Deferred();
	        var that = this;
	        $.ajax({
	            type: "GET",
	            dataType: "json",
	            url: "/box_restful_api/2.0/folders/"+id+"?fields=name,created_at,size,description,modified_at,shared_link,path_collection,item_collection,permissions&limit="+limit+"&offset="+offset,
	            beforeSend: function (xhr) {
	                xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("box_token"));
	            },
	            success:function(response, status, xhr){
	                //转换输出格式
	                var entries = response.item_collection.entries;
	                //先写进包里面
	                $.each(entries, function(index,item){
	                    if (item.type=="folder"){
	                        var folderItem = new Object();
	                        folderItem.id = item.id;
	                        folderItem.name = item.name;
	                        folderItem.createDate = item.created_at;
	                        folderItem.formatedDate = moment(item.created_at).format('MMM DD, YYYY');
	                        folderItem.createTime = moment(item.created_at).format('hh:mm a');
	                        folderItem.modDate = item.modified_at;
	                        folderItem.size = item.size;
	                        folderItem.type = "folder";
	                        if (!item.description || item.description.length<1){
	                            item.description = "No description.";
	                        }
	                        folderItem.description = item.description;

	                        if (item.shared_link && item.shared_link.url){
	                            folderItem.hasShared = true;
	                            folderItem.shared = new Object();
	                            folderItem.shared.link = item.shared_link;
	                            if (item.shared_link.download_count){
	                                folderItem.shared.count = item.shared_link.download_count;
	                            }
	                        }
	                        folderItem.canShare = item.permissions.can_share;

	                        allEntries.push(folderItem);
	                    } else if (item.type=="file"){
	                        var fileItem = new Object();
	                        fileItem.id = item.id;
	                        fileItem.name = item.name;
	                        fileItem.url = "/box_restful_api/2.0/files/"+item.id+"/content",
	                        fileItem.createDate = item.created_at;
	                        fileItem.formatedDate = moment(item.created_at).format('MMM DD, YYYY');
	                        fileItem.createTime = moment(item.created_at).format('hh:mm a');
	                        fileItem.modDate = item.modified_at;
	                        fileItem.size = item.size;
	                        fileItem.type = "file";
	                        fileItem.isFile = true;

	                        if (!item.description || item.description.length<1){
	                            item.description = "No description.";
	                        }
	                        fileItem.description = item.description;
	                        if (item.shared_link && item.shared_link.url){
	                            fileItem.hasShared = true;

	                            fileItem.shared = new Object();
	                            fileItem.shared.link = item.shared_link;
	                            //偷懒，但是不影响以后的通用性
	                            fileItem.shared.count = item.shared_link.download_count;
	                        }
	                        fileItem.icon = that.fetchFileIcon(fileItem.name);
	                        fileItem.canShare = item.permissions.can_share;

	                        //根据文件名字判断图标
	                        allEntries.push(fileItem);
	                    } else if (item.type === "web_link") {
	                        var p = new Object();
	                        p.id = item.id;
	                        p.name = item.name;
	                        p.createDate = item.created_at;
	                        p.formatedDate = moment(item.created_at).format('MMM DD, YYYY');
	                        p.createTime = moment(item.created_at).format('hh:mm a');
	                        p.modDate = item.modified_at;
	                        p.size = item.size;
	                        p.type = "web_link";
	                        if (!item.description || item.description.length<1){
	                            item.description = "No description.";
	                        }
	                        p.description = item.description;

	                        if (item.shared_link && item.shared_link.url){

	                            p.hasShared = true;
	                            p.shared = new Object();
	                            p.shared.link = item.shared_link;
	                            if (item.shared_link.download_count){
	                                p.shared.count = item.shared_link.download_count;
	                            }
	                        }

	                        p.canShare = item.permissions.can_share;
	                        allEntries.push(p);
	                    } else {
	                        var p = new Object();
	                        p.id = item.id;
	                        p.name = item.name;
	                        p.createDate = item.created_at;
	                        p.formatedDate = moment(item.created_at).format('MMM DD, YYYY');
	                        p.createTime = moment(item.created_at).format('hh:mm a');
	                        p.modDate = item.modified_at;
	                        p.size = item.size;
	                        p.type = "other";
	                        if (!item.description || item.description.length<1){
	                            item.description = "No description.";
	                        }
	                        p.description = item.description;

	                        if (item.shared_link && item.shared_link.url){

	                            p.hasShared = true;
	                            p.shared = new Object();
	                            p.shared.link = item.shared_link;
	                            if (item.shared_link.download_count){
	                                p.shared.count = item.shared_link.download_count;
	                            }
	                        }

	                        p.canShare = item.permissions.can_share;
	                        allEntries.push(p);
	                    }
	                });
	                if (allEntries.length<response.total_count){
	                    that.fetchAllFolder(id, limit, offset+limit, allEntries);
	                } else {
                        deferred.resolve(response);
	                }
	            },
	            error: function (xhr, errorInfo, exception) {
	                //转换输出格式
	                //var errorItem = errorItem.clone();
	                errorItem.requestType = "listFolders";
	                errorItem.statusCode = xhr.status;
	                deferred.reject(errorItem);
	            }
	        });

	        return deferred.promise();
	    },
	    fetchFolderInfo:function(id){
	        var deferred = $.Deferred();
	        var that = this;
	        $.ajax({
	            type: "GET",
	            dataType: "json",
	            url: "/box_restful_api/2.0/folders/"+id+"?fields=name,created_at,size,modified_at,shared_link,path_collection",
	            beforeSend: function (xhr) {
	                xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("box_token"));
	            },
	            success:function(response, status, xhr){
	                var paths = response.path_collection.entries;
	                paths.push({id:id,name:response.name});
	                var info = new Object();
	                info.paths = paths;
	                if (response.shared_link && response.shared_link.url){
	                    info.shared_link = response.shared_link.url;
	                }
	                info.name = response.name;

	                deferred.resolve(info);
	            },
	            error: function (xhr, errorInfo, exception) {
	                deferred.reject();
	            }
	        });
	        return deferred.promise();
	    },
	    searchItemMethod:function(keywords, limit, offset, allEntries){
	        var deferred = $.Deferred();
	        var that = this;
	        $.ajax({
	            type: "GET",
	            dataType: "json",
	            url: "/box_restful_api/2.0/search?query="+keywords+"&limit="+limit+"&offset="+offset+"&fields=name,size,description,created_at,modified_at,shared_link,path_collection,permissions",
	            beforeSend: function (xhr) {
	                xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("box_token"));
	            },
	            success:function(response, status, xhr){
	                //转换输出格式
	                var entries = response.entries;
	                //先写进包里面
	                $.each(entries, function(index,item){
	                    if (item.type=="folder"){
	                        var folderItem = new Object();
	                        folderItem.id = item.id;
	                        folderItem.name = item.name;
	                        folderItem.createDate = item.created_at;
	                        folderItem.formatedDate = moment(item.created_at).format('MMM DD, YYYY');
	                        folderItem.createTime = moment(item.created_at).format('hh:mm a');
	                        folderItem.modDate = item.modified_at;
	                        folderItem.size = item.size;
	                        folderItem.path = item.path_collection.entries;

	                        if (!item.description || item.description.length<1){
	                            item.description = "No description.";
	                        }
	                        folderItem.canShare = item.permissions.can_share;
	                        folderItem.description = item.description;

	                        if (item.shared_link && item.shared_link.url){

	                            folderItem.hasShared = true;
	                            folderItem.shared = new Object();
	                            folderItem.shared.link = item.shared_link;
	                            if (item.shared_link.download_count){
	                                folderItem.shared.count = item.shared_link.download_count;
	                            }
	                        }
	                        allEntries.push(folderItem);
	                    }

	                    if (item.type=="file"){
	                        var fileItem = new Object();
	                        fileItem.id = item.id;
	                        fileItem.name = item.name;
	                        fileItem.url = "/box_restful_api/2.0/files/"+item.id+"/content",
	                        fileItem.createDate = item.created_at;
	                        fileItem.formatedDate = moment(item.created_at).format('MMM DD, YYYY');
	                        fileItem.createTime = moment(item.created_at).format('hh:mm a');
	                        fileItem.modDate = item.modified_at;
	                        fileItem.size = item.size;
	                        fileItem.path = item.path_collection.entries;

	                        if (!item.description || item.description.length<1){
	                            item.description = "No description.";
	                        }
	                        if (item.shared_link && item.shared_link.url){

	                            fileItem.hasShared = true;
	                            fileItem.shared = new Object();
	                            fileItem.shared.link = item.shared_link;
	                            if (item.shared_link.download_count){
	                                fileItem.shared.count = item.shared_link.download_count;
	                            }
	                        }

	                        fileItem.canShare = item.permissions.can_share;
	                        fileItem.description = item.description;
	                        fileItem.icon = that.fetchFileIcon(fileItem.name);
	                        allEntries.push(fileItem);
	                    } else if (item.type === "web_link") {
	                        var p = new Object();
	                        p.id = item.id;
	                        p.name = item.name;
	                        p.createDate = item.created_at;
	                        p.formatedDate = moment(item.created_at).format('MMM DD, YYYY');
	                        p.createTime = moment(item.created_at).format('hh:mm a');
	                        p.modDate = item.modified_at;
	                        p.size = item.size;
	                        p.type = "web_link";
	                        if (!item.description || item.description.length<1){
	                            item.description = "No description.";
	                        }
	                        p.description = item.description;

	                        p.canShare = item.permissions.can_share;
	                        if (item.shared_link && item.shared_link.url){

	                            p.hasShared = true;
	                            p.shared = new Object();
	                            p.shared.link = item.shared_link;
	                            if (item.shared_link.download_count){
	                                p.shared.count = item.shared_link.download_count;
	                            }
	                        }

	                        allEntries.push(p);
	                    } else {
	                        var p = new Object();
	                        p.id = item.id;
	                        p.name = item.name;
	                        p.createDate = item.created_at;
	                        p.formatedDate = moment(item.created_at).format('MMM DD, YYYY');
	                        p.createTime = moment(item.created_at).format('hh:mm a');
	                        p.modDate = item.modified_at;
	                        p.size = item.size;
	                        p.type = "other";
	                        if (!item.description || item.description.length<1){
	                            item.description = "No description.";
	                        }
	                        p.description = item.description;

	                        if (item.shared_link && item.shared_link.url){

	                            p.hasShared = true;
	                            p.shared = new Object();
	                            p.shared.link = item.shared_link;
	                            if (item.shared_link.download_count){
	                                p.shared.count = item.shared_link.download_count;
	                            }
	                        }
	                        p.canShare = item.permissions.can_share;

	                        allEntries.push(p);
	                    }
	                });

	                if (allEntries<response.total_count){
	                    that.searchItemMethod(keywords, limit, offset+limit, allEntries);
	                } else {
	                    deferred.resolve(response.total_count);
	                }
	            },
	            error: function (xhr, errorInfo, exception) {
	                //转换输出格式
	                //var errorItem = errorItem.clone();
	                errorItem.requestType = "listFolders";
	                errorItem.statusCode = xhr.status;
	                deferred.reject(errorItem);
	            }
	        });

	        return deferred.promise();
	    },
	    fetchFileIcon:function(filename){
	        if (filename.lastIndexOf(".psd")==filename.length-".psd".length){
	            return "assets/css/kotg/box/PSD.png";
	        } else if (filename.lastIndexOf(".ai")==filename.length-".ai".length){
	            return "assets/css/kotg/box/AI.png";
	        } else if (filename.lastIndexOf(".pptx")==filename.length-".pptx".length){
	            return "assets/css/kotg/box/PPTX.png";
	        } else if (filename.lastIndexOf(".xlsx")==filename.length-".xlsx".length){
	            return "assets/css/kotg/box/XLSX.png";
	        } else if (filename.lastIndexOf(".docx")==filename.length-".docx".length){
	            return "assets/css/kotg/box/DOCX.png";
	        } else if (filename.lastIndexOf(".css")==filename.length-".css".length){
	            return "assets/css/kotg/box/CSS.png";
	        } else if (filename.lastIndexOf(".zip")==filename.length-".zip".length){
	            return "assets/css/kotg/box/ZIP.png";
	        } else if (filename.lastIndexOf(".pdf")==filename.length-".pdf".length){
	            return "assets/css/kotg/box/PDF.png";
	        }else if (filename.lastIndexOf(".mp3")==filename.length-".mp3".length){
	            return "assets/css/kotg/box/MP3.png";
	        }else if (filename.lastIndexOf(".html")==filename.length-".html".length){
	            return "assets/css/kotg/box/HTML.png";
	        }else if (filename.lastIndexOf(".epub")==filename.length-".epub".length){
	            return "assets/css/kotg/box/EPUB.png";
	        }else if (filename.lastIndexOf(".exl")==filename.length-".exl".length){
	            return "assets/css/kotg/box/EXL.png";
	        }else if (filename.lastIndexOf(".jpg")==filename.length-".jpg".length){
	            return "assets/css/kotg/box/JPG.png";
	        }else if (filename.lastIndexOf(".png")==filename.length-".png".length){
	            return "assets/css/kotg/box/PNG.png";
	        }else if (filename.lastIndexOf(".mp4")==filename.length-".mp4".length){
	            return "assets/css/kotg/box/MP4.png";
	        }else{
	            return "assets/css/kotg/box/FILE.png";
	        }
	    },

        shareBoxFile:function(name, email, comment, shareLink){
            var body = {
                name:name,
                email:email,
                comment:comment,
                sharedLink:shareLink
            };
            return $.ajax({
                url: "/knowledgecenter/kotg/box/share",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(body),
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Content-Type", "application/json");
	            	app.encryptionService(xhr);
                }
            });
        }
	};

	var fileItem = {
	            type:"file",
	            id:"文件id",
	            name:"文件名",
	            url:"访问的url",
	            owner:"所有者",
	            ownerId:"所有者id",
	            icon:"当前文件的icon",
	            size:"文件大小",
	            createDate:"创建时间",
	            modDate:"修改时间",
	            share:{
	                hasShare:false,//just for ember
	                link:"",
	                downloadCount:0,
	                viewCount:0
	            }
	};

	var folderItem = {
	            type:"folder",
	            id:"文件ID",
	            name:"目录",
	            url:"访问的url",
	            owner:"所有者",
	            ownerId:"所有者id",
	            icon:"当前文件的icon",
	            size:"文件夹大小",
	            count:"文件数",
	            createDate:"创建时间",
	            modDate:"修改时间",
	    share:{
	        hasShare:false,//just for ember
	        link:"",
	        downloadCount:0,
	        viewCount:0
	    }
	};

	var folderListItem = {
	    statusCode:200,
	    driveType:"box",
	    request_type:"listFolders",
	    path:null,
	    entries:null,
	    "count":0,
	    "offset":0,
	    "limit":0,
	    "shared_link":null
	};

	var errorItem = {
	    statusCode: 401,
	    errorDescription: "",
	    driveType: "box",
	    requestType: "",
	    attach: {
	        //附加属性
	    }
	};

	return boxDriveService;
});

