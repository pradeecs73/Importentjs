'use strict';

define(["app",'services/groupService'],
  function(app,groupService) {
    app.CommunityBlogsRoute = Ember.Route.extend({
      renderTemplate: function() {
        this.render();
      },
      model:function(){
      	return this.modelFor('community');
      },
      setupController: function(controller, model) {
            if (model.isMember || this.controllerFor('community').isMember) {
              try{
                controller.set('isMember', true);
              }catch(err){
                controller['isMember'] = true;
              }
            } else {
               try{
                controller.set('isMember', false);
              }catch(err){
                controller['isMember'] = false;
              }
            }
            controller.set('model', model);
            controller.set('blogPageNumber', 1);
            controller.set('pageNumber', 1);
            this.controllerFor('community').populatePostsData('BLOG', 1, 'updateDate', controller.get('sortOrder'));
            groupService.showCreateButtonBasedonPermissionsInDetailsPage(model,"Blogs").then(function(access){  
                  controller.set('userHasAccessToCreatePostInDetailsPage',access.permissionStatus);
                  if(!access.permissionStatus){
                      groupService.showCreateButtonBasedonPermissionsInDetailsPage(model,"CommunityProxyBlogger").then(function(access){  
                            controller.set('userHasAccessToCreatePostInDetailsPage',access.permissionStatus);
                      }).fail(function(err){
                            Ember.Logger.error('[CommunityBlogsRoute :: setupController :: ]',error);
                            controller.set('userHasAccessToCreatePostInDetailsPage',false)
                      });                    
                  }
            }).fail(function(err){
                  Ember.Logger.error('[CommunityBlogsRoute :: setupController :: ]',error);
                  controller.set('userHasAccessToCreatePostInDetailsPage',false)
            });
           
        }
    });
  });