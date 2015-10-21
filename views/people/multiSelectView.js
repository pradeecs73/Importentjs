define(['app', 'text!templates/people/multiSelectWidget.hbs', 'services/tenantService'],
    function (app, multiSelectWidget, tenantService) {

        App.MultiSelectWidgetView = Ember.View.extend({
            template: Ember.Handlebars.compile(multiSelectWidget),
            tagName: '',
            didInsertElement: function(){
                var self = this;

                tenantService.getTenantInfo().then(function(tenantInfo){
                    Ember.set(self, "isJabberEnabled", tenantInfo.JabberInfo.JabberEnabled || false);
                    Ember.set(self, "isWebexEnabled", tenantInfo.WebexInfo.WebexEnabled || false);
                    Ember.set(self, "isMultiSelectEnabled", tenantInfo.WebexInfo.WebexEnabled || tenantInfo.JabberInfo.JabberEnabled || false);
                });
            }
        });

    });

