"use strict";

define(["app", "text!templates/expertise.hbs"],
  function(app, adminExpertiseTemplate) {

    app.UserManagementExpertiseView = Ember.View.extend({
      template: Ember.Handlebars.compile(adminExpertiseTemplate),

      didInsertElement: function(){
        this.controller.set('successMessage', '');
      },

      willClearRender: function() {
        this.controller.set('searchtextvalue','')
        this.controller.set('expertisesearchvalue','')
      } 

    });

    return app;
  });
