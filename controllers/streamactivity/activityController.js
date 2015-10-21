'use strict';
define(['app', 'text!templates/streamactivity/activitystream.hbs','pages/activity', 'httpClient', 'Q'],
    function(app, activityTemplate, activity, httpClient, Q) {
        App.StreamactivityView = Ember.View.extend({
            template: Ember.Handlebars.compile(activityTemplate),
            templateName: 'activity-stream',
            toggleView : function(view) {
                var self = this;
                self.controller.set('_currentView', view);
                var search = $("#searchactivities").val();
                App.ActJsonUtil.getSearchFilterResults(search, self);
                Ember.run.schedule('afterRender', function task3() {
                    self.assignEvents(self);    
                });
            },
            didInsertElement: function() {
                activity.initialize();
                activity.visualSearch(this.$(), null, this.controller.visualFilterCallBack, this, this.controller.preferences);
                var self = this;
                self.assignEvents(self);
            },
            assignEvents : function(self) {
                App.ActJsonUtil.setLikeIcons(self);
                var cview = self.controller.get('_currentView');
                var chld = $("[data-class='bgimg0']");
                App.ActEventUtil.showHideNextArrow();
                $("#divDiscussion").on("click", ".activityrow", function() {
                    var newdiscussionTitle = $(this).data('title');
                    $("#searchactivities").val("");
                    var cview = self.controller.get('_currentView');
                    var newactivities = self.controller.get("uniquediscussion");
                    var topics = App.ActJsonUtil.getCurrentTopics(newactivities, newdiscussionTitle);
                    self.controller.get("formatdiscussions").clear();
                    self.controller.set("formatdiscussions", topics);
                    if(topics && topics.length == 0) {
                        self.controller.set('isnotification', "true");
                        self.controller.set('nodatamsg', "No results found");
                    } else {
                        self.controller.set('isnotification', "false");
                        self.controller.set('nodatamsg', "");
                    }
                    if(cview == "grid-view") {
                        self.controller.set('_currentView', "list-view");
                        Ember.run.schedule('afterRender', function task3() {
                            self.assignEvents(self);
                        });
                    } else {
                        Ember.run.schedule('afterRender', function task3() {
                            if (window.like) window.like.render();
                            App.ActJsonUtil.setLikeIcons(self);
                            App.ActEventUtil.showHideNextArrow();
                        });
                    }
                    return false;
                });
                $("#divDiscussion").on("click", '.discussion_ppl_img', function(event) {
                    var me = self;
                    var parobj = $($(this).closest(".activityrow")), newdiscussionTitle = parobj.data('title');
                    var personname = $(this).attr("discussion_ppl_img");
                    var newactivities = self.controller.get("uniquediscussion");
                    var ctopics = App.ActJsonUtil.getCurrentTopics(newactivities, newdiscussionTitle);
                    var mtopics = [];
                    _.each(ctopics[0].uactivities, function(item) {
                        if(item._source.actor.displayName.toLowerCase() == personname.toLowerCase()) {
                            mtopics.push(item);
                        }
                    });
                    ctopics[0].uactivities = mtopics;
                    var utopics = $.merge([], ctopics);
                    me.controller.get("formatdiscussions").clear();
                    me.controller.set("formatdiscussions", utopics);
                    if(utopics && utopics.length == 0) {
                        self.controller.set('isnotification', "true");
                        self.controller.set('nodatamsg', "No results found");
                    } else {
                        self.controller.set('isnotification', "false");
                        self.controller.set('nodatamsg', "");
                    }
                    var cview = self.controller.get('_currentView');
                    if(cview == "grid-view") {
                        me.controller.set('_currentView', "list-view");
                        Ember.run.schedule('afterRender', function task3() {
                            me.assignEvents(me);
                        });
                    } else {
                        Ember.run.schedule('afterRender', function task3() {
                            if (window.like) window.like.render();
                            App.ActJsonUtil.setLikeIcons(self);
                            App.ActEventUtil.showHideNextArrow();
                        });
                    }
                    utopics = ctopics = mtopics = null;
                    event.stopImmediatePropagation();
                });

                $("#divDiscussion").on("click", ".show-more-stream", function(event) {
                    var newactivities = self.controller.get("uniquediscussion");
                    var actarr = App.ActJsonUtil.getLoadData(newactivities);
                    self.controller.set("formatdiscussions",actarr);
                    if(actarr && actarr.length == 0) {
                        self.controller.set('isnotification', "true");
                        self.controller.set('nodatamsg', "No results found");
                    } else {
                        self.controller.set('isnotification', "false");
                        self.controller.set('nodatamsg', "");
                    }
                    Ember.run.schedule('afterRender', function task3() {
                        if (window.like) window.like.render();
                        App.ActJsonUtil.setLikeIcons(self);
                        App.ActEventUtil.showHideNextArrow();
                    });
                    event.stopPropagation();
                    return false;
                });

                $("#searchactivities").on("keyup", function(event) {
                    if(event.keyCode == 13 || ($(event.target).val() == "")) {
                        $( "#searchImgIcon" ).trigger("click");
                    }
                });

                $("#searchImgIcon").on("click", function(event) {
                    var search = $("#searchactivities").val();
                    App.ActJsonUtil.getSearchFilterResults(search, self);
                    Ember.run.schedule('afterRender', function task3() {
                        if (window.like) window.like.render();
                        App.ActJsonUtil.setLikeIcons(self);
                        App.ActEventUtil.showHideNextArrow();
                    });
                });

                $('#actMobSrchTgl').on('click', function(event) {
                    $('#mobileactsrchgrp').toggleClass("hidden-xs hidden-sm");
                    event.stopPropagation();
                });

                $('#actMobFltrTgl').on('click', function(event) {
                    $('#mobileactfltrgrp').toggleClass("hidden-xs hidden-sm");
                    event.stopPropagation();
                });
                if (window.like) window.like.render();
            }
        });

        App.StreamactivityRoute = Ember.Route.extend({
            model: function() {
                return this.controllerFor('streamactivity').getActivities();
            },
            getPostsFollowedByUser: function() {
                var endPoint = "/knowledgecenter/cclom/posts?tenantId=30&follows.user=" + app.getUsername();
                return httpClient.get(endPoint).then(function(response) {
                    return response.posts;
                }, function(err) {
                    console.log(err);
                    return [];
                });
            },
            getAllPostsByUser: function() {
                var endPoint = "/knowledgecenter/cclom/posts?tenantId=30&author=" + app.getUsername();
                return httpClient.get(endPoint).then(function(response) {
                    return response.posts;
                }, function(err) {
                    console.log(err);
                    return [];
                });
            }
        });
        App.StreamactivityController = Ember.ObjectController.extend({
            filter : "",
            postKey : function() {
                var self = this;
                var filter = this.get('filter');
                if (filter != '') {
                    var filteredAct = self.get('model').activities.filter(function(item, index, enumerable) {
                        return item._source.title.toLowerCase().match(filter.toLowerCase());
                    });
                    var activities = {};
                    activities.activities = filteredAct;
                    self.get('model').formattedActivities.clear();
                    self.get('model').formattedActivities.pushObjects(self.formatAllActivitiesData(activities).activityStream);
                }
            }.observes('filter'),
            _currentView : "list-view",
            isGridView : function() {
                var cview = this.get('_currentView');
                return cview == 'list-view';
            }.property("_currentView"),
            getActivities : function() {
                var endPoint = "/knowledgecenter/cclom/activities";
                var self = this;
                var req = {
                    tenantId: 30,
                    users: [app.getUsername()]
                };
                var model = {
                    uniquediscussion : [], 
                    activities : [], 
                    formatdiscussions : [],
                    currenttopics : [],
                    formattopics : [],
                    formattedActivities: [],
                    objectTypeArray: [],
                    filter : "",
                    isnotification : false,
                    nodatamsg : ""
                };
                var self = this;
                return this.getAllActivities().then(function(activities) {
                    if (activities.activities) {
                        model.activities = activities.activities;
                        model.uniquediscussion = App.ActJsonUtil.getUniqueDiscussion(model.activities,app.getShortname());
                        model.formatdiscussions = App.ActJsonUtil.getLoadData(model.uniquediscussion);
                        if(!model.formatdiscussions || (model.formatdiscussions && model.formatdiscussions.length == 0)) {
                            model.isnotification = true;
                            model.nodatamsg = "No results found";
                        }
                    } else {
                        model.activities = [];
                        model.formattedActivities.pushObjects([]);
                        model.isnotification = true;
                        model.nodatamsg = "No results found";
                    }
                    return model;
                }, function(error) {
                    return model;
                });
            },
            getAllActivities: function() {
                /* Get the user's activity preferences */
                var myActivityPreferencesPost, myActivityPreferencesCourse, myActivityPreferencesFollowUser, myActivityPreferencesAdminActs;

                var endPointToGetMyPrefs = '/knowledgecenter/cclom/activities/preferences/' + app.getUsername();
                return httpClient.get(endPointToGetMyPrefs).then(function(response) {
                    if (response.code == "200E" || response.length == 0) {
                        var endPoint = "/knowledgecenter/cclom/activities";
                        return httpClient.get(endPoint);
                    }
                    /* Gather the prefs */

                    for (var i in response) {

                        if (response.hasOwnProperty(i)) {
                            if (response[i].post) {
                                if (myActivityPreferencesPost) {
                                    myActivityPreferencesPost = myActivityPreferencesPost + "|" + response[i].post;
                                } else {
                                    myActivityPreferencesPost = response[i].post;
                                }
                            }
                            if (response[i].course) {
                                if (myActivityPreferencesCourse) {
                                    myActivityPreferencesCourse = myActivityPreferencesCourse + "|" + response[i].course;
                                } else {
                                    myActivityPreferencesCourse = response[i].course;
                                }

                            }
                            if (response[i].followUserX) {
                                if (myActivityPreferencesFollowUser) {
                                    myActivityPreferencesFollowUser = myActivityPreferencesFollowUser + "|" + response[i].followUserX;
                                } else {
                                    myActivityPreferencesFollowUser = response[i].followUserX;
                                }

                            }
                            if (response[i].communityX) {
                                if (myActivityPreferencesAdminActs) {
                                    myActivityPreferencesAdminActs = myActivityPreferencesAdminActs + "|" + response[i].communityX;
                                } else {
                                    myActivityPreferencesAdminActs = response[i].communityX;
                                }

                            }
                        }
                    }
                    if (myActivityPreferencesPost) {
                        myActivityPreferencesPost = myActivityPreferencesPost.replace(/,/g, "|");
                    }
                    if (myActivityPreferencesCourse) {
                        myActivityPreferencesCourse = myActivityPreferencesCourse.replace(/,/g, "|");
                    }
                    if (myActivityPreferencesFollowUser) {
                        myActivityPreferencesFollowUser = myActivityPreferencesFollowUser.replace(/,/g, "|");
                    }
                    if (myActivityPreferencesAdminActs) {
                        myActivityPreferencesAdminActs = myActivityPreferencesAdminActs.replace(/,/g, "|");
                    }


                    var endPoint = "/knowledgecenter/cclom/myactivities?userEmailId=" + app.getUsername() +
                        "&blogs=" + myActivityPreferencesPost +
                        "&questions=" + myActivityPreferencesPost +
                        "&lms=" + myActivityPreferencesCourse +
                        "&communityX=" + myActivityPreferencesAdminActs +
                        "&followUserX=" + myActivityPreferencesFollowUser;
                        endPoint = encodeURI(endPoint);
                        return httpClient.get(endPoint).then(function(response) {
                            return response;
                        }, function(err) {
                            return [];
                        });
                }, function(err) {
                    return [];
                });
            },
            visualFilterCallBack : function (context, searchCollection) {
                var typeArr = [], formatdiscussions = [],filtereddis = [];
                var uniquediscussion = context.controller.get('model').uniquediscussion;
                formatdiscussions = App.ActJsonUtil.getLoadData(uniquediscussion);
                var searchval = $("#searchactivities").val();
                if(searchval == "") {
                    _.each(searchCollection.models, function(obj) {
                        if(obj.attributes.value) {
                            var fdis = _.filter(formatdiscussions,function(item) {
                                return (item.objtype == obj.attributes.value);
                            });
                            if(fdis && fdis.length > 0) {
                                _.each(fdis,function(items){
                                    var findobj = _.where(filtereddis, items);
                                    if(!findobj || (findobj && findobj.length <= 0)) {
                                        filtereddis.push(items);
                                    }
                                });
                            }
                        }    
                    });
                    if(searchCollection.models && searchCollection.models.length == 0) {
                        filtereddis = formatdiscussions;
                    }
                    context.controller.set('formatdiscussions',filtereddis);    
                    if(filtereddis && filtereddis.length == 0) {
                        context.controller.set('isnotification', "true");
                        context.controller.set('nodatamsg', "No results found");
                    } else {
                        context.controller.set('isnotification', "false");
                        context.controller.set('nodatamsg', "");
                    }
                } else {
                    var fdiscussion = context.controller.get("uniquediscussion"), formatdiscussion = [], count = 0;
                    var ndiscussion = [];
                    _.each(fdiscussion, function(items) {
                        var isobjtype = false;
                        _.each(searchCollection.models, function(obj) {
                            if(obj.attributes.value && obj.attributes.value == items.objtype) {
                                isobjtype = true;
                            }
                        });
                        if(isobjtype || searchCollection.models.length == 0) {
                            var filteredact = _.filter(items, function(item) {
                                                    return (item._source.title.toLowerCase().match(searchval.toLowerCase())
                                                            || item._source.object.ellipsisedContent.toLowerCase().match(searchval.toLowerCase()));
                                                });
                            if((filteredact && filteredact.length > 0)
                                || (items[0]._source.object.displayName.toLowerCase().match(searchval.toLowerCase()))) {
                                    formatdiscussion[count] = {};
                                    formatdiscussion[count].dtitle = items[0]._source.object.displayName;
                                    formatdiscussion[count].dlatest = items[0]._source.published;
                                    formatdiscussion[count].dactor = items[0]._source.actor.displayName;
                                    formatdiscussion[count].dpeople = [];
                                    formatdiscussion[count].objtype = items.get("objtype");
                                    formatdiscussion[count].dcount = "";
                                    formatdiscussion[count].uactivities = [];
                                    formatdiscussion[count].uactivities = filteredact;
                                    count++;
                            }
                            formatdiscussion = _.sortBy(formatdiscussion, function (item) {
                                                    return item.dlatest;
                                                }).reverse();
                        }
                    });              
                    var latestdiscussion = $.merge([], formatdiscussion);
                    context.controller.get("formatdiscussions").clear();
                    context.controller.set("formatdiscussions",latestdiscussion);
                    if(latestdiscussion && latestdiscussion.length == 0) {
                        context.controller.set('isnotification', "true");
                        context.controller.set('nodatamsg', "No results found");
                    } else {
                        context.controller.set('isnotification', "false");
                        context.controller.set('nodatamsg', "");
                    }
                }
                Ember.run.schedule('afterRender', function task3() {
                        if (window.like) window.like.render();
                        context.assignEvents(context);
                        App.ActJsonUtil.setLikeIcons(context);
                        App.ActEventUtil.showHideNextArrow();
                    });
            }
        });
});


