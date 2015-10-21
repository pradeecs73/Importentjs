"use strict";

define(["app", "text!templates/adminCategorise.hbs", "services/topicModellingService"],
    function (app, adminCategoriseTemplate, topicModellingService) {
        app.AdminCategoriseView = Ember.View.extend({
            template: Ember.Handlebars.compile(adminCategoriseTemplate)
        });

        app.AdminCategoriseRoute = Ember.Route.extend({
            model: function () {
                return topicModellingService.allTopics();
            }
        });
    });
