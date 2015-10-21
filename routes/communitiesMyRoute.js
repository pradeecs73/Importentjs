'use strict';

define(['app', 'services/groupService', 'services/cloudletService'],
  function(app, groupService, cloudletService) {
    app.CommunitiesMyRoute = Ember.Route.extend({
      controllerName: 'communityListing',
      queryParams: {
        searchText: {
          refreshModel: true
        },
        filters: {
          refreshModel: true
        },
        filterType: {
            refreshModel: true
        },
        pageNumber: {
          refreshModel: true
        },
        sortBy: {
            refreshModel: true
        },
        sortOrder: {
            refreshModel: true
        }
      },
      setProperties: function(key,val){
        this.controllerFor('communityListing').set(key,val);
      },
      model: function(queryParams) {
        var self = this;
        _.each(queryParams, function(val, key){
          self.setProperties(key,val);
        })
        return cloudletService.getAllResources("community", queryParams.filterType).then(function (resourceIds) {
          if(resourceIds.length > 0 || queryParams.filterType == "all"){
            var filters = queryParams.filters ? queryParams.filters.split(",") : [];
            filters.push("members:" + app.getUsername())
            filters = filters.concat(resourceIds.length > 0 ? _.map(resourceIds, function(resourceId){return "id:" + resourceId;}) : []);
            queryParams.filters = filters.join(';');
            if(self.controllerFor('application').currentPath !='communities.my')
            {
            	 window.location.href = "#/communities/my";
            }
            return groupService.allGroupsWithFilters(queryParams);
          }
          else{
            return {};
          }
        });
      },
      renderTemplate: function() {
    	  var model = this.modelFor('communities.my');
    	  // Figure out a way around
    	  this.render("communities.all");
    	  $("#communitiesSortingDropdownId li a").removeClass("selected");
    	  var fieldName = this.controllerFor('communityListing').sortBy;
    	  if(fieldName=='category.name'){
    		  fieldName=fieldName.split('.')[0];
    	  }
    	  $("#"+fieldName).addClass("selected");
    	  
    	  if (model && model.length == 0) {
    		  this.render("noData")
    	  }
      },
      setupController: function(controller, model) {
    	  controller.setProperties({listingName:"My Communities",content:model});
      }
    });
  });