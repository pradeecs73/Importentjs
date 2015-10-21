'use strict';

define(['app', 'services/documentsService', 'services/activityService', 'services/groupService', 'text!templates/documents/document.hbs',
        'text!templates/shareDocumentModal.hbs', 'services/usersService', "Q"],
    function(app, documentsService, activityService, groupService, documentTemplate, shareDocumentModalTemplate, usersService, Q) {
        app.DocumentView = Ember.View.extend({
            template: Ember.Handlebars.compile(documentTemplate),

            /* this is in "annotate old jiathis comment" area
            //postCommentCallBack : function(result) {
            //    if(result && result[0].replyTo) {
            //        this.pushShareToActivityStream(true);
            //    } else {
            //        this.pushShareToActivityStream(false);
            //    }
            //},
            //pushShareToActivityStream: function(isReply) {
            //        var document = this.controller.get('model');
            //        var documentDisplayType = app.DocumentUtils.getDocumentDisplayType(document.documentType);
            //        var message = app.getShortname() + " has commented on " + documentDisplayType + " with name " + document.title;
            //        if(isReply) {
            //            message = app.getShortname() + " has replied to a comment on " + documentDisplayType + " with name " + document.title;
            //        }
            //        app.DocumentUtils.pushToActivityStreamForDocument(document, "comment", message)
            //},
            */
            didInsertElement: function() {
                var documentView = this;
                if (window.social) window.social.render();
                if (window.activityStream) {
                    documentView.$().on("cloudlet:activity", function(e, activityType) {
                        documentView.onCloudletActivity(activityType)
                    });
                }

                if (window.UYANCMT) {
                    var model = documentView.controller.get('model');
                    var type = app.DocumentUtils.getDocumentDisplayType(model.documentType);
                    UYANCMT.loadBox(model.id, type, model.title, model.createdBy);
                }
                /* annotate old jiathis comment
                try {
                    if (window.UYANCMT && window.jiaThisAppId) {
                        if (jiaThisAppId == "%JIA_THIS_APP_ID%") {
                            console.log("Please configure JIA_THIS_APP_ID");
                            return;
                        }

                        var baseUrl = window.location.protocol + "//" + window.document.domain;
                        var nickName = app.getShortname();
                        var faceUrl = app.profileImage(app.getUsername(), "mini");
                        var profileUrl = baseUrl + "/#/user/" + app.getUsername();
                        var model = documentView.controller.get('model');

                        documentView.$().find('.uyan-comment').attr("appid", jiaThisAppId);
                        documentView.$().find('.uyan-comment').attr("articletitle", model.title);
                        documentView.$().find('.uyan-comment').attr("nickName", nickName);
                        documentView.$().find('.uyan-comment').attr("faceUrl", faceUrl);
                        documentView.$().find('.uyan-comment').attr("profileUrl", profileUrl);

                        UYANCMT.load(jiaThisAppId, model.id, null, model.title, nickName, faceUrl, profileUrl, null, null, this.postCommentCallBack.bind(this));

                    }
                } catch (err) {
                    console.log("Failure in rendering Comments." + err);
                }
                */

            },
            onCloudletActivity: function(activityType) {
                var model = this.controller.get('model');
                var activityToVerb = {};
                activityToVerb[comments.getConfig().pluginType] = 'comment';
                activityToVerb[rating.getConfig().pluginStateOn] = 'rate';
                activityToVerb[rating.getConfig().pluginStateOff] = 'un-rate';
                activityToVerb[follow.getConfig().pluginStateOn] = 'follow';
                activityToVerb[favorite.getConfig().pluginStateOn] = 'favorite';
                activityToVerb[like.getConfig().pluginStateOn] = 'like';
                activityToVerb[follow.getConfig().pluginStateOff] = 'un-follow';
                activityToVerb[favorite.getConfig().pluginStateOff] = 'un-favorite';
                activityToVerb[like.getConfig().pluginStateOff] = 'un-like';
                //push to activity stream
                app.DocumentUtils.pushToActivityStreamForDocument(model, activityToVerb[activityType.activity]);
            }
        });

        app.DocumentController = Ember.ObjectController.extend({
            isVideoUploadEnabled: app.videoUploadEnabled(),
            appId: applicationIdConfig.contentstore,
            isVideo: function() {
                var model = this.get('model');
                var fileExtensionRegex = /(?:\.([^.]+))?$/;
                return _.contains(app.allowedVideoFileTypes, fileExtensionRegex.exec(model.uri).pop().toLowerCase());
            }.property('model'),
            goBack: function() {
                window.history.back();
                return false;
            },
            getExistingShares: false,
            isEditable: function() {
                return this.get('model').permissions.isEditable;
            }.property("model.permissions"),
            enableSocialWidgets: function() {
                return this.get('model').permissions.isSocialWidgetsEditable;
            }.property("model.permissions"),
            enableComment: function() {
                return this.get('model').permissions.isCommentingAllowed;
            }.property("model.permissions"),
            isTagsAvailable: function() {
                var model = this.get('model');
                return model.userTags;
            }.property("model.userTags"),
            imageType: function() {
                if (_.contains(app.allowedVideoFileTypes, this.get('model').documentType.toLowerCase()))
                    return "video";
                else if ("epub" === this.get('model').documentType.toLowerCase())
                    return "ebook";
                else
                    return "document";
            }.property("model.documentType"),
            documentEditPath: function() {
                var path = this.controllerFor('application').get('currentPath').split('.');
                var docEditPath = "#/document";
                docEditPath += "/" + this.content.id;
                docEditPath += "/edit/" + path[1];
                return docEditPath;
            }.property("controller._currentView")

        });
        App.DocumentRoute = Ember.Route.extend(App.DocumentsRouteMixin, {
            renderTemplate: function(controller, model) {
                this.render()
                if (model && model.error) {
                    if (model.error.status === 403)
                        this.render("notAllowed")
                    else {
                        this.controllerFor("somethingWentWrong").message = "This file is no longer available. It may have been deleted or you may not be entitled to view it any longer.";
                        this.render("somethingWentWrong")
                    }
                }
            },
            actions: {
                onDocumentReadActivity: function() {
                    var document = this.controller.get('model');
                    app.DocumentUtils.pushToActivityStreamForDocument(document,"view");
                }
            },
            model: function(params) {
                return documentsService.document(params.document_id)
                    .then(function(doc) {
                        var activitiesP = activityService.activities("share", "file", doc.id, applicationIdConfig.contentstore);
                        var userProfileP = usersService.userProfileFor(doc.createdBy);
                        return Q.spread([activitiesP, userProfileP], function(activities, userProfile) {
                            doc.shares = _.map(activities.recipients, function(recipient) {
                                return {
                                    "entityId": recipient.id,
                                    "entityName": recipient.name,
                                    "entityType": recipient.type
                                }
                            });
                            doc.profile = userProfile;
                            return doc;
                        });
                    })
                    .fail(function(err) {
                        return {"error": err};
                    });
            }
        });

        App.ClickableView = Ember.View.extend({
            click: function(evt) {
                this.get('controller').send('onDocumentReadActivity');
            }
        });
    });
