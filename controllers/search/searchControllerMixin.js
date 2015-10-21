define(['app', 'objects/search/filters', 'objects/search/facets', 'pages/documentItems', 'services/searchService'],
  function (app, filtersObj, facetsObj, documentItems, searchService) {
      app.SearchControllerMixin = Ember.Mixin.create({
      _allFilters: [],
      _currentView: "grid-view",
      _type: "",
        sortOrder: "asc",
        sortBy: "",

      allFilters: function () {
        return filtersObj.toDisplay(this._allFilters);
      }.property("_allFilters"),

      resetFilters: function () {
        this.set('_allFilters', [])
      }.observes('parentController.searchText'),

      isGridView: function () {
        return this.get('_currentView') == 'grid-view';
      }.property("_currentView"),

      searchText: function () {
        return this.parentController.get('searchText');
      }.property('parentController.searchText'),

      facets: function () {
        return {
          "resourceType": facetsObj.toDisplay(this.get('model').facets)
        };
      }.property('model'),

      toggleView: function (viewName, resource) {
        documentItems.toggleView(viewName, resource);
        this.set('_currentView', viewName);
      },
      setType: function(typeName) {
        this._type = typeName;
      },
        setSortByField: function(field) {
          this.sortBy = field;
        },
        setSortOrder: function(sortOrder) {
          this.sortOrder = sortOrder;
        },
        resetSortConfig: function () {
          this.set('sortBy', 'relevance')
          this.set('sortOrder', 'asc')
        }.observes('parentController.searchText'),
      gotoPage: function (pageValue) {
        this._searchWith(this.parentController.searchText, [], this._allFilters, this._type, pageValue, this.constructSortConfig());
      },

      _searchWith: function (searchText, categoryFilters, filters, resourceType, pageNumber, sortConfig) {
        var self = this;
        var filters = filters && filters.length > 0 ? filters : [];
        var searchType = [resourceType.substring(0, resourceType.length - 1)];

        searchService.search(searchText, categoryFilters, filters, searchType, app.PageSize, pageNumber, sortConfig).then(function (searchResult) {
          var result = searchResult[resourceType];
          result.pageNumber = parseInt(pageNumber);
          self.parentController.set('model.' + self._type, result);
        })
      },

      addSecondarySort: function(sortBy){
        var self = this;
        if(this.defaultSecondarySortConfig){
          var existingSortConfig = _.find(sortBy, function(sortConfig){
            return sortConfig.sortBy == self.defaultSecondarySortConfig.sortBy
          })
          if(!existingSortConfig){
            sortBy.push(this.defaultSecondarySortConfig)
          }
        }
      },

        constructSortConfig : function(){
          var sortBy = []
          sortBy.push({
            "sortBy" : this.sortBy,
            "sortOrder" : this.sortOrder
          })
          this.addSecondarySort(sortBy);
          return sortBy
        },

      actions: {
        addFilter: function (filterName, value, resourceType) {
          var filters = filtersObj.addFilter(this._allFilters, filterName, value);
          this.set('_allFilters', filters);
          var sortBy = this.constructSortConfig();
          this._searchWith(this.parentController.searchText, [], filters, resourceType, 1, sortBy);
        },

        removeFilter: function (filterName, value, resourceType) {
          var filters = filtersObj.removeFilter(this._allFilters, filterName, value);
          this.set('_allFilters', filters);
          var sortBy = this.constructSortConfig();
          this._searchWith(this.parentController.searchText, [], filters, resourceType, 1, sortBy);
        },
        updateSortBy: function(sortByField) {
          this.set('sortBy', sortByField);
          var sortBy = this.constructSortConfig()
          this._searchWith(this.parentController.searchText, [], this._allFilters, this._type, 1, sortBy)
        },
        toggleSortOrder: function(){
          if(this.sortOrder == 'asc') this.set('sortOrder', 'desc');
          else this.set('sortOrder', 'asc')
          var sortBy = this.constructSortConfig();
          this._searchWith(this.parentController.searchText, [], this._allFilters, this._type, 1, sortBy)
        }

      }
    })
  });