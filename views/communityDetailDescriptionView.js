'use strict';

define(['app',
        'underscore',
        'text!templates/communities/communityDetailDescription.hbs',
        'services/tenantService'],
    function(app, _, descriptionTemplate, tenantService) {
        app.CommunitiesDetailDescriptionView = Ember.View.extend({
            template: Ember.Handlebars.compile(descriptionTemplate),
            tagName: '',
            didInsertElement: function(){
                var self = this;

                tenantService.getTenantInfo().then(function(tenantInfo){
                    Ember.set(self, "isWebexEnabled", tenantInfo.WebexInfo.WebexEnabled ||false);
                });
            }
        });
    });
