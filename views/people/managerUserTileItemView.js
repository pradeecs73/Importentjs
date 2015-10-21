define(['app', 'text!templates/people/managerUserTileItem.hbs'],
  function (app, managerUserTileItem) {

    app.ManagerUserTileItemView = Ember.View.extend({
      template: Ember.Handlebars.compile(managerUserTileItem),
      tagName: ''
    });

  });