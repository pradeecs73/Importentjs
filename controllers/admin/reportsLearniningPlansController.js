"use strict";

define(["../../app", 'services/formallearning/learningPlanService', 'text!templates/formallearning/adminLearningPlan.hbs', 'httpClient', 'services/usersService', 'services/formallearning/courseService','Q', 'emberPageble','controllers/utils/dateUtil', "pages/learningPlan", 'services/entitlementService'],
    function (app, learningPlanService, adminLearningPlanTemplate, httpClient, usersService, courseService, Q, emberPageble, dateUtil, pageLearningPlan, entitlementService) {

	App.then(function (app) {
			var self = this;
			courseService.getCourseFilters().then(function (filters) {
				sessionStorage.setItem("categories", JSON.stringify(filters.categories ? filters.categories : ""));
				sessionStorage.setItem("types", JSON.stringify(filters.types ? filters.types : ""));
				sessionStorage.setItem("locations", JSON.stringify(filters.locations ? filters.locations : ""));
				sessionStorage.setItem("jobRoles", JSON.stringify(filters.jobRoles ? filters.jobRoles : ""));
				sessionStorage.setItem("skills", JSON.stringify(filters.skills ? filters.skills : ""));
				sessionStorage.setItem("plpTypes", JSON.stringify(["Prescribed", "Individual"]));
			}, function (err) {
				sessionStorage.setItem("categories", JSON.stringify([]));
				sessionStorage.setItem("types", JSON.stringify([]));
				sessionStorage.setItem("locations", JSON.stringify([]));
				sessionStorage.setItem("jobRoles", JSON.stringify([]));
				sessionStorage.setItem("skills", JSON.stringify([]));
				sessionStorage.setItem("plpTypes", JSON.stringify([]));
			});
			usersService.allUsersWithFilters("*", [], false, 1, false, "", 'asc').then(function (userSearchFilters){
				sessionStorage.setItem("cities", JSON.stringify(userSearchFilters.allFacets.city ? userSearchFilters.allFacets.city : ""));
				sessionStorage.setItem("organizations", JSON.stringify(userSearchFilters.allFacets.organization ? userSearchFilters.allFacets.organization : ""));
				sessionStorage.setItem("jobTitles", JSON.stringify(userSearchFilters.allFacets.jobTitle ? userSearchFilters.allFacets.jobTitle : ""));
				sessionStorage.setItem("managerId", JSON.stringify(userSearchFilters.allFacets.managerId ? userSearchFilters.allFacets.managerId : ""));
			}, function (err) {
				sessionStorage.setItem("cities", JSON.stringify([]));
				sessionStorage.setItem("organizations", JSON.stringify([]));
				sessionStorage.setItem("jobTitles", JSON.stringify([]));
				sessionStorage.setItem("managerId", JSON.stringify([]));
			});
		});

		app.ReportsLearningPlanView = Ember.View.extend({
			template: Ember.Handlebars.compile(adminLearningPlanTemplate)
		}); 

		app.ReportsLearningPlanRoute = Ember.Route.extend({
		    renderTemplate: function() {
                var self = this
                this.render()
				var permissionType = "viewAdminReports";
                usersService.hasPermission(permissionType).then(function (response) {
                    if(!response.length) self.render("notAllowed"); 
                })
            },
            queryParams: {
                pageNumber: {
                    refreshModel: true
                },
				keyword: {
					refreshModel: true
				},
                filters: {
                    refreshModel: true
                }
            },
 			setProperties: function(key, val) {
                this.controllerFor('reportsLearningPlan').set(key, val);
            },
			setupController: function(controller, model) {
				controller.set('model', model);
                var allFacets = {
					Type: JSON.parse(sessionStorage.getItem('plpTypes')),
                    jobTitle: JSON.parse(sessionStorage.getItem('jobTitles')),
                    organization: JSON.parse(sessionStorage.getItem('organizations')),
					managerId: JSON.parse(sessionStorage.getItem('managerId'))
                }
				controller.set("allFacets", allFacets);
				controller.learningPlans.set("currentPage", 1);
				controller.set('model', model);
				controller.set("totalResults", model.learningPlans.plpCount);
				controller.set('learningPlans.data', model.learningPlans.learningPlans);
			},
			model: function(queryParams) {
				 var self = this;
				 var model = Ember.Object.create({
					"learningPlans": {learningPlans:[], plpCount:0}
				 });
				_.each(queryParams, function(val, key) {
					self.setProperties(key, val);
				});
				
				var startDate = this.controllerFor('reportsLearningPlan').get("startDate"),
                    endDate = this.controllerFor('reportsLearningPlan').get("endDate");
				var dates = App.DateUtil.getGMTStartDateAndEndDate(startDate, endDate);
				queryParams["startDate"] = dates["startDate"];
				queryParams["endDate"] = dates["endDate"];
				queryParams["type"] = this.controllerFor('reportsLearningPlan').get("searchTermType") ? this.controllerFor('reportsLearningPlan').get("searchTermType") : "";
				queryParams["manager"] = this.controllerFor('reportsLearningPlan').get("managerSearchTerm") ? this.controllerFor('reportsLearningPlan').get("managerSearchTerm") : "";
				queryParams["jobTitle"] = this.controllerFor('reportsLearningPlan').get("jobTitleSearchTerm") ? this.controllerFor('reportsLearningPlan').get("jobTitleSearchTerm") : "";
				queryParams["organization"] = this.controllerFor('reportsLearningPlan').get("organizationSearchTerm") ? this.controllerFor('reportsLearningPlan').get("organizationSearchTerm") : "";
				return learningPlanService.getLearningPlanReport(queryParams).then(function(learningPlans) {
					var model = Ember.Object.create({
						"learningPlans": learningPlans
					});
					 return model;
				}, function(error) {
				  return model;
				});
			}
		});

		app.ReportsLearningPlanController = Ember.ObjectController.extend({
			queryParams: ['pageNumber'],
			pageNumber: 1,
			filters: '',
			startDate: '',
            endDate: '',
			learningPlans: Ember.ArrayController.createWithMixins(VG.Mixins.Pageable, {
				perPage: app.PageSize
			}),
            filterSelected: function (courses, filters, allFacets) {
				App.DateUtil.searchFilterSelected(courses, allFacets, false, false, true, true);
                var self = this,
                    typeArr = courses.content.get('typeArr'),
					startDate = this.controllerFor('reportsLearningPlan').get("startDate"),
                    endDate = this.controllerFor('reportsLearningPlan').get("endDate"),
					managerArr = courses.content.get('managerArr'),
					jobTitleArr = courses.content.get('jobTitleArr'),
					organizationArr = courses.content.get('organizationArr');
				var dates = App.DateUtil.getGMTStartDateAndEndDate(startDate, endDate);
				if(typeArr.length == 2){typeArr = ["all"]}
				var searchCriteria = {
                    "type": typeArr.join(','),
                    "pageNumber": 1,
					"startDate": dates["startDate"],
					"endDate": dates["endDate"],
					"manager": managerArr.join(','),
					"jobTitle": jobTitleArr.join(','),
					"organization": organizationArr.join(',')
				};				
				self.set('searchTermType', searchCriteria.type);
				self.set('managerSearchTerm', searchCriteria.manager);
				self.set('jobTitleSearchTerm', searchCriteria.jobTitle);
				self.set('organizationSearchTerm', searchCriteria.organization);
				return learningPlanService.getLearningPlanReport(searchCriteria).then(function(response) {
					self.learningPlans.set("currentPage", 1);
					self.set("totalResults", response.plpCount);
					self.set('learningPlans.data', response.learningPlans);
					self.get("model").learningPlans = response.learningPlans;
					self.set('pageNumber', 1);
				});
            }.observes('filters'),
            managerSearchTerm: "",
            jobTitleSearchTerm: "",
			organizationSearchTerm:"",
            searchTermType: "",
            searchFilters: {
                "limitTo": 2,
                "limitFrom": 0,
			    "startDate" : "",
			    "endDate" : "",
				"type": "",
				"manager": "",
				"jobTitle": "",
				"organization": ""
            },
            setSearchFilters: function () {
                var searchFilters = {
                    "type": this.get('searchTermType'),
                    "limitTo": 2,
                    "limitFrom": 0,
					"manager": this.get('managerSearchTerm'),
					"jobTitle": this.get('jobTitleSearchTerm'),
					"organization": this.get('organizationSearchTerm')
                };
				var startDate = this.controllerFor('reportsLearningPlan').get("startDate")? this.controllerFor('reportsLearningPlan').get("startDate") : "",
                    endDate = this.controllerFor('reportsLearningPlan').get("endDate") ? this.controllerFor('reportsLearningPlan').get("endDate"): "";
				var dates = App.DateUtil.getGMTStartDateAndEndDate(startDate, endDate);
				searchFilters["startDate"] = dates["startDate"];
				searchFilters["endDate"] = dates["endDate"];
                this.set("searchFilters", searchFilters);
            }.observes("searchText", "startDate", "endDate", "managerSearchTerm", "jobTitleSearchTerm", "organizationSearchTerm"),
            getLearningPlans: function (searchFilters) {
                return learningPlanService.getLearningPlanReport(searchFilters);
            },
            formatCourseJSON: function (JSONData) {
                var formattedJSON = [];
                var formatDate = function (dateVal) {
                    var dateGMT = new Date(dateVal * 1000);
					return dateGMT.toUTCString().substring(4, dateGMT.length);
                };

                JSONData.forEach(function (plp) {
                    var learningPlanItems = plp["learningPlanItems"],
						shortName = plp["firstName"] + " " + plp["lastName"];
                    pageLearningPlan.prescribedLearningPlanStatus(plp);
					if(learningPlanItems.length != 0){
						learningPlanItems.forEach(function (learningPlanItem) {
							var learningPlanItemDetails = {
								"Name of Learning Plan": plp["name"],
								"Type of Plan": plp["Type"],
								"Name of Assignee": plp["assignedBy"] == "Self" ? "Self" + " " + "(" + shortName + ")" : plp["assignedBy"] || plp["assignedBy"] == "Individual" ?  shortName : plp["assignedBy"],
								"Learning Plan Status": plp["status"],
								"Course Name": learningPlanItem.fullName ? learningPlanItem.fullName : learningPlanItem.taskDesc,
								"Delivery Type": learningPlanItem.courseType ? learningPlanItem.courseType : "Task",
								"Score": learningPlanItem.score ? learningPlanItem.score : 'No Score',
								"Manager Approval": plp["managerApproval"]
							}
							if (learningPlanItem.sessions.length > 0) {
								learningPlanItem.sessions.forEach(function (session) {
									var learningPlanItemSessionDetails = _.extend({},learningPlanItemDetails);
									learningPlanItemSessionDetails = _.extend(learningPlanItemSessionDetails, {
										"Completion Status": learningPlanItem.courseCompleted,
										"Enrolment Date": learningPlanItem.enrolDate ? formatDate(learningPlanItem.enrolDate) : 'NA',
										"Session Name": session.title,
										"Session Start Date": session.startDate ? formatDate(session.startDate) : 'No start date',
										"Session End Date": session.endEnd ? formatDate(session.endEnd) : 'No end date'
									});
									formattedJSON.push(learningPlanItemSessionDetails);
								});
							} else {
								_.extend(learningPlanItemDetails, {
									"Completion Status": learningPlanItem.courseCompleted,
									"Enrolment Date": learningPlanItem.enrolDate ? formatDate(learningPlanItem.enrolDate) : 'NA',
									"Session Name": "NA",
									"Session Start Date": "NA",
									"Session End Date": "NA"
								});
								formattedJSON.push(learningPlanItemDetails);
							}
						});
					}else{
                        formattedJSON.push({"Name of Learning Plan": plp["name"], 
					   "Type of Plan": plp["Type"] ? plp["Type"] : 'No Type', 
					   "Name of Assignee": plp["assignedBy"] == "Self" ? "Self" + " " + "(" + shortName + ")" : plp["assignedBy"] || plp["assignedBy"] == "Individual" ?  shortName : plp["assignedBy"],
					   "Completion Goal": formatDate(plp["completeByDate"]), "Learning Plan Status": plp["status"], "Course Name": "NA","Delivery Type": "NA", "Score": "NA", "Manager Approval":plp["managerApproval"], "Completion Status": "NA", "Enrolment Date": "NA", "Session Name": "NA", "Session Start Date": "NA", "Session End Date": "NA"});
					}
                });
                return formattedJSON;
            },
			actions:{
				gotoPage: function (pageValue) {
                    this.set('pageNumber', pageValue)
                },
                filter: function (filters) {
                    this.set('filters', filters.join(';'));
                    this.set('pageNumber', 1);
                },
                searchLearningPlans: function () {
                    var self = this,
						dates = App.DateUtil.validateStartDateAndEndDate(this.get('startDate'), this.get('endDate')),
						learningPlanQuery = {
							"type": self.get('searchTermType'),
							'limitTo':app.PageSize,
							"manager": self.get('managerSearchTerm'),
							"jobTitle": self.get('jobTitleSearchTerm'),
							"organization": self.get('organizationSearchTerm'),
							"startDate": dates["startDate"],
							"endDate": dates["endDate"]
						};
                    learningPlanService.getLearningPlanReport(learningPlanQuery).then(function (response) {
                        self.setProperties({
                            'model.learningPlans': response.learningPlans,
                            'learningPlans.data' : response.learningPlans,
                            'learningPlans.currentPage': 1,
                            'pageNumber': 1,
                            'status': status,
                            "totalResults": response.plpCount
                        });
                    });
                }
			}
		});

    });