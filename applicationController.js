'use strict';

define(['app', 'ember', 'httpClient', 'text!templates/termsAndConditionModal.hbs', 'pages/documentItems', 'text!templates/notAllowedPage.hbs', 'text!templates/noDataPage.hbs', 'text!templates/somethingWentWrong.hbs', 'text!templates/application.hbs', 'text!templates/loader.hbs', 'pages/dashboard',  'services/formallearning/userService', 'services/configurationsService', 'controllers/jabber/jabberMixin'],
    function (app, Ember, httpClient, termsAndConditionModalTemplate, documentItems, notAllowedTemplate, noDataTemplate, somethingWentWrongTemplate, applicationTemplate, loaderTemplate, dashBoard,  learningUserServices, configurationsService) {
        app.ApplicationView = Ember.View.extend({
            template: Ember.Handlebars.compile(applicationTemplate),
            popoverTermsAndConditions: function() {
                var self = this;
                this.getTermsAndConditions().then(function(response){

                    if(response && self.controller.preferences["AcceptTermsAndConditions"]) {
                        var termsAndConditions = JSON.parse(response)
                        var version = termsAndConditions.version;
                        self.controller.set("tAndCVersion", version);
                        var query = '/knowledgecenter/userpi/user/termsAndConditions/status?termsAndConditionsVersion=' + version;
                        httpClient.get(query).then(function (response) {
                            if(response.acceptedVersion)
                                self.controller.set("modalTitle", "Please review our updated Terms and Conditions");
                            else
                                self.controller.set("modalTitle", "Please review our Terms and Conditions");

                            if (response["shouldAccept"] == "true") {
                                self.controller.set("tAndCText", termsAndConditions.text);
                                $('#termsAndConditions').modal('show');
                            }
                        }, function (error) {
                            console.log(error);
                        });
                    }
                });
            },
            didInsertElement: function() {
                app.PopOverUtils.popoverCatalog();
                this.popoverTermsAndConditions();
            },
            getTermsAndConditions : function() {
                return httpClient.get('/knowledgecenter/termsAndConditions')
            },
            click: function(evt) {
              this.controller.refreshPopOvers();
            }
        });

        app.TermsAndConditionView = Ember.View.extend({
            template: Ember.Handlebars.compile(termsAndConditionModalTemplate)
        });


        App.NotAllowedView = Ember.View.extend({
            template: Ember.Handlebars.compile(notAllowedTemplate)
        });

        App.NotAllowedController = Ember.ObjectController.extend({
            init: function() {
                if (!Ember.TEMPLATES["notAllowed"]) {
                    Ember.TEMPLATES["notAllowed"] = Ember.Handlebars.template(Ember.Handlebars.precompile(notAllowedTemplate));
                }
            }
        });

        App.NoDataView = Ember.View.extend({
            template: Ember.Handlebars.compile(noDataTemplate)
        })

        App.SomethingWentWrongView = Ember.View.extend({
            template: Ember.Handlebars.compile(somethingWentWrongTemplate)
        })

        App.SomethingWentWrongController = Ember.ObjectController.extend({
            message: "",
            init: function() {
                if (!Ember.TEMPLATES["somethingWentWrong"]) {
                    Ember.TEMPLATES["somethingWentWrong"] = Ember.Handlebars.template(Ember.Handlebars.precompile(somethingWentWrongTemplate));
                }
            }
        });

        app.ApplicationRoute = Ember.Route.extend(Ember.TargetActionSupport, {
            actions: {
                willTransition: function (transition) {
                    var transitionPath = transition.targetName;
                    for(var i = 0; i<=(transitionPath.match(/\./g) || []).length; i++){
                        if(_.has(this.configurableRoutes, transitionPath))
                            break;
                        else{
                            var lastIndex = transitionPath.lastIndexOf('.');
                            transitionPath = lastIndex == -1? "": transitionPath.substring(0, lastIndex);
                        }
                    }
                    if(!(this.configurableRoutes[transitionPath] == null) && !this.preferences[this.configurableRoutes[transitionPath]])
                        transition.router.transitionTo("featureUnavailable");
                },
                goBack: function() {
                    history.back();
                },
                acceptTermsAndConditions: function (version) {
                    var inputJson = {
                        "version" : version
                    }
                    var query = '/knowledgecenter/userpi/user/termsAndConditions';
                    httpClient.put(query, inputJson).then(function (response) {
                        },
                    function (err) {
                        console.log(err);
                        $('#termsAndConditions').modal('show');
                    });
                },
                logout: function(){
                    var topNavController = this.controllerFor('topNav');
                    this.triggerAction(
                        {
                            action: 'logout',
                            target: topNavController
                        }
                    )
                }
            },
            renderTemplate: function() {
                var self = this;
                this.render();
                this.render('topNav', {
                    into: 'application',
                    outlet: 'top-nav'
                });
                this.render('leftNav', {
                    into: 'application',
                    outlet: 'left-nav',
                    controller: self.controllerFor("leftNav")
                });
                this.render('breadcrumbs', {
                    into: 'application',
                    outlet: 'breadcrumbs'
                });
                this.render('notificationPanel', {
                    into: 'topNav',
                    outlet: 'notificationPanel'
                });
                this.render("termsAndCondition", {
                    into: 'application',
                    outlet: 'modal'
                });
            }
        });

        app.ApplicationController = Ember.ObjectController.extend(App.JabberMixin, {
            modalTitle: "Please review our Terms and Conditions",
            isAgreed: false,
            tAndCText: "",
            tAndCVersion: "",

            init: function() {
                documentItems.initialize();
                try {
                    learningUserServices.createLMSUser();
                } catch (e) {
                    console.log("Error while creating user meta data");
                }

                //clear token when application initialize for the first time. This token will get generated by kotg services wehen required.
                localStorage.removeItem("account_token");
            },
            flashMessage: {},
            shouldRefreshPopOver: false,
            currentFlashMessage: {},
            currentPathChange: function() {
                this.set("currentFlashMessage", this.flashMessage);
                this.set("flashMessage", {});
                Ember.set(App, "currentPathValue", this.get("currentPath"));
            }.observes('currentPath'),
            refreshPopOvers: function() {
              this.toggleProperty("shouldRefreshPopOver");
            }
        });

        app.NotificationPanelController = Ember.ObjectController.extend({
            discussionNotificationEnabled: true,
            init: function () {
                var self = this;
                this.set('model', {
                    notifications: [],
                    count: [],
                    followedUserActivities: Ember.Object.create({
                        count: 0
                    }),
                    endorsements: Ember.Object.create({
                        count: 0
                    }),
                    notificationsCount: Ember.Object.create({
                        count: 0
                    }),
                    profileNotificationCount: Ember.Object.create({
                        count: 0
                    }),
                    totalCount: Ember.Object.create({
                        count: 0
                    })

                });
                if(!self.preferences["Collaboration"])
                    self.set('discussionNotificationEnabled', false);

                this.getNotificationsUsingSocket(self.get('model'), window.location.hostname);

                this.getNotifications().then(function (res) {
                    self.get('model').notifications.pushObject({
                        "type": "Questions",
                        "count": 0
                    });
                    var newnotifications = [];
                    _.each(res.notifications, function (notificationObj) {
                        if (notificationObj._source.notification.expires != '0') {
                            newnotifications.pushObject(notificationObj);
                        }
                    });
                    self.get('model').notificationsCount.set('count', newnotifications.length);
                    if(newnotifications.length > 0)
                        self.set('discussionNotificationEnabled', true);
                    self.getEndorseMentNotifications().then(function (endorseRes) {
                        var newnotifications = [];
                        _.each(endorseRes.notifications, function (notificationObj) {
                            if (notificationObj._source.notification.expires != '0') {
                                newnotifications.pushObject(notificationObj);
                            }
                        });
                        self.get('model').endorsements.set('count', newnotifications.length);
                        self.get('model').totalCount.set('count', parseInt(self.get('model').endorsements.count) + parseInt(self.get('model').notificationsCount.count));

                    }, function (err) {
                        console.log(err);
                    });
                }, function (err) {
                    console.log(err);
                    self.getEndorseMentNotifications().then(function (res) {
                        var newnotifications = [];
                        _.each(res.notifications, function (notificationObj) {
                            if (notificationObj._source.notification.expires != '0') {
                                newnotifications.pushObject(notificationObj);
                            }
                        });
                        self.get('model').endorsements.set('count', newnotifications.length);
                        self.get('model').totalCount.set('count', parseInt(self.get('model').endorsements.count) + parseInt(self.get('model').notificationsCount.count));

                    }, function (err) {
                        console.log(err);
                    });
                });

               if (window.cloudletAppId) {
                    this.getFollowedUserActivities().then(function (res) {
                        self.get('model').followedUserActivities.set('count', res.activities.length);
                    }, function (err) {
                        console.log(err);
                    });
                }
            },
            getNotifications: function () {
                var endPoint = "/knowledgecenter/cclom/notifications/" + app.getUserLoginId();
                return httpClient.get(endPoint);
            },
            getEndorseMentNotifications: function () {
                var endPoint = "/knowledgecenter/cclom/notifications/endorse/" + app.getUserLoginId();
                return httpClient.get(endPoint);
            },
            getNotificationsUsingSocket: function (model, hostname) {
			   var self = this;

	           if(hostname!=""){
                    jQuery.ajax({
                        method:"GET",
                        url: '/knowledgecenter/cclom/system/notifications/socketpath',
                        headers: {'x-socket-host': hostname},
                        dataType: "JSON",
                        contentType: "application/json",
                        beforeSend: function(xhr){
                            httpClient.setRequestHeadersData(xhr);
                        },
                        success: function(result) { 
                            var supportedDomainName =  result.socket
                            var socket = io.connect(supportedDomainName, {
                                "secure": true,
                                "resource": "kpns/socket.io"
                            }); // connect event was not firing.
                            socket.on('connect', function () {
                                var count;
                                var endorsecount;
                                var questioncount;
                                socket.emit('join', {
                                    'name': app.getEmailId()
                                });
                                socket.on('Event', function (data) {

                                    if (data) {
                                        if (data._source.verb == "endorse" || data._source.verb == "approve" || data._source.verb == "recommend") {
                                            var notificationModel = self.controllerFor('notificationsEndorsement').get('model');
                                            endorsecount = model.endorsements.count;
                                            endorsecount += 1;
                                            model.endorsements.set('count', endorsecount);
                                            if (notificationModel.endorsementdata) {
                                                notificationModel.endorsementdata.unshiftObject(data);
                                                notificationModel.endorsements.unshiftObject(data);
                                            }
                                        } else if ((data._source.verb == 'comment' || data._source.verb == 'edit' || data._source.verb == 'like' || data._source.verb == 'rate' || data._source.verb == 'follow' || data._source.verb == 'favorite') && data._source.object.objectType == 'forum') {
                                            var notificationModel = self.controllerFor('notificationsQuestions').get('model');
                                            questioncount = model.notificationsCount.count;
                                            questioncount += 1;
                                            model.notificationsCount.set('count', questioncount);
                                            if (notificationModel.notificationData) {
                                                notificationModel.notificationData.unshiftObject(data);
                                                notificationModel.notifications.unshiftObject(data);
                                            }

                                        }
                                    }
                                    model.totalCount.set('count', parseInt(model.endorsements.count) + parseInt(model.notificationsCount.count));
                                });
                            });
                            return "";
                        },
                        error: function(error) {
                                console.log(error);
                            }
                        }); 

                   }
                
            },
            getFollowedUserActivities: function () {
                var appId = window.cloudletAppId;
                var userName = app.getUserLoginId();
                var endPoint = "/knowledgecenter/cclom/cloudlet/followed/users/activities/" + appId + "/" + userName + "?entityType=users";
                return httpClient.get(endPoint);
            }
        });

        app.isFirstTimeUser = function (userId) {
            var loggedInAtleastOnceCookieName = userId + '-loggedInAtleastOnceCookieName';
            if (app.getCookie(loggedInAtleastOnceCookieName)) {
                return false;
            }
            $.cookie(loggedInAtleastOnceCookieName, true);
            return true;
        };

        app.isMobile = function () {
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                return true;
            } else {
                return false;
            }
        }

        return app;
    });