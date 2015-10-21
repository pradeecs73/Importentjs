/**
 * Handle  all the posts shared calls for getting data from ES.
 * File Name : sharedPostService.js
 * @author Mohan Rathour
 */
define(['app', 'httpClient'],function (app, httpClient) {

	/**
	 * Create generic funcation for  post Shared filter data.
	 * @author Mohan Rathour.
	 */
	var genericSharedWithPost = function(searchText, searchFilters, resourceTypes, pageSize, pageNumber, activityParams, sortBy) {
		if (!activityParams.hasOwnProperty("type")) {
			console.log("Type of activity is a compulsory param!!");
			console.log(activityParams);
			throw new Ember.Error("Type of activity is a compulsory param!!")
		}
		var genericSharedRequestWithPost = constructGenericSharedRequestForPost(searchText, searchFilters, resourceTypes, pageSize, pageNumber, activityParams, sortBy)
		var postRequest = httpClient.post("/knowledgecenter/pipeline/actions/_search", genericSharedRequestWithPost);
		return postRequest
		.then(function(genericSharedResponse) {
			return constructGenericSharedResponse(searchText, searchFilters, genericSharedResponse);
		})
	};

	/**
	 * Construct  post Shared filter request data.
	 * @author Mohan Rathour.
	 */
	var constructGenericSharedRequestForPost = function(searchText, searchFilters, resourceTypes, pageSize, pageNumber, activityParams, sortBy) {
		var searchRequest = {
				type: resourceTypes,
				filters: searchFilters,
				searchText: searchText,
				pageNumber: pageNumber,
				pageSize: pageSize,
				sortBy: sortBy,
				activity: activityParams
		};
		return searchRequest;
	};

	/**
	 * Get   post Shared filter response data.
	 * @author Mohan Rathour.
	 */
	var constructGenericSharedResponse = function(searchText, searchFilters, response) {
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



	return {
		genericSharedWithPost: genericSharedWithPost,
		constructGenericSharedRequestForPost: constructGenericSharedRequestForPost
	}
});