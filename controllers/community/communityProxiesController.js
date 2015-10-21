'use strict';

define(['app', 'underscore', 'services/groupService',
        'services/usersService', 'services/webExService',
        'services/searchService', 'services/documentsService',
        'pages/flashMessage', 'emberPageble',
        'services/collaborationUtil', 'httpClient','services/usersService','services/adminBlogProxyAssignmentService'
    ],
    function(app, _, groupService, userService,
        webExService, searchService, documentsService,
        flashMessage, emberPageble, collaborationUtil, httpClient,usersService,blogProxyService) {
       /*This function will fetch list of all categories from groups Api and store in a session varibale*/
        app.CommunityProxiesController = Ember.ObjectController.extend(app.PeoplePopoverControllerMixin, {
            currentUser:app.getUserLoginId(),
            isPublic: function() {
                return this.get('model').type == "public";
            }.property('model.type'),
            userNameAttribute: "username",
            getAllUsers: function() {
                return this.get('model').memberProfiles;
            },
            allUsersConfig: function() {
                return usersService.usersAutoSuggest();
            },
            actions: {
                removeSelectedUser:function(bloggerid,userId){
                    var self=this;
                    var bloggerProxies=self.get('model');
                    var selectedBlogger=_.findWhere(bloggerProxies,{userId:bloggerid});
                    var communityId=self.controllerFor('community').get('_id');
                    var removeproxy=_.findWhere(selectedBlogger.proxies,{userId:userId});
                    if(typeof removeproxy !='undefined'){
                      var objDelete={blogger:{userId:selectedBlogger.userId,displayName:selectedBlogger.displayName},
                                       proxies:removeproxy, resourceId:{communityId:communityId},
                                       userEmail:App.getUserLoginId()};
                      return blogProxyService.removeProxies(objDelete,'community').then(function(result){
                         selectedBlogger.proxies.removeObject(removeproxy);
                         jQuery.gritter.add({title:'', text: 'Proxy user has been removed successfully.', class_name: 'gritter-success'});
                      }).fail(function(error){
                         Ember.Logger.error("adminBlogProxyAssignment::removeSelectedUser: Error in deleting proxies::",error);
                         jQuery.gritter.add({title:'', text: 'Failed to remove Proxy user. Please try again.', class_name: 'gritter-error'});
                      });
                    }
                    else{
                       Ember.Logger.error("adminBlogProxyAssignment::removeSelectedUser:Error in deleting proxies::",error);
                       jQuery.gritter.add({title:'', text: 'Invalid proxy users', class_name: 'gritter-error'});
                    }
                    
                   },
                    getBloggerId:function(BloggerId){
                      var bloggerProxies=this.get('model');
                      var selectedBlogger=_.findWhere(bloggerProxies,{userId:BloggerId});
                      this.set('selectedBlogger',selectedBlogger);
                   },
                   addProxy:function(value,handleFailure,handleSuccess){
                    var self=this;
                    var communityId=self.controllerFor('community').get('_id');
                       var obj=blogProxyService.validateProxyUser(value.text);
                       if(obj){
                          var displayName= obj.split('|')[0];
                          var userId=obj.split('|')[1];
                          var selectedBlogger=self.get('selectedBlogger');
                          var ifExists=_.findWhere(selectedBlogger.proxies,{userId:userId})
                           if(typeof ifExists =='undefined'){ 
                                var objCreate={blogger:{displayName:selectedBlogger.displayName,userId:selectedBlogger.userId},
                                                proxies:{displayName:displayName,userId:userId},userEmail:App.getUserLoginId(),
                                                resourceId:{communityId:communityId}};
                                return blogProxyService.addProxies(objCreate,'community').then(function(proxyResult){
                                   var model=self.get('model');
                                   var currentBlogger= _.findWhere(model,{userId:selectedBlogger.userId});   
                                   currentBlogger.proxies.addObject(objCreate.proxies);

                                   jQuery.gritter.add({title:'', text: 'Proxy user has been added successfully.', class_name: 'gritter-success'});
                                   handleSuccess();
                                },function(error){
                                   Ember.Logger.error("Blog proxy assignment :: Error in adding proxies::",error);
                                   jQuery.gritter.add({title:'', text: 'Failed to add proxy user.', class_name: 'gritter-error'});
                                   handleFailure();
                                });
                              }
                            else{
                                Ember.Logger.error("[adminBlogProxyAssignment :: addProxy: no selected blogger]");
                                jQuery.gritter.add({title:'', text: 'Proxy user exists already.', class_name: 'gritter-error'});
                            }
                        }
                        else
                        {       
                          Ember.Logger.error("[adminBlogProxyAssignment :: addProxy: validateProxyUser fail]");                
                          jQuery.gritter.add({title:'', text: 'Invalid proxy users', class_name: 'gritter-error'});
                        }
                    }

            }
        });

    });
