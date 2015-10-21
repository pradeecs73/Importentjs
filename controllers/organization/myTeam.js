'use strict'
define(['app', 'text!templates/organization/myTeam.hbs', 'pages/peoplePage', 'httpClient', 'services/usersService', 'underscore', 'services/searchService', 'services/webExService', 'services/formallearning/learningPlanService', 'pages/learningPlan'],
    function (app, myTeamTemplate, peoplePageJs, httpClient, usersService, _, searchService, webExService, learningPlanService, learningPlan) {

        app.MyTeamController = Ember.ObjectController.extend(app.PeoplePopoverControllerMixin, {
            _currentView: 'list-view',
            queryParams: ['sortBy','sortOrder','pageNumber','searchText','filters','manageruniqueid','managerUserName'],
            sortBy: "shortName",
            sortOrder: 'asc',
            pageNumber: 1,
            searchText: "",
            filters: "",
            manageruniqueid: app.getUsername(),
            managerUserName: app.getShortname(),
            selectedUsers: [],
            buttonDisabled: true,
            anyUserSelected: false,
            selectedUsersLength: 0,
            showList: false,
            offlineError: false,
            _currentView: 'list-view',
            userNameAttribute: "username",
            pageName: "myTeam",
            
            
			plpSearchText: '',
            
			facetFilters: '',
			serachFilters: {},
			searchCriteria: '',
            
            selectedUsersNotAvailableError: false,
            allChecked: false,
            selectAll: false,
            keepUserSelection: false,
			learningPlanDate:"",
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

           managersearchBoxText: function () {
                return this.get('searchText')
            }.property('searchText'),

           loggedinmanager: function () {
             return (this.get('manageruniqueid') == app.getUsername());
           }.property("manageruniqueid"),

            isGridView: function () {
                return this.get('_currentView') === 'grid-view';
            }.property("_currentView"),
			
			searchHelper: function(response){
				var self = this;
				if (response.length) {
					self.set('plpList', response);
				} else {
					self.set("plpList", response);
				}
			},
			filterHelper: function() {
				var searchData = {
					'jobrole': this.get('serachFilter.jobrole') ? this.get('serachFilter.jobrole') : '',
					'skill': this.get('serachFilter.skill') ? this.get('serachFilter.skill') : '',
					'searchtext': this.get('plpSearchText') ? this.get('plpSearchText') : ''
				}
				this.set('searchCriteria', searchData);
			},

            destroyAllUserItems: function () {
                //Issues destroy command to all user items, to get rid of current user items,
                // as while paginating, new user items will be created
                // and the old ones will still remain and observe the ember events
                this.set("destroyYourself", true);
            },
            getAllUsers: function () {
                return this.get('model').allUsers;
            },

            observeSelectedUsersLength: function() {

              if (this.get('selectedUsersLength') === this.get('model.allUsers').length) {
                this.set('allChecked', true);  
              }

            }.observes('selectedUsersLength'),

            observeAllChecked: function() {

              if (!this.get('selectAll'))  {
                _.forEach(this.get('model.allUsers'), function(a) {
                  Ember.set(a, 'flag', this.get('allChecked'));
                }.bind(this));
              } else {
                this.set('selectAll',false);
              }

            }.observes("allChecked"), 


            observSelectAll: function () {
              if (this.get('selectAll')) {
                this.set('allChecked', false);
              }

            }.observes('selectAll'),

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
                        invitees: userJabberIDs
                    }
                    chatRooms.pushObject(roomInfo);
                },
                startWebExMeeting: function () {
                    var expertsDetails = _.map(this.selectedUsers, function (userInfo) {
                        return {
                            expertId: userInfo.shortName,
                            expertEmail: userInfo.name
                        };
                    });
                    webExService.instantMeeting(expertsDetails)
                },
                clearSelection: function () {
                    this.set("selectedUsers", []);
                    this.set("allChecked", false);
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
				 
                searchbytext: function () { 
                  this.set('searchText', this.get('managersearchBoxText'));
                  this.set('filters', '');
                  this.set('pageNumber', 1);
                  this.set('keepUserSelection', false);
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
                },
				facetFilter: function(facetFilters) {
					var self = this,
						model = this.get('model');
					this.set('facetFilters', facetFilters.join(';'));
					var filterData = this.get('facetFilters');
					learningPlan.filterBySkillsAndJobroles(model, filterData);
					this.set('serachFilters', model.serachFilters);
					self.filterHelper();
					var searchCriteria = self.get('searchCriteria');
					learningPlanService.fetchPrescribedLearningPlan(searchCriteria).then(function(response) {
						self.searchHelper(response);
					});
				},
				searchPrescribedLearningPlans: function() {
					var self = this;
					self.filterHelper();
					var searchCriteria = self.get('searchCriteria');
					learningPlanService.fetchPrescribedLearningPlan(searchCriteria).then(function(response) {
						self.searchHelper(response);
					}, function(err) {
					});
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
                    jQuery('#bttn-add-plp').attr('disabled', true);
                    jQuery('#multiselect').css('display', 'none');
                    
                } else {
                    this.set("anyUserSelected", true);
                    jQuery('#bttn-add-plp').attr('disabled', false);
                    jQuery('#multiselect').css('display', 'block');
                    peoplePageJs.initialize()
                }
                this.set("selectedUsersLength", this.selectedUsers.length);
            }.observes("selectedUsers.@each"),

            shouldAssignPLPs: function () {
                var checkboxesPLP = this.get('plpList') ? this.get('plpList') : [];
                this.set('buttonDisabled', true);
                for (var i = checkboxesPLP.length - 1; i >= 0; i--) {
                    if (checkboxesPLP[i].isSelected == true) {
                        this.set('buttonDisabled', false);
                        break;
                    } 
                };
            }.observes('plpList.@each.isSelected'),
            planId: ""
        });
        return app
    })
