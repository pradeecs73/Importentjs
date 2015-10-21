'use strict';

define(['app', 'text!templates/notificationPanel.hbs', 'httpClient', 'text!templates/notificationPage.hbs', 'pages/followedUserActivities', 'Q'],
    function(App, notificationPanelTemplate, httpClient, notificationPageTemplate, notificationjs, Q) {
         var notificationCountFlags = {
            questionAction : false,
            endorsementAction : false,
            allNotificationAction:false,
            questionTotalCount : 0,
            endorsementTotalCount : 0
        }

        App.NotificationPanelView = Ember.View.extend({
            template: Ember.Handlebars.compile(notificationPanelTemplate),
            didInsertElement: function() {}
        });

        App.NotificationsQuestionsView = Ember.View.extend({
            template: Ember.Handlebars.compile(notificationPageTemplate),
            didInsertElement: function() {
                var self = this;
                notificationjs.visualSearch(this.controller.get('model').types, this.controller.visualSearchCallBack, this);
                notificationjs.sortOver();
                notificationjs.initialize(this.$());
            },

            change: function(e, val) {
                var option = this.controller.get("option");
                var model = this.controller.get("model");
                model.notifications.clear();
                if (option == null || !option) {
                    model.notifications.pushObjects(model.notificationData);
                } else {
                    _.each(model.notificationData, function(notification, key) {
                        if (option == notification._source.target.objectType) {
                            model.notifications.pushObject(notification);
                        }
                    });
                }

            }

        });

        App.NotificationsQuestionsRoute = Ember.Route.extend({
            model: function(params) {
                var self = this;
                var type = "";
                var finddata = self.controllerFor("notificationsQuestions").target.router.activeTransition.targetName;
                if (finddata.indexOf('endorsement') != -1) {
                    type = "endorsement";
                } else {
                    type = "questions";
                }
                var model = {
                    route: type,
                    notifications: [],
                    notificationData: [],
                    endorsements: [],
                    endorsementdata: [],
                    types: []
                };
                return Q.all([
                    this.getNotifications(),
                    this.getEndorseMentNotifications()
                ]).spread(function(notifications, endorseMentNotifications) {
                    model.types.pushObjects(["DISCUSSIONS"]);
                    model.notificationData  = self.setNotifications(notifications.notifications);
                    model.notifications     = self.setNotifications(notifications.notifications);
                    model.questionAction    = notificationCountFlags.questionAction;
                    model.questionTotalCount = notificationCountFlags.questionTotalCount; 
                }).then(function() {
                    return model;
                }, function(error) {
                    return model;
                });
            },
            afterModel: function(model) {
                var self = this;
                Ember.run.next(this, function() {
                    if (model.route.indexOf('endorsement') != -1) {
                        Ember.set(this.controllerFor('application'), "currentPath", "notifications.endorsement");
                    } else {
                        Ember.set(this.controllerFor('application'), "currentPath", "notifications.questions");
                    }
                });
            },
            setNotifications: function(notifications) {
                var notificationSet = [];
                var newNotifications = [];
                var oldNotifications = [];
                _.each(notifications, function(notificationObj) {

                    if (notificationObj._source.notification.expires == '0') {
                        notificationObj.markedRead = true;
                        oldNotifications.pushObject(notificationObj);
                    } else {
                        newNotifications.pushObject(notificationObj);
                    }
                });
                oldNotifications.sort(function(a, b) {
                    return new Date(a._source.notification.published) - new Date(b._source.notification.published);
                });
                newNotifications.sort(function(a, b) {
                    return new Date(b._source.notification.published) - new Date(a._source.notification.published);
                });
                /*
                -- Set notification Actions settings for Markas Read and Ignore all flags.
                */
                notificationCountFlags.questionTotalCount = newNotifications.length;

                if(newNotifications.length>0){
                    notificationCountFlags.questionAction = true;
                }else{
                     notificationCountFlags.questionAction = false;
                }
                notificationSet.pushObjects(newNotifications);
                notificationSet.pushObjects(oldNotifications);
                return notificationSet;
            },
            getNotifications: function() {
                var endPoint = "/knowledgecenter/cclom/notifications/" + App.getEmailId();
                   return httpClient.get(endPoint).then(function(notification) {
                    
                   var item_index, item_type, item_id,  item_sort,item_score;
                     var model = {
                        notifications: []
                    };
                   
                    _.each(notification.notifications, function(item, index) {
                        item_index   = item._index; 
                        item_type    = item._type;    
                        item_id      = item._id;
                        item_sort    = item.sort;
                        item_score   = item._score;

                        item = item._source;
                        item.isEven = (index % 2 === 0) ? true : false;

                        item.objectId = item.object.id;
                        item.objectType = item.object.objectType;

                        if (item.object.objectType == "blog") {
                            item.pathName = "blog";
                        } else if (item.object.objectType == "forum") {
                            item.pathName = "question";
                            item.objectType = "Discussions";
                        }
                        item.objectType = item.objectType.capitalize();
                        model.notifications.push({
                            "_index":item_index,"_type":item_type,"_id":item_id,"_score":item_score,"_source":item,"sort":item_sort
                        });

                    });
                    return model;
                }, function(error) {
                    return model;
                });

            },

            getEndorseMentNotifications: function() {
                var endPoint = "/knowledgecenter/cclom/notifications/endorse/" + App.getEmailId();
                return httpClient.get(endPoint);
            },

            actions: {
                ignore: function(notifications) {
                    var notifciationArray = [];
                    if (notifications.length > 1) {
                        _.each(notifications, function(notification) {
                            if (notification._source.notification.expires != '0') {
                                notifciationArray.push(notification);
                            }
                        });
                    } else {
                        if (notifications._source) {
                            notifciationArray.push(notifications);
                        } else {
                            notifciationArray.push([]);
                        }
                    }
                    if (notifciationArray.length > 0) {
                        var self = this;
                        var data = {
                            username: App.getEmailId(),
                            notification: notifciationArray
                        };
                        jQuery.ajax({
                            type: "POST",
                            contentType: "application/json",                            
                            url: '/knowledgecenter/cclom/notifications/ignore',
                            data: JSON.stringify(data),
                            beforeSend: function(xhr){
                                httpClient.setRequestHeadersData(xhr);
                            },
                            success: function(result) {
                                var model = self.modelFor('notificationsQuestions');
                                var notificationPanel = self.controllerFor('notificationPanel').get('model');
                                var totalCount = self.controllerFor('notificationPanel').get('model').totalCount.count;
                                var notificationCount = notificationCountFlags.questionTotalCount;

                                 if (notifciationArray.length > 1) {
                                        model.questionAction = false;
                                        if(totalCount > 0 && notificationCount <= totalCount){
                                            self.controllerFor('notificationPanel').get('model').totalCount.set('count', parseInt(totalCount) - parseInt(notificationCount));
                                        }                                        
                                        self.controllerFor('notificationPanel').get('model').notificationsCount.set('count', 0);    

                                        _.each(model.notifications, function(notification) {
                                            if (!notification.markedRead) {
                                                notification.markedRead = true;
                                            }
                                            var notificationsView = self.router._activeViews["notifications.questions"][0];
                                            notificationsView.rerender();
                                        });
                                        return;
                                    } else {
                                        var notificationObj = _.findWhere(model.notifications, {
                                            _id: notifciationArray[0]._id
                                        });
                                        if (notificationObj) {
                                            notificationObj.markedRead = true;
                                            notificationCount = self.controllerFor('notificationPanel').get('model').notificationsCount.count;    
                                            if(notificationCount > 0){                                                
                                                self.controllerFor('notificationPanel').get('model').notificationsCount.set('count', notificationCount - 1);
                                                self.controllerFor('notificationPanel').get('model').totalCount.set('count', totalCount - 1);
                                                notificationCountFlags.questionTotalCount = notificationCount - 1;
                                                notificationCount = notificationCountFlags.questionTotalCount;
                                            }
                                            var notificationsView = self.router._activeViews["notifications.questions"][0];
                                            if (notificationCount == 0) {
                                                model.questionAction = false;
                                            }
                                            notificationsView.rerender();
                                            return;
                                        }
                                    }                           
                            },
                            error: function(error) {
                                console.log(error);
                            }
                        });
                    }

                },
                markAsRead: function(notifications) {
                    var notifciationArray = [];
                    if (notifications.length > 1) {
                        _.each(notifications, function(notification) {
                            if (notification._source.notification.expires != '0') {
                                notifciationArray.push(notification);
                            }
                        });
                    } else {
                        if (notifications._source) {
                            notifciationArray.push(notifications);
                        } else {
                            notifciationArray.push([]);
                        }
                    }
                    if (notifciationArray.length > 0) {
                        var self = this;
                        var data = {
                            username: App.getEmailId(),
                            notification: notifciationArray
                        };
                        jQuery.ajax({
                            type: "POST",
                            url: '/knowledgecenter/cclom/notifications/markAsRead',
                            contentType: "application/json",
                            data: JSON.stringify(data),
                            beforeSend: function(xhr){
                                httpClient.setRequestHeadersData(xhr);
                            },
                            success: function(result) {
                                var model = self.modelFor('notificationsQuestions');
                                var notificationPanel = self.controllerFor('notificationPanel').get('model');
                                var totalCount = self.controllerFor('notificationPanel').get('model').totalCount.count;
                                var notificationCount = notificationCountFlags.questionTotalCount;
                                 
                                if (notifciationArray.length > 1) {
                                    model.questionAction = false;
                                    if(totalCount > 0 && notificationCount <= totalCount){
                                        self.controllerFor('notificationPanel').get('model').totalCount.set('count', parseInt(totalCount) - parseInt(notificationCount));
                                    }                                        
                                    self.controllerFor('notificationPanel').get('model').notificationsCount.set('count', 0);    

                                    _.each(model.notifications, function(notification) {
                                        if (!notification.markedRead) {
                                            notification.markedRead = true;
                                        }
                                        var notificationsView = self.router._activeViews["notifications.questions"][0];
                                        notificationsView.rerender();
                                    });
                                    return;
                                } else {
                                    var notificationObj = _.findWhere(model.notifications, {
                                        _id: notifciationArray[0]._id
                                    });
                                    if (notificationObj) {
                                        notificationObj.markedRead = true;
                                        notificationCount = self.controllerFor('notificationPanel').get('model').notificationsCount.count;    
                                        if(notificationCount > 0){                                                
                                            self.controllerFor('notificationPanel').get('model').notificationsCount.set('count', notificationCount - 1);
                                            self.controllerFor('notificationPanel').get('model').totalCount.set('count', totalCount - 1);
                                            notificationCountFlags.questionTotalCount = notificationCount - 1;
                                            notificationCount = notificationCountFlags.questionTotalCount;
                                        }
                                        var notificationsView = self.router._activeViews["notifications.questions"][0];
                                        if (notificationCount == 0) {
                                            model.questionAction = false;
                                        }
                                        notificationsView.rerender();
                                        return;
                                    }
                                }                        
                            },
                            error: function(error) {
                                console.log(error);
                            }
                        });
                    }

                }
            }
        });

        App.NotificationsQuestionsController = Ember.ObjectController.extend({
            option: "ALL",
            content: [],
            filter: "",
            filteredNewNotifications: function() {
                var self = this;
                var filter = this.get('filter');
                var notifications = this.get('content').notifications;
                try{
                 for(var i=0;i<notifications.length;i++)
                    {        
                             var value = '';           
                             value=notifications[i]._source.actor.id.replace('urn::person:','');
                             notifications[i]._source.actor.id=value;
                             notifications[i]=notifications[i];                            
                    }
                }catch(err){
                    console.log("Error in collecting id info in notifications: "+ err);
                }
                if (this.get('content').route == 'endorsement') {
                    notifications = this.get('content').endorsements;
                    self.controllerFor('application').set('currentPath', "notifications.endorsement");
                } else {
                    self.controllerFor('application').set('currentPath', "notifications.questions");
                }
                if (filter == '') {
                    return notifications;
                } else {
                    return notifications.filter(function(item, index, enumerable) {
                        return item._source.notification.message.toLowerCase().match(filter.toLowerCase());
                    });
                }
            }.property('filter', 'notifications.@each'),

            visualSearchCallBack: function(context, searchCollection) {
                var self = this;
                var typeArr = [];
                _.each(searchCollection.models, function(obj) {
                    if (obj.attributes.category == "Type") {
                        if(obj.attributes.value=="DISCUSSIONS"){
                            typeArr.push("forum");
                         }else{
                            typeArr.push(obj.attributes.value);
                         }
                         
                    }
                });
                if (context.controller.get('model').route == 'endorsement') {
                    if (typeArr.length === 0 || typeArr.length === context.controller.get('model').types.length) {
                        context.controller.get('model').endorsements.clear();
                        context.controller.get('model').endorsements.pushObjects(context.controller.get('model').endorsementdata);
                        return;
                    }
                    var filteredNotifications = context.controller.get('model').endorsements.filter(function(item, index, enumerable) {
                        var matchedItem = null;
                        _.each(typeArr, function(match, index) {
                             if (!matchedItem) matchedItem = item._source.object.objectType.toLowerCase().match(match.toLowerCase());
                        });
                        return matchedItem;
                    });
                    context.controller.get('model').endorsements.clear();
                    context.controller.get('model').endorsements.pushObjects(filteredNotifications);

                } else {
                    if (typeArr.length === 0 || typeArr.length === context.controller.get('model').types.length) {
                        context.controller.get('model').notifications.clear();
                        context.controller.get('model').notifications.pushObjects(context.controller.get('model').notificationData);
                        return;
                    }
                    var filteredNotifications = context.controller.get('model').notifications.filter(function(item, index, enumerable) {
                        var matchedItem = null;
                        _.each(typeArr, function(match, index) {
                            if (!matchedItem) matchedItem = item._source.object.objectType.toLowerCase().match(match.toLowerCase());
                        });
                        return matchedItem;
                    });
                    context.controller.get('model').notifications.clear();
                    context.controller.get('model').notifications.pushObjects(filteredNotifications);

                }

            }

        });
        
        
        
        App.NotificationsEndorsementView = Ember.View.extend({
            template: Ember.Handlebars.compile(notificationPageTemplate),
            didInsertElement: function() {
                var self = this;
                notificationjs.visualSearch(this.controller.get('model').types, this.controller.visualSearchCallBack, this);
                notificationjs.sortOver();
                notificationjs.initialize(this.$());
            },

            change: function(e, val) {
                var option = this.controller.get("option");
                var model = this.controller.get("model");
                model.notifications.clear();
                if (option == null || !option) {
                    model.notifications.pushObjects(model.notificationData);
                } else {
                    _.each(model.notificationData, function(notification, key) {
                        if (option == notification._source.target.objectType) {
                            model.notifications.pushObject(notification);
                        }
                    });
                }

            }

        });
        
        
        
        

        App.NotificationsEndorsementRoute = Ember.Route.extend({

            model: function(params) {
                var self = this;
                var type = "";
                var finddata = self.controllerFor("notificationsEndorsement").target.router.activeTransition.targetName;
                if (finddata.indexOf('endorsement') != -1) {
                    type = "endorsement";
                } else {
                    type = "questions";
                }
                var model = {
                    route: type,
                    notifications: [],
                    notificationData: [],
                    endorsements: [],
                    endorsementdata: [],
                    types: []
                };
                return Q.all([
                    this.getNotifications(),
                    this.getEndorseMentNotifications()
                ]).spread(function(notifications, endorseMentNotifications) {
                    model.types.pushObjects(["USER"]);
                    model.endorsementdata = self.setNotifications(endorseMentNotifications.notifications);
                    model.endorsements = self.setNotifications(endorseMentNotifications.notifications);
                    model.endorsementAction = notificationCountFlags.endorsementAction;
                    model.endorsementTotalCount = notificationCountFlags.endorsementTotalCount;

                }).then(function() {
                    return model;
                }, function(error) {
                    return model;
                });
            },
            afterModel: function(model) {
                var self = this;
                Ember.run.next(this, function() {
                    if (model.route.indexOf('endorsement') != -1) {
                        Ember.set(this.controllerFor('application'), "currentPath", "notifications.endorsement");
                    } else {
                        Ember.set(this.controllerFor('application'), "currentPath", "notifications.questions");
                    }
                });
            },
            setNotifications: function(notifications) {
                var notificationSet = [];
                var newNotifications = [];
                var oldNotifications = [];
                _.each(notifications, function(notificationObj) {

                    if (notificationObj._source.notification.expires == '0') {
                        notificationObj.markedRead = true;
                        oldNotifications.pushObject(notificationObj);
                    } else {
                        newNotifications.pushObject(notificationObj);
                    }
                });
                oldNotifications.sort(function(a, b) {
                    return new Date(a._source.notification.published) - new Date(b._source.notification.published);
                });
                newNotifications.sort(function(a, b) {
                    return new Date(b._source.notification.published) - new Date(a._source.notification.published);
                });
                 /*
                -- Set notification Actions settings for Markas Read and Ignore all flags.
                */
                 notificationCountFlags.endorsementTotalCount=newNotifications.length;
                if(newNotifications.length>0){
                    notificationCountFlags.endorsementAction = true;
                }else{
                     notificationCountFlags.endorsementAction = false;
                }
                notificationSet.pushObjects(newNotifications);
                notificationSet.pushObjects(oldNotifications);
                return notificationSet;
            },
            getNotifications: function() {
                var endPoint = "/knowledgecenter/cclom/notifications/" + App.getEmailId();
                return httpClient.get(endPoint);
            },

            getEndorseMentNotifications: function() {
                var endPoint = "/knowledgecenter/cclom/notifications/endorse/" + App.getEmailId();

                return httpClient.get(endPoint).then(function(endorsement) {

                   var item_index, item_type, item_id,  item_sort,item_score;
                     var model = {
                        notifications: []
                    };
                   
                    _.each(endorsement.notifications, function(item, index) {
                        item_index      = item._index; 
                        item_type       = item._type;    
                        item_id         = item._id;
                        item_sort       = item.sort;
                        item_score      = item._score;
                        item            = item._source;
                        item.isEven     = (index % 2 === 0) ? true : false;
                        item.objectId   = item.object.id;
                        item.objectType = item.object.objectType;
                        item.objectType = item.objectType.toUpperCase();
                        model.notifications.push({
                            "_index":item_index,"_type":item_type,"_id":item_id,"_score":item_score,"_source":item,"sort":item_sort
                        });

                    });

                    return model;
                }, function(error) {
                    return model;
                });

            },

            actions: {
                ignore: function(notifications) {
                    var notifciationArray = [];
                    if (notifications.length > 1) {
                        _.each(notifications, function(notification) {
                            if (notification._source.notification.expires != '0') {
                                notifciationArray.push(notification);
                            }
                        });
                    } else {
                        if (notifications._source) {
                            notifciationArray.push(notifications);
                        } else {
                            notifciationArray.push([]);
                        }
                    }
                    if (notifciationArray.length > 0) {
                        var self = this;
                        var data = {
                            username: App.getEmailId(),
                            notification: notifciationArray
                        };
                        jQuery.ajax({
                            type: "POST",
                            url: '/knowledgecenter/cclom/notifications/ignore',
                            contentType: "application/json",
                            data: JSON.stringify(data),
                            beforeSend: function(xhr){
                                httpClient.setRequestHeadersData(xhr);
                            },
                            success: function(result) {
                                var model = self.modelFor('notificationsEndorsement');
                                var notificationPanel = self.controllerFor('notificationPanel').get('model');
                                var totalCount = self.controllerFor('notificationPanel').get('model').totalCount.count;
                                 var endorsementCount = model.endorsementTotalCount;

                                if (notifciationArray.length > 1) {
                                    model.endorsementAction = false;
                                    if(totalCount > 0 && endorsementCount <= totalCount){
                                        self.controllerFor('notificationPanel').get('model').totalCount.set('count', parseInt(totalCount) - parseInt(endorsementCount));
                                    }
                                        self.controllerFor('notificationPanel').get('model').endorsements.set('count', 0);
                                    _.each(model.endorsements, function(endorsement){
                                        if (!endorsement.markedRead) {
                                            endorsement.markedRead = true;
                                        }
                                        var notificationsView = self.router._activeViews["notifications.endorsement"][0];
                                        notificationsView.rerender();
                                    });

                                    return;
                                } else {
                                    var endorseMent = _.findWhere(model.endorsements, {
                                        _id: notifciationArray[0]._id
                                    });
                                    if (endorseMent) {
                                        endorseMent.markedRead = true;
                                        totalCount = self.controllerFor('notificationPanel').get('model').totalCount.count;
                                        if(totalCount > 0){
                                            self.controllerFor('notificationPanel').get('model').totalCount.set('count', totalCount - 1);                                                
                                        }    
                                        if(endorsementCount > 0){
                                            self.controllerFor('notificationPanel').get('model').endorsements.set('count', endorsementCount - 1);
                                            model.endorsementTotalCount = endorsementCount - 1;
                                            endorsementCount = model.endorsementTotalCount
                                        }
                                        var notificationsView = self.router._activeViews["notifications.endorsement"][0];
                                        if (endorsementCount == 0) {
                                            model.endorsementAction = false;
                                        }
                                        notificationsView.rerender();
                                        return;
                                    }
                                }
                            },
                            error: function(error) {
                                console.log(error);
                            }
                        });
                    }

                },
                markAsRead: function(notifications) {
                    var notifciationArray = [];
                    if (notifications.length > 1) {
                        _.each(notifications, function(notification) {
                            if (notification._source.notification.expires != '0') {
                                notifciationArray.push(notification);
                            }
                        });
                    } else {
                        if (notifications._source) {
                            notifciationArray.push(notifications);
                        } else {
                            notifciationArray.push([]);
                        }
                    }
                    if (notifciationArray.length > 0) {
                        var self = this;
                        var data = {
                            username: App.getEmailId(),
                            notification: notifciationArray
                        };
                        jQuery.ajax({
                            type: "POST",
                            url: '/knowledgecenter/cclom/notifications/markAsRead',
                            contentType: "application/json",
                            data: JSON.stringify(data),
                            beforeSend: function(xhr){
                                httpClient.setRequestHeadersData(xhr);
                            },
                            success: function(result) {var model = self.modelFor('notificationsEndorsement');
                                var notificationPanel = self.controllerFor('notificationPanel').get('model');
                                var totalCount = self.controllerFor('notificationPanel').get('model').totalCount.count;
                                var endorsementCount = model.endorsementTotalCount;
                                if (notifciationArray.length > 1) {
                                    model.endorsementAction = false;
                                    if(totalCount > 0 && endorsementCount <= totalCount){
                                        self.controllerFor('notificationPanel').get('model').totalCount.set('count', parseInt(totalCount) - parseInt(endorsementCount));
                                    }
                                        self.controllerFor('notificationPanel').get('model').endorsements.set('count', 0);
                                    _.each(model.endorsements, function(endorsement){
                                        if (!endorsement.markedRead) {
                                            endorsement.markedRead = true;
                                        }
                                        var notificationsView = self.router._activeViews["notifications.endorsement"][0];
                                        notificationsView.rerender();
                                    });

                                    return;
                                } else {
                                    var endorseMent = _.findWhere(model.endorsements, {
                                        _id: notifciationArray[0]._id
                                    });
                                    if (endorseMent) {
                                        endorseMent.markedRead = true;
                                        totalCount = self.controllerFor('notificationPanel').get('model').totalCount.count;
                                        if(totalCount > 0){
                                            self.controllerFor('notificationPanel').get('model').totalCount.set('count', totalCount - 1);                                                
                                        }    
                                        if(endorsementCount > 0){
                                            self.controllerFor('notificationPanel').get('model').endorsements.set('count', endorsementCount - 1);
                                            model.endorsementTotalCount = endorsementCount - 1;
                                            endorsementCount = model.endorsementTotalCount
                                        }
                                        var notificationsView = self.router._activeViews["notifications.endorsement"][0];
                                        if (endorsementCount == 0) {
                                            model.endorsementAction = false;
                                        }
                                        notificationsView.rerender();
                                        return;
                                    }
                                }                          
                            },
                            error: function(error) {
                                console.log(error);
                            }
                        });
                    }

                }
            }
        });

        App.NotificationsEndorsementController = Ember.ObjectController.extend({
            option: "ALL",
            content: [],
            filter: "",
            filteredNewNotifications: function() {
                var filter = this.get('filter');
                var notifications = this.get('content').endorsements;          
                try{
                 for(var i=0;i<notifications.length;i++)
                    {        
                             var value = '';          
                             value=notifications[i]._source.actor.id.replace('urn::person:','');
                             notifications[i]._source.actor.id=value;
                             notifications[i]=notifications[i];                            
                    }
                }catch(err){
                    console.log("Error in collecting ids in endorsements: "+ err);
                }
                if (filter == '') {
                    return notifications;
                } else {
                    return notifications.filter(function(item, index, enumerable) {
                        return item._source.notification.message.toLowerCase().match(filter.toLowerCase());
                    });
                }
            }.property('filter', 'notifications.@each'),

            visualSearchCallBack: function(context, searchCollection) {
                var self = this;
                var typeArr = [];
                _.each(searchCollection.models, function(obj) {
                    if (obj.attributes.category == "Type") {
                        typeArr.push(obj.attributes.value);
                    }
                });
                if (typeArr.length === 0 || typeArr.length > context.controller.get('model').types.length) {
                    context.controller.get('model').endorsements.clear();
                    context.controller.get('model').endorsements.pushObjects(context.controller.get('model').endorsementdata);
                    return;
                }
                var filteredNotifications = context.controller.get('model').endorsementdata.filter(function(item, index, enumerable) {
                    var matchedItem = null;
                    _.each(typeArr, function(match, index) {
                        if (!matchedItem) matchedItem = item._source.object.objectType.toLowerCase().match(match.toLowerCase());
                    });
                    return matchedItem;
                });
                context.controller.get('model').endorsements.clear();
                context.controller.get('model').endorsements.pushObjects(filteredNotifications);

            }

        });
        
        
        

        App.AllNotificationsView = Ember.View.extend({
            template: Ember.Handlebars.compile(notificationPageTemplate),
            didInsertElement: function() {
                var self = this;
                notificationjs.visualSearch(this.controller.get('model').types, this.controller.visualSearchCallBack, this);
                notificationjs.sortOver();
                notificationjs.initialize(this.$());
            },
            change: function(e, val) {
                var option = this.controller.get("option");
                var model = this.controller.get("model");
                model.notifications.clear();
                if (option == null || !option) {
                    model.notifications.pushObjects(model.notificationData);
                } else {
                    _.each(model.notificationData, function(notification, key) {
                        if (option == notification._source.target.objectType) {
                            model.notifications.pushObject(notification);
                        }
                    });
                }

            }

        });

        App.AllNotificationsRoute = Ember.Route.extend({
            model: function(params) {
                var self = this;
                var model = {
                    allNotifications: [],
                    allNotificationData: [],
                    types: []
                };
                return Q.all([
                    this.getAllNotifications()
                ]).spread(function(notifications) {
                    model.types.pushObjects(["DISCUSSIONS","USER"]);
                    model.allNotificationData = self.setNotifications(notifications.notifications);
                    model.allNotifications = self.setNotifications(notifications.notifications);
                    model.endorsementAction = notificationCountFlags.allNotificationAction;
                    
                }).then(function() {
                    return model;
                }, function(error) {
                    return model;
                });
            },
            setNotifications: function(notifications) {
                var notificationSet = [];
                var newNotifications = [];
                var oldNotifications = [];
                _.each(notifications, function(notificationObj) {
                     if (notificationObj._source.notification.expires == '0') {
                            notificationObj.markedRead = true;
                            oldNotifications.pushObject(notificationObj);
                        } else {
                            newNotifications.pushObject(notificationObj);
                        }
                });
                oldNotifications.sort(function(a, b) {
                    return new Date(a._source.notification.published) - new Date(b._source.notification.published);
                });
                newNotifications.sort(function(a, b) {
                    return new Date(b._source.notification.published) - new Date(a._source.notification.published);
                });
                 /*
                -- Set notification Actions settings for Markas Read and Ignore all flags.
                */
                if(newNotifications.length>0){
                    notificationCountFlags.allNotificationAction = true;
                }else{
                     notificationCountFlags.allNotificationAction = false;
                }

                notificationSet.pushObjects(newNotifications);
                notificationSet.pushObjects(oldNotifications);
                return notificationSet;
            },
            getAllNotifications: function() {
                var endPoint = "/knowledgecenter/cclom/notifications/all/" + App.getEmailId();
                 return httpClient.get(endPoint).then(function(notification) {
                   var item_index, item_type, item_id,  item_sort,item_score;
                     var model = {
                        notifications: []
                    };

                    _.each(notification.notifications, function(item, index) {

                        item_index   = item._index; 
                        item_type    = item._type;    
                        item_id      = item._id;
                        item_sort    = item.sort;
                        item_score   = item._score;

                        item = item._source;
                        item.isEven = (index % 2 === 0) ? true : false;
                        item.objectId = item.object.id;
                        item.objectType = item.object.objectType;

                        if (item.object.objectType == "blog") {
                            item.pathName = "blog";
                        } else if (item.object.objectType == "forum") {
                            item.pathName = "question";
                            item.objectType = "Discussions";
                        }

                        item.objectType = item.objectType.capitalize();
                        model.notifications.push({
                            "_index":item_index,"_type":item_type,"_id":item_id,"_score":item_score,"_source":item,"sort":item_sort
                        });

                    });
                    return model;
                }, function(error) {
                    return model;
                });

            },
            actions: {
                ignore: function(notifications) {
                    var notifciationArray = [];
                    if (notifications.length > 1) {
                        _.each(notifications, function(notification) {
                            if (notification._source.notification.expires != '0') {
                                notifciationArray.push(notification);
                            }
                        });
                    } else {
                        if (notifications._source) {
                            notifciationArray.push(notifications);
                        } else {
                            notifciationArray.push([]);
                        }
                    }
                    if (notifciationArray.length > 0) {
                        var self = this;
                        var data = {
                            username: App.getEmailId(),
                            notification: notifciationArray
                        };
                        jQuery.ajax({
                            type: "POST",
                            url: '/knowledgecenter/cclom/notifications/ignore',
                            contentType: "application/json",
                            data: JSON.stringify(data),
                            beforeSend: function(xhr){
                                httpClient.setRequestHeadersData(xhr);
                            },
                            success: function(result) {
                                var model = self.modelFor('allNotifications');
                                var notificationPanel = self.controllerFor('notificationPanel').get('model');
                                var totalCount = self.controllerFor('notificationPanel').get('model').totalCount.count;
                                var endorsementCount = self.controllerFor('notificationPanel').get('model').endorsements.count;
                                var notificationCount = self.controllerFor('notificationPanel').get('model').notificationsCount.count;
                                
                                if (notifciationArray.length > 1) {
                                     model.endorsementAction = false;
                                     self.controllerFor('notificationPanel').get('model').totalCount.set('count', 0);                               
                                        if(endorsementCount > 0){
                                        	self.controllerFor('notificationPanel').get('model').endorsements.set('count', 0);                                      	
                                        }
                                        if(notificationCount > 0){
                                        	self.controllerFor('notificationPanel').get('model').notificationsCount.set('count', 0);
                                        }
                                        
                                    _.each(model.allNotifications, function(notification) {
                                        if (!notification.markedRead) {
                                            notification.markedRead = true;
                                        }
                                        var allNotificationsView = self.router._activeViews.allNotifications[0];
                                        allNotificationsView.rerender();
                                    });
                                    return;
                                } else {
                                    
                                     var notification = _.findWhere(model.allNotifications, {
                                         _id: notifciationArray[0]._id
                                     });
                                    
                                    if(notification){
                                         notification.markedRead = true;
                                         self.controllerFor('notificationPanel').get('model').totalCount.set('count', totalCount - 1);
                                         if(endorsementCount > 0){
                                             self.controllerFor('notificationPanel').get('model').endorsements.set('count', endorsementCount - 1);                                          
                                            }
                                        if(notificationCount > 0){
                                            self.controllerFor('notificationPanel').get('model').notificationsCount.set('count', parseInt(notificationCount) - 1);
                                            }
                                         var allNotificationsView = self.router._activeViews.allNotifications[0];
                                         allNotificationsView.rerender();
                                         return;
                                    }
                                   
                                }

                            },
                            error: function(error) {
                                console.log(error);
                            }
                        });
                    }

                },
                markAsRead: function(notifications) {
                    var notifciationArray = [];
                    if (notifications.length > 1) {
                        _.each(notifications, function(notification) {
                            if (notification._source.notification.expires != '0') {
                                notifciationArray.push(notification);
                            }
                        });
                    } else {
                        if (notifications._source) {
                            notifciationArray.push(notifications);
                        } else {
                            notifciationArray.push([]);
                        }
                    }
                    if (notifciationArray.length > 0) {
                        var self = this;
                        var data = {
                            username: App.getEmailId(),
                            notification: notifciationArray
                        };
                        jQuery.ajax({
                            type: "POST",
                            url: '/knowledgecenter/cclom/notifications/markAsRead',
                            contentType: "application/json",
                            data: JSON.stringify(data),
                            beforeSend: function(xhr){
                                httpClient.setRequestHeadersData(xhr);
                            },
                            success: function(result) {
                                var model = self.modelFor('allNotifications');
                                var notificationPanel = self.controllerFor('notificationPanel').get('model');
                                var totalCount = self.controllerFor('notificationPanel').get('model').totalCount.count;
                                var endorsementCount = self.controllerFor('notificationPanel').get('model').endorsements.count;
                                var notificationCount = self.controllerFor('notificationPanel').get('model').notificationsCount.count;

                                if (notifciationArray.length > 1) {
                                   model.endorsementAction = false;
                                   self.controllerFor('notificationPanel').get('model').totalCount.set('count', 0);                                        
                                    if(endorsementCount > 0){
                                    	self.controllerFor('notificationPanel').get('model').endorsements.set('count', 0);                                            	
                                    }
                                    if(notificationCount > 0){
                                    	self.controllerFor('notificationPanel').get('model').notificationsCount.set('count', 0);                                            	
                                    }                                            
                                   _.each(model.allNotifications, function(notification) {
                                       if (!notification.markedRead) {
                                           notification.markedRead = true;                                           
                                       }
                                       var allNotificationsView = self.router._activeViews.allNotifications[0];
                                       allNotificationsView.rerender();
                                   });
                                   return;
                               } else {
                                 var notification = _.findWhere(model.allNotifications, {
                                        _id: notifciationArray[0]._id
                                    });
                                
                                if(notification){
                                    notification.markedRead = true;
                                    self.controllerFor('notificationPanel').get('model').totalCount.set('count', totalCount - 1);
                                    if(endorsementCount > 0){
                                         self.controllerFor('notificationPanel').get('model').endorsements.set('count', endorsementCount - 1);                                          
                                        }
                                    if(notificationCount > 0){
                                        self.controllerFor('notificationPanel').get('model').notificationsCount.set('count', parseInt(notificationCount) - 1);
                                        }
                                    var allNotificationsView = self.router._activeViews.allNotifications[0];
                                    allNotificationsView.rerender();
                                    return;
                                }
                                  
                               }
                            },
                            error: function(error) {
                                console.log(error);
                            }
                        });
                    }

                }
            }
        });

        App.AllNotificationsController = Ember.ObjectController.extend({
            option: "ALL",
            content: [],
            filter: "",
            filteredNewNotifications: function() {
                var filter = this.get('filter');
                var notifications = this.get('content').allNotifications;          
                try{
                 for(var i=0;i<notifications.length;i++)
                    {        
                             var value = '';          
                             value=notifications[i]._source.actor.id.replace('urn::person:','');
                             notifications[i]._source.actor.id=value;
                             notifications[i]=notifications[i];                            
                    }
                }catch(err){
                    console.log("Error in collecting ids in notifications: "+ err);
                }
                if (filter == '') {
                    return notifications;
                } else {
                    return notifications.filter(function(item, index, enumerable) {
                        return item._source.notification.message.toLowerCase().match(filter.toLowerCase());
                    });
                }
            }.property('filter', 'notifications.@each'),

            visualSearchCallBack: function(context, searchCollection) {
                var self = this;
                var typeArr = [];
                _.each(searchCollection.models, function(obj) {
                    if (obj.attributes.category == "Type") {
                        // changes maded for Forum to Discussions in static way
                         if(obj.attributes.value=="DISCUSSIONS"){
                            typeArr.push("forum");
                         }else{
                            typeArr.push(obj.attributes.value);
                         }
                        
                    }
                });
                if (typeArr.length === 0 || typeArr.length > context.controller.get('model').types.length) {
                    context.controller.get('model').allNotifications.clear();
                    context.controller.get('model').allNotifications.pushObjects(context.controller.get('model').allNotificationData);
                    return;
                }
                var filteredNotifications = context.controller.get('model').allNotificationData.filter(function(item, index, enumerable) {
                    var matchedItem = null;
                    _.each(typeArr, function(match, index) {
                        if (!matchedItem) matchedItem = item._source.object.objectType.toLowerCase().match(match.toLowerCase());
                    });
                    return matchedItem;
                });
                context.controller.get('model').allNotifications.clear();
                context.controller.get('model').allNotifications.pushObjects(filteredNotifications);

            }

        });

    });