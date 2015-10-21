'use strict';

define(["app", "text!templates/components/viewFileComponent.hbs"],
    function (app, viewFileComponentTemplate) {
    app.ViewFileComponent = Ember.Component.extend(App.ViewFileComponentMixin, {
        template: Ember.Handlebars.compile(viewFileComponentTemplate)
    });
});