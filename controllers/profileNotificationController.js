define(['app', 'text!templates/notificationPanel.hbs', 'httpClient', 'text!templates/notificationPage.hbs','pages/followedUserActivities', 'Q'],
	    function(App, notificationPanelTemplate, httpClient, notificationPageTemplate, notificationjs, Q) {
	
	
	
	 App.ProfileNotificationsView = Ember.View.extend({
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

     App.ProfileNotificationsRoute = Ember.Route.extend({
         model: function(params) {
             var self = this;
             var type = params.type;
             var model = {
             	 route : type,	
                 profileNotifications: [],
                 profileNotificationData: [],
                 types: []
             };
             return Q.all([
                 this.getProfileNotifications()
             ]).spread(function(profileNotifications) {
                 model.types.pushObjects(["FORUM", "BLOG", "LEARNING PLAN", "USER"]);
                 model.profileNotificationData = self.setNotifications(profileNotifications.notifications);
                 model.profileNotifications = self.setNotifications(profileNotifications.notifications);
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
                 return new Date(a._source.notification.published) - new Date(b._source.notification.published);
             });
             notificationSet.pushObjects(newNotifications);
             notificationSet.pushObjects(oldNotifications);
             return notificationSet;
         },
         getProfileNotifications: function() {
             var endPoint = "/knowledgecenter/cclom/notifications/" + App.getEmailId();
             return httpClient.get(endPoint);
         },
         actions: {
             ignore: function(notifications) {
	                    var notifciationArray = [];
	                    if (notifications.length > 1) {
	                        _.each(notifications, function(notification) {
	                        	if(notification._source.notification.expires != '0'){
	                        		 notifciationArray.push(notification);
	                        	}
	                        });
	                    } else {
	                    	if(notifications._source){
		                        notifciationArray.push(notifications);
	                    	}else{
	                    		notifciationArray.push([]);
	                    	}
	                    }
	                    if(notifciationArray.length > 0){
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
		                        	var model = self.modelFor('profileNotifications');
		                        	var notificationPanel = self.controllerFor('notificationPanel').get('model');
		                        	var totalCount = self.controllerFor('notificationPanel').get('model').totalCount.count;
		                        	
                        			var profileNotificationCount = self.controllerFor('notificationPanel').get('model').profileNotificationCount.count;
                        			if(notifciationArray.length > 1){
                        				_.each(model.profileNotifications , function(profilenotification){
                        					if(!profilenotification.markedRead){
                        						profilenotification.markedRead = true;
                        						self.controllerFor('notificationPanel').get('model').totalCount.set('count',parseInt(totalCount)-1);
                        						self.controllerFor('notificationPanel').get('model').profileNotificationCount.set('count',parseInt(profileNotificationCount)-1);
                        					}
                                            var profileNotificationsView = self.router._activeViews.profileNotifications[0];
                                            profileNotificationsView.rerender();
                            			})
                        				return;
                        			}else{
                        				_.each(model.profileNotifications , function(profilenotification){
                        					if(notifications._id == profilenotification._id){
                        						profilenotification.markedRead = true;
	                        					self.controllerFor('notificationPanel').get('model').totalCount.set('count',totalCount-1);
	                        					self.controllerFor('notificationPanel').get('model').profileNotificationCount.set('count',profileNotificationCount-1);
	                        					var profileNotificationsView = self.router._activeViews.profileNotifications[0];
	                        					profileNotificationsView.rerender();
	                                            return;
                        					}
                            			})
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
	                        	if(notification._source.notification.expires != '0'){
	                        		 notifciationArray.push(notification);
	                        	}
	                        });
	                    } else {
	                    	if(notifications._source){
		                        notifciationArray.push(notifications);
	                    	}else{
	                    		notifciationArray.push([]);
	                    	}
	                    }
	                    if(notifciationArray.length > 0){
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
		                        	var model = self.modelFor('notifications');
		                        	var notificationPanel = self.controllerFor('notificationPanel').get('model');
		                        	var totalCount = self.controllerFor('notificationPanel').get('model').totalCount.count;
		                        	
		                        	var profileNotificationCount = self.controllerFor('notificationPanel').get('model').profileNotificationCount.count;
                        			if(notifciationArray.length > 1){
                        				_.each(model.profileNotifications , function(profilenotification){
                        					if(!profilenotification.markedRead){
                        						profilenotification.markedRead = true;
                        						self.controllerFor('notificationPanel').get('model').totalCount.set('count',parseInt(totalCount)-1);
                        						self.controllerFor('notificationPanel').get('model').profileNotificationCount.set('count',parseInt(profileNotificationCount)-1);
                        					}
                                            var profileNotificationsView = self.router._activeViews.profileNotifications[0];
                                            profileNotificationsView.rerender();
                            			})
                        				return;
                        			}else{
                        				_.each(model.profileNotifications , function(profilenotification){
                        					if(notifications._id == profilenotification._id){
                        						profilenotification.markedRead = true;
	                        					self.controllerFor('notificationPanel').get('model').totalCount.set('count',totalCount-1);
	                        					self.controllerFor('notificationPanel').get('model').profileNotificationCount.set('count',profileNotificationCount-1);
	                        					var profileNotificationsView = self.router._activeViews.profileNotifications[0];
	                        					profileNotificationsView.rerender();
	                                            return;
                        					}
                            			})
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

     App.ProfileNotificationsController = Ember.ObjectController.extend({
	            option: "ALL",
	            content: [],
	            filter: "",
	            filteredNewNotifications: function() {
	                var filter = this.get('filter');
	                var notifications = this.get('content').notifications;
	                if(this.get('content').route == 'profilenotifications'){
	                	notifications = this.get('content').profileNotifications;
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
	                if(context.controller.get('model').route== 'profilenotifications'){
	                	 if (typeArr.length === 0 || typeArr.length === context.controller.get('model').types.length) {
	                         context.controller.get('model').profileNotifications.clear();
	                         context.controller.get('model').profileNotifications.pushObjects(context.controller.get('model').profileNotificationData);
	                         return;
	                     }
	                     var filteredNotifications = context.controller.get('model').profileNotifications.filter(function(item, index, enumerable) {
	                         var matchedItem = null;
	                         _.each(typeArr, function(match, index) {
	                             if (!matchedItem) matchedItem = item._source.target.objectType.toLowerCase().match(match.toLowerCase());
	                         });
	                         return matchedItem;
	                     });
	                     context.controller.get('model').profileNotifications.clear();
	                     context.controller.get('model').profileNotifications.pushObjects(filteredNotifications);
	                	
	                }
            
	            }
     });
	
	
});
