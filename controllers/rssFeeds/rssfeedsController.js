'use strict'

define(
  [
    'app',
    'services/usersService',
    'pages/rssfeedsPage'
  ],
  function(app, usersService, rssfeedsPage) {
    app.RssfeedsController = Ember.ArrayController.extend({
      rssFeedId:'',
      addFeed: function(feed) {
        var self=this;
        var controllerOperationName=self.controllerFor("rssfeedEdit").get('controllerOperationName');
         if (!(feed.name || feed.url)) {
          return;
        }
        var email = app.getCookie('username')
        var model = this.get('model');
        feed.userEmail=email;
        if(controllerOperationName=="Edit")
        {
          var feedId=self.get('rssFeedId');
          if(feedId)
          {
             usersService.updateFeedForUser(feed,feedId).then(function(response){
               var _feed=_.findWhere(model,{'_id':feedId});
               _feed.name=feed.name;
               _feed.url=feed.url;
               model.removeObject(_feed)
               model.unshiftObject(_feed);
               Ember.run.scheduleOnce('afterRender', self, 'expandFirstFeed');
               self.transitionToRoute("rssfeeds")
            }).fail(function(err){
               console.log("Error while updating the rssfeed"+err);
            });

          }else{
            console.log("FeedId is not found");
          }
          self.controllerFor("rssfeedEdit").set('controllerOperationName','');
        }else{
          usersService.addFeedsForUser(feed).then(function(response){
              feed._id=response[0]._id;
              model.unshiftObject(feed);
              Ember.run.scheduleOnce('afterRender', self, 'expandFirstFeed');
              self.transitionToRoute("rssfeedItems", response[0]._id)
			  jQuery.gritter.add({title:'', text: 'RSS Feed addition is successful.', class_name: 'gritter-success'});
          }).fail(function(err){
			   jQuery.gritter.add({title:'', text: 'RSS Feed addition failed. Please try again.', class_name: 'gritter-error'});
               console.log("Error while create the rssfeed"+err);
          });


        }       
      },
      expandFirstFeed: function() {
        rssfeedsPage.expandFirstRssFeed();
      },
      nofeeds: function() {
        return this.get("model").length <= 0
      }.property("model.@each")

    })
  })
