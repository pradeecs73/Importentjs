define(["app", "text!templates/communities/joinCommunityModalDialog.hbs"],
    function(App, joinCommunityModelDialogTemplate) {
            App.JoinCommunityDialogView = Ember.View.extend({
                template: Ember.Handlebars.compile(joinCommunityModelDialogTemplate),
                actions: {
                    joinCommunity: function() {
                        // var controller = this.container.lookup("controller:community.index");
                        // var boundSend = controller.send.bind(controller);
                        // boundSend('joinCommunity', true);
                    }
                },
                init: function() {
                    this._super();
                }
            });
    });