'use strict';

define(['app','text!templates/pulse.hbs', 'pages/pulse'],
    function(app, pulseTemplate, pulse) {
        App.PulseView = Ember.View.extend({
            template: Ember.Handlebars.compile(pulseTemplate),
            didInsertElement: function() {
                pulse.initialize();
                pulse.pulseGraphRenderer("assets/data/pulse-me.tsv", "meChartContainer");
            }
        });

        App.PulseController = Ember.ArrayController.extend({
            actions: {
                wePulse: function (topicName) {
                    pulse.pulseGraphRenderer("assets/data/pulse-we.tsv", "weChartContainer");
                }
            }
        });

    });
