'use strict';

define(['app', 'services/documentsService'], function(app, documentsService) {
  app.DocumentsMyController = Ember.ObjectController.extend(App.DocumentsControllerMixin, {
    needs: ['application'],
    requiredCloudletFilters: ['liked', 'followed', 'favorited', 'all'],
    _currentView: 'list-view',
    queryParams: ['searchText', 'filters', 'filterType', 'pageNumber', 'sortBy', 'sortOrder'],
    searchText: '',
    filters: '',
    filterType: 'all',
    pageNumber:1,
    isUpload:false,
    community_id:'',
    community_name:'',
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
      sharedWith: true,
      sharing: true,
      delete: true,
      download: true,
      multiselect: true,
      tagging: false,
      upload: false
    }
  });
})