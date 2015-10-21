"use strict";

define(["app", "httpClient", "Q", "text!templates/formallearning/enrollments.hbs", "pages/trainingCatalog", 'emberPageble', "pages/messageModelHide", "services/formallearning/courseService"],
    function (app, httpClient, Q, enrollmentsTemplate, trainingCatalog, emberPageble, messageModelHide, courseService) {
        App.MyEnrollmentController = Ember.ObjectController.extend({
            queryParams:["reporteesUsername", 'reporteesSort', 'searchText'],
            sort: "",
			allFacets: {},
            filters: '',
            removeOnUnenroll :true,
            startDate: '',
            endDate: '',
            reporteesUsername: '',
			reporteesSort:'',
			searchText: '',
			sortByName:"progress",
            sortOrder: 'asc',
			sortByType:1,
			sortableFields:[
              {text:'Name', value:'title'},
              {text:'Delivery Type', value:'deliverytype'},
			  {text:'Enrolled', value:'progress'},
			  {text:'Completed', value:'completed'}
              ],
            courses: Ember.ArrayController.createWithMixins(VG.Mixins.Pageable, {
                perPage: app.PageSize
            }),
            completed: false,
            _currentView: "list-view",
			filterSelected: function (courses, filters, allFacets) {
                App.DateUtil.searchFilterSelected(courses, allFacets, false, true);
                var self=this,
                    catIds = courses.content.get('catIds'),
                    typeArr = courses.content.get('typeArr');
				var dates = App.DateUtil.validateStartDateAndEndDate(this.startDate, this.endDate);
                var searchCriteria = {
                    "query": this.get('searchTermCriteria'),
                    "category": catIds.join(','),
                    "type": typeArr.join(','),
                    'enrol': 1,
					'limitTo':app.Infinity,
                    'reporteesUsername': this.get('reporteesUsername'),
                    "startDate": dates["startDate"],
                    "endDate": dates["endDate"],
					"sortByName":self.controllerFor('myEnrollment').get('sortByName'),
					"sortByType":self.controllerFor('myEnrollment').get('sortByType'),
                };
                this.set('searchTermCategory', searchCriteria.category);
                this.set('searchTermType', searchCriteria.type);
                courseService.getCourses(searchCriteria).then(function (response) {
				    var courses = response.courses,
                        model = self.get('model');
                     if (response) {
                        self.set('pageNumber', 1);
                        courses = self.formatCourses(courses);
                        model.set("courses", courses);
                        self.sortSelected();
                
                    } else { 
                        self.showStatusMessage('alert-danger', 'icon-remove', 'Error in course Search.');
                    }
                });
            }.observes("filters"),
            sortSelected: function () {
                var self = this;
                self.courses.set("currentPage", 1);
                var coursesData = self.get("model").courses;
                var filter = self.get("sort"),
                    courses = [],
					view = this.get('_currentView');
                if (filter == "completed") {
                    self.get('model').set('status', '');
					self.get('model').set('enrolled', true);
                    _.each(coursesData, function (val, ind) {
                        if (val.completed == 1) {
							if (view == 'list-view'){
								val.isGridView = false;
							}else{
								val.isGridView = true;
							}
                            courses.push(val);
                        }
                    });
                    if (courses.length == 0) {
                        self.get('model').set('status', 'No courses to display');
                    }
                } else if (filter == "progress") {
                   self.get('model').set('status', '');
				   self.get('model').set('enrolled', false);
                    _.each(coursesData, function (val, ind) {
                        if (val.completed != 1) {
							if (view == 'list-view'){
								val.isGridView = false;
							}else{
								val.isGridView = true;
							}
                            courses.push(val);
                        }
                    });
                    if (courses.length == 0) {
                        self.get('model').set('status', 'No courses to display');
                    }
                }
                self.courses.setProperties({"currentPage": 1, "data" : courses, "reporteesUsername":self.get('model').reporteesUsername});
            }.observes("sort"),
            isGridView: function () {
                return this.get('_currentView') == 'grid-view';
            }.property("_currentView"),
            formatCourses: function (courses) {
                var isGridView = this.isGridView ? this.isGridView() : this.get('_currentView') == 'grid-view';
                _.each(courses, function (course) {
                    if (course.isWebex || course.isIlt) {
                        course.hideRegister = true;
                    }
					trainingCatalog.pendingApprovalStatus(course);
                    course.isGridView = isGridView;
                    course.stats = Ember.Object.create({
                        likes: 0,
                        comments: 0,
                        views: 0
                    });
                });
                var courseIdList = _.pluck(courses, "id");
                App.StatsUtil.getCourseLikesCount(courseIdList)
                    .then(function (_likedCourses) {
                        var _favoritedCourses = courses;
                        _.each(_likedCourses, function (course) {
                            var match = _.findWhere(_favoritedCourses, {
                                id: parseInt(course._id)
                            });
                            if (match) {
                                match.stats.set("likes", course.count);
                            }
                        });

                    });
                App.StatsUtil.getViewCount(courseIdList)
                    .then(function (viewStats) {
                        var _favoritedCourses = courses;
                        _.each(viewStats, function (viewStat) {
                            var match = _.findWhere(_favoritedCourses, {
                                id: parseInt(viewStat.objectId)
                            });
                            if (match) {
                                match.stats.set("views", viewStat.views);
                            }
                        });

                    });
                return courses;
            },
            searchTermCriteria: "",
            searchTermCategory: "",
            searchTermType: "",
			searchFilters: {
                "enrol": 1,
                "limitTo": 2,
                "limitFrom": 0,
			    "startDate" : "",
			    "endDate" : ""
            },
            setSearchFilters: function () {
                var searchFilters = {
                    "query": this.get('searchTermCriteria'),
                    "category": this.get('searchTermCategory'),
                    "type": this.get('searchTermType'),
                    "enrol": 1,
                    "limitTo": 2,
                    "limitFrom": 0,
                    "sortByName":this.get('sortByName'),
                    "sortByType":this.get('sortByType')
                };
				var dates = App.DateUtil.getGMTStartDateAndEndDate(this.get('startDate'), this.get('endDate'));
				searchFilters["startDate"] = dates["startDate"];
				searchFilters["endDate"] = dates["endDate"];
                this.set("searchFilters", searchFilters);
            }.observes("searchTermCriteria", "searchTermCategory", "searchTermType", "startDate", "endDate", "sortByName", "sortByType", "sort"),
            getEnrolledCourses: function (searchFilters) {
                return courseService.getCourses(searchFilters);
            },
            formatCourseJSON:function(JSONData){
                var self = this;
                var formattedJSON = [];
                var formatDate = function(dateVal) {
					var dateGMT = dateVal ? new Date(dateVal * 1000) : "NA";
					return dateGMT == "NA" ? dateGMT : dateGMT.toUTCString().substring(4, dateGMT.length);
                }
                //generating report for completed course
                var filter = $(".views-filter").find("input:checked").val(),
                    courses = [];
                if (filter == "completed") {
                    _.each(JSONData, function (val, ind) {
                        if (val.completed == 1) {
                            courses.push(val);
                        }
                    });
                } else if (filter == "progress") {
                    _.each(JSONData, function (val, ind) {
                        if (val.completed != 1) {
                            courses.push(val);
                        }
                    });
                }
                JSONData = courses;
                JSONData.forEach(function(course){
                    var courseItemDetails = {
								"Course Title":course["name"],
								"Delivery Type": course["courseType"],
								"Registration Date": formatDate(course["enrolTime"]),
								"Date Completed": course["completionTime"] ? formatDate(course["completionTime"]) : 'NA',
                                "Score": course["score"] ? course["score"] : "No Score",
								"Manager Approval": course['managerApproval'] ? true :  false
                    };
                    var sessions = course["sessions"];
                    if (sessions.length > 0) {
                        sessions.forEach(function (session) {
                            var sessionItemDetails = _.extend({}, courseItemDetails);
                            sessionItemDetails = _.extend(sessionItemDetails, {
								"Completion Status": session.registrationDate ? "Registered": "Not Registered",
                                "Session Name": session.title? session.title : "NA",
								"Session Start Date": formatDate(session.startDate),
                                "Session End Date": session.endDate ? formatDate(session.endDate) : "NA",
                                "Session Location": session.city ? session.city : "NA"
							});
                            formattedJSON.push(sessionItemDetails);
						});
					}else{
                        courseItemDetails = _.extend(courseItemDetails, {
							"Completion Status": course["completed"] ? "completed": "enrolled",
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
            actions: {
                search: function () {
                    var controller = this.controllerFor('myEnrollment');
                    var query = this.get("searchText");
                    this.controllerFor('myEnrollment').set('searchTermCriteria', this.get("searchText"));
                    var query = controller.get('searchTermCriteria');

                    if (typeof query != "undefined") {

                        var courseDetails = {
                            "query": controller.get('searchTermCriteria'),
                            "category": controller.get('searchTermCategory'),
                            "type": controller.get('searchTermType'),
                            "enrol":1,
							'limitTo':app.Infinity
                        };

                        courseService.getCourses(courseDetails).then(function (response) {
							var courses = response.courses;
                            var model = controller.get('model'),
                                courses = controller.formatCourses(courses);
                            model.set("courses", courses);
                            controller.sortSelected();
                        });
                    }
                },
    			sortCoursesByHeader: function(sortName){
                    var self = this;
                    self.set("showMessage", false);
    				if (sortName == "progress" || sortName == "completed") {
						self.set("sortByName", "");self.set("sort", sortName);
					}else{self.set("sortByName", sortName);}
					var dates = App.DateUtil.validateStartDateAndEndDate(this.startDate, this.endDate);
					var courseDetails = {
						"query": self.get("searchText"),
						"category": self.get('searchTermCategory'),
						"type": self.get('searchTermType'),
						"sortByName":self.get('sortByName'),
						"sortByType":self.controllerFor('myEnrollment').get('sortByType'),
						"enrol":1,
						'limitTo':app.Infinity,
                        "startDate": dates["startDate"],
                        "endDate": dates["endDate"]
					};
					courseService.getCourses(courseDetails).then(function (response) {						
						if (response) {
							var courses = response.courses,
								model = self.get('model');
							if (self.get('sort') == "progress") {
								if(self.controllerFor('myEnrollment').get('sortByType') == 1){courses = _.sortBy(courses, "enrolTime");
								}else{courses = _.sortBy(courses, "enrolTime").reverse();}
							}else if(self.get('sort') == "completed"){
								if(self.controllerFor('myEnrollment').get('sortByType') == 0){courses = _.sortBy(courses, "completionTime");
								}else{courses = _.sortBy(courses, "completionTime").reverse();}
							}
							self.set('pageNumber', 1);
							courses = self.formatCourses(courses);
							model.set("courses", courses);
							self.set("sortByName", sortName);
							self.sortSelected();
						} else {
							self.showStatusMessage('alert-danger', 'icon-remove', 'Error in course sorting.');
						}
					}); 
    			},
				toggleSortOrder: function(){
					if(this.sortOrder == 'asc') {this.set('sortOrder', 'desc'); this.controllerFor('myEnrollment').set('sortByType', 0)}
					else {this.set('sortOrder', 'asc'); this.controllerFor('myEnrollment').set('sortByType', 1)}
					this.send('sortCoursesByHeader', this.get('sortByName'));
				},
                updateSortBy: function(sortName) {
					this.set('sortByName', sortName);
					this.send('sortCoursesByHeader', sortName);
                },
                filter: function (filters) {
                    this.set('filters', filters.join(';'));
                    this.set('pageNumber', 1);
                },
				filterByStartAndEndDate: function(){
                    var controller = this;
                    var dates = App.DateUtil.validateStartDateAndEndDate(this.startDate, this.endDate);
					var courseDetails = {
						"query": controller.get('searchTermCriteria'),
						"category": controller.get('searchTermCategory'),
						"type": controller.get('searchTermType'),
						"enrol":1,
						'limitTo':app.Infinity,
                        "startDate": dates["startDate"],
                        "endDate": dates["endDate"],
						"sortByName":self.controllerFor('myEnrollment').get('sortByName'),
						"sortByType":self.controllerFor('myEnrollment').get('sortByType'),
					};
					courseService.getCourses(courseDetails).then(function (response) {
						var courses = response.courses;
						var model = controller.get('model'),
							courses = controller.formatCourses(courses);
						model.set("courses", courses);
						controller.sortSelected();
					});
				}
            }
        });
    });