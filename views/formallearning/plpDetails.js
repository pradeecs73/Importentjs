 'use strict';
define(['../../app','pages/learningOfferings', 'httpClient', "text!templates/formallearning/plpDetails.hbs", 'pages/documentItems', 'services/usersService', 'underscore'],
    function(app, learningOfferings, httpClient, plpDetailsTemplate, documentItems, usersService, _) {

 App.PlpDetailsView = Ember.View.extend({
        template: Ember.Handlebars.compile(plpDetailsTemplate),
        didInsertElement: function() {
            var plpDetailsView = this;
            app.CourseUtils.upDatePlpStatus(plpDetailsView.controller);

             try {
                 if (window.social) window.social.render({
                     "like": true,
                     "rating": true,
                     "ratingOnly": true,
                     "follow": true,
                     "favorite": true,
                 });
                 if (window.activityStream) {
                     //Subscribing to Cloudlet Activity event published by cloudlet plugin
                     plpDetailsView.$().on("cloudlet:activity", function(e, activity) {
                         plpDetailsView.onCloudletActivity(activity);
                     });
                 }
                 /* Jiathis comments*/
                 if (window.UYANCMT) {
                    var model = plpDetailsView.controller.get('model');
                    UYANCMT.loadBox(model.id, 'plp', model.title, 'ccl@cisco.com');
                 }
             } catch (err) {
                 console.log("Failed to load services: " + err);
             }
        },
         onCloudletActivity: function(activityType) {
             var model = this.controller.get('model');
             var recentReaders = model.recentReadersUserData;
             var streamDataContract = null;

             //push to activity stream
             if (activityType.activity == "favorite" && activityType.entityType == "users") {
                 _.each(recentReaders, function(recentReader) {
                     if (recentReader.email == activityType.entityId) {
                         streamDataContract = new activityStream.StreamDataContract(activityType.entityId, 'USER');
                         streamDataContract.title = recentReader.shortName;
                         streamDataContract.resourceUrl = "/#/user/" + activityType.entityId;
                         streamDataContract.verb = 'follow';
                         streamDataContract.authorUserName = activityType.entityId;
                     }
                 });
             } else {
                 streamDataContract = new activityStream.StreamDataContract(model.id.toString(), 'Prescribed Learning Plan');
                 streamDataContract.resourceUrl = "#/plpDetails/" + model.id;
                 streamDataContract.title = model.title;
                 if (activityType.activity == favorite.getConfig().pluginType) {
                     streamDataContract.verb = 'favorite';
                 }
                 streamDataContract.authorUserName = "ccl@cisco.com";
             }

             switch (activityType.activity) {
                 case comments.getConfig().pluginType:
                     streamDataContract.verb = 'comment';
                     break;
                 case rating.getConfig().pluginStateOn:
                     streamDataContract.verb = 'rate';
                     break;
                 case rating.getConfig().pluginStateOff:
                     streamDataContract.verb = 'un-rate';
                     break;
                 case follow.getConfig().pluginStateOn:
                     streamDataContract.verb = 'follow';
                     break;
                 case like.getConfig().pluginStateOn:
                     streamDataContract.verb = 'like';
                     break;
                 case favorite.getConfig().pluginStateOn:
                     streamDataContract.verb = 'favorite';
                     break;
                 case follow.getConfig().pluginStateOff:
                     streamDataContract.verb = 'un-follow';
                     break;
                 case like.getConfig().pluginStateOff:
                     streamDataContract.verb = 'un-like';
                     break;
                 case favorite.getConfig().pluginStateOff:
                     streamDataContract.verb = 'un-favorite';
                     break;
                 case 'launch':
                     streamDataContract.verb = 'launch';
                     break;
             }
             activityStream.pushToStream(streamDataContract);
         },
        });
}); 