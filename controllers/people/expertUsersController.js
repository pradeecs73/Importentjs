'use strict'

define(['app', 'text!templates/people/expertUsers.hbs', 'pages/documentItems', 'pages/peoplePage', 'httpClient', 'services/usersService', 'underscore', 'services/searchService', 'services/webExService'],
  function (app, expertsTemplate, documentItems, peoplePageJs, httpClient, usersService, _, searchService, webExService) {

    app.ExpertUsersView = Ember.View.extend({
      template: Ember.Handlebars.compile(expertsTemplate),
      didInsertElement: function () {
        Ember.run.scheduleOnce('afterRender', this, 'renderFavoritePlugin');
      },

      onCloudletActivity: function (activityType) {
        var userList = this.controller.get('model');
        var streamDataContract = null;
        _.each(userList, function (user) {
          if (user.username == activityType.entityId) {
            streamDataContract = new activityStream.StreamDataContract(activityType.entityId, 'USER');
            streamDataContract.title = user.shortName;
            streamDataContract.resourceUrl = "/#/user/" + activityType.entityId;
            streamDataContract.authorUserName = activityType.entityId;
            streamDataContract.verb = 'follow';
          }
        });
        activityStream.pushToStream(streamDataContract);
      },
      willClearRender: function() {
        this.controller.set('searchText','')
      },

      toggleView: function (view) {
        this.controller.set('_currentView', view);
      }
    })

    app.ExpertUsersRoute = Ember.Route.extend({
      controllerName: 'expertUsers',
      queryParams: {
        searchText: {
          refreshModel: true
        },
        filters: {
          refreshModel: true
        },
          pageNumber: {
              refreshModel:true
          },
          keepUserSelection: {
              refreshModel: true
          },
        sortBy: {
          refreshModel:true
        },
        sortOrder: {
          refreshModel: true
        }
      },

      renderTemplate: function() {
        this.render()
        var model = this.modelFor('experts')
        if(model && model.length == 0) {
          this.render("noData")
        }
      },
      setProperties: function(key,val){
        this.controllerFor('expertUsers').set(key,val);
      },
      model: function (queryParams) {
        var self = this
        _.each(queryParams, function(val, key){
          self.setProperties(key,val);
        })
        var filters = queryParams.filters ? queryParams.filters.split(";") : [];

        var searchText = queryParams.searchText && queryParams.searchText.length > 0 ? queryParams.searchText : "*";
        var pageNumber = (queryParams.pageNumber && queryParams.pageNumber > 0) ? queryParams.pageNumber : 1;
        var sortBy = queryParams.sortBy ? queryParams.sortBy : (searchText != "*" ? "relevance" : "shortName");
        var sortOrder = queryParams.sortOrder ? queryParams.sortOrder : 'asc';

        return usersService.expertUsersWithFilters(searchText, filters,pageNumber, sortBy, sortOrder);
      },
      afterModel: function () {
        if (this.controller && !(this.controller.get('keepUserSelection')))
          this.controller.send("clearSelection")
      }
    });

    app.ExpertUsersController = Ember.ObjectController.extend(app.PeoplePopoverControllerMixin, {
      selectedUsers: [],
      anyUserSelected: false,
      selectedUsersLength: 0,
      showList: false,
      userNameAttribute: "username",
      offlineError: false,
      searchBoxText:'',
      _currentView: 'list-view',
      queryParams: ['searchText', 'filters', 'pageNumber', 'keepUserSelection', 'sortBy', 'sortOrder'],
      searchText: '',
      filters: '',
        pageNumber: 1,
        selectedUsersNotAvailableError: false,
        keepUserSelection: false,
      sortBy: 'shortName',
      sortOrder: 'asc',
      sortableFields:[
        {text:'Name', value:'shortName'},
        {text:'Job Title', value:'jobTitle'},
        {text:'Location', value:'city'},
        {text:'Organization', value:'organization'}
      ],
      sortableFieldsWithRelevance:[
        {text:'Name', value:'shortName'},
        {text:'Job Title', value:'jobTitle'},
        {text:'Location', value:'city'},
        {text:'Organization', value:'organization'},
        {text:'Relevance', value:'relevance'}
      ],

        selectedUsersNotAvailable: function () {
        var areAllUsersAvailable = true;
        _.each(this.selectedUsers, function (user) {
          areAllUsersAvailable = areAllUsersAvailable && user.isAvailable;
        });
        return !areAllUsersAvailable;
      },
      selectedUsersWithoutJabberId: function () {
        var areJabberIDsAvailable = true;
        _.each(this.selectedUsers, function (user) {
          areJabberIDsAvailable = areJabberIDsAvailable && (user.jabberUsername? true: false);
        });
        return !areJabberIDsAvailable;
      },
        getAllUsers: function() {
            return this.get('model').allUsers;
        },
      searchBoxTextObserver: function () {
        this.controllerFor("expertUsers").set("searchBoxText",this.get('searchText'))
      }.observes('searchText'),

      isGridView: function () {
        return this.get('_currentView') == 'grid-view';
      }.property("_currentView"),

        destroyAllUserItems: function() {
            //Issues destroy command to all user items, to get rid of current user items,
            // as while paginating, new user items will be created
            // and the old ones will still remain and observe the ember events
            this.set("destroyYourself", true);
        },
      hasSearchText: function() {
        return this.get('searchText') != ""
      }.property("searchText"),

      actions: {
        gotoPage: function (pageValue) {
            this.destroyAllUserItems();
            this.set('pageNumber', pageValue)
            this.set('keepUserSelection', true)
        },
        startGroupChat: function () {
          var self = this;
          if (app.getMyJabberStatus() === "offline") {
            this.set("offlineError", true)
            setTimeout(function () {
              self.set("offlineError", false)
            }, 5000)
            return
          }
          var selectedUsersWithoutJabberIds = this.selectedUsersWithoutJabberId();
          if(selectedUsersWithoutJabberIds){
            this.set("selectedUsersNotAvailableError", selectedUsersWithoutJabberIds);
            setTimeout(function () {
              self.set("selectedUsersNotAvailableError", false)
            }, 5000)
          }
          var selectedUsersNotAvailable = this.selectedUsersNotAvailable();
          if (selectedUsersNotAvailable) {
            this.set("selectedUsersNotAvailableError", selectedUsersNotAvailable);
            setTimeout(function () {
              self.set("selectedUsersNotAvailableError", false)
            }, 5000)
          }
          var chatRooms = this.controllerFor('application').get('chatRooms');
          var userJabberIDs = _.map(this.selectedUsers, function (userInfo) {
            return userInfo.jabberUsername;
          });
          var roomInfo = {
            invitees: userJabberIDs,
            active: true
          }
          chatRooms.pushObject(roomInfo);
        },
        startWebExMeeting: function(){
          var expertsDetails =  _.map(this.selectedUsers, function (userInfo) {
            return {
              expertId: userInfo.shortName,
              expertEmail: userInfo.email
            };
          });
          webExService.instantMeeting(expertsDetails)
        },
        clearSelection: function () {
          this.set("selectedUsers", []);
          this.set("selectedUsersNotAvailableError", false);
          this.set("offlineError", false);
          this.set("showList", false);
        },
        toggleViewSelectedUsers: function () {
          var showList = this.get("showList");
          this.set("showList", !showList);
        },
        unselectUser: function (id) {
            var selectedUser = _.find(this.selectedUsers, function (selectedUser) {
                return (selectedUser.id === id);
            });
            this.selectedUsers.removeObject(selectedUser);
        },
        filter: function (filters) {
          this.set('filters', filters.join(';'));
          this.set('pageNumber', 1)
          this.set('keepUserSelection', false)
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
        updateSortBy: function(sortByField) {
          this.set('sortBy', sortByField);
        },
        toggleSortOrder: function(){
          if(this.sortOrder == 'asc') this.set('sortOrder', 'desc');
          else this.set('sortOrder', 'asc')
        }

      },

      isLocationCommaSeparator: function () {
        var model = this.get('model');
        return (model.location.city && model.location.country)
      }.property(),

      observeSelectedUsers: function () {
        if (this.selectedUsers.length === 0) {
          this.set("showList", false);
          this.set("anyUserSelected", false);
        } else {
          this.set("anyUserSelected", true);
          peoplePageJs.initialize()
        }
        this.set("selectedUsersLength", this.selectedUsers.length);
      }.observes("selectedUsers.@each")

    });

    return app
  })
