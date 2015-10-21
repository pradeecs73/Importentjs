"use strict";

define(["app", 'services/searchService', 'services/expertiseService'],
  function(app, searchService, expertiseService) {
    App.UserManagementUsersController = Ember.ArrayController.extend({
      itemController: 'userItem',
      expertise: null,
      isMobile: function() {
          return app.isMobile();
      }.property(),
      expertiseAutoSuggest: function() {
        return expertiseService.expertiseAutoSuggest();
      }.property(),
      roles: null,
      selfdeleteexpertise:[],
      allFacets: {},
      deleteexpertise:[],
      addadminexpertise:[],
      queryParams: ['searchText', 'filters', 'pageNumber','sortBy', 'sortOrder'],
      searchText: '',
      filters: '',
      pageNumber: 1,
      sortBy: 'shortName',
      sortOrder: 'asc',
      sortableFields:[
        {text:'User Name', value:'username'},
        {text:'Job Title', value:'jobTitle'},
        {text:'Last Login', value:'loginDate'},
        {text:'Data Modified', value:'lastUpdated'},
        {text:'Data Created', value:'onBoardingDate'},
        {text:'Full Name', value:'fullName'}
      ],
      sortableFieldsWithRelevance:[
        {text:'User Name', value:'username'},
        {text:'Job Title', value:'jobTitle'},
        {text:'Relevance', value:'relevance'},
        {text:'Last Login', value:'loginDate'},
        {text:'Data Modified', value:'lastUpdated'},
        {text:'Data Created', value:'onBoardingDate'},
        {text:'Full Name', value:'fullName'}
      ],


      searchBoxText: function() {
        return this.get('searchText')
      }.property('searchText'),

      allRolesLoaded: function() {
        return (this.get('roles') != null);
      }.property('roles'),

      usersNotLoaded: function() {
        //Looking for loading of users using a controller property
        return (_.isEmpty(this.get("model")));
      }.property("model"),

      hasSearchText: function() {
        return this.get('searchText') != ""
      }.property("searchText"),

      activeMessage: function () {
        return this.get("model")["active"] ? "" : "This user is Inactive"
      }.property("model"),

      actions:{
        filter: function (filters) {
          this.set('filters', filters.join(';'));
          this.set('pageNumber', 1)
        },
        search: function () {
           this.set('searchText', this.get('searchBoxText'))
           this.set('filters', '')
           this.set('pageNumber', 1)
           this.set('keepUserSelection', false)
          this.set('sortBy', this.get('hasSearchText') ? 'relevance' : "shortName")
          if(this.get('hasSearchText')){
            this.set('sortOrder', 'asc')
          }
        },
        gotoPage: function (pageValue) {
            this.set('pageNumber', pageValue)
        },
        updateSortBy: function(sortByField) {
          this.set('sortBy', sortByField);
        },
        toggleSortOrder: function(){
          if(this.sortOrder == 'asc') this.set('sortOrder', 'desc');
          else this.set('sortOrder', 'asc')
        }

      }

    });

    return app;
  });
