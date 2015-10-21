'use strict';

define(['app', 'text!templates/documents/catalog.hbs', 'pages/documentItems', 'services/searchService', 'services/documentsService','controllers/documents/documentsCatalogItemController', 'httpClient', 'Q', 'services/cloudletService'],
  function(app, documentsCatalogTemplate, documentItems, searchService, documentsService,documentsCatalogItemController, httpClient, Q, cloudletService) {
      
    app.DocumentsCatalogView = Ember.View.extend({
      template: Ember.Handlebars.compile(documentsCatalogTemplate),
      toggleView: function(view) {
        this.controller.set('_currentView', view);
      },
      willClearRender: function() {
        this.controller.set('searchText','')
        this.controller.set('searchBoxText','')
      }
    });
    app.DocumentsCatalogRoute = Ember.Route.extend(App.DocumentsRouteMixin, {
      renderTemplate: function() {
        this.render()
        var model = this.modelFor('documents.catalog')
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
        filterType: {
          refreshModel: true
        },
        pageNumber: {
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
        this.controllerFor('documentsCatalog').set(key, val);
      },

      model: function(queryParams) {
        this.controllerFor('documentsCatalog').set('pageTitle', "Knowledge Library");
        var self = this;
        _.each(queryParams, function(val, key) {
          self.setProperties(key, val);
        })

        return cloudletService.getAllResources("document", queryParams.filterType).then(function(resourceIds) {
          if (queryParams.filterType == 'all' || resourceIds.length > 0) {
            var filters = queryParams.filters ? queryParams.filters.split(";") : [];

            filters = filters.concat(resourceIds.length > 0 ? _.map(resourceIds, function(resourceId) {
              return "id:" + resourceId;
            }) : []);

            filters.push("isPublic:true");
            queryParams.filters = filters.join(';');
            return documentsService.allDocumentsWithFilters(queryParams).then(function(searchResponse){
                searchResponse.allFacets = _.omit(searchResponse.allFacets, ["createdBy"]);
                return searchResponse;
            });
          }
          else {
            return {"allDocuments": []};
          }
        })
      }


    });

    app.DocumentsCatalogController = Ember.ObjectController.extend(App.DocumentsControllerMixin, {
      requiredCloudletFilters: ['liked', 'followed', 'favorited', 'all'],
      _currentView: 'list-view',
      queryParams: ['searchText', 'filters', 'filterType', 'pageNumber','sortBy', 'sortOrder'],
      searchText: '',
      filters: '',
      filterType: 'all',
      pageNumber: 1,
      pageTitle: "",
      sortBy: 'uploadedOn',
      sortOrder: 'desc',
      sortableFields:[
        {text: 'Type', value: 'documentType'},
        {text:'Name', value:'title'},
        {text:'Size', value:'size'},
        {text:'Modified', value:'modifiedOn'},
        {text:'Uploaded', value:'uploadedOn'}
      ],
      actionsEnabled: {
        sharedWith: false,
        sharing: false,
        delete: true,
        download: true,
        multiselect: false,
        tagging: false,
        upload: false
      }
    });
  })
