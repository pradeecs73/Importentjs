'use strict';

define(['app', 'pages/documentItems', 'text!templates/communityView.hbs', 'emberPageble',
        'views/communities/joinCommunityDialogView', 'views/communities/communityDetailJoinRequestsView',
        'views/communities/joinCommunityRequestView'
    ],
    function(app, documentItems, communityIndexTemplate, emberPageble, joinCommunityDialogView,communityDetailJoinRequestsView, joinCommunityRequestView) {

    app.CommunityIndexView = Ember.View.extend({
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
                /* annotate old jiathis comment
                if (window.UYANCMT && window.jiaThisAppId) {
                    if (window.jiaThisAppId == "%JIA_THIS_APP_ID%") {
                        console.log("Please configure JIA_THIS_APP_ID");
                        return;
                    }
                    
                    var baseUrl = window.location.protocol + "//" + window.document.domain;
                    var nickName = App.getShortname();
                    var faceUrl = App.profileImage(app.getUsername(), "mini");
                    var profileUrl = baseUrl + "/#/user/" + App.getUsername();
                    var model = myComponentView.controller.get('model');
                    
                    myComponentView.$().find('.uyan-comment').attr("appid", window.jiaThisAppId);
                    myComponentView.$().find('.uyan-comment').attr("articletitle", model.name);
                    myComponentView.$().find('.uyan-comment').attr("nickName", nickName);
                    myComponentView.$().find('.uyan-comment').attr("faceUrl", faceUrl);
                    myComponentView.$().find('.uyan-comment').attr("profileUrl", profileUrl);
                    
                    var entityType = "community"
                    var accountId = null 
                     UYANCMT.load(jiaThisAppId, model._id, null, model.title, nickName, faceUrl, profileUrl,accountId,entityType,function(data){
                        try{
                            var viewInstance = window.App.__container__.lookup('view:community.index');
                            var model = window.App.__container__.lookup('controller:community.index').get('model');
                            var streamDataContract = viewInstance.createActivityStreamObject(model);
                            streamDataContract.verb = 'comment';
                            activityStream.pushToStream(streamDataContract);
                        }
                        catch(err){
                            console.log("Publishing activity to AS failed in community due to: "+ err)
                        }
                        
                    });
                }
                */
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
            streamDataContract.authorUserName = model.creator;
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
        template: Ember.Handlebars.compile(communityIndexTemplate)
    });
});