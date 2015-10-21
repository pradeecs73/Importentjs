"use strict";

define(["app", "text!templates/blogProxyAssignment.hbs",'services/usersService','services/adminBlogProxyAssignmentService',"underscore"],
    function (app, BlogProxyAssignmentTemplate,usersService,blogProxyService,_) {
        App.CollaborateBlogProxyAssignmentView = Ember.View.extend({
            template: Ember.Handlebars.compile(BlogProxyAssignmentTemplate)
        });

        App.CollaborateBlogProxyAssignmentRoute = Ember.Route.extend({
            model: function () {
                 return blogProxyService.getBloggerAssignedProxies().then(function(bloggerProxies){
                   return bloggerProxies;
                 }).fail(function(err){
                   Ember.Logger.error('[AdminBlogProxyAssignmentRoute :: model :: getBloggerAssignedProxies]',err);
                   return [];
                 });
             },
            setupController:function(controller,model){
              controller.set('model',model);
            }
        });
        App.CollaborateBlogProxyAssignmentController = Ember.ObjectController.extend({
            selectedBlogger:{},
            removeValue: function(array, id) {
                    return _.reject(array, function(item) {
                        return item === id; // or some complex logic
                      });
                   },
            allUsersConfig: (function() {
                return usersService.usersAutoSuggest();
            }).property(),
            actions:{
                searchBloggers:function(){
                },
                removeSelectedUser:function(bloggerid,userId){
                    var self=this;
                    var bloggerProxies=self.get('model');
                    var selectedBlogger=_.findWhere(bloggerProxies,{_id:bloggerid});
                    var removeproxy=_.findWhere(selectedBlogger.proxies,{userId:userId});
                    if(typeof removeproxy !='undefined'){
                      var objDelete={blogger:{userId:selectedBlogger.userId,displayName:selectedBlogger.displayName},
                                       proxies:removeproxy,
                                       userEmail:App.getUserLoginId()};
                      return blogProxyService.removeProxies(objDelete,'blog').then(function(result){
                         selectedBlogger.proxies.removeObject(removeproxy);
                         jQuery.gritter.add({title:'', text: 'Proxy user removed successfully.', class_name: 'gritter-success'});
                      }).fail(function(error){
                         Ember.Logger.error("adminBlogProxyAssignment::removeSelectedUser: Error in deleting proxies::",error);
                         jQuery.gritter.add({title:'', text: 'Proxy user failed to remove.', class_name: 'gritter-error'});
                      });
                    }
                    else{
                       Ember.Logger.error("adminBlogProxyAssignment::removeSelectedUser:Error in deleting proxies::",error);
                       jQuery.gritter.add({title:'', text: 'Invalid proxy users', class_name: 'gritter-error'});
                    }
                    
                   },
                   getBloggerId:function(BloggerId){
                      var bloggerProxies=this.get('model');
                      var selectedBlogger=_.findWhere(bloggerProxies,{_id:BloggerId});
                      this.set('selectedBlogger',selectedBlogger);
                   },
                   addProxy:function(value,handleFailure,handleSuccess){
                    var self=this;
                       var obj=blogProxyService.validateProxyUser(value.text);
                       if(obj){
                          var displayName= obj.split('|')[0];
                          var userId=obj.split('|')[1];
                          var selectedBlogger=self.get('selectedBlogger');
                          var ifExists=_.findWhere(selectedBlogger.proxies,{userId:userId})
                           if(typeof ifExists =='undefined'){ 
                                var objCreate={blogger:{displayName:selectedBlogger.displayName,userId:selectedBlogger.userId},
                                                proxies:{displayName:displayName,userId:userId},userEmail:App.getUserLoginId()};
                                return blogProxyService.addProxies(objCreate,'blog').then(function(proxyResult){
                                   var model=self.get('model');
                                   var currentBlogger= _.findWhere(model,{userId:selectedBlogger.userId});   
                                   currentBlogger.proxies.addObject(objCreate.proxies);

                                   jQuery.gritter.add({title:'', text: 'Proxy user added successfully.', class_name: 'gritter-success'});
                                   handleSuccess();
                                },function(error){
                                   Ember.Logger.error("Blog proxy assignment :: Error in adding proxies::",error);
                                   jQuery.gritter.add({title:'', text: 'Proxy user failed to add.', class_name: 'gritter-error'});
                                   handleFailure();
                                });
                              }
                            else{
                                Ember.Logger.error("[adminBlogProxyAssignment :: addProxy: no selected blogger]");
                                jQuery.gritter.add({title:'', text: 'Proxy user aleready exists.', class_name: 'gritter-error'});
                            }
                        }
                        else
                        {       
                          Ember.Logger.error("[adminBlogProxyAssignment :: addProxy: validateProxyUser fail]");                
                          jQuery.gritter.add({title:'', text: 'Invalid proxy users', class_name: 'gritter-error'});
                        }
                    },
                }
            });
         
        
   });
   
      