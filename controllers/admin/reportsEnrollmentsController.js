"use strict";

define(["../../app", 'services/formallearning/learningPlanService', 'text!templates/formallearning/adminReportsEnrolment.hbs', 'httpClient', 'services/usersService', 'services/formallearning/courseService','Q', 'emberPageble','controllers/utils/dateUtil', "pages/learningPlan", 'services/entitlementService'],
    function (app, learningPlanService, adminLearnerTemplate, httpClient, usersService, courseService, Q, emberPageble, dateUtil, pageLearningPlan, entitlementService) {

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

		app.ReportsEnrollmentView = Ember.View.extend({
			template: Ember.Handlebars.compile(adminLearnerTemplate)
		}); 

		app.ReportsEnrollmentRoute = Ember.Route.extend({
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
                this.controllerFor('reportsEnrollment').set(key, val);
            },
			setupController: function(controller, model) {
				controller.set('model', model);
                var allFacets = {
					Type: JSON.parse(sessionStorage.getItem('types')),
                    jobTitle: JSON.parse(sessionStorage.getItem('jobTitles')),
                    organization: JSON.parse(sessionStorage.getItem('organizations')),
					managerId: JSON.parse(sessionStorage.getItem('managerId'))
                }
				controller.set("allFacets", allFacets);
				controller.courses.set("currentPage", 1);
				controller.set('model', model);
				controller.set("totalResults", model.courses.total);
				controller.set('courses.data', model.courses.courses);
			},
			model: function(queryParams) {
			 var self = this;
			 var model = Ember.Object.create({
                    "courses": {courses:[], total:0}
                });
                _.each(queryParams, function(val, key) {
                    self.setProperties(key, val);
                });
				var sDate = this.controllerFor('reportsEnrollment').get("startDate") ? this.controllerFor('reportsEnrollment').get("startDate") : "",
                    eDate = this.controllerFor('reportsEnrollment').get("endDate") ? this.controllerFor('reportsEnrollment').get("endDate"):"";
 				var dates = App.DateUtil.getGMTStartDateAndEndDate(sDate, eDate);
				queryParams["startDate"] = dates["startDate"];
				queryParams["endDate"] = dates["endDate"];
				queryParams["type"] = this.controllerFor('reportsEnrollment').get("searchTermType") ? this.controllerFor('reportsEnrollment').get("searchTermType") : "";
				queryParams["manager"] = this.controllerFor('reportsEnrollment').get("managerSearchTerm") ? this.controllerFor('reportsEnrollment').get("managerSearchTerm") : "";
				queryParams["jobTitle"] = this.controllerFor('reportsEnrollment').get("jobTitleSearchTerm") ? this.controllerFor('reportsEnrollment').get("jobTitleSearchTerm") : "";
				queryParams["organization"] = this.controllerFor('reportsEnrollment').get("organizationSearchTerm") ? this.controllerFor('reportsEnrollment').get("organizationSearchTerm") : "";
				
				return courseService.getLearnerReport(queryParams).then(function (courses) {
					var model = Ember.Object.create({
						"courses": courses
					});
					 return model;
				}, function(error) {
				  return model;
				}); 
			}
		});

		app.ReportsEnrollmentController = Ember.ObjectController.extend({
			queryParams: ['pageNumber'],
			pageNumber: 1,
			filters: '',
			startDate: '',
            endDate: '',
			courses: Ember.ArrayController.createWithMixins(VG.Mixins.Pageable, {
				perPage: app.PageSize
			}),
            filterSelected: function (courses, filters, allFacets) {
				App.DateUtil.searchFilterSelected(courses, allFacets, false, false, false, true);
                var self = this,
                    typeArr = courses.content.get('typeArr'),
					startDate = self.controllerFor('reportsEnrollment').get("startDate"),
                    endDate = self.controllerFor('reportsEnrollment').get("endDate"),
					managerArr = courses.content.get('managerArr'),
					jobTitleArr = courses.content.get('jobTitleArr'),
					organizationArr = courses.content.get('organizationArr');
				var dates = App.DateUtil.getGMTStartDateAndEndDate(startDate, endDate);
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
                courseService.getLearnerReport(searchCriteria).then(function (response) {
                    if (response) {
						self.courses.set("currentPage", 1);
                        self.set("totalResults", response.total);
                        self.set('courses.data', response.courses);
                        self.get("model").courses = response.courses;
                        self.set('pageNumber', 1);
                    } else {
                        $.gritter.add({title: '', text: 'Error in course Search.', class_name: 'gritter-error'});
                    }
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
				var startDate = this.controllerFor('reportsEnrollment').get("startDate")? this.controllerFor('reportsEnrollment').get("startDate") : "",
				endDate = this.controllerFor('reportsEnrollment').get("endDate") ? this.controllerFor('reportsEnrollment').get("endDate"): "";
				var dates = App.DateUtil.getGMTStartDateAndEndDate(this.get('startDate'), this.get('endDate'));
				searchFilters["startDate"] = dates["startDate"];
				searchFilters["endDate"] = dates["endDate"];
                this.set("searchFilters", searchFilters);
            }.observes("searchTermType", "startDate", "endDate", "managerSearchTerm", "jobTitleSearchTerm", "organizationSearchTerm"),
            getEnrolledCourses: function (searchFilters) {
                return courseService.getLearnerReport(searchFilters);
            },
            formatCourseJSON:function(JSONData){
                var self = this;
                var formattedJSON = [];
                var formatDate = function(dateVal){
					var dateGMT = new Date(dateVal * 1000);
					return dateGMT.toUTCString().substring(4, dateGMT.length);
                }
                JSONData.forEach(function(course){
                    var courseItemDetails = {
						"Last Name":course["lastName"] ? course["lastName"]: "No data",
						"First Name":course["firstName"] ? course["firstName"] : "No data",
						"Email":course["email"] ? course["email"] : "No data",
						"Organization":course["organization"] ? course["organization"] : "No data",
						"Course Title":course["fullname"] ? course["fullname"] : "No data",
						"Delivery Type": course["courseType"] ? course["courseType"] : "No data",
						"Registration Date": formatDate(course["enrolTime"]) ? formatDate(course["enrolTime"]) : "No data" ,
						"Score": course["score"] ? course["score"] : "No Score",
						"Manager Approval": course["managerApproval"] ? course["managerApproval"] : "No data"
                    };
                    var sessions = course["sessions"];
                    if (sessions.length > 0) {
                        sessions.forEach(function (session) {
                            var sessionItemDetails = _.extend({}, courseItemDetails);
                            sessionItemDetails = _.extend(sessionItemDetails, {
                                "Session Name": session.title? session.title : "NA",
								"Session Start Date": formatDate(session.startDate) ? formatDate(session.startDate) : "NA",
                                "Session End Date": session.endDate ? formatDate(session.endDate) : "NA",
                                "Session Location": session.city ? session.city : "NA",
								"Date Completed": session.completedDate ? formatDate(session.completedDate) : "NA",
								"Completion Status": session.completionStatus ? session.completionStatus : "NA",
							});
                            formattedJSON.push(sessionItemDetails);
						});
					}else{
                        courseItemDetails = _.extend(courseItemDetails, {
							"Date Completed": course["completionTime"] ? formatDate(course["completionTime"]) : 'NA',
							"Completion Status": course["completed"] ? course["completed"] :"No data",
							"Session Name": "NA",
							"Session Start Date": "NA",
							"Session End Date": "NA",
							"Session Location": "NA"
						});
                        formattedJSON.push(courseItemDetails);
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
				filterByStartAndEndDate: function(){
                    var self = this;
                    var dates = App.DateUtil.validateStartDateAndEndDate(this.startDate, this.endDate);
					var courseDetails = {
						"type": self.get('searchTermType'),
                        "startDate": dates["startDate"],
                        "endDate": dates["endDate"],
						"manager": self.get('managerSearchTerm'),
						"jobTitle": self.get('jobTitleSearchTerm'),
						"organization": self.get('organizationSearchTerm'),
						"pageNumber": 1
					};
					courseService.getLearnerReport(courseDetails).then(function (response) {
						self.courses.set("currentPage", 1);
                        self.set("totalResults", response.total);
                        self.set('courses.data', response.courses);
                        self.get("model").courses = response.courses;
                        self.set('pageNumber', 1);
					});
				}
			}
		});

    });