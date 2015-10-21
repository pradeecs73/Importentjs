define(['app', 'text!templates/search/otgSearchTemplate.hbs', 'controllers/search/searchControllerMixin'],
  function (app, otgSearchTemplate) {

    App.OtgSearchController = Ember.ObjectController.extend(App.SearchControllerMixin, {
      init: function () {
        if (!Ember.TEMPLATES["otgSearch"]) {
          Ember.TEMPLATES["otgSearch"] = Ember.Handlebars.template(Ember.Handlebars.precompile(otgSearchTemplate));
        }
        this.setType("otg");
        this.setSortByField("");
        this.setSortOrder("asc");
      },
      appId: applicationIdConfig.contentstore
    });
  });