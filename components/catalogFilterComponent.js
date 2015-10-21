define(['app', 'text!templates/components/catalogFilterComponent.hbs', 'services/cloudletService', 'underscore'],
  function (app, catalogFilterTemplate, cloudletService, _) {
    app.CatalogFilterComponent = Ember.Component.extend({
      layout: Ember.Handlebars.compile(catalogFilterTemplate),
      ALL_FILTERS: [
        {
          "label": "All",
          "value": "all"
        },
        {
          "label": "My Likes",
          "value": "liked"
        },
        {
          "label": "My Favorites",
          "value": "favorited"
        },
        {
          "label": "Followed by Me",
          "value": "followed"
        }
      ],

      applicableFilters: function () {
        var fields = this.get('filters');
        this.set('selectedFilter',this.get('selected'));

        var rawFilters = _.filter(this.ALL_FILTERS, function (filter) {
          return _.contains(fields, filter.value);
        });
        return rawFilters;
      }.property(),

      observesSelected: function () {
        return this.set('selectedFilter', this.get('selected'));
      }.observes('selected'),

      applyFilter: function () {
        this.sendAction('action', this.selectedFilter);
      }.observes('selectedFilter')
    });
  });