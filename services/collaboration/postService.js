define(['app', 'httpClient', 'Q', 'services/collaboration/postSearchService', 'controllers/collaboration/utils/postUtil', 'services/tagsService', 'xbbcode'], function(app, httpClient, Q, postSearchService, postUtil, tagsService, xbbcode) {

    //URL end points variable .
    var cclomPostsURL = "/knowledgecenter/cclom/posts/",
        downloadAttachURL = "/knowledgecenter/cclom/download/";

    //push posts data into the activity stream.
    var pushToStream = function(post, verb, postType, __resourceUrl) {
        var pushPromise=Q.defer();
        Ember.Logger.info('[postService] >>[pushToStream]!');
        if (window.activityStream) {
            var _streamDataContract = new activityStream.StreamDataContract(post._id, post.type, verb);
            _streamDataContract.title = post.title;
            if(__resourceUrl){
                _streamDataContract.resourceUrl = __resourceUrl;
            }else{
                _streamDataContract.resourceUrl = "/#/" + postType + "/" + post._id;    
            }
            _streamDataContract.authorUserName = post.author;
            if(postType == 'question' && verb == 'comment'){
                var authorShortName = App.getShortname();
                var discussionTitle = post.title;
                var displayMessage = authorShortName + " has replied to  "+ discussionTitle;
                _streamDataContract.displayMessage = displayMessage;                    
            }
            try {
                if (post.files) {
                    if (_streamDataContract.hasOwnProperty('attachments')) {
                        _streamDataContract.attachments = _.pluck(post.files, "fName").join(",")
                    } else {
                        _streamDataContract['attachments'] = _.pluck(post.files, "fName").join(",")
                    }
                }
            } catch (err) {
                Ember.Logger.error("Error info: " + postType + "s controller : pushToStream :: " + err)
            }
            //activity stream call.
            activityStream.pushToStream(_streamDataContract);
            pushPromise.resolve(activityStream);
            return pushPromise.promise;
        }
        else{
            pushPromise.reject([]);
            return pushPromise.promise;
        }
    };

    //Update post view data.
    var updatePostView = function(postModel, postType) {
        Ember.Logger.info('[postService] >>[updatePostView]!');
        return httpClient.put(cclomPostsURL + "addView/" + postModel._id, {
            user: app.getUsername(),
            displayName: app.getShortname(),
            sessionId: '' + Math.random()
        }).then(function(response) {
            var postId = response._id;
            _.each(postModel.files, function(data) {
                data.id = postId;
            });
            //push data activity stream.
            pushToStream(postModel, "view", postType);
        });
    };

    //setting post index view data before rendering the page.
    var postsIndexViewDidInsertElement = function(postType, thisObject) {
        Ember.Logger.info('[postService] >>[postsIndexViewDidInsertElement]!');
        var self = thisObject;
        if (postType != "blog") {
            var model = self.controller.get('model');
            if (model.successStatus) {
                jQuery("#successMessageDiv").removeClass('hide');
                model.successStatus = false;
            }
        }
        var status = [];
        status = [{
            "value": "Published",
            "label": "Published"
        }, {
            "value": "Draft",
            "label": "Draft"
        }, {
            "value": "inactive",
            "label": "Inactive"
        }];
        var scope = [{
            value: "Public",
            label: "Public"
        }, {
            value: "Restricted",
            label: "Restricted"
        }];
        if (postType == "wiki") {
            $(".icon-external-link").click(function(e) {
                $('.tooltip').hide();
            });
        }
        if (self.controller.filterType == 'all') {
            jQuery(".views-filter").find("input").first().prop("checked", "checked");
        }
    }

    //Observing filter action.
    var filterSelected = function(postType, thisObject) {
        Ember.Logger.info('[postService] >>[filterSelected]!');
        var self = thisObject;
        if (self.get('content').allPosts) {
            self.get('content').allPosts.clear();
        }
        $("#" + postType + "DelMessage").addClass("hide");
        $("#sortingDropdownId li a").removeClass("selected");
        $("#updateDate").addClass("selected");
        Ember.set(self.controllerFor(postType), "showMessage", false);
        getFilter(postType, thisObject);
    }

    //Setting queryParams before _search call.
    var setFilterData = function(type, thisObject) {
        thisObject.get('model').status = '';
        thisObject.set("filterType", type);
        thisObject.set("searchText", "");
        thisObject.set('pageNumber', 1)
    }

    //Getting data on the basis of filter type
    var getFilter = function(postType, thisObject) {
        Ember.Logger.info('[postService] >>[getFilter]!');
        var self = thisObject;
        var filter = self.get("filter");
        switch (filter) {
            case "liked":
                self.controllerFor('application').set('currentPath', postType + ".liked");
                setFilterData("liked", thisObject);
                break;
            case "favorite":
                self.controllerFor('application').set('currentPath', postType + ".favorited");
                setFilterData("favorite", thisObject);
                break;
            case "followed":
                self.controllerFor('application').set('currentPath', postType + ".followed");
                setFilterData("followed", thisObject);
                break;
            case "recent":
                self.controllerFor('application').set('currentPath', postType + ".recent");
                setFilterData("recent", thisObject);
                break;
            case "shared":
                self.controllerFor('application').set('currentPath', postType + ".shared");
                setFilterData("share", thisObject);
                break;
            case "my":
                self.controllerFor('application').set('currentPath', postType + ".index");
                setFilterData("my", thisObject);
                break;
            case "top":
                self.controllerFor('application').set('currentPath', postType + ".index");
                setFilterData("top", thisObject);
                break;
            case "unAnswer":
                self.controllerFor('application').set('currentPath', postType + ".index");
                setFilterData("unAnswer", thisObject);
                break;

            default:
                setFilterData("my", thisObject);
                Ember.Logger.error("No filter type is matching.");
                break;
        }

    }

    //Getting posts model data on the basis of query params and postType.
    var getPostsModel = function(postType, thisObject, queryParams) {            
            var self = thisObject;
            self.controllerFor(postType).status = "";
            if (queryParams.searchText && queryParams.searchText != "") {
                self.controllerFor(postType).searchBoxText = queryParams.searchText;
            }
            _.each(queryParams, function(val, key) {
                self.controllerFor(postType + ".index").set(key, val);
            });
            var postReqType = postType == "blogs" ? 'BLOG' : (postType == 'questions' ? 'FORUM' : 'WIKI');
            permitActivityBasedonPermission(postType, "Create").then(function(createPermissionStatus){
                self.controllerFor(postType + ".index").isUserHasAccessToCreate = createPermissionStatus.permissionStatus;
            }, function(error){
                Ember.Logger.error("Failed to validate user for permissons/roles:" + error);
                self.controllerFor(postType + ".index").isUserHasAccessToCreate = false;
            })
            return postSearchService.getPosts(thisObject, queryParams, postReqType).then(function(res) {
                if (res.allPosts && res.allPosts.length == 0) {
                    self.controllerFor(postType).status = "No " + postType + " to display";
                }
                App.PostStatsUtil.cloudstats(res.allPosts, postType.substring(0, (postType.length - 1)));
                return permitActivityBasedonPermission(postType, "Delete").then(function(permissionData){
                _.each(res.allPosts,function(result){
                    result.isUserHasAccessToDelete= ((permissionData.permissionStatus) || (result.author == App.getUserLoginId()));
                });
                return res;
                },function(error){
                     _.each(res.allPosts,function(result){
                        result.isUserHasAccessToDelete = false || (result.author == App.getUserLoginId());
                    });
                    return res;
                });

            }, function(error) {
                Ember.Logger.error("Error in getting data from post search service >>:", error);
                return [];
            });

        }
     //Download attach file on the basis of fileNaem and postId.
    var downloadAttachFile = function(fileName, postId) {
        $.fileDownload(downloadAttachURL + postId + "/" + fileName)
            .done(function() {
                Ember.Logger.info('File download a success!');
            })
            .fail(function() {
                Ember.Logger.error('File download failed!');
            });
    }

    //Delete a post of the basis of postId and postType.
    var deletePosts = function(postType, thisObject, post) {
        var self = thisObject;
        $("#" + postType + "DelMessage").addClass("hide");
        $.ajax({
            url: cclomPostsURL + post._id,
            type: 'DELETE',
            contentType: "application/json",
            beforeSend: function(xhr) {
                httpClient.setRequestHeadersData(xhr);
            },
            success: function(result) {
                //Remove post entry from model.
                self.get('model').allPosts.removeObject(post);
                //call to activity stream.
                pushToStream(post, "delete", postType);
                //check filter type
                getFilter(postType + "s", thisObject);
                $("#" + postType + "DelMessage").removeClass("hide");
                jQuery.gritter.add({
                    title: "",
                    text: "Deletion is successful.",
                    class_name: "gritter-success"
                });
            },
            error: function(error) {
                jQuery.gritter.add({
                    title: '',
                    text: postUtil.firstCharToUpperCase(postType) + 'deletion failed. Please try again.',
                    class_name: 'gritter-error'
                });
            }
        });

    };
    
    //Delete a post.
    var deleteAPost = function(postType, thisObject, aPost) {
        var controller = thisObject.controllerFor(postType + "s");
        $.ajax({
            url: cclomPostsURL + aPost._id,
            type: 'DELETE',
            contentType: "application/json",
            beforeSend: function(xhr) {
                httpClient.setRequestHeadersData(xhr);
            },
            success: function(result) {
                pushToStream(aPost, "delete", postType);
                try{
                    controller.target.transitionTo(postType + "s.index", {
                        queryParams: {
                            showMessage: true
                        }
                    });
                }catch(err){
                    Ember.Logger.error("[postService :: ] [deleteAPost >>>] ", error)
                    jQuery.gritter.add({
                        title: "",
                        text: postUtil.firstCharToUpperCase(postType) + " deletion failed. Please try again.",
                        class_name: "gritter-error"
                    }); 
                }        
            },
            error: function(error) {
                jQuery.gritter.add({
                    title: "",
                    text: postUtil.firstCharToUpperCase(postType) + " deletion failed. Please try again.",
                    class_name: "gritter-error"
                });
            }
        });

    }

    var postComment = function(postType, thisObject) {
        var self = thisObject;
        var post = thisObject.get('model');
        var commentObj = {
            "user": thisObject.get('currentUser'),
            "userName": thisObject.get('currentUserShortName'),
            "commentText": thisObject.get("commentText"),
            "commentStatus": "active",
            "userId": thisObject.get('currentUser'),
            "files": [],
            "comments": [],
            "ancestors": [],
            "flags": []
        };
        return httpClient.put(cclomPostsURL + "addComments/" + post._id, commentObj).then(function(response) {
            post.comments.unshiftObject(response.commentObj);
            self.set("commentText", "");
        }, function(error) {
            Ember.Logger.error(error);
        });

    }

    var sharePost = function(postType, thisObject, postId, share) {
        var shares = "";
        var action = "";
        var shareDetails = jQuery("#shareForPost").val();
        if (shareDetails) {
            shares = shareDetails;
            share = shares;
        }
        if (!shares) {
            action = "removeAll"
            shares = [];
            share = "";
        }
        var postModel = thisObject.get("model");
        postModel.set("sharing", true);
        postModel.set("messageStatus", false);
        postModel.set("messages", "");
        if (!share && !postModel.postShares.length) {
            try {
                Ember.FlashQueue.pushFlash('warning', 'No user to share');
            } catch (e) {
                Ember.Logger.error("Error in sharing the " + postType);
            }
            return;
        }
        var existingShares = postModel.postShares;
        var shareStatus = App.postsShareActivityBuilderUtil.callToShareBuilderFromPopup(existingShares, shares, postModel._id, action);
        var self = thisObject;
        if (shareStatus == 0) {
            var model = self.get("model");
            model.set("messageStatus", true);
            model.set("sharing", false);
            model.set("messages", "Please Add or Remove the share details");
            return;
        }
        var postData = App.ResourceShareUtil.populatePostsShareData(null, postModel, share, postModel._id);
        httpClient.put(cclomPostsURL + postModel._id, postModel).then(function(data) {
            var model = self.get("model");
            if (postData.streamDataContract && postData.streamDataContract.sharedWith.length > 0) {
                //push to activity stream
                var activityStreamResponse = activityStream.pushToStream(postData.streamDataContract);
                Q.all([activityStreamResponse]).then(function() {
                    Ember.Logger.info("Share info has been captured in AS sucessfully.")
                }, function(err) {
                    Ember.Logger.info("Share info has not been captured in AS.")
                })
            }
            model.set("messageStatus", true);
            model.set("sharing", false);
            model.set("messages", "The changes made to sharing have been updated successfully");

        }, function(error) {
            model.set("messageStatus", false);
            model.set("sharing", false);
            model.set("messages", "Unexpected error while sharing");
            Ember.Logger.error("error - ", error);
        });

    };

    var getSharedDetails = function(thisObject, postId) {
        var self = thisObject;
        var alreadySharedData = [];
        var postShareEndPoint = cclomPostsURL + postId;
        return httpClient.get(postShareEndPoint).then(function(postData) {
            if (postData.post && postData.post.postShares.length > 0) {
                alreadySharedData = _.map(postData.post.postShares, function(sharedObj) {
                    return {
                        'share': sharedObj.share,
                        'display': sharedObj.display,
                        'type': sharedObj.type
                    };
                });
                return alreadySharedData;
            }
            return alreadySharedData;
        }, function(err) {
            Ember.Logger.error("Error in getting shared details >>", err);
            return alreadySharedData;
        });
    };

    var openShareModel = function(postType, thisObject, postId) {
        var self = thisObject;
        getSharedDetails(thisObject, postId).then(function(alreadySharedData) {
            var model = self.controllerFor(postType).get('model');
            model.set("sharing", false);
            model.set("messageStatus", false);
            model.set("messages", "");
            self.controllerFor(postType).set('alreadySharedData', alreadySharedData);
            if (alreadySharedData.length > 0) {
                var shares = [];
                _.each(alreadySharedData, function(share, key) {
                    shares.push({
                        value: share.share + '|' + share.display + '|' + share.type,
                        text: share.display
                    });
                })
                model.set('share', shares);
            }

        });
        jQuery('#sharePost').modal('show');
    };

    var buildModel = function(postType, thisObject, postId) {
        var self = thisObject,
            relatedType = "",
            tags = "Tags";
        var modelObject = {
            statsMetaData: Ember.Object.create({
                likesCount: 0
            }),
            writeAccess: false,
            shareAccess: false
        };
        tags = postType + tags;
        try{
            relatedType = "related" + postUtil.firstCharToUpperCase(postType) + "s";
        }catch(err){
            relatedType="related" + postType+ "s";
            Ember.Logger.error("[postService::][buildModel]:",err);
        }
        
        modelObject[relatedType] = [];
        modelObject[tags] = Ember.Object.create({
            tags: ""
        });
        var model = Ember.Object.create(modelObject);
        return httpClient.get(cclomPostsURL + postId+"?postType="+postType)
            .then(function(postData) {
                var postDetails = postData.post;
                _.each(_.keys(postDetails), function(key) {
                    model.set(key, postDetails[key]);
                });

                if (postData.resources) {
                    model.set("writeAccess", postData.writeAccess);
                    model.set("shareAccess", postData.shareAccess);
                }
                if (_.findWhere(postData.post.permissions, "comment")) {
                    model.set("writeAccess", true);
                } else {
                    model.set("writeAccess", false);
                }
                if (_.findWhere(postData.post.permissions, "share")) {
                    model.set("shareAccess", true);
                } else {
                    model.set("shareAccess", false);
                }
                return permitActivityBasedonPermission(postType, "Delete").then(function(permissionData){
                    model.isUserHasAccessToDelete= ((permissionData.permissionStatus) || (model.author == App.getUserLoginId()));
                    return getCommentsCount(postData.post._id,postType).then(function(commentsCount){
                        model.commentsCount= commentsCount.count;
                        return model;
                    }, function(err){
                        Ember.Logger.error("Error in validating permissions: " + err);
                        model.commentsCount= 0;
                        return model;    
                    });
                }, function(err){
                    Ember.Logger.error("Error in validating permissions: " + err);
                    model.isUserHasAccessToDelete= ( false || (model.author == App.getUserLoginId()));
                    return model;    
                });

            }, function(err) {
                Ember.Logger.error("Error while retrieving resource details", err.responseText);
                return model;
            });
    };

    var createActivityStreamObject = function(postType, model) {
        var streamDataContract = new activityStream.StreamDataContract(model._id, model.type);
        streamDataContract.title = model.title;
        streamDataContract.resourceUrl = "/#/" + postType + "/" + model._id;
        streamDataContract.authorUserName = model.author;
        return streamDataContract;
    };
    var onIframeMessage = function(postType) {
        if (!$('.uyan-comment').data('loaded')) {
            $('.uyan-comment').data('loaded', true);
            return;
        }
        var viewInstance = window.App.__container__.lookup('view:'+postType+'.index');
        var model = window.App.__container__.lookup('controller:' + postType + '.index').get('model');
        var streamDataContract = viewInstance.createActivityStreamObject( model);
        streamDataContract.verb = 'comment';
        activityStream.pushToStream(streamDataContract);
    };

    var onCloudletActivity = function(postType, thisObject, activityType) {
        var model = thisObject.controller.get('model');
        // push to activity stream

        var streamDataContract = thisObject.createActivityStreamObject( model);
        switch (activityType.activity) {
                case comments.getConfig().pluginType:
                    streamDataContract.verb = 'comment';
                    break;
                case rating.getConfig().pluginStateOn:
                    streamDataContract.verb = 'rate';
                    break;
                case rating.getConfig().pluginStateOff:
                    streamDataContract.verb = 'un-rate';
                    break;
                case follow.getConfig().pluginStateOn:
                    streamDataContract.verb = 'follow';
                    break;
                case favorite.getConfig().pluginStateOn:
                    streamDataContract.verb = 'favorite';
                    break;
                case like.getConfig().pluginStateOn:
                    streamDataContract.verb = 'like';
                    break;
                case follow.getConfig().pluginStateOff:
                    streamDataContract.verb = 'un-follow';
                    break;
                case favorite.getConfig().pluginStateOff:
                    streamDataContract.verb = 'un-favorite';
                    break;
                case like.getConfig().pluginStateOff:
                    streamDataContract.verb = 'un-like';
                    break;
        }
        activityStream.pushToStream(streamDataContract);
    };


    var postIndexDidInsertElement = function(postType, thisObject) {
        if(postType == 'question'){
            try{
                var postContent = thisObject.content;                 
                var result = xbbcode.XBBCODE.process({
                        text: postContent,
                        removeMisalignedTags: 1,
                        addInLineBreaks: 1
                });
                thisObject.content = result;
            }catch(error){
                Ember.Logger.error("[postService][getPostsModel ::] >> Unable to parse bbcode..Ignore & proceed!! [" , error , "]");
            }               
        }            

        try {
            App.displayContentInNewTab("message-body", 1);
        } catch (err) {
            Ember.Logger.error("Error in Content Full View: " + err);
        }
        var postIndexView = thisObject;
        thisObject.$().find('[data-rel=tooltip]').tooltip();
        if (window.social) window.social.render();
        if (window.activityStream) {
            postIndexView.$().on("cloudlet:activity", function(e, activityType) {
                onCloudletActivity(postType, thisObject, activityType)
            });
        }
        /* Added to open any link in the post content in new tab */
        jQuery(".message-body").find('a').prop('target', '_blank');
        var model = postIndexView.controller.get('model')
        if (model.successStatus) {
            jQuery("#successMessageDiv").removeClass('hide');
            model.successStatus = false;
        }
        permitActivityBasedonPermission(postType,"Comment").then(function(permissionData){
            model.set("commentsPermissionStatus",permissionData.permissionStatus);
        }, function(err){
            Ember.Logger.error("Error in validating permissions: " + err);
            model.set("commentsPermissionStatus", false);
        });
        /* Jiathis comments*/
        if (window.UYANCMT) {
            var model = postIndexView.controller.get('model');
            UYANCMT.loadBox(model._id, postType, model.title, model.author);
        }
        //Hide tooltip when fullview icon is clicked
        $(".icon-external-link").click(function(e) {
            $('.tooltip').hide();
        });

    };

    var activityStreamPostForDiscussion = function(model, postType){
        var viewInstance = window.App.__container__.lookup('view:' + postType + '.index');
        var streamDataContract = viewInstance.createActivityStreamObject(postType, model);
        streamDataContract.verb = 'comment';
        pushToStream(model, streamDataContract.verb, postType);
    };

    var permitActivityBasedonPermission = function(postType, permission){
       var __permission;
        if(postType == 'blogs' || postType == 'blog' ){
            __permission = permission + "Blog"           
        }else if(postType == 'questions' || postType == 'question'){
            __permission = permission + "Discussion"   
        }else if(postType == 'wikis' || postType == 'wiki' ){
            __permission = permission + "Wiki" 
        }else if(postType == 'community'){
            __permission = permission + "Community"
        }else if(postType == ""){
            __permission = permission
        }
        var urlTogetPermissionForUserToCreate = "/knowledgecenter/cclom/subject/role/"+__permission;
        return result = jQuery.ajax({
            url: urlTogetPermissionForUserToCreate,
            type:'GET',
            beforeSend: function(xhr) {
                httpClient.setRequestHeadersData(xhr);
            },
            success: function(permissionData) {
               if(permissionData && permissionData.permissionStatus){
                    return permissionData;  
               }else{
                    return {permissionData: {permissionStatus: false}}
               } 
               
            },
            error: function(error) {
               Ember.Logger.error("Error in getting permission details >>", error);
               var permissionData = {permissionStatus:false}
               return permissionData;                 
            }
        });
    }

    //Get total comments count 
    var getCommentsCount = function(postDataIds,postType){
        var urlTogetTotalCommentsCount = "/knowledgecenter/jiathis/countComments?entityId="+postDataIds+"&entityType="+postType;        
        return result = jQuery.ajax({
            url: urlTogetTotalCommentsCount,
            type:'GET',
            contentType: "application/json",            
            beforeSend: function(xhr) {
                httpClient.setRequestHeadersData(xhr);
            },
            success: function(totalCommentsCount) {
               return totalCommentsCount;
            },
            error: function(error) {
               Ember.Logger.error("Error in getting total comments details >>",error);
               return {count: 0};
            }
        });
    }
    var getProxyUsersInAutoSuggestBox = function(communityId,controller,resourceType){
        var self=this;
        var permission;
          if(resourceType == 'Blogs'){
                permission = "ContributeBlogs";           
            }else if(resourceType == 'Discussions'){
                permission = "ContributeDiscussions";   
            }else if(resourceType == 'Wikis'){
                permission = "ContributeWikis"; 
            }else if(resourceType == 'Files'){
                permission = "ContributeFiles"; 
            }else if(resourceType == 'CommunityProxyBlogger'){
                permission = "CommunityProxyBlogger"; 
            }else if(resourceType == 'ManageCommunityMembers'){
                permission = "ManageCommunityMembers"; 
            }else if(resourceType == 'Moderator'){
                permission = "Community Moderator"; 
            }
         self.getProxyUsersList(communityId,permission).then(function(proxyUserList){
              var obj=new Array();
              var objProxy=new Array();
              proxyUserList = App.uniqObjects(proxyUserList)
              _.each(proxyUserList,function(proxy){
                 obj.push({id:proxy.displayName+'('+proxy.userId+')',text:proxy.displayName+'('+proxy.userId+')'});
                 objProxy.push(proxy.displayName+'('+proxy.userId+')');
               });
               var filteredList = App.uniqObjects(objProxy)
               var fiterObj=App.uniqObjects(obj);
               controller.set('proxyUserList', filteredList);
                $("#blogProxyUserList.typeahead").select2({
                  placeholder: "Select a user",
                  data: fiterObj,
                  allowClear: true
                }).on("select2-selecting", function(e) {
                   console.log("selecting val=",e.val,e.object.text);
                })

          }).fail(function(err){
            Ember.Logger.error("[postService :: getProxyUsersInAutoSuggestBox :: getProxyUsersList]",err);
            return [];
          });  
    }    

    var getRolesForUserInCommunity=function(resourceId,userId){
        var urlForUserInCommunity = "/knowledgecenter/cclom/subject/"+resourceId+"/bloggers/"+userId+"/proxy?resourceType=community";
        return httpClient.get(urlForUserInCommunity).then(function(communityRoles){
            if(communityRoles){
                return communityRoles;
            }else{
                return [];
            }
        }, function(error){
            Ember.Logger.error("[postService :: ][getRolesForUserInCommunity >>>]", error);
            return [];
        })

    }
    
    //Get list of all BlogProxy (role) Users (TODO: has to be updated with auto suggest once available)
    var getProxyUsersList = function(communityId,contributeType){
        var ProxyId=App.getUserLoginId();
        var urlToGetProxyUsers = "/knowledgecenter/cclom/bloggers/proxy/" + ProxyId+'?resourceType=blog' ;
        if(communityId && communityId!=""){
            urlToGetProxyUsers="/knowledgecenter/cclom/subject/"+communityId+"/bloggers/proxy?resourceType=community&contributeType="+contributeType
        }
        return result = jQuery.ajax({
            url: urlToGetProxyUsers,
            type:'GET',
            contentType: "application/json",
            beforeSend: function(xhr) {
                httpClient.setRequestHeadersData(xhr);
            },
            success: function(blogProxyUsers) {
               var __blogProxyUsers = []
               try{
                   if(blogProxyUsers){
                        __blogProxyUsers = App.uniqObjects(blogProxyUsers) 
                   }else{
                        __blogProxyUsers = blogProxyUsers
                   }
               }catch(error){
                    __blogProxyUsers = blogProxyUsers
                    Ember.Logger.error("[postService :: ] [getProxyUsersList :: ] Issue in constructing unique objects.", error)
               }
               return __blogProxyUsers;
            },
            error: function(error) {
                 Ember.Logger.error("Error in getting blog proxy users list:  >>", error);
            }
        }); 
    }    

    var validateProxyUser=function(thisObject){
       var owner = jQuery("#blogProxyUserList.typeahead").val();
       var proxyUserList=thisObject.get('proxyUserList');
       var post = thisObject.get('model');
       if(owner){
             if(owner==""){  
                 return 1;
             }
             else if(owner !="" && proxyUserList==null)
             {
                 jQuery.gritter.add({
                                title: 'Invalid user ',
                                text: 'Invalid user.',
                                class_name: 'gritter-error'
                            });
                      return 0;   

             }
             else if(owner && owner!="" && owner.indexOf('(') !=-1 && owner.indexOf(')') !=-1 && proxyUserList!=null){
                try{
                    if(proxyUserList.indexOf(owner) !=-1){
                    var displayName=owner.substring(0,owner.indexOf('('));
                    var userId=owner.substring(owner.indexOf('(')+1,owner.indexOf(')')) 
                    var pattern =/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                     if(pattern.test(userId)){
                        return displayName+'|'+userId;
                     }
                     else{
                       jQuery.gritter.add({
                                title: 'Invalid email format',
                                text: 'Invalid email format for blog proxy.',
                                class_name: 'gritter-error'
                            });
                        return 0;
                     }   
                  }
                  else{
                         jQuery.gritter.add({
                                title: 'Invalid user ',
                                text: 'Invalid user.',
                                class_name: 'gritter-error'
                            });
                      return 0;   
                      }        
                }catch(err){
                        Ember.Logger.error("Error in retrieving proxy user data." + err);
                        return 0;
                } 

             }
             else{
                  jQuery.gritter.add({
                                title: 'Invalid email ',
                                text: 'Invalid email for blog proxy.',
                                class_name: 'gritter-error'
                            });
                  return 0;
             }        
         }else{
            return 1;
         }

    }

    var getUsersForRole = function(){
        var userRoles=Q.defer();
        try{
            var endPoint = "/knowledgecenter/cclom/search/user/Blogger";
            return httpClient.get(endPoint).then(function (users) {
                 var reqUsers=[];
                 _.each(users,function(item){
                    reqUsers.push({
                        displayName: item._source.fullName,
                        userId: item._source.username
                    })
                 }) 
                return reqUsers;
            }).fail(function(err){
               Ember.Logger.error("[ postService :: ][getUsersForRole >>>]", JSON.stringify(err));
               return [];
            });
        }catch(error){
            Ember.Logger.error("[postService :: ][tempGetUsersForRole >>>]", error);
            userRoles.reject([]);
            return userRoles.promise;
        }    
    }

    var getRolesForUser = function(userId){
        var profileInfoLink = "/knowledgecenter/userpi/user/" + userId + "/profile";
        return httpClient.get(profileInfoLink).then(function(profileInfo){
            if(profileInfo && profileInfo.roles){
                return profileInfo.roles;
            }else{
                return [];
            }
        }, function(error){
            Ember.Logger.error("[postService :: ][getRolesForUser >>>]", error);
            return [];
        })
    }

    var getPredefinedRolesForUser = function(){
        var predefinedRolesForCommunity = "/knowledgecenter/cclom/pdr/roles";
        return httpClient.get(predefinedRolesForCommunity).then(function(prdefinedCommunityRoles){
            if(prdefinedCommunityRoles && prdefinedCommunityRoles.roles){
                return prdefinedCommunityRoles.roles;
            }else{
                return [];
            }
        }, function(error){
            Ember.Logger.error("[postService :: ][getPredefinedRolesForUser >>>]", error);
            return [];
        })
    }
    var validateBloggerProxy=function(communityId){
        var self=this;
         if(communityId && communityId !=''){
            return self.getRolesForUserInCommunity(communityId,App.getUserLoginId()).then(function(communityRoles){
                        var communityRoleIds=_.pluck(communityRoles,'roleId');
                        if(communityRoleIds.indexOf("CommunityProxyBlogger") !=-1)
                           return true
                        else
                           return false;

                    }).fail(function(err){
                        Ember.Logger.error('[postService :: validateBloggerProxy ::getRolesForUserInCommunity]',err);
                        return false;
                    });
               } 
         else
           {
            return self.permitActivityBasedonPermission("", "BloggerProxy").then(function(createPermissionStatus){
                    return createPermissionStatus.permissionStatus;
                }).fail(function(error){
                    Ember.Logger.error('[postService :: validateBloggerProxy ::permitActivityBasedonPermission]',err);
                    return false;
                })
           }     
    } 
    //Handling all the posts requests.
    return {
        pushToStream: pushToStream,
        updatePostView: updatePostView,
        postsIndexViewDidInsertElement: postsIndexViewDidInsertElement,
        filterSelected: filterSelected,
        getPostsModel: getPostsModel,
        downloadAttachFile: downloadAttachFile,
        deletePosts: deletePosts,
        deleteAPost: deleteAPost,
        postComment: postComment,
        sharePost: sharePost,
        openShareModel: openShareModel,
        buildModel: buildModel,
        postIndexDidInsertElement: postIndexDidInsertElement,
        createActivityStreamObject: createActivityStreamObject,
        activityStreamPostForDiscussion: activityStreamPostForDiscussion,
        permitActivityBasedonPermission: permitActivityBasedonPermission,
        getProxyUsersList: getProxyUsersList,
        validateProxyUser: validateProxyUser,
        getUsersForRole: getUsersForRole,
        getRolesForUser: getRolesForUser,
        getCommentsCount: getCommentsCount,
        getProxyUsersInAutoSuggestBox: getProxyUsersInAutoSuggestBox,
        getRolesForUserInCommunity: getRolesForUserInCommunity,
        getPredefinedRolesForUser: getPredefinedRolesForUser,
        validateBloggerProxy:validateBloggerProxy
    }
});
