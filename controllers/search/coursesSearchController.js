define(['app', 'text!templates/search/coursesSearchTemplate.hbs', 'emberPageble'],
  function (app, coursesSearchTemplate) {

    App.CoursesSearchController = Ember.ObjectController.extend(App.SearchControllerMixin, {
      init: function () {
        if (!Ember.TEMPLATES["coursesSearch"]) {
          Ember.TEMPLATES["coursesSearch"] = Ember.Handlebars.template(Ember.Handlebars.precompile(coursesSearchTemplate));
        }
        this.setType("courses");
        this.setSortByField("");
        this.setSortOrder("asc");

      }
    });
  });