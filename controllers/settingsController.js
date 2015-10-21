'use strict';

define(['app', 'text!templates/settings.hbs', 'pages/settings'],
    function (app, settingsTemplate, settings) {
        App.SettingsView = Ember.View.extend({
            template: Ember.Handlebars.compile(settingsTemplate),
            didInsertElement: function() {
                settings.initialize();
            }
        });

    });
