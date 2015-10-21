"use strict";

define([],
  function () {
    return {
      facetsDisplayMap: {
        "expertise": "Expertise",
        "jobTitle": "Job Title",
        "city": "Location",
        "scope": "Scope",
        "status": "Status",
        "offeringtype": "Type"
      },

      filterBlankFacets: function (facetValues) {
        return _.reject(facetValues, function (facetValue) {
          return _.isEmpty(facetValue.term)
        })
      },

      toDisplay: function (facetsMap) {
        var facets = [];
        for (var key in facetsMap) {
          var facet = {
            "fieldName": key,
            "values": this.filterBlankFacets(facetsMap[key]),
            "displayName": this.facetsDisplayMap[key] || key
          }
          if (facet.values.length > 0) {
            facets.push(facet);
          }
        }
        return facets;
      }
    }
  });
