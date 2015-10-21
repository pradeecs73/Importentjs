'use strict'
define(['app', 'text!templates/organization/myTeam.hbs', 'pages/peoplePage', 'httpClient', 'services/usersService', 'services/formallearning/learningPlanService', 'underscore', 'services/searchService','services/webExService', 'services/formallearning/courseService'],
    function (app, myTeamTemplate, peoplePageJs, httpClient, usersService, learningPlanService, _, searchService, webExService, courseService) {

        app.MyTeamRoute = Ember.Route.extend({
            queryParams: { 
                sortBy: {
                 refreshModel: true
                },	 
                sortOrder: {
                  refreshModel: true
                },
                pageNumber: {
                  refreshModel: true
                },
                manageruniqueid: {
                  refreshModel: true
                },
                searchText: {
                    refreshModel: true
                },
                filters: {
                    refreshModel: true
                },
                keepUserSelection: {
                    refreshModel: true
                }
            },

            renderTemplate: function () {
                this.render()
                var model = this.modelFor('contacts')
                if (model && model.length == 0) {
                    this.render("noData")
                }
            },
			
			setupController: function(controller, model) {
				controller.set('model', model);
				var skillsAndJobroles = {
                    JobRoles : _.pluck(JSON.parse(sessionStorage.getItem('jobRoles')), "name"),
					Skills: _.pluck(JSON.parse(sessionStorage.getItem('skills')), "name")
                };
				controller.set('serachFilters', skillsAndJobroles);
				App.DateUtil.setDateToLearningPlan(controller);
			},

            model: function (queryParams) {
                this.controllerFor('myTeam').set("managerUserName", queryParams.managerUserName);
                this.controllerFor('application').set("currentPath", queryParams.manageruniqueid);
                var managerid=queryParams.manageruniqueid;
                var filters = queryParams.filters ? queryParams.filters.split(";") : [];
                var searchText = queryParams.searchText && queryParams.searchText.length > 0 ? queryParams.searchText : "*";
                var sortBy = queryParams.sortBy ? queryParams.sortBy : (searchText != "*" ? "relevance" : "shortName");
                var sortOrder = queryParams.sortOrder ? queryParams.sortOrder : 'asc';
                var pageNumber = (queryParams.pageNumber && queryParams.pageNumber > 0)? queryParams.pageNumber : 1;
                return usersService.managerTeamWithFilters(searchText, filters, false, pageNumber, false, sortBy, sortOrder, managerid);
            },
            afterModel: function () {
                if (this.controller && !(this.controller.get('keepUserSelection')))
                    this.controller.send("clearSelection")
            },

            actions: {
                openPlpModelPopup: function () {
                    var self = this,
                        controller = self.controller,
                        anyUserSelected = controller.get("anyUserSelected");
                    var isAPICalled = controller.get("isAPICalled");
					jQuery('#myTeamError').hide();
                    if (anyUserSelected) {
                        var model = self.controller.get("model");
						var serachFilter = {
							"jobrole": '',
							"skill": '',
							"searchtext": ''
						};
                        if (!isAPICalled) {
                            learningPlanService.fetchPrescribedLearningPlan(serachFilter).then(function (availablePLP) {
                                controller.set("isAPICalled", true);
                                if (availablePLP && availablePLP.length > 0) {
                                    controller.set("numPLP", availablePLP.length);
                                    availablePLP.forEach(function (plp) {
                                        plp.isSelected = false;
                                    });
                                }
                                controller.set("plpList", availablePLP);
                                localStorage.setItem("plpList", JSON.stringify(availablePLP));
                            })
                        }
                    }
                },
                assignPLPsToUsers: function () {
                    var controller = this.controller,
						self = this,
                        selectedUsers = controller.get("selectedUsers"),
                        plpList = controller.get("plpList"),
                        selectedPLPIds = [], selectedUserIds = [], selectedUserEmail = [], selectedPLPList = [];

                    plpList.forEach(function (plp) {
                        if (plp.isSelected) {
                            selectedPLPIds.push(plp.id);
                            selectedPLPList.push({id: plp.id, name: plp.name});
                        }
                    });

                    selectedUsers.forEach(function (user) {
                        selectedUserEmail.push(user.username);
                    })

					var completedByDate = controller.get("learningPlanDate"),
					currentDate = app.todayDateinUnix;
					jQuery('#myTeamError').hide();	
					
					if(completedByDate == ""){
						var newCompletedByDate = false;
					}else{
						var date = App.DateUtil.formatInputDateWithGmt(completedByDate);
						if (date < currentDate) {
							var newCompletedByDate = false;
						}else{
							var newCompletedByDate = true;
						}
					}
					if(newCompletedByDate){
						learningPlanService.prescribeLearningPlanToUser(selectedUserEmail, selectedPLPIds, App.DateUtil.formatGmtDateToNormal(date)).
							then(function (response) {
								var plpAssignResult = response ? response : [],
									assignedPLPs = [];
								plpAssignResult.forEach(function (plp) {
									var plpId = _.findWhere(selectedPLPList, {id: plp.planId});
									if (plp.assignStatus) {
										assignedPLPs.push({name: plpId.name, status: true});
									} else {
										assignedPLPs.push({name: plpId.name, status: false});
									}
								});
								controller.set("assignedPLPsCount", assignedPLPs.length);
								controller.set("assignedPLPs", assignedPLPs);
								jQuery('#addPrescribedModal').modal('hide');
								jQuery('#myAddPrescribedSuccessModal').modal('show');
								$('.manager-plp-checkbox input[type=checkbox]').attr('checked',false);
							});
					}else{
						jQuery('#myTeamError').show();
						return;
					}
                },
				clearAssignedPLP: function() {
					this.controllerFor('myTeam').setProperties ({
						'model.assignedPLPs': [],
						'buttonDisabled': true
					});
					var plpList = this.controllerFor('myTeam').get('model.plpList');
					plpList.forEach(function (plp) {
						if(plp.isSelected){
							plp.isSelected = false;
						}
					});
				}
            }
        });
        return app
    })
