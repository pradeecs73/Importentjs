define(['app', 'text!templates/people/userTileItem.hbs'],
  function (app, userTileItem) {

    app.UserTileItemView = Ember.View.extend({
      template: Ember.Handlebars.compile(userTileItem),
      tagName: ''
    });

  });