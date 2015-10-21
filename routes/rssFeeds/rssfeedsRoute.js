'use strict'

define(
  [
    'app',
    'services/usersService',
    'underscore'
  ],
  function(app, usersService,_) {
    app.RssfeedsRoute = Ember.Route.extend({
       model: function() {
        var email = app.getCookie('username')
        return usersService.rssFeedsForUser(email).then(function(rssfeeds) {
          rssfeeds.sort(function(d1, d2) {
            return new Date(d2.createdOn) - new Date(d1.createdOn)
          });
          return rssfeeds;
        });
      },
      actions: {
        openCreateRssfeedModal: function() {
          var controller = this.controllerFor('rssfeedCreate')
          this.render("rssfeedsCreate", {
            into: 'application',
            outlet: 'modal',
            controller: controller
          });
        },
        openEditRssfeedModal:function(){
          var model=this.controllerFor('rssfeeds').get('model');
          var rssFeedId=this.controllerFor('rssfeeds').get('rssFeedId');
          var rssFeedToEdited=_.findWhere(model,{'_id':rssFeedId});
          if(rssFeedToEdited)
          {
            var controller = this.controllerFor('rssfeedEdit');
            var content={'name':rssFeedToEdited.name,'url':rssFeedToEdited.url};
            controller.set('content',content);
            controller.set('controllerOperationName','Edit');
            this.render("rssfeedsEdit", {
              into: 'application',
              outlet: 'modal',
              controller: controller
            });

          }
        },
          deleteRssFeed:function(){
          var self=this;
          var rssFeedId=self.controllerFor('rssfeeds').get('rssFeedId');
          if(rssFeedId)
          {
            usersService.deleterssFeeds(rssFeedId).then(function(response){
				var model=self.controllerFor('rssfeeds').get('model');
				var rssFeedToBeDeleted=_.findWhere(model,{_id:rssFeedId});
				model.removeObject(rssFeedToBeDeleted);
				self.transitionTo('rssfeeds');
				jQuery.gritter.add({title:'', text: 'RSS Feed has been deleted.', class_name: 'gritter-success'});
            }).fail(function(err){
				console.log("Error in deleting rssfeed "+err)
				jQuery.gritter.add({title:'', text: 'RSS Feed deletion failed. Please try again.', class_name: 'gritter-error'});
            });
          }
        },
        close: function() {
          this.disconnectOutlet({outlet: 'modal', parentView: 'application'});
          this.controllerFor("rssfeedCreate").resetModel();
        }
      }
    })
  })
