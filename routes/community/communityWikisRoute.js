'use strict';

define(["app", "services/groupService"],
  function(app, groupService) {
    app.CommunityWikisRoute = Ember.Route.extend({
      renderTemplate: function() {
        this.render();
      },
      model:function(){
			return this.modelFor('community');
      },
      setupController: function(controller, model) {
             
            if (model.isMember || this.controllerFor('community').isMember) {
                    controller.set('isMember', true);
            } else {
                    controller.set('isMember', false);
            }
            controller.set('model', model);
            controller.set('wikiPageNumber', 1);
            controller.set('pageNumber', 1);
            controller.get('sortedFieldName').Wikis = 'updateDate';
            controller.populatePostsData('WIKI', 1, controller.get('sortedFieldName').Wikis, controller.get('sortOrder'));
            groupService.showCreateButtonBasedonPermissionsInDetailsPage(model,"Wikis").then(function(access){  
                  controller.set('userHasAccessToCreatePostInDetailsPage',access.permissionStatus);
            }).fail(function(err){
                  Ember.Logger.error('[CommunityWikisRoute :: setupController :: ]',error);
                  controller.set('userHasAccessToCreatePostInDetailsPage',false)
            });             
     }
    });
  });