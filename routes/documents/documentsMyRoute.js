'use strict';

define(['app', 'pages/documentItems', 'services/searchService', 'services/cloudletService', 'services/documentsService', 'httpClient'],
  function(app, documentItems, searchService, cloudletService, documentsService, httpClient) {
    app.DocumentsMyRoute = Ember.Route.extend(App.DocumentsRouteMixin, {
      actions: {
        openCreateDocumentModal: function() {
          var controller = this.controllerFor("fileUpload");
          controller.resetModel();
          this.render("fileUpload", {
            into: 'application',
            outlet: 'modal',
            controller: controller
          });
        },
          closeCreateDocumentModal: function() {
          var mydocContrlr= this.get('controller');
           this.controllerFor("fileUpload").resetModel();
           this.refresh();
          if(mydocContrlr.get('isUpload'))
          {
            //seting the community upload to false Abhilash
            this.get('controller').set('isUpload',false);
            this.transitionTo('community.documents',mydocContrlr.get('community_id'));
          }
        }
      },
      renderTemplate: function() {
        this.render();
        var model = this.modelFor('documents.shared');
        if (model && model.length == 0) {
          this.render("noData")
        }
      },
      queryParams: {
        searchText: {
          refreshModel: true
        },
        filters: {
          refreshModel: true
        },
        pageNumber: {
          refreshModel: true
        },
        filterType: {
          refreshModel: true
        },
        sortOrder: {
            refreshModel: true
        },
        sortBy: {
            refreshModel: true
        }
      },

      setProperties: function(key, val) {
        this.controllerFor('documentsMy').set(key, val);
      },

      model: function(queryParams) {
        var documentMyController = this.controllerFor('documentsMy');
        documentMyController.set('pageTitle', "My Files");
        var self = this;
        _.each(queryParams, function(val, key) {
          self.setProperties(key, val);
        })

        documentsService.canUploadAFile().then(function() {
          documentMyController.set("actionsEnabled.upload", true);
        }).fail(function() {
          documentMyController.set("actionsEnabled.upload", false);
          console.log("Not authorized to upload a file.")
        })

        return cloudletService.getAllResources("document", queryParams.filterType).then(function(resourceIds) {
          if (queryParams.filterType == 'all' || resourceIds.length > 0) {
            var filters = queryParams.filters ? queryParams.filters.split(";") : [];
            filters = filters.concat(resourceIds.length > 0 ? _.map(resourceIds, function(resourceId) {
              return "id:" + resourceId;
            }) : []);
            filters.push("createdBy:" + app.getUsername());
            queryParams.filters = filters.join(';');
            return documentsService.allDocumentsWithFilters(queryParams).then(function(searchResponse){
              searchResponse.allFacets = _.omit(searchResponse.allFacets, ["createdBy"]);
              return searchResponse;
            });
          }
          else {
            return {searchResultDocuments: []};
          }
        });
      }
    })
  });
