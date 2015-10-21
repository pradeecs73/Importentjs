"use strict";

define(["app", "text!templates/leftNav/mobileFolder.hbs"],
    function(app, template) {
        App.MobileFolderView = Ember.View.extend({
            template: Ember.Handlebars.compile(template)
        });
        return app;
    });

