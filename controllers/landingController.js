'use strict';
define(['app', 'pages/landing'],
    function(app, landing) {
        app.LandingRoute = Ember.Route.extend({
            renderTemplate: function() {
                var self = this
                this.render()
            }
        });

        app.LandingController = Ember.Controller.extend({
            init: function() {
                $.ajax({
                    url: 'knowledgecenter/branding/hbs/landing.hbs',
                    async: false,
                    success: function (landingTemplate) {
                        app.LandingView = Ember.View.extend({
                            template: Ember.Handlebars.compile(landingTemplate),
                            didInsertElement: function() {
                                landing.initialize();
                            }
                        });
                    }
                });
            }});
    })
