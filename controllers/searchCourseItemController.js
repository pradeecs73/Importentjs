define(['app', 'text!templates/formallearning/searchCourseItemGrid.hbs', 'text!templates/formallearning/searchCourseItemList.hbs'],
  function (app, searchCourseItemGridTemplate, searchCourseItemListTemplate) {

    App.SearchCourseItemGridView = Ember.View.extend({
      template: Ember.Handlebars.compile(searchCourseItemGridTemplate)
    });

    App.SearchCourseItemListView = Ember.View.extend({
      template: Ember.Handlebars.compile(searchCourseItemListTemplate),
      tagName: ''
    });

    app.SearchCourseItemController = Ember.ObjectController.extend({

      init: function () {
        if (!Ember.TEMPLATES["searchCourseItemGrid"]) {
          Ember.TEMPLATES["searchCourseItemGrid"] = Ember.Handlebars.template(Ember.Handlebars.precompile(searchCourseItemGridTemplate));
        }
        if (!Ember.TEMPLATES["searchCommunityList"]) {
          Ember.TEMPLATES["searchCommunityList"] = Ember.Handlebars.template(Ember.Handlebars.precompile(searchCourseItemListTemplate));
        }
      },
      views: {
        "list-view": { "descriptionLength": 400, "titleLength": 100},
        "large-grid-view": { "descriptionLength": 500, "titleLength": 50},
        "grid-view": { "descriptionLength": 150, "titleLength": 45}
      }

    })
  });

