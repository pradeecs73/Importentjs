define(['app', 'text!templates/people/managerUserListItem.hbs'],
  function (app, managerUserListItem) {

    App.ManagerUserListItemView = Ember.View.extend({
      template: Ember.Handlebars.compile(managerUserListItem),
      tagName: ''
    });

  });
