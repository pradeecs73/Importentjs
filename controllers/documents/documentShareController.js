'use strict';

define(['app', 'services/documentsService', 'services/activityService', 'services/groupService', 'services/entitlementService', 'text!templates/documents/document.hbs',
    'text!templates/shareDocumentModal.hbs', 'services/usersService','objects/activityBuilder' ,'httpClient', 'Q'],
    function(app, documentsService, activityService, groupService, entitlementService, documentTemplate, shareDocumentModalTemplate, usersService, ActivityBuilder, httpClient, Q){
        app.DocumentShareView = Ember.View.extend({
            layoutName: "modal_layout",
            template: Ember.Handlebars.compile(shareDocumentModalTemplate),

            didInsertElement: function() {
                var self = this;
                var currentModel = self.controller.get('model');
                self.controller.populateExistingShare();
                self.controller.set('allAuthenticatedUsersGroupsSelected', currentModel.isPublic);
                self.controller.set('sharedWithAllAuthenticatedUsersProp', currentModel.isPublic);
                self.controller.set("hideShareWarning", false);
                self.controller.set("showMessage", false);
            }
        });

        app.DocumentShareController = Ember.ObjectController.extend({
            needs:['documentsMy'],
            messages: {},
            sharing: false,
            status: false,
            showMessage: false,
            cookieExists: false,
            showWarning: false,
            shareShareSelected: false,
            allAuthenticatedUsersGroups: [],
            sharedWithAllAuthenticatedUsersProp: false,
            allAuthenticatedGroupIds: [],
            hideShareWarning: false,
            newExistingShare:{recipients:[]},
            canChangePublicAccess: function() {
                var model = this.get('model');
                return model.permissions && model.permissions.canMakePublic;
            }.property('model'),

            usersAndGroupsForAutoSuggest: function() {
              var exclusionList = [];
              var existingSharesMap = this.formatIntoShares(_.pluck(this.get('existingShares'), "value"));
              var existingShares = _.map(existingSharesMap, function(share) {
                return share.entityId;
              });
              var documentCreator = this.get('model').createdBy;
              exclusionList = exclusionList.concat([documentCreator, app.getUsername()]);
              exclusionList = exclusionList.concat(existingShares);
              return usersService.usersAndGroupsAutoSuggest(exclusionList) ;
            }.property('existingShares'),

            existingSharesLoaded: function() {
              return this.get('existingShares') != null;
            }.property('existingShares'),

            cleanPopUp: function() {
                this.set("messages", {});
                this.set("allAuthenticatedUsersGroups", []);
                this.set("allAuthenticatedGroupIds", []);
                this.set("showWarning", false);
                this.set("sharing", false);
                this.set("existingShares", null);
            },

            existingSharesFromContentstore: function () {
                var self = this;
                var existingShares = [];
              //Sneha: Hack until this old flow goes away.
                var sharesFromModel = self.get('model').sharesMap? self.get('model').sharesMap: self.get('model').shares;
                _.chain(sharesFromModel)
                    .filter(function (share) {
                        return (share.entityId !== app.getUsername());
                    })
                    .each(function (share, key) {
                        existingShares.push({
                            "value": share.entityId + "|" + share.entityName + "|" + share.entityType,
                            "text": share.entityName
                        });
                    })
                this.set('existingShares', existingShares);
            },
            existingSharesFromActivity: function () {
                var model = this.get("model");
                var self = this;
                return activityService.activities("share", "file", model.id, applicationIdConfig.contentstore).then(function (share) {
                    self.set("newExistingShares", share);
                    var existingShares = _.chain(share.recipients)
                    .filter(function (recipient) {
                        return (recipient.id !== app.getUsername());
                    })
                    .map(function (recipient) {
                        return {
                            "value": recipient.id + "|" + recipient.name + "|" + recipient.type + "|" + recipient.applicationId,
                            "text": recipient.name
                        }
                    }).value();
                    self.set('existingShares', existingShares);
                    return existingShares;
                });
            },
            existingShares: null,
            populateExistingShare: function(){
                this.existingSharesFromActivity();
            },
            warningShowEnabled: function() {
                return !$.cookie('hideShareWarning') && this.get('showWarning');
            }.property('showWarning'),
            toggleWarning: function() {
               this.set('showWarning', this.get('allAuthenticatedUsersGroupsSelected') && !this.sharedWithAllAuthenticatedUsers());
            }.observes('allAuthenticatedUsersGroupsSelected'),
            enableButton: function() {
                return !this.get('sharing') && !this.get('warningShowEnabled');
            }.property('sharing', 'showWarning', 'warningShowEnabled'),
            sharedWithAllAuthenticatedUsers: function() {
              return this.get('model').isPublic;
            },
            existingAllAuthenticatedUsersGroups: function() {
                var self = this;
                var existingShares = [];
              _.chain(this.get('newExistingShares').recipients)
                .filter(function(recipient) {
                  return (_.contains(self.get('allAuthenticatedGroupIds'), recipient.id));
                })
                .each(function(share) {
                  existingShares.push({
                    "value": share.id + "|" + share.name + "|" + share.type,
                    "text": share.name
                  });
                });
                return existingShares;
            }.property("model.shares"),

            formatIntoShares: function(shares) {
                return _.map(shares, function(share) {
                    var idNameAndTypeArray = share.trim().split('|');
                    return {
                        'entityId': idNameAndTypeArray[0],
                        'entityName': idNameAndTypeArray[1],
                        'entityType': idNameAndTypeArray[2]
                    };
                });
            },
            combineShares: function(entity, entityType) {
                if (entityType == "group"){
                    return {
                        "value": entity._id + "|" + entity.name + "|" + entityType,
                        "text": entity.name
                    }
                }
                else {
                    return {
                        "value": entity.username + "|" + entity.shortName + "|" + entityType,
                        "text": entity.shortName}
                }
            },
            formatIntoNewShares: function (sharesAdded,sharesRemoved,documentId) {
                var activity = new ActivityBuilder.activityBuilder();

                activity.onResource(documentId,"file");

                _.map(sharesAdded,function(share){
                    var idNameAndTypeArray = share.trim().split('|');
                    activity.addRecipient(idNameAndTypeArray[0],idNameAndTypeArray[1],idNameAndTypeArray[2],idNameAndTypeArray[3]);
                })

                _.map(sharesRemoved,function(share){
                    var idNameAndTypeArray = share.trim().split('|');
                    activity.removeRecipient(idNameAndTypeArray[0],idNameAndTypeArray[1],idNameAndTypeArray[2],idNameAndTypeArray[3]);
                })

                return activity.shareAct().build();
            },
            pushShareToActivityStream: function(document, target, verb) {
              var message;
              var loggedInUser = app.getShortname();

              var documentDisplayType = app.DocumentUtils.getDocumentDisplayType(document.documentType)
              if(verb == "unshare") {
                message = loggedInUser + " has unshared a " + documentDisplayType + " on " + document.title + " with " + target.name;
              } else {
                message = loggedInUser + " has shared a " + documentDisplayType + " on " + document.title + " with " + target.name;
              }
              app.DocumentUtils.pushToActivityStreamForDocument(document, verb, message, target);
            },

            capturePublishActivity: function(document) {
                var verb = "unshare";
                if (document.isPublic) {
                    verb = "share";
                }

                this.pushShareToActivityStream(document, {id: "AllAuthenticatedUsers", name: "All Registered Users", type: "group"}, verb);
            },

            captureShareActivity: function (document, recipients) {
              var self= this;
              recipients.adds.forEach(function(target){
                self.pushShareToActivityStream(document, target, "share");
              })
              recipients.removes.forEach(function(target){
                  self.pushShareToActivityStream(document, target, "unshare");
              })
            },
            actions: {
                tagsInputInitialized: function() {
                    var self = this;
                    if (self.get('showMessage')) {
                        Ember.set(self.messages, "statusMessage", "The changes made to sharing have been updated successfully");
                    }
                    self.set("sharing", false);
                },
                acceptWarning: function() {
                    this.set('showWarning', false);
                },
                resetAllAuthenticatedUsersGroups: function() {
                    this.set('allAuthenticatedUsersGroupsSelected', false);
                },
                shareDocument: function() {
                    var self = this;
                    Ember.set(self.messages, "statusMessage", "");
                     var self = this;
                    //checking the call coming from comuunity file share
                    var docMyContrlr=self.get('controllers.documentsMy');
                    Ember.set(self.messages, "statusMessage", "");
                    
                    //checking whether the community file uploader has a file to share
                    if(docMyContrlr.get('isUpload') && docMyContrlr.get('community_id'))
                    {
                         var documentId=self.get('comDocId');
                         var doc= docMyContrlr.get('community_id')+'|'+docMyContrlr.get('community_name')+'|group|zion';
                         sharesAdded=[]
                         sharesAdded.push(doc);
                         sharesRemoved=[];
                    }
                    else
                    {
                        var documentId = self.get('content').id;
                        var allShares = $("#sharesField").val() == null || $("#sharesField").val() == "" ? [] : $("#sharesField").val().split(",");
                        var allExistingShares = self.get('existingShares');
                        var sharesAdded = _.difference(allShares, _.pluck(allExistingShares, "value"));
                        var sharesRemoved = _.difference(_.pluck(allExistingShares, "value"), allShares);
                       
                    }
                     var formattedSharesAdded = this.formatIntoShares(sharesAdded);
                     var formattedSharesRemoved = this.formatIntoShares(sharesRemoved);  

                  

                    if (formattedSharesAdded.length==0 && formattedSharesRemoved.length==0 && this.get('model').isPublic === this.get('allAuthenticatedUsersGroupsSelected')) {
                        self.set("status", false);
                        Ember.set(self.messages, "statusMessage", "No new changes have been made to shares");
                        return;
                    }

                    var updateShares;
                    if (!(formattedSharesAdded.length == 0 && formattedSharesRemoved.length == 0)) {
                        var activity = this.formatIntoNewShares(sharesAdded, sharesRemoved, documentId);
                        updateShares = activityService.sendUpdate(activity, applicationIdConfig.contentstore);
                    }

                    var documentUpdatePromise;
                    if(this.get('model').isPublic !== this.get('allAuthenticatedUsersGroupsSelected')) {
                        var document = this.get('model');
                        documentUpdatePromise = documentsService.changePublic(document.id, this.get('allAuthenticatedUsersGroupsSelected'));
                    }

                    self.set("sharing", true);

                    Q.all([updateShares, documentUpdatePromise])
                        .then(function (results) {
                        var model = self.get("model");
                        if (results[1] && results[1].status === "success") {
                            Ember.set(model, "isPublic", self.get('allAuthenticatedUsersGroupsSelected'));
                            self.capturePublishActivity(self.get("model"));
                        }
                        Ember.set(model, "shares", self.formatIntoShares(allShares));
                        Ember.set(model, "sharesMap", self.formatIntoShares(allShares));
                        self.set('showMessage', true);

                        self.populateExistingShare();

                        self.set("status", true);
                        results.forEach(function(result){
                          if(result != null && result.recipients!= null)
                            self.captureShareActivity(self.get('model'), result.recipients);
                        })
                        if (self.get('hideShareWarning'))
                            $.cookie('hideShareWarning', true, {expires: 365});
                        }, function (err) {
                            self.set("status", false);
                            self.set("sharing", false);
                            if(err.status===403){
                                Ember.set(self.messages, "statusMessage", "You are either not authorized to share this file or the file is deleted.");
                            }else {
                                Ember.set(self.messages, "statusMessage", "The changes made to sharing errored out");
                            }
                    }).done();
                }
            }
        });
    });
