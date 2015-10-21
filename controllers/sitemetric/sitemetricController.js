

'use strict';

    define(['app', 'text!templates/sitemetric/sitemetrics.hbs'],
        function(app, sitemetricTemplate) {
          app.SitemetricView = Ember.View.extend({
            template: Ember.Handlebars.compile(sitemetricTemplate)
          });
    });