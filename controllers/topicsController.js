'use strict';

define(['app','text!templates/topics.hbs', 'pages/topics'],
    function(app, topicsTemplate, topics) {
        App.TopicsView = Ember.View.extend({
            template: Ember.Handlebars.compile(topicsTemplate),
            didInsertElement: function() {
                topics.initialize();
            }
        });

        App.TopicsRoute = Ember.Route.extend({
            renderTemplate: function () {
                this.render();
                this.render("trendingTopics", {
                    into: "topics",
                    outlet: "trendingTopics"
                });
            }
        });
    });
