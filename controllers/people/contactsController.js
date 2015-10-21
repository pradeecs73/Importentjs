'use strict'

define(['app', 'text!templates/people/contacts.hbs', 'pages/documentItems', 'pages/peoplePage', 'httpClient', 'services/usersService', 'underscore', 'services/searchService', 'services/webExService', 'services/tenantService'],
    function (app, contactsTemplate, documentItems, peoplePageJs, httpClient, usersService, _, searchService, webExService, tenantService) {

    Ember.RadioButton = Ember.View.extend({
        tagName: "input",
        type: "radio",
        attributeBindings: ["name", "type", "value", "checked:checked:"],
        click: function() {
            this.set("selection", this.$().val())
        },
        checked: function() {
            return this.get("value") == this.get("selection");
        }.property(),

        updateValue: function() {
            if (this.get('selection') == this.$().val()) {
                return this.set('checked', true);
            }
            return this.set('checked', false);
        }.observes('selection')
    });

        app.ContactsView = Ember.View.extend({
            template: Ember.Handlebars.compile(contactsTemplate),
            didInsertElement: function () {
                 if(this.controller.filterType == 'all'){
                    jQuery(".views-filter").find("input").first().prop("checked","checked");
                }
                Ember.run.scheduleOnce('afterRender', this, 'renderFavoritePlugin');
            },
            onCloudletActivity: function (activityType) {
                var model = this.controller.get('model');
                var usersList = model.allUsers;
                var user = _.findWhere(usersList, {username :activityType.entityId });
                if(user){
	                   var streamDataContract = null;
	            	   streamDataContract = new activityStream.StreamDataContract(activityType.entityId, 'USER');
	                   streamDataContract.title = user.shortName;
	                   streamDataContract.resourceUrl = "/#/user/" + activityType.entityId;
	                   streamDataContract.authorUserName = activityType.entityId;
	                   streamDataContract.verb = 'follow';
	                   activityStream.pushToStream(streamDataContract);
                }	
            },
            willClearRender: function() {
                this.controller.set('searchText','')
                this.controller.set('searchBoxText','')
            } ,
          toggleView: function (view) {
            this.controller.set('_currentView', view);
          }
        })

        app.ContactsRoute = Ember.Route.extend({

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
                keepUserSelection: {
                    refreshModel: true
                },
                sortBy: {
                    refreshModel: true
                },
                sortOrder: {
                  refreshModel: true
                }
            },

        renderTemplate: function() {
              this.render()
              var model = this.modelFor('contacts')
              if(model && model.length == 0) {
                this.render("noData")
              }
            },

            model: function (queryParams) {
                if(queryParams.filterType == 'all'){
					$('.sorting-dropdown').removeClass('hide');
                    var filters = queryParams.filters ? queryParams.filters.split(";") : [];

                    var searchText = queryParams.searchText && queryParams.searchText.length > 0 ? queryParams.searchText : "*";
                    var sortBy = queryParams.sortBy ? queryParams.sortBy : (searchText != "*" ? "relevance" : "shortName");
                    var sortOrder = queryParams.sortOrder ? queryParams.sortOrder : 'asc';
                    var pageNumber = (queryParams.pageNumber && queryParams.pageNumber > 0)? queryParams.pageNumber : 1;
                    return usersService.allUsersWithFilters(searchText, filters, false, pageNumber, false, sortBy, sortOrder);                    
                }else{
					$('.sorting-dropdown').addClass('hide');
                    var entityType = "users";
                    var pluginType = "followed";
                    return usersService.getFollowedUsersDataFromCloudlet(this, pluginType, entityType, queryParams).then(function(results){
                        return results;
                    }).fail(function(err){
                        Ember.Logger.error("Issues in setting total results count for pagination. " + err);
                    });                
				}

            },
            afterModel: function () {
                if (this.controller && !(this.controller.get('keepUserSelection')))
                    this.controller.send("clearSelection")
            }
        });

        app.ContactsController = Ember.ObjectController.extend(app.PeoplePopoverControllerMixin, {
            selectedUsers: [],
            anyUserSelected: false,
            selectedUsersLength: 0,
            showList: false,
            offlineError: false,
            _currentView: 'list-view',
            userNameAttribute: "username",

            queryParams: ['searchText', 'filters', 'filterType', 'pageNumber', 'keepUserSelection', 'sortBy', 'sortOrder'],
            searchText: '',
            filters: '',
            filterType: 'all',
            pageNumber:1,
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

          filter: "",
          filterSelected: function() {
            var self = this;
            var filter = self.get("filter");
            if(this.get('content').allUsers){
                this.get('content').allUsers.clear();
            }
            var model = self.get('model');           

            if (filter == "all") {                
                this.controllerFor('application').set('currentPath', "people.contacts");
                self.setFilterData("all");
            } else if (filter == "my") {
                this.controllerFor('application').set('currentPath', "people.contacts");
                self.setFilterData("my");
            }
        }.observes('filter'),

        setFilterData : function(type) {
            this.get('model').status = '';
            this.set("filterType", type);
            this.set("searchText", "");
            this.set('pageNumber', 1)
        },

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

            searchBoxText: function () {
                return this.get('searchText')
            }.property('searchText'),

            isGridView: function () {
                return this.get('_currentView') === 'grid-view';
            }.property("_currentView"),

            destroyAllUserItems: function() {
                //Issues destroy command to all user items, to get rid of current user items,
                // as while paginating, new user items will be created
                // and the old ones will still remain and observe the ember events
                this.set("destroyYourself", true);
            },
            getAllUsers: function() {
                return this.get('model').allUsers;
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
