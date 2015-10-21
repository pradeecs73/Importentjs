define(['../app', 'services/webExService', 'text!templates/webexItem.hbs', 'services/tenantService'],
    function (app, webExService, webexItemTemplate, tenantService) {

        App.WebexItemController = Ember.ObjectController.extend({
            init: function () {
                if (!Ember.TEMPLATES["webexItem"]) {
                    Ember.TEMPLATES["webexItem"] = Ember.Handlebars.template(Ember.Handlebars.precompile(webexItemTemplate));
                }
                var self = this;

                tenantService.getTenantInfo().then(function (tenantInfo) {
                    if (!_.isUndefined(tenantInfo.WebexInfo.WebexEnabled))
                        self.set("isWebexEnabled", tenantInfo.WebexInfo.WebexEnabled);
                    else
                        self.set("isWebexEnabled", false);
                });
            },
            actions: {
                instantMeeting: function() {
                    var model = this.get('model');
                    var expertsDetails = [
                        {
                            expertId: model.shortName,
                            expertEmail: model.email
                        }
                    ];
                    webExService.instantMeeting(expertsDetails)
                }
            }
        })
    })