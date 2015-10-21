define(['app', 'text!templates/communities/communityGrid.hbs', 'text!templates/communities/communityList.hbs', 'text!templates/communities/communityPopOver.hbs'],
  function (app, communityGrid, communityList, communityPopOver) {

    App.CommunityGridView = Ember.View.extend({
      template: Ember.Handlebars.compile(communityGrid)
    });

    App.CommunityListView = Ember.View.extend({
      template: Ember.Handlebars.compile(communityList),
      tagName: ''
    });

    App.CommunityPopOver = Ember.View.extend({
      template: Ember.Handlebars.compile(communityPopOver),
      tagName: ''
    });

    app.CommunityItemController = Ember.ObjectController.extend({

      init: function () {
        if (!Ember.TEMPLATES["communityGrid"]) {
          Ember.TEMPLATES["communityGrid"] = Ember.Handlebars.template(Ember.Handlebars.precompile(communityGrid));
          Ember.TEMPLATES["communityPopOver"] = Ember.Handlebars.template(Ember.Handlebars.precompile(communityPopOver));
        }
        if (!Ember.TEMPLATES["communityList"]) {
          Ember.TEMPLATES["communityList"] = Ember.Handlebars.template(Ember.Handlebars.precompile(communityList));
        }
      },
      views: {
        "list-view": { "descriptionLength": 400, "titleLength": 100},
        "large-grid-view": { "descriptionLength": 500, "titleLength": 50},
        "grid-view": { "descriptionLength": 150, "titleLength": 45}
      },
      isPublicGroup: function() {
        var type = this.get('model').resource.type;
        return type == "public";
      }.property('model.resource'),

      isGridView: function() {
        return this.get('parentController').get('_currentView') == 'grid-view';
      }.property('parentController._currentView')
    })
  });

