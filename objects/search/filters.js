"use strict";

define(["underscore"],
  function (_) {
    return {
      addFilter: function (allFilters, filterName, value) {
        var filters = allFilters.slice();
        if (!(allFilters).contains(filterName + ":" + value)) {
          filters = this.addFilterFields(filterName, value, filters);
        }
        return filters;
      },

      addFilterFields: function (filterName, value, filters) {
        var aFilter = filterName + ":" + value;
        if (!_.contains(filters, aFilter)) {
          filters.pushObject(aFilter);
        }
        return filters;
      },

      removeFilter: function (allFilters, filterName, value) {
        return this.removeFilterFields(filterName, value, allFilters).slice();
      },

      removeFilterFields: function (filterName, value, filters) {
        var aFilter = filterName + ":" + value;
        if (_.isEmpty(filters)) {
          return filters;
        }
        else {
          if (_.contains(filters, aFilter))
            filters.removeObject(aFilter)
        }
        return filters;
      },

      toDisplay: function(allFilters) {
        var filterValues = [];
        _.each(allFilters, function (aFilters) {
          var filterValue = aFilters.split(":")
          if (filterValue && filterValue.length == 2) filterValues.push({
            "fieldName": filterValue[0],
            "value": filterValue[1]
          })
        });
        return filterValues;
      }
    }
  });
