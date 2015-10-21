'use strict';
define(['app', 'underscore', 'services/groupService','services/entitlementService', 'services/collaboration/postService'],
    function(app, _, groupService,entitlementService,postService) {

        app.CommunityRoute = Ember.Route.extend({
            model: function(params) {
                var getCommunityPromise = groupService.group(params.community_id);
                var allTabsForPromise = groupService.allTabsFor();
                var self = this;
                return getCommunityPromise
                    .then(function(results) {
                        return allTabsForPromise.then(function(response) {
                            console.log(response);
                            var community = app.Community.create({
                                fileuploadMetaData: Ember.Object.create({
                                    files: []
                                }),
                                fileuploadlistData: Ember.Object.create({
                                    files: []
                                }),
                                fileuploadData: []
                            });

                            community.set("_id", results._id);
                            community.set("active", results.active);
                            community.set("category", results.category);
                            community.set("creator", results.creator);
                            community.set("name", results.name);
                            community.set("creatorShortName", results.creatorShortName);
                            community.set("description", results.description);
                            community.set("id", results.id);
                            community.set("invites", results.invites);
                            community.set("joinRequesterProfiles", results.joinRequesterProfiles);
                            community.set("memberProfiles", results.memberProfiles);
                            community.set("members", results.members);
                            community.set("membersCount", results.membersCount);
                            community.set("oldMembers", results.oldMembers);
                            community.set("requests", results.requests);
                            community.set("tags", results.tags);
                            community.set("tenant_Id", results.tenant_Id);
                            community.set("type", results.type);
                            community.set("updatedOn", results.updatedOn);
                            community.set("fileuploadData", results.attachment);
                            community.fileuploadlistData.files = results.attachment;
                            community.set("write", results.write);
                            community.set("createdOn", results.createdOn);
                            if(response.communities){
                                community.set("hasPlaybook", response.communities.courses);
                            }                            
                            self.pushShareToActivityStream(results)
                            if (results.type == 'public' || results.type == 'hidden') {
                                community.set('requestMembers', false)
                            } else {
                                community.set('requestMembers', true);
                            }
                            return community;
                        });
                    }).fail(function(err) {
                        if (err && err.status == 403) {
                            return {
                                "error": true
                            };
                        }
                    })
            },
            serialize: function(community) {
              return {
                community_id: community.get("_id")
              }
            },
            actions: {
                beforeUpload: function() {
                    jQuery("#selected-file").text("No file has been selected");
                    jQuery('#files').val('');
                    jQuery('#fileuploadCommunity').modal('show');
                },

                attachFile: function() {

                    var fileuploadData = jQuery('#files').get(0).files;
                    var backup = [];
                    var controller = this.controller;
                    var existSelectedfile = controller.get('model').fileuploadData;
                    _.each(existSelectedfile, function(file) {

                        backup.push(file);

                    });
                    _.each(fileuploadData, function(data) {

                        backup.push(data);

                    });
                    controller.get('model').set('fileuploadData', backup);
                    var files = [];
                    var existFile = controller.get('model').fileuploadMetaData.files;
                    _.each(existFile, function(res) {

                        files.push(res);
                    });
                    _.each(fileuploadData, function(file) {

                        var deletFile = controller.get('model').get('deletedfile');
                        var delfileArr = _.without(deletFile, _.findWhere(deletFile, {
                            "name": file.name
                        }));
                        controller.get('model').set('deletedfile', delfileArr);
                        var existObj = _.findWhere(files, {
                            "fName": file.name,
                        });
                        if (!existObj) {

                            var type = file.name.split(".")[1];
                            var rawSize = file.size;
                            var sizeNum = rawSize.toString().length;
                            var filesize = "";
                            var sizeDenom = "";
                            if (sizeNum < 7) {
                                filesize = Math.ceil(rawSize / 1000);
                                sizeDenom = "KB";
                            } else { // mb
                                filesize = Math.ceil(rawSize / 1000000);
                                sizeDenom = "MB";
                            }
                            var sizeText = filesize + " " + sizeDenom;
                            files.push({
                                "fName": file.name,
                                "id": "",
                                "type": type,
                                "size": sizeText
                            });
                        }
                    });

                    Ember.set(controller.get('model').fileuploadMetaData, "files", files);
                    jQuery('#fileuploadCommunity').modal('hide');

                    if (files.length != 0) {
                        jQuery('.checkid').hide();
                        jQuery('.uploadid').show();
                        jQuery('.uploadid').removeAttr('disabled')
                    }


                },
                cancelAttachFile: function() {

                    jQuery('#fileuploadCommunity').modal('hide');
                    jQuery('.checkid').text('Attach Files')
                }
            },
            pushShareToActivityStream: function(group) {
                if (window.activityStream) {
                    try {
                        var streamDataContract;
                        streamDataContract = new activityStream.StreamDataContract(group._id, "community");
                        streamDataContract.title = group.name;
                        streamDataContract.resourceUrl = "/#/community/" + group._id;
                        streamDataContract.authorUserName = app.getUsername();
                        streamDataContract.verb = 'view';
                        activityStream.pushToStream(streamDataContract)
                    } catch (e) {
                        console.log("error posting to activity stream: ", e)

                    }
                }
            },
            setupController: function(controller, model) {
                if (_.contains(model.members, app.getUsername())) {
                    controller.set('isMember', true);
                } else {
                    controller.set('isMember', false);
                }
                var isUserAuthored = false;
                var isOwner =  false;
                if(!model.creator || (model.creator === App.getUserLoginId())){
                    isOwner = true;
                    try{
                        controller.set('isUserAuthored',true)
                        controller.set('isUserAuthoredForDeletion', true)    
                    }catch(err){
                        controller['isUserAuthored'] = true
                        controller['isUserAuthoredForDeletion'] = true
                        Ember.Logger.error("Skippable: Issue in resolving key: isUserAuthored")
                    }                    
                }
                var isAdmin = false ;
                if(!isOwner){
                    entitlementService.isAdmin().then(function(decision){
                        isAdmin = decision;
                        var decisionForUserAuthored= (isOwner || isAdmin);
                            try{
                                controller.set('isUserAuthored',decisionForUserAuthored)
                                controller.set('isUserAuthoredForDeletion', decisionForUserAuthored)    
                            }catch(err){
                                controller['isUserAuthored'] = decisionForUserAuthored
                                controller['isUserAuthoredForDeletion'] = decisionForUserAuthored
                                Ember.Logger.error("Skippable: Issue in resolving key: isUserAuthored")
                            }                        
                        if(!decisionForUserAuthored){
                                 groupService.showCreateButtonBasedonPermissionsInDetailsPage(model,"Moderator").then(function(access){
                                        try{  
                                            controller.set('isUserAuthoredForDeletion',access.permissionStatus);
                                            controller.set('isUserAuthored',access.permissionStatus);
                                        }catch(err){
                                            controller['isUserAuthored'] = access.permissionStatus;
                                            controller['isUserAuthoredForDeletion'] = access.permissionStatus;
                                        }
                                  }).fail(function(err){
                                        Ember.Logger.error('[CommunityRoute :: setupController :: ]',error);
                                        try{  
                                            controller.set('isUserAuthoredForDeletion', false);
                                            controller.set('isUserAuthored', false);
                                        }catch(err){
                                            controller['isUserAuthored'] = false;
                                            controller['isUserAuthoredForDeletion'] = false;
                                        }
                                  });
                           var deletionPermission = false;
                           try{
                               deletionPermission = controller.get('isUserAuthoredForDeletion')
                           }catch(err){
                               deletionPermission = controller['isUserAuthoredForDeletion']
                           }        
                           if(!deletionPermission){
                                postService.permitActivityBasedonPermission("community","Delete").then(function(permissionData){
                                    if(permissionData && permissionData.permissionStatus){
                                        try{
                                            controller.set('isUserAuthoredForDeletion',permissionData.permissionStatus)    
                                        }catch(err){
                                            controller['isUserAuthoredForDeletion'] = permissionData.permissionStatus
                                            Ember.Logger.error("Skippable: Issue in resolving key: isUserAuthoredForDeletion")
                                        }                                     
                                    }
                                }).fail(function(error){
                                        try{
                                            controller.set('isUserAuthoredForDeletion', false)    
                                        }catch(err){
                                            controller['isUserAuthoredForDeletion'] = false
                                            Ember.Logger.error("Skippable: Issue in resolving key: isUserAuthoredForDeletion")
                                        }                                 
                                    Ember.Logger.error("Community deletion permission validation failed >>>"+error);   
                                })

                                postService.permitActivityBasedonPermission("community","Edit").then(function(permissionData){
                                    if(permissionData && permissionData.permissionStatus){
                                        try{
                                            controller.set('isUserAuthoredForEdit',permissionData.permissionStatus)    
                                        }catch(err){
                                            controller['isUserAuthoredForEdit'] = permissionData.permissionStatus
                                            Ember.Logger.error("Skippable: Issue in resolving key: isUserAuthoredForEdit")
                                        }                                     
                                    }
                                }).fail(function(error){
                                        try{
                                            controller.set('isUserAuthoredForEdit', false)    
                                        }catch(err){
                                            controller['isUserAuthoredForEdit'] = false
                                            Ember.Logger.error("Skippable: Issue in resolving key: isUserAuthoredForEdit")
                                        }                                 
                                    Ember.Logger.error("Community 'edit' permission validation failed >>>"+error);   
                                })                                
                            }
                        }
                    }).fail(function(error){
                        Ember.Logger.error("Admin role validation failed >>>"+error);
                        isAdmin = false;
                        var decisionForUserAuthored= (isOwner || isAdmin);
                        try{
                            controller.set('isUserAuthored',decisionForUserAuthored)    
                        }catch(err){
                            controller['isUserAuthored'] = decisionForUserAuthored
                            Ember.Logger.error("Skippable: Issue in resolving key: isUserAuthored")
                        }
                    })                    
                }else{
                        try{
                            controller.set('isUserAuthored',true)
                            controller.set('isUserAuthoredForDeletion', true)    
                        }catch(err){
                            controller['isUserAuthored'] = true
                            controller['isUserAuthoredForDeletion'] = true                   
                            Ember.Logger.error("Skippable: Issue in resolving key: isUserAuthored")
                        }
                    
                }
                controller.set('model', model);
            }
        });

    });

