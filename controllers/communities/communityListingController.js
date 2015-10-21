'use strict';

define(['app', 'pages/documentItems', 'text!templates/allCommunities.hbs','services/collaborationUtil','services/groupService','httpClient','Q'],
  function (app, documentItems, communityListing,collaborationUtil,groupService,httpClient,Q) {
	
	app.CommunityListingController = Ember.ObjectController.extend({
      requiredCloudletFilters: ['liked', 'followed', 'favorited', 'all'],
      _currentView: "list-view",
      queryParams: ['searchText', 'filters', 'filterType', 'pageNumber', 'sortBy', 'sortOrder'],
      searchText: '',
      filters: '',
      filterType: 'all',
      listingName: 'Communities',
      pageNumber: 1,
      sortBy: 'createdOn',
      sortOrder: 'desc',
      sortableFields:[
        {text: 'Name', value: 'name'},
        {text:'Created Date', value:'createdOn'},
        {text:'Category', value:'category.name'},
        {text:'# of Members', value:'membersCount'},
        {text:'Type', value:'type'}
      ],
      init: function () {
        if (!Ember.TEMPLATES["communityListing"]) {
          Ember.TEMPLATES["communityListing"] = Ember.Handlebars.template(Ember.Handlebars.precompile(communityListing));
        }
      },
      isUserHasAccessToCreate: false,
      searchBoxText: function () {
        return this.get('searchText')
      }.property('searchText'),

      routeName: function () {
    	collaborationUtil.setToggleDirection(this, '#sortCommunities');
        if (this.get("listingName") == "Communities")
          return "all";
        return "my"
      }.property('listingName'),

      isGridView: function () {
        return this.get('_currentView') == 'grid-view';
      }.property("_currentView"),
      isPublic: function () {
        var type = this.get('model').resource.type;
        return type == "public";
      }.property('model.resource'),
      
      actions: {
    	  changeSortedDataDirection: function(dropId){
    				this.send('getChangedFieldDirection',this.get('sortBy'));
    	  },
    	  getSortedData: function(fieldName,dropId){
    		  if (fieldName && fieldName != "") {
    			  this.set('sortBy',fieldName);
    			  this.send('getChangedFieldDirection', fieldName);
    		  }
    	  },
    	  getChangedFieldDirection:function(fieldName){
    		  $("#communitiesSortingDropdownId li a").removeClass("selected");
              if(fieldName=='category.name'){
              	fieldName=fieldName.split('.')[0];
              }
              $("#"+fieldName).addClass("selected");
    	  },
    	  toggleTile: function (communityId) {
    		  documentItems.toggleTile(communityId);
    	  },
    	  filter: function (filters) {
    		  this.set('filters', filters.join(';'));
    		  this.set('pageNumber', 1);
    	  },
    	  search: function () {
    		  this.set('searchText', this.get('searchBoxText'))
    		  this.set('filters', '')
    		  this.set('pageNumber', 1);
    	  },
    	  gotoPage: function (pageValue) {
    		  this.set('pageNumber', pageValue)
    	  },
        toggleSortOrder: function(){
          if(this.sortOrder == 'asc') this.set('sortOrder', 'desc');
          else this.set('sortOrder', 'asc')
        },
        updateSortBy: function(sortByField) {
            this.set('sortBy', sortByField);
        },
    	  cloudletFilter: function (selectedfilter) {
    		  this.set("filterType", selectedfilter);
    		  this.set('pageNumber', 1)
    	  }
      }
    });
  });
