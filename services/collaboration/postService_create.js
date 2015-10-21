/**
 * @class postService_create.js
 * This class is a client stub for the handling posts create  requests at service level.
 * @author Mohan Rathour
 * TODO we will move all the services calls from controller level  to services layer.
 */
define(['app', 'httpClient', 'Q', 'controllers/collaboration/utils/postUtil', 'pages/wysiwyg+tags', 'services/collaboration/postService', 'services/tagsService', 'services/groupService', 'services/jabberUsersService'],
    function(app, httpClient, Q, postUtil, ui, postService, tagsService, groupService, jabberUsersService) {
        var cclomPostsURL = "/knowledgecenter/cclom/posts/meta";

        //Return the post type on the basis of postType.
        var postTypeForMessage = function(postType) {
            return (postType === "question") ? "discussion" : postType;
        };

        //After successful post creation, This function will push the data to AS and Share builder .
        var afterSuccessfulPostCreation = function(postType, self, data, postData, successMessage, contentDiv) {
            var postId = data._id;
            //push data to AS
            postService.pushToStream(data, "create", postType);
            contentDiv=""
            //Getting post data by id and postType.
            postService.buildModel(postType, self, data._id).then(function(model) {
                model.successStatus = true;
                model.successMessage = successMessage;
                _.each(model.files, function(res) {
                    res.id = postId;
                });
                self.transitionTo(postType, model);
                if (self.communityId) {
                        var communityRoute="details";
                        if(postType=="blog")
                        {
                            communityRoute="blogs";

                        }else if(postType=="question")
                        {
                            communityRoute="discussions";
                        }else if(postType=="wiki")
                        {
                            communityRoute="wikis";
                        }

                    self.transitionToRoute('community.'+communityRoute, self.communityId);
                }
            },function(model){
                //TODO: Remove code duplication
                  try{
                        model.successStatus = true;
                        model.successMessage = successMessage;
                        _.each(model.files, function(res) {
                            res.id = postId;
                        });
                        self.transitionTo(postType, model);
                        if (self.communityId) {
                                var communityRoute="details";
                                if(postType=="blog")
                                {
                                    communityRoute="blogs";

                                }else if(postType=="question")
                                {
                                    communityRoute="discussions";
                                }else if(postType=="wiki")
                                {
                                    communityRoute="wikis";
                                }

                            self.transitionToRoute('community.'+communityRoute, self.communityId);
                        }                    
                    }catch(err){
                        Ember.Logger.error("Issue in [postService_create::afterSuccessfulPostCreation] " + err)
                    }  
            });
            if (postData.streamDataContract) {
                postData.streamDataContract.resourceId = data._id;
                activityStream.pushToStream(postData.streamDataContract);
            }
            var shareData;
            _.each(data.postShares, function(sharedata) {
                if (shareData) {
                    shareData = shareData + "," + sharedata.share + "|" + sharedata.display + "|" + sharedata.type;
                } else {
                    shareData = sharedata.share + "|" + sharedata.display + "|" + sharedata.type;
                }
            });
            //checking share condition,if share then index to ES.
            if (shareData) {
                App.postsShareActivityBuilderUtil.callToShareBuilder(shareData, [], postId);
            }
        };

        //This funcation is used to handle post creation.
        var createPost = function(postType, thisObject) {
            var self = thisObject,
                post = thisObject.get('model');
            if(self.communityId){
                var communityId = self.communityId;
                post.set('communityId', communityId);
            }else{
                var communityId = "";
                post.set('communityId', communityId);
            }
            var contentDiv= CKEDITOR.instances['wysiwyg-editor'].getData() 
            if (contentDiv == undefined || contentDiv.length == 0) {
                contentDiv = $("#wysiwyg-editor").html().trim();
            }
            var scopeValue = $('select#scopeSelector').val();
            if (scopeValue) {
                post.set('scope', scopeValue);
            } else {
                post.set('scope', "public");
            }
            var statusValue = $('select#statusSelector').val();
            if (statusValue) {
                post.set('status', statusValue);
            } else {
                post.set('status', "published");
            }
            var selectedCategory = $('select#categorySelector').val();
            if (selectedCategory) {
                var categoryObject = _.findWhere(self.get('model').postsCategories, {
                    _id: selectedCategory
                });
                post.set("category", categoryObject);
            }
            if(contentDiv.length==0){
                post.set('content', "");
            }else{
                post.set('content', contentDiv);
            }
            var tags = ($("#tagsField").length == 0) ? [] : $("#tagsField").val().split(",");
            post.set('tags', ((tags.length && tags[0]) ? tags : []));
            post.permissions.splice(1, 3);
            if (post.get('isEditPermissionChecked')) {
                post.permissions.addObject('edit');
            }
            if (post.get('isCommentPermissionChecked') || jQuery(".allowreplies").find('input').val() == 'on') {
                post.permissions.addObject('comment');
            }
            if (post.get('isSharePermissionChecked')) {
                post.permissions.addObject('share');
            }

            post.errors.clear();
            post.validate().then(function() {
                    if (!post.get('isValid')) {
                        Ember.Logger.error(post.errors);
                    } else {
                        var _post = {
                            type: post.get('type'),
                            author: App.getUserLoginId(),
                            authorName: post.get('authorName'),
                            tenantId: post.get('tenantId'),
                            permissions: post.get('permissions'),
                            title: post.get('title'),
                            tags: post.get('tags'),
                            scope: post.get('scope'),
                            status: post.get('status'),
                            content: post.get('content'),
                            files: post.get('files'),
                            category: post.get('category'),
                            communityId:post.get('communityId')
                        }
                        var postData = {
                            streamDataContract: null
                        };
                        var formData = new FormData();
                        var shareDetails = jQuery("#form-field-mask-2").val();
                        shareDetails ? ( post.set('share', shareDetails.split(','))) : (delete post.share, delete post.shares);
                       
                        if (post.get('share')) {
                            _post.postShares = [];
                            formData.append('postShares', []);
                            postData = App.ResourceShareUtil.populatePostsShareData(post, _post, null, post.id);
                            formData.append('postShares', JSON.stringify(postData.postObject.postShares));
                        }
                        var uploadFile = post.get('fileuploadData');
                        if (uploadFile && uploadFile.length != 0) {
                            formData.append("attachmentStatus", "true");
                        } else {
                            formData.append("attachmentStatus", "false");
                        }
                        formData.append('type', post.get('type'));
                        if(postType=='blog'){
                             var bloggerValidate=postService.validateProxyUser(thisObject);
                                if(bloggerValidate==1){
                                    formData.append('author',App.getUserLoginId());
                                    formData.append('authorName', post.get('authorName'));
                                }
                                else if(bloggerValidate==0)
                                {
                                    return ;
                                }
                                else
                                {
                                    formData.append('author',bloggerValidate.split('|')[1]);
                                    formData.append('authorName', bloggerValidate.split('|')[0]);
                                }
                        }
                        else{
                             formData.append('author',App.getUserLoginId());
                             formData.append('authorName', post.get('authorName'));  
                        }
                        formData.append('communityId',post.get('communityId'));
                        formData.append('tenantId', post.get('tenantId'));
                        formData.append('permissions', post.get('permissions'));
                        formData.append('title', post.get('title').trim());
                        formData.append('tags', JSON.stringify(post.get('tags')));
                        formData.append('scope', post.get('scope'));
                        formData.append('status', post.get('status'));
                        formData.append('content', post.get('content'));
                        formData.append('files', []);
                        formData.append('category', JSON.stringify(post.get('category')));
                        var postRequest;
                        return postRequest = $.ajax({
                            url: cclomPostsURL,
                            type: "POST",
                            data: formData,
                            cache: false,
                            dataType: "json",
                            processData: false,
                            contentType: false,
                            beforeSend: function(xhr) {
                                httpClient.setRequestHeadersData(xhr);
                            },
                            success: function(data, textStatus, jqXHR) {
                                var successMessage;
                                try{
                                    if(data.type == 'FORUM'){
                                        UYANCMT.register(data._id, "question", data.title)         
                                    }
                                }catch(err){
                                    Ember.Logger.error("postService_create :: createPost :::", err)
                                }
                                
                                if (data.attachmentStatus == "noAttach") {
                                    successMessage = "You have created the " + postTypeForMessage(postType) + " successfully";
                                    afterSuccessfulPostCreation(postType, self, data, postData, successMessage, contentDiv);
                                } else if (data.attachmentStatus == "attachment") {
                                    _.each(uploadFile, function(obj, index) {
                                        formData.append('file', obj);
                                    });
                                    formData.append('postId', data._id);
                                    formData.append('newTenantId', data.tenantId);
                                    return uploadAttachmentRequest = $.ajax({
                                        url: '/cclom/cclom/posts/attachment',
                                        type: 'POST',
                                        data: formData,
                                        cache: false,
                                        dataType: 'json',
                                        processData: false,
                                        contentType: false,
                                        beforeSend: function(xhr) {
                                            httpClient.setRequestHeadersData(xhr);
                                        },
                                        success: function(data, textStatus, jqXHR) {
                                            if (data.attachmentStatus == "failed") {
                                                successMessage = "You have created the " + postTypeForMessage(postType) + " successfully but File has not been uploaded"
                                                afterSuccessfulPostCreation(postType, self, data, postData, successMessage, contentDiv);
                                            } else {
                                                successMessage = "You have created the " + postTypeForMessage(postType) + " successfully with Attachment(s)";
                                                afterSuccessfulPostCreation(postType, self, data, postData, successMessage, contentDiv);
                                            }
                                        }
                                    });
                                }
                            },
                            error: function() {
                                jQuery.gritter.add({
                                    title: '',
                                    text: postUtil.firstCharToUpperCase(postTypeForMessage(postType)) + ' creation failed. Please try again.',
                                    class_name: 'gritter-error'
                                });
                            }
                        });
                    }
                },
                function(err) {
                    Ember.Logger.error(err);
                });
        };

        //This funcation is used to handle post creation.
        var extractPostContentFromChatSession = function(postType, chatSession) {
            var filteredContact = _.find(jabberService.model.contacts, function(contact) {
                return contact.name.split("@")[0] === chatSession;
            })
            var userDetailsMap = jabberUsersService.lookUpUserInfo(chatSession);
            var chatTranscript = {};
            var chattingTo = userDetailsMap["shortName"];
            var chattingAs = app.getShortname();
            chatTranscript.chattingTo = chattingTo;
            switch (postType) {
                case "blog":
                    var chattingToUserName = userDetailsMap["username"];
                    chatTranscript.blogContent = ""
                    _.each(filteredContact.messages, function(message) {
                        var sender = message.sent ? chattingAs : chattingTo;
                        chatTranscript.blogContent += ("<b>" + sender + "</b>" + ": " + message.body + "<br/>");
                    });
                    chatTranscript.shares = []
                    var shareDetails = {
                        display: chattingTo,
                        share: chattingToUserName,
                        type: "email",
                        permission: ["view"],
                        _id: ""
                    };
                    chatTranscript.shares.push(shareDetails);
                    break;
                case "wiki":
                    chatTranscript.wikiContent = ""
                    _.each(filteredContact.messages, function(message) {
                        var sender = message.sent ? chattingAs : chattingTo;
                        chatTranscript.wikiContent += ("<b>" + sender + "</b>" + ": " + message.body + "<br/>");
                    });
                    break;
                default:
                    Ember.Logger.info("No filter type is matching.");
                    break;
            }
            return chatTranscript;
        };

        //Handle chat room request.
        var extractPostContentFromChatRoom = function(postType, roomName) {
            var myChatRoom = jabberService.roomDetailsFor(roomName);
            var chatTranscript = {};
            chatTranscript.shares = []
            _.each(myChatRoom.occupantsJabberIds, function(jabberID) {
                var details = jabberUsersService.lookUpUserInfo(jabberID);
                if (details.username != App.getUserLoginId()) {
                    var shareDetails = {
                        display: details.shortName,
                        share: details.username,
                        type: "email",
                        permission: ["view"],
                        _id: ""
                    };
                    chatTranscript.shares.push(shareDetails);
                }
            });
            switch (postType) {
                case "blog":
                    chatTranscript.blogContent = ""
                    _.each(myChatRoom.messages, function(message) {
                        if (message.isNotification)
                            chatTranscript.blogContent += ("<i>" + message.body + "</i><br/>");
                        else
                            chatTranscript.blogContent += ("<b>" + message.user.shortName + "</b>" + ": " + message.body + "<br/>");
                        chatTranscript.chattingTo = "group"

                    });
                    break;
                case "wiki":
                    chatTranscript.wikiContent = ""
                    _.each(myChatRoom.messages, function(message) {
                        if (message.isNotification)
                            chatTranscript.wikiContent += ("<i>" + message.body + "</i><br/>");
                        else
                            chatTranscript.wikiContent += ("<b>" + message.user.shortName + "</b>" + ": " + message.body + "<br/>");
                        chatTranscript.chattingTo = "group"

                    });
                    break;
                default:
                    Ember.Logger.info("No filter type is matching.");
                    break;
            };
            return chatTranscript;
        };

        //Get model data.
        var getModelFrom = function(postType, thisObject, chatScript) {
            var contentDiv = $("#wysiwyg-editor");
            var chatScriptContent;
            if (postType == "blog") {
                contentDiv.html(chatScript.blogContent);
                chatScriptContent = chatScript.blogContent;
                thisObject.controllerFor('blogs.new').set('selected', 'restricted');
                thisObject.controllerFor('blogs.new').set('selectedName', 'published');
            } else {
                contentDiv.html(chatScript.wikiContent);
                chatScriptContent = chatScript.wikiContent;
                thisObject.controllerFor(postType + "s.new").set("selected", "public");
            }
            var title = "Chat with " + chatScript.chattingTo;
            var model = postUtil.postObjectModel(postType, true, {
                title: title,
                chatScript: chatScriptContent
            });
            if (chatScript.shares) {
                Ember.set(model, "shares", chatScript.shares)
            } else {
                Ember.set(model, "shares", [])
            }
            return model;
        };

        //Get model data for community id
        var getModelFromCommunity = function(postType, thisObject, communityId) {
            var self = thisObject;
            return groupService.group(communityId).then(function(groupDetails) {
                var shareDetails = {
                    display: groupDetails.name,
                    share: communityId,
                    type: "group",
                    permission: ["view"],
                    _id: ""
                };
                var model = postUtil.postObjectModel(postType, true);
                Ember.set(model, "shares", [shareDetails]);
                self.controllerFor(postType + "s.new").set('selected', (groupDetails.type == 'hidden') ? 'restricted' : 'public');
                return model;
            });
        };

        //Post model for new Route.
        var postsModelForNewRoute = function(postType, thisObject, queryParameters) {
            if (queryParameters.communityId) {
                var self = thisObject;
                return getModelFromCommunity(postType, thisObject, queryParameters.communityId).then(function(model) {
                    return model
                });
            } else {
                var model = {};
                if (postType != "question") {
                    if (queryParameters.chatSession) {
                        var chatScript = extractPostContentFromChatSession(postType, queryParameters.chatSession);
                        model = getModelFrom(postType, thisObject, chatScript)
                    } else if (queryParameters.chatRoom) {
                        var chatScript = extractPostContentFromChatRoom(postType, queryParameters.chatRoom);
                        model = getModelFrom(postType, thisObject, chatScript);
                    } else {
                        model = postUtil.postObjectModel(postType, false);
                    }
                } else {
                    model = postUtil.postObjectModel(postType, false);
                    thisObject.controllerFor(postType + "s.new").set("selected", "public");
                }
                return model
            }
        };

        //Handle Post NewController Delete post attachment request.
        var deleteAttachmentPostsNewController = function(thisObject, name, id) {
            var thisModel = thisObject.get('model');
            var uploadData = thisModel.get('fileuploadData');
            uploadData = _.without(uploadData, _.findWhere(uploadData, {
                "name": name
            }));
            thisModel.set('fileuploadData', uploadData);
            var obj = thisModel.fileuploadMetaData.files.findProperty("fName", name);
            thisModel.fileuploadMetaData.files.removeObject(obj);
        };

        //Handle didInsertElement request for Post new controller.
        var didInsertElementPostsNewController = function(thisObject) {
            var self = thisObject;
            var postModelObj = thisObject.controller.get('model');
            postModelObj.errors.clear();
            if (postModelObj.chatScript) {
                var contentDiv = $("#wysiwyg-editor");
                contentDiv.html(postModelObj.chatScript)
            }
            if (postModelObj.shares) {
                var shares = [];
                _.each(postModelObj.shares, function(share, key) {
                    shares.push({
                        value: share.share + '|' + share.display,
                        text: share.display
                    });
                })
                postModelObj.set('share', shares);
            }
            CKEDITOR.config.readOnly = false;
            ui.initializeWysiwyg();
        }

        //Handle new route setup controller.
        var postsNewRouteSetupController = function(postType, controller, model) {
            tagsService.allTags().then(function(tags) {
                tags = (postType === "question" && tags.length == 1) ? tags[0].split(',') : tags;
                controller.set('allTags', tags);
                controller.set('allTagsLoaded', true);
            });
            model.fileuploadMetaData.files.splice(0);
            controller.set('model', model);
            controller.set('postsCategories', JSON.parse(sessionStorage.getItem("postsCategories")));
        }

        //Handle New controller clear action.
        var postNewControllerClearAction = function(postType, thisObject) {
            thisObject.get('model').errors.clear();
            if (thisObject.communityId) {
                var communityRoute = "details";
                if(postType=="blogs")
                {
                    communityRoute="blogs";

                }else if(postType=="questions")
                {
                    communityRoute="discussions";
                }else if(postType=="wikis")
                {
                    communityRoute="wikis";
                }
                thisObject.transitionToRoute('community.'+communityRoute, thisObject.communityId);
            } else {
                thisObject.replaceRoute('home');
                thisObject.replaceRoute(postType);
            }
        }

        var initialLikeCall = function(model,entityId,value){
            var tenantId = model.tenantId;
            var payload= {
                            "payload":{
                            "application_id":window.cloudletAppId,
                            "entity_type":"question",
                            "entity_id":entityId,
                            "user_id":App.getUsername(),
                            "plugin_type":"like",
                            "tenant_Id":tenantId,
                            "value":value
                            
                            }
                        }
            httpClient.post('/knowledgecenter/cloudlet/widget',payload).then(function(response){
                return response;
            },function(err){
                Ember.Logger.error("Issue in contacting cloudlet."+err);
                return err;
            })
        }        

        //Handle all the post New Route and controller request.
        return {
            createPost: createPost,
            postsModelForNewRoute: postsModelForNewRoute,
            deleteAttachmentPostsNewController: deleteAttachmentPostsNewController,
            didInsertElementPostsNewController: didInsertElementPostsNewController,
            postsNewRouteSetupController: postsNewRouteSetupController,
            postNewControllerClearAction: postNewControllerClearAction,
            initialLikeCall: initialLikeCall
        }
    });