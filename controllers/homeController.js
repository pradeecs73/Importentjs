'use strict';

define(['app','text!templates/home.hbs', 'pages/home'],
    function(app, homeTemplate, home) {
        App.HomeView = Ember.View.extend({
            template: Ember.Handlebars.compile(homeTemplate),
            didInsertElement: function() {
                home.initialize();
            }
        });
        App.HomeRoute = Ember.Route.extend({
            renderTemplate: function () {
                this.render();
                this.render("settings", {
                    into: "home",
                    outlet: "settings"
                });
            }
        });

    });
