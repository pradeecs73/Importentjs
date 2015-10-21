define(['app', 'httpClient', 'underscore', 'Q'], function(app, httpClient, _, Q) {
    /*
     Pramod: This is a temporary thing for the new auth integration, once every resource is completely moved to new auth this would go away!
     */

    var searchWithExcludedFields = function(searchText, categoryFilters, searchFilters, types, pageSize, pageNumber,excludedFields){
        return this.genericSearchWithPost(searchText, searchFilters, types, pageSize, pageNumber, null, null,excludedFields);
    };
    var search = function(searchText, categoryFilters, searchFilters, types, pageSize, pageNumber, sortConfig) {
        return this.genericSearchWithPost(searchText, searchFilters, types, pageSize, pageNumber, null, sortConfig);
    };
    var genericSearchWithPost = function(searchText, searchFilters, resourceTypes, pageSize, pageNumber, luceneQuery, sortBy, excludedFields) {
        var genericSearchRequestWithPost = constructGenericSearchRequestForPost(searchText, searchFilters, resourceTypes, pageSize, pageNumber, luceneQuery, sortBy, excludedFields)
        var postRequest = httpClient.post("/knowledgecenter/pipeline/_search", genericSearchRequestWithPost);
        return postRequest
            .then(function(genericSearchResponse) {
                return constructGenericSearchResponse(searchText, searchFilters, genericSearchResponse);
            })
    };

    var constructGenericSearchRequestForPost = function(searchText, searchFilters, resourceTypes, pageSize, pageNumber, luceneQuery, sortBy, excludedFields) {
        var request = {
            query: searchText,
            filters: searchFilters,
            types: resourceTypes,
            pageSize: pageSize,
            pageNumber: pageNumber,
            luceneQuery: luceneQuery,
            sortBy: sortBy,
            excludedFields:excludedFields
        }
        return request;
    };

    var constructAutoCompleteRequest = function(text, isTemplate, params) {
        var queryParams = $.param({
            params: JSON.stringify(params)
        });
        // Pramod: ABSOLUTELY UGLY!! Get rid of it by changing the underlying library
        var queryParam = "query=" + text;
        if (!isTemplate) {
            queryParam = $.param({
                query: text
            })
        }
        return "/knowledgecenter/pipeline/_suggest?" + queryParam + '&' + queryParams;
    };

    var getSuggestUrl = function() {
        return "/knowledgecenter/pipeline/_suggest";
    };

    var constructGenericSearchResponse = function(searchText, searchFilters, response) {
        _.each(searchFilters, function(searchFilter) {
            var filterName = searchFilter.split(':')[0];
            var filterValue = searchFilter.split(':')[1]
            _.each(_.keys(response), function(resourceType) {
                var facetValues = response[resourceType] ? response[resourceType].facets[filterName] : [];
                _.each(facetValues, function(facetValue) {
                    if (facetValue.term == filterValue) {
                        facetValue.selected = true;
                    }
                });
                if (response[resourceType]) response[resourceType].facets[filterName] = facetValues;
            })
        });
        response.searchText = searchText;
        response.allFilters = searchFilters;
        return response;
    };

    var facetsFor = function(searchResponse, resource) {
        var allFacets = {}
        var responseForResource = searchResponse[resource];
        if (!responseForResource) return allFacets;
        _.each(responseForResource.facets, function(facets, facetName) {
            var termsInFacet = _.pluck(facets, "term");
            if (termsInFacet.length > 0) {
                allFacets[facetName] = termsInFacet;
            }
        });

        return allFacets;
    };

    var responseByType = function(searchResponse, type, facetIgnores) {
        searchResponse.allFacets = _.omit(facetsFor(searchResponse, type), facetIgnores);
        searchResponse.allDocuments = _.pluck(searchResponse[type].results, "resource");
        searchResponse.totalResults = searchResponse[type].totalResults;

        return searchResponse;
    };
    var sanitize = function(query) {
        query = query.trim()
        var precedingWildcardRegex = /^\*+/;
        var wildcardRegex = /\*+/g;
        query = query.replace(precedingWildcardRegex, '')
        return query.replace(wildcardRegex, '*')
    };
    var validQuery = function(query) {
        var wildCardRegex = /\*+/g;
        var spaceRegex = /\s+/g;

        return query && query.replace(wildCardRegex, "").replace(spaceRegex, "").replace(/^\"/g, "").replace(/\"$/g, "").length > 1;
    }

    return {
        searchWithExcludedFields: searchWithExcludedFields,
        search: search,
        responseByType: responseByType,
        genericSearchWithPost: genericSearchWithPost,
        facetsFor: facetsFor,
        sanitize: sanitize,
        validQuery: validQuery,
        constructAutoCompleteRequest: constructAutoCompleteRequest,
        getSuggestUrl : getSuggestUrl
    }
});