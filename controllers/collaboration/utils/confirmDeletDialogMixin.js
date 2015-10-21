define(["app", "text!templates/collaboration/confirmModalDialog.hbs"],
    function(App, confirmModelDialogTemplate) {
        App.ConfirmDeleteDialogViewMixin = Ember.Mixin.create({
            confirmModelDialogView: Ember.View.extend({
                template: Ember.Handlebars.compile(confirmModelDialogTemplate),
                controller: Ember.Object.create({}),
                actions: {
                    deletePost: function(getType) {
                            var currentRouteKey = (this._parentView._debugTemplateName) ? this._parentView._debugTemplateName : this._parentView._parentView._debugTemplateName;
                            var controller = this.container.lookup("controller:" +currentRouteKey );
                            var boundSend = controller.send.bind(controller);
                            var post = this.$().find('#deletePost').data("post");
                            boundSend('delete', post, true);

                    }
                },
                init: function() {
                    this._super();
                    var parentView = this._parentView;
                    //Index View Fix
                    this.controller = (parentView.confirmModelDialogController) ? parentView.confirmModelDialogController : parentView._parentView.confirmModelDialogController;
                }
            }),
            actions: {
                beforeDelete: function(content) {
                    jQuery("#deletePost").data("post",content);
                    this.$().find('#deletePost').modal('show');
                },
                beforeDeleteCommunity:function(community){
                    this.$().find('#deletePost').data("community", community);
                    this.$().find('#deletePost').modal('show');
                }
            },
            init: function() {
                this._super();
            }
        });
    });