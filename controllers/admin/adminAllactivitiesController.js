'use strict';

define(['app', 'text!templates/admin/adminAllactivities.hbs', 'text!templates/activityStream.hbs', 'pages/activity', 'httpClient', 'Q'],
    function(app, activityTemplate, activityItemStreamTemplate, activity, httpClient, Q) {
        
        var model = Ember.Object.create({
            formattedActivities: [],
            activities: [],
            objectTypeArray: [],
            status: "",
            to:"",
            page:50,
            filter:[],
            start:0,
            search:""
        });

        App.ReportsAllactivitiesView = Ember.View.extend({
            template: Ember.Handlebars.compile(activityTemplate),
            templateName: 'activity-stream',
            toggleView: function(view) {
                this.controller.set('_currentView', view);
            },

            didInsertElement: function() {
                var view = this;
                $(window).bind("scroll", function() {
                    view.didScroll();
                });
                activity.initialize();

                activity.visualSearch(this.$(), this.controller.get('model').objectTypeArray, this.controller.visualSearchCallBack, this, this.controller.preferences);
                           
            },
            willDestroyElement: function() {
                $(window).unbind("scroll");
            },
            didScroll: function() {
                if (this.isScrolledToBottom()) {
                    
                    var model=this.controller.get('model');
                    var filterArray=this.controller.get('model').filter; 
                    var context=this;
                    if(model.search!="")
                    {
                        
                    }else if(filterArray.length==0)
                    {
                        this.controller.getActivities();

                    }else{

                       var key="scroll"
                       this.controller.filterScroll(key,context);
                    }
                   
                }
            },
            isScrolledToBottom: function() {
                var distanceToTop = $(document).height() - $(window).height(),
                    top = $(document).scrollTop();
                return top === distanceToTop;
            }
        });

        App.ReportsAllactivitiesRoute = Ember.Route.extend({
            model: function() {
                model.formattedActivities.clear();
                model.activities.splice(0);
                model.set('start',0);
                model.set('filter',[]);
                model.set('search',"");
                model.status="";
                return this.controllerFor('reportsAllactivities').getActivities();
            },
            getPostsFollowedByUser: function() {
                var endPoint = "/knowledgecenter/cclom/posts?tenantId=30&follows.user=" + app.getEmailId();
                return httpClient.get(endPoint).then(function(response) {
                    return response.posts;
                }, function(err) {
                    console.log(err);
                    return [];
                });
            },
            getAllPostsByUser: function() {
                var endPoint = "/knowledgecenter/cclom/posts?tenantId=30&author=" + app.getEmailId();
                return httpClient.get(endPoint).then(function(response) {
                    return response.posts;
                }, function(err) {
                    console.log(err);
                    return [];
                });
            },
            actions: {
                reload: function() {
                    var self = this;
                    var model = self.controllerFor('reportsAllactivities').get('model');
                    model.set('status', '');
                    model.set('start',0);
                    model.formattedActivities.clear();
                    model.activities.splice(0);
                    if(model.filter.length!=0)
                    {
                        var key="visual";
                        self.controller.filterScroll(key,self);
                    } else if(model.search!="") {

                      self.controller.postKey();

                    } else{

                        self.controllerFor('reportsAllactivities').getActivities();
                    }
                }
            }

        });
        App.ReportsAllactivitiesController = Ember.ObjectController.extend({

            filter: "",
            postKey: function() {
                var self = this;
                var filter = this.get('filter');
                var model=self.get('model');
                var endPoint;
                model.set('search',filter);
                model.set('filter',[]);
                if (filter != '') {
                    endPoint="/knowledgecenter/cclom/activities/search/"+filter+"?restrict=all";
        } else {
                  endPoint = "/knowledgecenter/cclom/activities/search/from/0/to/50";
        }
                    
                   httpClient.get(endPoint).then(function(response) {
                    self.get('model').formattedActivities.clear();
                    self.get('model').formattedActivities.pushObjects(self.formatAllActivitiesData(response).activityStream);

                   }, function(err) {
                    self.get('model').formattedActivities.pushObjects([]);
                      console.log(err);
                        
                   });
                  
            }.observes('filter'),
            perPage: 100,
            events: {
                getMore:function(activityFormatedData, model) {
                    model.formattedActivities.clear();
                    model.formattedActivities.pushObjects(activityFormatedData.activityStream);
                    model.objectTypeArray = activityFormatedData.objectTypeArray;
                    this.set('model', model);
                    return model;
                }
            },
            _currentView: "list-view",
            isGridView: function() {
                return this.get('_currentView') == 'grid-view';
            }.property("_currentView"),
            getActivities: function() {
                var endPoint = "/knowledgecenter/cclom/activities";
                var self = this;
                
                var req = {
                    tenantId: 30,
                    users: [app.getEmailId()]
                };


                var self = this;
                return this.getAllActivities().then(function(activities) {


                    if (activities.activities) {

                        if (activities.activities.length == 1 || activities.activities.length == 0) {

                            var len = 0;
                            if (model.formattedActivities.length != 0) {
                                for (var t = 0; t < model.formattedActivities.length; t++) {
                                    var length = model.formattedActivities[t].activities.length;
                                    len = len + length;
                                }
                                if (len > 7) {
                                    model.set('status', 'No more data !');
                                }
                            }

                        };


                        if (model.activities.length == 0) {
                                                   
                           model.activities = activities.activities;
                           var activityFormatedData = self.formatAllActivitiesData(activities);
                           model.formattedActivities.pushObjects(activityFormatedData.activityStream);

                        } else {

                            var status = 0;
                            var stat = 0;
                            var activityLen = activities.activities.length;
                            var data = activities.activities.slice(0, activityLen);
                            model.activities.pushObjects(data);
                            var activityFormatedData = self.formatAllActivitiesData(activities);
                            for (var i = 0; i < activityFormatedData.activityStream.length; i++) {
                                var activitiesLen = activityFormatedData.activityStream[i].activities.length;
                                var dateKey = activityFormatedData.activityStream[i].dateKey;
                                var reducelength = model.formattedActivities.length;
                                for (var t = 0; t < model.formattedActivities.length; t++) {
                                    var modelformatLen = model.formattedActivities[t].activities.length;
                                    var modeldateKey = model.formattedActivities[t].dateKey;
                                    if (modeldateKey == dateKey) {
                                        var data = activityFormatedData.activityStream[i].activities.slice(0, activitiesLen);
                                        model.formattedActivities[t].activities.pushObjects(data);
                                        reducelength -= 1;
                                        status = 1;
                                    } else {

                                        reducelength -= 1;
                                        stat = 1;

                                    }
                                }
                                if (reducelength == 0) {
                                    if (status != 1) {
                                        if (stat == 1) {
                                            stat = 0;
                                            var data = activityFormatedData.activityStream[i];
                                            model.formattedActivities.pushObject(data);
                                        }
                                    } else {
                                        status = 0;
                                    }
                                }
                            }
                        }
                        model.objectTypeArray = activityFormatedData.objectTypeArray;
                        return model;
                    } else {
                        model.activities = [];
                        model.formattedActivities.pushObjects([]);
                        return model;
                    }
                }, function(error) {
                    return model;
                });
            },
           
            getAllActivities: function() {
                /* Get the user's activity list */
                var self=this;
                var endPoint = "/knowledgecenter/cclom/activities";
                if (model.formattedActivities.length == 0) {
                    endPoint = endPoint + '/from/0/to/50';

                } else {

                    var from = 0;

                    for (var t = 0; t < model.formattedActivities.length; t++) {
                        from = model.formattedActivities[t].activities.length + from;
                    }
                    var to = from + 50;
                    endPoint = endPoint + '/from/' + from + '/to/' + to;
                }
                return httpClient.get(endPoint);

            },
            formatAllActivitiesData: function(data) {
                var dataLength;
                var self = this;
                
                data.activities.sort(self.activitySorter);
                   
                var activityGroups = [],
                    objectTypeArray = [];
                var today = new Date();
                var yesterday = new Date();
                yesterday.setDate(today.getDate() - 1);
                var todayMonth = today.getMonth() + 1;
                var yesterdayMonth = yesterday.getMonth() + 1;
                var todayKey = today.getDate() + '-' + todayMonth + '-' + today.getFullYear();
                var yesterdayKey = yesterday.getDate() + '-' + yesterdayMonth + '-' + yesterday.getFullYear();
                if (data.type == "scroll") {
                    dataLength = data.activities.length;

                } else {
                    if (data.activities.length < 10) {
                        dataLength = data.activities.length;
                    } else {
                        dataLength = this.perPage;
                    }

                }
                //console.log("&&&&&=> perPage="+dataLength); //debug statement
                for (var i = 0; i < dataLength; i++) {
                    if (data.activities[i] && data.activities[i]._source) {
                        var item = data.activities[i]._source;
                //console.log(i+". ->>>> "+item.title+ " ooooo> item.published=->" + item.published); //debug statement
                        var date = new Date(item.published);
                        var day = date.getDate();
                        var year = date.getFullYear();
                        var month = date.getMonth() + 1;
                        var tempKey = day + '-' + month + '-' + year;

                        if (todayKey === tempKey) {
                            tempKey = "Today";
                        } else if (yesterdayKey === tempKey) {
                            tempKey = "Yesterday";
                        }

                        if (item.target) {
                            item.objectId = item.target.id;
                            item.objectType = item.target.objectType;
                            var activity = {
                                dateKey: tempKey,
                                activity: item
                            };
                            objectTypeArray.push(item.objectType);
                            activityGroups.push(activity);
                        } else {
                            if (item.object) {
                                item.objectId = item.object.id;
                                item.objectType = item.object.objectType;
                                if (item.object.objectType == "blog") {
                                    item.pathName = "blog";
                                } else if (item.object.objectType == "forum") {
                                    item.pathName = "question";
                                }
                                if (item.object.ellipsisedContent) {
                                    item.ellipsisedContent = item.object.ellipsisedContent;
                                }
                                if (item.object.url) {
                                    item.url = item.object.url;
                                }
                                var activity = {
                                    dateKey: tempKey,
                                    activity: item
                                };
                                objectTypeArray.push(item.objectType);
                                activityGroups.push(activity);
                            }
                        }
                    }
                }

                //Group all activities by date

                var activityStream = {
                    activityStream: [],
                    objectTypeArray: _.uniq(objectTypeArray)
                };
                var dateKeyArray = _.pluck(activityGroups, "dateKey");

                if (dateKeyArray && dateKeyArray.length) {
                    dateKeyArray = _.uniq(dateKeyArray);

                    _.each(dateKeyArray, function(_dateKey) {
                        var activityStreamItem = {
                            dateKey: _dateKey,
                            activities: []
                        };

                        var activityStreamItemsByDateKey = _.where(activityGroups, {
                            "dateKey": _dateKey
                        });

                        _.each(activityStreamItemsByDateKey, function(activityStreamItemByDateKey) {
                            delete activityStreamItemByDateKey.dateKey;
                            activityStreamItem.activities.push(activityStreamItemByDateKey.activity);
                        });

                        //activityStreamItem.activities.reverse();
                        activityStream.activityStream.push(activityStreamItem);
                    });
                }
                //activityStream.activityStream.reverse();
                return activityStream;
            },
            activitySorter: function comp(a, b) {
                return new Date(b._source.published).getTime() - new Date(a._source.published).getTime();
            },
            filterScroll:function(key,context)
            {
                var self=this;
                var typeArr = [];
                var model=this.controllerFor('reportsAllactivities').get('model');
                _.each(model.filter, function(obj,i) {
                    if (obj.attributes.category == "Type") {
                        var value=obj.attributes.value;
                        if(typeArr.length!=0)
                        {
                            var status=0;
                            typeArr.forEach(function(res)
                            {
                                                                                    
                                if(res==value)
                                {
                                    status=1;
                                }
                            });
                            if(status!=1)
                            {
                                if(obj.attributes.value=="discussions") typeArr.push("forum"); else typeArr.push(obj.attributes.value);
                                
                            }

                        }else{
                            if(obj.attributes.value=="discussions") typeArr.push("forum"); else typeArr.push(obj.attributes.value);
                        }  
                    }
                });
                var typeStream;
                typeArr.forEach(function(data)
                {
                     if(typeStream)
                     {

                        typeStream=typeStream+','+data;

                     }else{

                        typeStream=data;
                     }
                });
                var endPoint = "/knowledgecenter/cclom/activities/filter?userEmailId=" +app.getEmailId()+"&type=" + typeStream +"&restrict=all";
                var len=typeStream.split(',').length;
                if(len==1 )
                {
                    if(key=="visual")
                    {
                        endPoint =endPoint +"&from=0&to=100";
                        model.set('start',100);

                    }else{
                        var from=model.start;
                        to=from+100;
                        model.set('start',to);
                        endPoint =endPoint+"&from="+from+"&to="+to;
                        
                    }
                }else{
                    
                        var to=100/len;
                        var from="";
                        to=to.toString();
                        if(typeof to.split('.')[1]=="undefined")
                        {
                            if(key=="visual")
                            {
                                from=0;
                                to=parseInt(to);

                            }else{
                                from=model.start;
                                to=parseInt(to)+model.start;
                            }
                        }else{
                            to=to.split('.')[0];
                            if(key=="visual")
                            {
                                from=0;
                                to=parseInt(to)+1; 

                            }else{
                                from=model.start;
                                to=parseInt(to)+1; 
                                to=model.start+to;
                            }
                            
                        }
                        model.set('start',to);
                        endPoint =endPoint +"&from="+from+"&to="+to;
                    
                                           
                }
                
               httpClient.get(endPoint).then(function(response) {
                    if(key=="visual")
                    {
                                              
                        context.controller.get('model').formattedActivities.clear();
                        context.controller.get('model').formattedActivities.pushObjects(context.controller.formatAllActivitiesData({
                        activities: response.activities
                        }).activityStream);
                    }else{


                       
                        if(response.activities.length==0)
                        {
                            if(context.controller.get('model').formattedActivities!=0)
                            {
                                var activityLength=0;
                                _.each(context.controller.get('model').formattedActivities,function(objActivity)
                                {
                                         activityLength=activityLength+objActivity.activities.length;
                                });
                                if(activityLength>7)
                                {
                                    model.set('status', 'No more data !');
                                }
                            }

                        }else{
                        var data=context.controller.formatAllActivitiesData({
                        activities: response.activities
                        }).activityStream;
                            
                            for(var i=0;i<data.length;i++)
                            {
                                var datekey=data[i].dateKey;
                                var activitiesLen=data[i].activities.length;
                                var status=0;
                                for(var t=0;t<context.controller.get('model').formattedActivities.length;t++)
                                {
                                    var existdateKey=context.controller.get('model').formattedActivities[i].dateKey;
                                    if(existdateKey==datekey)
                                    {
                                        status=1;
                                        var acStream =data[i].activities;
                                       context.controller.get('model').formattedActivities[i].activities.pushObjects(acStream);
                                    }
                                }
                                if(status!=1)
                                {

                                    context.controller.get('model').formattedActivities.pushObject(data[i]);
                                }
                            }
                         
                        }
                        
                    }
                            
                }, function(err) {
                        
                });

            },
            visualSearchCallBack: function(context, searchCollection) {
                
                var model = context.controller.get('model');
                model.set('start',0);
                model.set('search',"");
                model.filter=searchCollection.models;
                model.set('status', ''); 
                if(searchCollection.models.length==0)
                {                      
                      model.formattedActivities.clear();
                      model.activities.splice(0);
                      context.controller.getActivities(model.filter);
                }
                else{
                    var key="visual";
                    context.controller.filterScroll(key,context);
                }

            }


        });

        Ember.Handlebars.registerBoundHelper('removeHTMLTagsForEllipsisDisplay', function(text) {
            return text.replace(/<(?:.|\n)*?>/gm, '').substring(0, 140);
        });


    });
