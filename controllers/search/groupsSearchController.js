define(['app', 'text!templates/search/groupsSearchTemplate.hbs', 'emberPageble'],
  function (app, groupsSearchTemplate) {
    App.GroupsSearchController = Ember.ObjectController.extend(App.SearchControllerMixin, {
      init: function () {
        if (!Ember.TEMPLATES["groupsSearch"]) {
          Ember.TEMPLATES["groupsSearch"] = Ember.Handlebars.template(Ember.Handlebars.precompile(groupsSearchTemplate));
        }
        this.setType("groups");
        this.setSortByField("");
        this.setSortOrder("asc");

      }
    });
  });