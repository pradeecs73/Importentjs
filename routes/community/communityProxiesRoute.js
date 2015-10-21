'use strict';

define(["app","services/groupService",'services/usersService','Q'],
  function(app,groupService,usersService,Q) {
    app.CommunityProxiesRoute = Ember.Route.extend({
	    renderTemplate: function() {
	        this.render();
	    },
	    model:function(){
			return this.modelFor('community');
	    },
	    setupController: function(controller, model) {
	    	var self = this;
	    	window.__thisModal__ = model;
            groupService.showBloggersProxyList(model,"ContributeBlogs").then(function(access){ 
            	if(access.bloggerProxies){
					controller.set('model',access.bloggerProxies);
            	}else{
					controller.set('model',[]);
            	}
             }).fail(function(err){
              Ember.Logger.error('[CommunityProxiesRoute :: setupController :: ]',err);
               controller.communityBloggersList = [];
             });
             	controller.allUsersConfig  = usersService.usersAutoSuggest();
		    }

    });
  });