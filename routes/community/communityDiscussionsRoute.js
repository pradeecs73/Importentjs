'use strict';

define(["app","services/groupService"],
  function(app, groupService) {
    app.CommunityDiscussionsRoute = Ember.Route.extend({

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
		        controller.set('forumPageNumber', 1);
		        controller.set('pageNumber', 1);
		        controller.get('sortedFieldName').Forums = 'updateDate';
		        controller.populatePostsData('FORUM', 1, controller.get('sortedFieldName').Forums, controller.get('sortOrder'));
	            groupService.showCreateButtonBasedonPermissionsInDetailsPage(model,"Discussions").then(function(access){  
	                  controller.set('userHasAccessToCreatePostInDetailsPage',access.permissionStatus);
	            }).fail(function(err){
	                  Ember.Logger.error('[CommunityDiscussionsRoute :: setupController :: ]',error);
	                  controller.set('userHasAccessToCreatePostInDetailsPage',false)
	            });
		}

    });
  });