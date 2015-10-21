'use strict';

define(['app', 'pages/documentItems'],
  function(app, documentItems) {

    app.CommunitiesMyController = Ember.ObjectController.extend({
      requiredCloudletFilters: ['liked', 'followed', 'favorited', 'all'],
      _currentView: "list-view",
      queryParams: ['searchText', 'filters', 'filterType', 'pageNumber'],
      searchText: '',
      filters: '',
      filterType: '',
      pageNumber: 1,
        
      searchBoxText: function() {
        return this.get('searchText')
      }.property('searchText'),

      isGridView: function() {
        return this.get('_currentView') == 'grid-view';
      }.property("_currentView"),

      isPublic: function() {
        var type = this.get('model').resource.type;
        return type == "public";
      }.property('model.resource'),

      actions: {
        toggleTile: function(communityId) {
          documentItems.toggleTile(communityId);
        },
        filter: function(filters) {
          this.set('filters', filters.join(';'));
          this.set('pageNumber', 1);
        },
        search: function() {
          this.set('searchText', this.get('searchBoxText'))
          this.set('filters', '')
          this.set('pageNumber', 1);
        },
        cloudletFilter: function(filterType){
          this.set("filterType", filterType);
          this.set('pageNumber', 1);
        },
        gotoPage: function (pageValue) {
            this.set('pageNumber', pageValue)
        }
      }
    });

  });
