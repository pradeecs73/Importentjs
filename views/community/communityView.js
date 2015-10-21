'use strict';
define(['app', 'pages/documentItems', 'text!templates/community.hbs', 'emberPageble',
        'views/communities/joinCommunityDialogView', 'views/communities/communityDetailJoinRequestsView',
        'views/communities/joinCommunityRequestView'
    ],
    function(app, documentItems,communityTemplate, emberPageble, joinCommunityDialogView,communityDetailJoinRequestsView, joinCommunityRequestView) {
	
    App.PaginatedDocumentsView = VG.Views.Pagination.extend({
        numberOfPages: 1
    });
    
    app.CommunityView = Ember.View.extend({
        didInsertElement: function() {
            var indexView = this;
            if (window.social) window.social.render();
            if (window.activityStream) {
                indexView.$().on("cloudlet:activity", function(e, activityType) {
                    indexView.onCloudletActivity(activityType)
                });
            };
            documentItems.popoverContact();
            
            try {
                var myComponentView = this;
                
                if (window.UYANCMT) {
                    var model = myComponentView.controller.get('model');
                    UYANCMT.loadBox(model._id, "community", model.name, model.creator);
                }
            } catch (err) {
                console.log("Failure in rendering Comments." + err);
            }
        },
        onCloudletActivity: function(activityType) {
            var model = this.controller.get('model');
            //push to activity stream
            var streamDataContract = new activityStream.StreamDataContract(model._id, "community");
            streamDataContract.title = model.name;
            streamDataContract.resourceUrl = "/#/community/" + model._id;
            streamDataContract.authorUserName = (model.creator || App.getUserLoginId());
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
                case favorite.getConfig().pluginStateOn:
                    streamDataContract.verb = 'favorite';
                    break;
                case like.getConfig().pluginStateOn:
                    streamDataContract.verb = 'like';
                    break;
                case follow.getConfig().pluginStateOff:
                    streamDataContract.verb = 'un-follow';
                    break;
                case favorite.getConfig().pluginStateOff:
                    streamDataContract.verb = 'un-favorite';
                    break;
                case like.getConfig().pluginStateOff:
                    streamDataContract.verb = 'un-like';
                    break;
            }
            activityStream.pushToStream(streamDataContract);
        },
        template: Ember.Handlebars.compile(communityTemplate)
    });
});
