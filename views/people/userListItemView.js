define(['app', 'text!templates/people/userListItem.hbs'],
  function (app, userListItem) {

    App.UserListItemView = Ember.View.extend({
      template: Ember.Handlebars.compile(userListItem),
      tagName: ''
    });

  });
