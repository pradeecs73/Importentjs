'use strict';

define(['app', 'text!templates/followedUserActivities.hbs', 'pages/followedUserActivities', 'httpClient', 'Q'],
    function(app, activityTemplate, followedUserActivities, httpClient, Q) {
        App.FollowedUserActivtiesView = Ember.View.extend({
            template: Ember.Handlebars.compile(activityTemplate),
            templateName: 'activity-stream',
            didInsertElement: function() {
                var self = this;
                followedUserActivities.visualSearch(this.controller.get('model').types, this.controller.visualSearchCallBack, this);
                followedUserActivities.sortOver();
                followedUserActivities.initialize(this.$());
            }
        });

        App.FollowedUserActivtiesRoute = Ember.Route.extend({
            model: function() {
                return this.getFollowedUserActivities();
            },
            getFollowedUserActivities: function() {
                var config;
                 var cloudletApplicationId;
                 var userName;
                if(window.cloudletAppId){
                    
                    cloudletApplicationId = window.cloudletAppId;
                    userName = app.getEmailId();
                }
                var model = {
                    activities: [],
                    unfilteredActivities: [],
                    types: []
                };

                var endPoint = "/knowledgecenter/cclom/cloudlet/followed/users/activities/" + cloudletApplicationId + "/" + userName + "?entityType=users";
                return httpClient.get(endPoint).then(function(activities) {
                    _.each(activities.activities, function(item, index) {
                        item = item._source;
                        item.isEven = (index % 2 === 0) ? true : false;
                        if (item.target) {
                            item.objectId = item.target.id;
                            item.objectType = item.target.objectType;
                        } else {
                            item.objectId = item.object.id;
                            item.objectType = item.object.objectType;
                        }
                        if (item.object.objectType == "blog") {
                            item.pathName = "blog";
                        } else if (item.object.objectType == "forum") {
                            item.pathName = "question";
                            item.objectType = "Discussions";
                        }
                        item.objectType = item.objectType.toUpperCase();
                        model.activities.push(item);
                        model.unfilteredActivities.push(item);
                        model.types.push(item.objectType);
                    });
                    model.activities.reverse();
                    model.unfilteredActivities.reverse();
                    model.types = _.uniq(model.types);
                    return model;
                }, function(error) {
                    return model;
                });

            }
        });
        App.FollowedUserActivtiesController = Ember.ObjectController.extend({
            filter: "",
            postKey: function() {
                var self = this;
                var filter = this.get('filter');

                if (filter != '') {
                    var filteredActivities = self.get('model').unfilteredActivities.filter(function(item, index, enumerable) {
                        return item.title.toLowerCase().match(filter.toLowerCase());
                    });
                    self.get('model').activities.clear();
                    self.get('model').activities.pushObjects(filteredActivities);
                }

            }.observes('filter'),
            visualSearchCallBack: function(context, searchCollection) {
                var self = this;
                var typeArr = [];
                _.each(searchCollection.models, function(obj) {
                    if (obj.attributes.category == "Type") {
                        typeArr.push(obj.attributes.value);
                    }
                });

                if (typeArr.length === 0 || typeArr.length === context.controller.get('model').types.length) {
                    context.controller.get('model').activities.clear();
                    context.controller.get('model').activities.pushObjects(context.controller.get('model').unfilteredActivities);
                    return;
                }

                var filteredActivities = context.controller.get('model').unfilteredActivities.filter(function(item, index, enumerable) {
                    var matchedItem = null;
                    _.each(typeArr, function(match, index) {
                        if (!matchedItem) matchedItem = item.objectType.toLowerCase().match(match.toLowerCase());
                    });
                    return matchedItem;
                });

                context.controller.get('model').activities.clear();
                context.controller.get('model').activities.pushObjects(filteredActivities);
            }

        });
    });