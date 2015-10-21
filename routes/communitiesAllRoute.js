'use strict';

define(['app', 'services/groupService', 'services/cloudletService', 'httpClient', 'Q'],
    function(app, groupService, cloudletService, httpClient, Q) {
        app.CommunitiesAllRoute = Ember.Route.extend({
            controllerName: 'communityListing',
            templateName: "communityListing",
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
            setProperties: function(key, val) {
                this.controllerFor('communityListing').set(key, val);
            },
            model: function(queryParams) {
                var self = this;
                _.each(queryParams, function(val, key) {
                    self.setProperties(key, val);
                })
                return cloudletService.getAllResources("community", queryParams.filterType).then(function(resourceIds) {
                    if (resourceIds.length > 0 || queryParams.filterType == "all") {
                        var filters = queryParams.filters ? queryParams.filters.split(",") : [];
                        filters = filters.concat(resourceIds.length > 0 ? _.map(resourceIds, function(resourceId) {
                            return "id:" + resourceId;
                        }) : []);
                        queryParams.filters = filters.join(';');
                        if(self.controllerFor('application').currentPath !='communities.all')
                        {
                        	window.location.href = "#/communities/all";
                        }
                        return groupService.allGroupsWithFilters(queryParams);
                    } else {
                        return {};
                    }
                });
            },
            renderTemplate: function() {
            	var model = this.modelFor('communities.all');
            	this.render();
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
                controller.setProperties({listingName:"Communities",content:model});
                var permission = "CreateCommunity";
                var urlTogetPermissionForUserToCreate = "/knowledgecenter/cclom/subject/role/"+permission;
                return httpClient.get(urlTogetPermissionForUserToCreate).then(function(response) {
                      if(response && response.permissionStatus){
                          var responseStatus = response.permissionStatus
                          controller.set('isUserHasAccessToCreate', responseStatus);
                      }else{
                          controller.set('isUserHasAccessToCreate', false);               
                      }
                  }, function(err) {
                      Ember.Logger.error("[communitiesAllRoute :: ][setupController :::]", err);
                      controller.set('isUserHasAccessToCreate', false)
                });

            }
        });
    });