define(['app', 'text!templates/search/postsSearchTemplate.hbs', 'emberPageble'],
  function (app, postsSearchTemplate) {
    App.PostsSearchController = Ember.ObjectController.extend(App.SearchControllerMixin, {
      init: function () {
        if (!Ember.TEMPLATES["postsSearch"]) {
          Ember.TEMPLATES["postsSearch"] = Ember.Handlebars.template(Ember.Handlebars.precompile(postsSearchTemplate));
        }
        this.setType("posts");
        this.setSortByField("");
        this.setSortOrder("asc");

      }
    });
  });