'use strict';

define(['app', 'text!templates/documents/catalog.hbs', 'pages/documentItems', 'services/searchService',
    'services/documentsService', 'services/groupService', 'underscore', 'services/cloudletService'],
  function(app, documentsCatalogTemplate, documentItems, searchService, documentsService, groupService, _, cloudletService) {

    app.DocumentsSharedView = Ember.View.extend({
      template: Ember.Handlebars.compile(documentsCatalogTemplate),
      toggleView: function(view) {
        this.controller.set('_currentView', view);
      },
      willClearRender: function() {
        this.controller.set('searchText','')
        this.controller.set('searchBoxText','')
      }
    });
    app.DocumentsSharedRoute = Ember.Route.extend(App.DocumentsRouteMixin ,{
      renderTemplate: function() {
        this.render()
        var model = this.modelFor('documents.shared')
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
        this.controllerFor('documentsShared').set(key, val);
      },
      model: function(queryParams) {
        this.controllerFor('documentsShared').set('pageTitle', "Shared Files");
        var self = this
        _.each(queryParams, function(val, key) {
          self.setProperties(key, val);
        })

        return cloudletService.getAllResources("document", queryParams.filterType).then(function(resourceIds) {
          if (queryParams.filterType == 'all' || resourceIds.length > 0) {
            var filters = queryParams.filters ? queryParams.filters.split(";") : [];
            filters = filters.concat(resourceIds.length > 0 ? _.map(resourceIds, function(resourceId) {
              return "id:" + resourceId;
            }) : []);
            var sharesResultPromise;
            queryParams.filters = filters.join(';');
            sharesResultPromise = documentsService.activitySearch(queryParams, {type:"SHARE",recipients:["me","myGroups"]});
            return sharesResultPromise;
          }
          else {
            return {searchResultDocuments: []};
          }
        })
      }
    });

    app.DocumentsSharedController = Ember.ObjectController.extend(App.DocumentsControllerMixin, {
      requiredCloudletFilters: ['liked', 'followed', 'favorited', 'all'],
      _currentView: 'list-view',
        queryParams: ['searchText', 'filters', 'filterType', 'pageNumber', 'sortBy', 'sortOrder'],
      searchText: '',
      filterType: 'all',
      filters: '',
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
        sharing: true,
        tagging: false,
        delete: true,
        download: true,
        multiselect: true,
        upload: false
      }
    });
  })