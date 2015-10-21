/**
 * @class postService_update.js
 * This class is a client stub for the handling posts update  requests at service level.
 * @author Mohan Rathour
 * TODO we will move all the services calls from controller level  to services layer.
 */
define(['app', 'httpClient', 'Q', 'controllers/collaboration/utils/postUtil', 'pages/wysiwyg+tags', 'services/tagsService', 'services/collaboration/postService'],
    function(app, httpClient, Q, postUtil, ui, tagsService, postService) {
        var cclomPostsURL = "/knowledgecenter/cclom/posts/meta/";

        //Handle update view after.
        var afterRenderEventPostEditView = function(thisObject) {
            var postModelObj = thisObject.get('controller').get('model');
            thisObject.$().find('#categorySelector option[value=' + postModelObj.category._id + ']').attr("selected", "selected");
            thisObject.$().find('#scopeSelector option[value=' + postModelObj.scope + ']').attr("selected", "selected");
            thisObject.$().find('#statusSelector option[value=' + postModelObj.status + ']').attr("selected", "selected");
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
        };

        //Post edit setup Controller.
        var postEditSetupController = function(controller, model) {
            tagsService.allTags().then(function(tags) {
                controller.set('allTags', tags);
            });
            controller.set('model', model);
            controller.set('postsCategories', JSON.parse(sessionStorage.getItem("postsCategories")));
        }

        //Set Post Edit model.
        var postEditModel = function(postType, thisObject) {
            var model = thisObject.modelFor(postType);
            var postModel = postUtil.postObjectModel(postType, true, {
                fileuploadMetaData: Ember.Object.create({
                    files: []
                })
            });
            postModel.set('fileuploadData', []);
            postModel.set('deletedfile', []);
            postModel.set('id', model['_id']);
            postModel.set('type', model['type']);
            postModel.set('author', model['author']);
            postModel.set('authorName', model['authorName']);
            postModel.set('tenantId', model['tenantId']);
            postModel.set('permissions', model['permissions']);
            postModel.set('title', model['title']);
            postModel.set('tags', model['tags']);
            postModel.set('scope', model['scope']);
            postModel.set('status', model['status']);
            postModel.set('content', model['content']);
            postModel.set('files', model['files']);
            postModel.set('category', model['category']);
            Ember.set(postModel.fileuploadMetaData, "files", model['files']);
            if (model["postShares"] && model["postShares"].length > 0) {
                postModel.set('shares', model["postShares"]);
                postModel.set('existingShares', model["postShares"]);

            }
            postModel.set('isEditPermissionChecked', model.permissions.contains("edit"));
            postModel.set('isCommentPermissionChecked', model.permissions.contains("comment"));
            postModel.set('isSharePermissionChecked', model.permissions.contains("share"));
            return postModel;
        };

        //Set Category data
        var setSelectedCategory = function(thisObject) {
            var x = {
                "_id": thisObject.get('category')._id,
                "name": thisObject.get('category').name
            };
            /** We added this SetTimeout to Fix the category population issue on safari
             * This is Ember.js issue we have already raised the ticket there also.
             * [http://discuss.emberjs.com/t/ember-select-valuebinding-event-is-not-triggering-in-safari/7363]
             **/
            setTimeout(function() {
                if (x && x._id) {
                    $('#categorySelector').val(x._id);
                    $('#categorySelector').val(x._id);
                    return x;
                }
            }, 100);
        };

        //After successful post updation, This function will push the data to AS and Share builder
        var afterSuccessfulPostUpdation = function(postType, self, data, postData, successMessage, contentDiv, aPost) {
            var postId = data._id;
            postService.pushToStream(data, "edit", postType);
            postService.buildModel(postType, self, data._id).then(function(model) {
                model.successStatus = true;
                model.successMessage = successMessage;
                _.each(model.files, function(res) {
                    res.id = postId;
                });
                self.transitionTo(postType, model);
            },function(model){
                //Todo: Cleanup code duplication 
                model.successStatus = true;
                model.successMessage = successMessage;
                _.each(model.files, function(res) {
                    res.id = postId;
                });
                self.transitionTo(postType, model);                
            });
            var newShared = data.postShares;
            var newSharedString;
            var action = "";
            if (newShared.length == 0) {
                action = "removeAll";
                newSharedString = [];
            } else {
                _.each(newShared, function(newShare) {
                    if (newSharedString) {
                        newSharedString = newSharedString + "," + newShare.share + "|" + newShare.display + "|" + newShare.type;
                    } else {
                        newSharedString = newShare.share + "|" + newShare.display + "|" + newShare.type;
                    }
                });
            }
            if (aPost.existingShares || newSharedString) {
                postService.pushToStream(data, "share", postType);
            } else {
                Ember.Logger.info("No shares to submit to AS.")
            }
            App.postsShareActivityBuilderUtil.callToShareBuilderFromPopup(aPost.existingShares, newSharedString, postId, action);
        };

        //Populate post data from apost.
        var populateData = function(aPost, formData) {
            var _blog = {
                type: aPost.get('type'),
                author: aPost.get('author'),
                authorName: aPost.get('authorName'),
                tenantId: aPost.get('tenantId'),
                permissions: aPost.get('permissions'),
                title: aPost.get('title'),
                tags: aPost.get('tags'),
                scope: $('select#scopeSelector').val(), //Ember bug model not binding blog.get('scope'),
                status: $('select#statusSelector').val(), // status not binding blog.get('status'),
                content: aPost.get('content'),
                files: aPost.get('files'),
                category: aPost.get('category')
            }
            var postData = {
                postObject: _blog,
                streamDataContract: null
            };

            var shareDetails=jQuery("#form-field-mask-2").val();
			shareDetails ? ( aPost.set('share', shareDetails.split(','))) : (delete aPost.share, delete aPost.shares);

            if (aPost.get('share')) {
                _blog.postShares = [];
                formData.append('postShares', []);
                postData = App.ResourceShareUtil.populatePostsShareData(aPost, _blog, null, aPost.id);
                formData.append('postShares', JSON.stringify(postData.postObject.postShares));
            }
            return postData;
        };

        //Handle post update call.
        var updatePost = function(postType, thisObject) {
            var self = thisObject,
                aPost = thisObject.get('model');

            var contentDiv= CKEDITOR.instances['wysiwyg-editor'].getData()
            if (contentDiv == undefined || contentDiv.length == 0) {
                contentDiv = $("#wysiwyg-editor");
                contentDiv=""
            }
            aPost.set('content', contentDiv);
            var selectedCategory = $('select#categorySelector').val();
            if (selectedCategory) {
                var categoryObject = _.findWhere(self.get('model').postsCategories, {
                    _id: selectedCategory
                });
                aPost.set("category", categoryObject);
            } else {
                aPost.set("category", "");
            }
            var tags = ($("#tagsField").length == 0) ? [] : $("#tagsField").val().split(",");
            aPost.set('tags', ((tags.length && tags[0]) ? tags : []));
            aPost.permissions.splice(1, 3);

            if (aPost.get('isEditPermissionChecked')) {
                aPost.permissions.addObject('edit');
            }

            if (aPost.get('isCommentPermissionChecked')) {
                aPost.permissions.addObject('comment');
            }

            if (aPost.get('isSharePermissionChecked')) {
                aPost.permissions.addObject('share');
            }

            aPost.errors.clear();
            aPost.validate().then(function() {
                if (!aPost.get('isValid')) {
                    Ember.Logger.error("Error in post validation >>", aPost.errors);
                } else {
                    var formData = new FormData();
                    var postData = populateData(aPost, formData);
                    var _aPost = postData.postObject;
                    var uploadFile = aPost.get('fileuploadData');
                    if (uploadFile && uploadFile.length != 0) {
                        formData.append("attachmentStatus", "true");
                    } else {
                        formData.append("attachmentStatus", "false");
                    }

                    formData.append('type', _aPost.type);
                       if(postType=='blog'){
                             var bloggerValidate=postService.validateProxyUser(thisObject);
                                if(bloggerValidate==1){
                                   formData.append('author', _aPost.author);
                                   formData.append('authorName', _aPost.authorName);
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
                            formData.append('author', _aPost.author);
                            formData.append('authorName', _aPost.authorName);
                        }
                  
                    formData.append('tenantId', _aPost.tenantId);
                    formData.append('permissions', _aPost.permissions);
                    formData.append('title', _aPost.title.trim());
                    formData.append('tags', JSON.stringify(_aPost.tags));
                    formData.append('scope', _aPost.scope);
                    formData.append('status', _aPost.status);
                    formData.append('content', _aPost.content);
                    formData.append('files', []);
                    formData.append('category', JSON.stringify(_aPost.category));
                    formData.append('deletedfile', JSON.stringify(aPost.get('deletedfile')));
                    formData.append('updateDate', new Date());
                    return aPostPostrequest = $.ajax({
                        url: cclomPostsURL + aPost.get('id'),
                        type: 'PUT',
                        data: formData,
                        cache: false,
                        dataType: 'json',
                        processData: false, // Don't process the files
                        contentType: false, // Set content type to false as jQuery will tell the server its a query string request
                        beforeSend: function(xhr) {
                            httpClient.setRequestHeadersData(xhr);
                        },
                        success: function(data, textStatus, jqXHR) {
                            var successMessage;
                            if (data.attachmentStatus == "noAttach") {
                                successMessage = "You have Updated the " + postType + " successfully";
                                afterSuccessfulPostUpdation(postType, self, data, postData, successMessage, contentDiv, aPost);
                            } else if (data.attachmentStatus == "attachment") {
                                _.each(uploadFile, function(obj, index) {
                                    formData.append('file', obj);
                                });
                                formData.append('postId', data._id);
                                formData.append('updatedFile', JSON.stringify(data.files));
                                formData.append('newTenantId', data.tenantId);
                                return uploadAttachmentRequest = $.ajax({
                                    url: '/cclom/cclom/posts/attachment/' + aPost.get('id'),
                                    type: 'PUT',
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
                                            successMessage = "you have updated the " + postType + " successfully but File has not been uploaded"
                                            afterSuccessfulPostUpdation(postType, self, data, postData, successMessage, contentDiv, aPost);
                                        } else {
                                            successMessage = "you have updated  the " + postType + " successfully with Attachment";
                                            afterSuccessfulPostUpdation(postType, self, data, postData, successMessage, contentDiv, aPost);
                                        }
                                    }
                                });
                            }
                        },
                        error: function() {
                            Ember.Logger.error(postUtil.firstCharToUpperCase(postType) + " updation failed.");
                        }
                    });
                }
            }, function(err) {
                Ember.Logger.error(err);
            });
        };

        //Handle post edit delete attachment request.
        var postEditDeleteAttachment = function(thisObject, name, id){
            var thisModel = thisObject.get('model');
            var uploadData = thisModel.get('fileuploadData');
            if (id) {
                thisModel.get('deletedfile').push({
                    "name": name
                });
            }
            uploadData = _.without(uploadData, _.findWhere(uploadData, {
                "name": name
            }));
            thisModel.set('fileuploadData', uploadData);
            var obj = thisModel.fileuploadMetaData.files.findProperty("fName", name);
            thisModel.fileuploadMetaData.files.removeObject(obj);
        }
            //For reply for discussions

        var replyToSpecificDiscussion = function(discussionPostText,parentId,userEmail,displayName,questionModel){
            var data={
                        userEmail:userEmail,
                        displayName: displayName,      
                        discussionPostText:discussionPostText,
                        parentId:parentId
            };
            var thisquestionModel = questionModel;
           return httpClient.put("/knowledgecenter/cclom/posts/"+questionModel._id+"/reply",data).then(function(response){
                return response;
           }).fail(function(error){
                Ember.Logger.error("Error in persisting the reply for discussion thread >>"+error);
                jQuery.gritter.add({
                    title: '',
                    text: 'Failed to save the reply. Please try again',
                    class_name: 'gritter-error'
                });
                return {};
           });
        }
        //Mark as answer
        var markReplyAsAnswer = function(userEmailId,displayName,getModel,replyId,action,answeredOrNot){
            var markReplyAsAnswer={
                userEmailId:userEmailId,
                displayName:displayName
            }
            var postId=getModel._id;
            return httpClient.put("knowledgecenter/cclom/posts/"+postId+"/reply/"+replyId+"/answer?action="+action+"&answeredOrNot="+answeredOrNot,markReplyAsAnswer).then(function(response){
                return response;
            });
        }
        //Lock specific resource
        var lockResource =function(lockedByEmailId,lockedByDisplayName,getModel,currentStatus){
            var lockResource={
                currentStatus:currentStatus,
                lockedByEmailId:lockedByEmailId,
                lockedByDisplayName:lockedByDisplayName
            }
            var postId=getModel._id;
            return httpClient.put("knowledgecenter/cclom/posts/"+postId+"/lock",lockResource).then(function(response){
                return response;
            });
        }
        //Handle all post Edit request calls.
        return {
            afterRenderEventPostEditView: afterRenderEventPostEditView,
            postEditSetupController: postEditSetupController,
            postEditModel: postEditModel,
            setSelectedCategory: setSelectedCategory,
            updatePost: updatePost,
            postEditDeleteAttachment: postEditDeleteAttachment,
            replyToSpecificDiscussion:replyToSpecificDiscussion,
            markReplyAsAnswer:markReplyAsAnswer,
            lockResource:lockResource
        }
    });
