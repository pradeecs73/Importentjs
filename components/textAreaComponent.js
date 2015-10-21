'use strict';

define(["app", "text!templates/components/textAreaComponent.hbs"], function (app, textAreaComponentTemplate) {
    app.TextAreaComponent = Ember.Component.extend({
        template: Ember.Handlebars.compile(textAreaComponentTemplate),
        characterLeft: function() {
            if(this.get("currentText")) {
                return (this.get("maxLength") - this.get("currentText").length);
            }
            return this.get("maxLength");
        }.property('currentText'),

        characterEntered: function() {
          if(this.get("currentText")) {
            return this.get("currentText").length;
          }
          return 0;
        }.property('currentText'),

        isCountType: function() {
          if(this.get("type")) {
            return this.get("type") == "count";
          }
          return false;
        }.property()
    });
});