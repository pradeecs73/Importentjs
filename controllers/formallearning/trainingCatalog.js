"use strict";
define(["app", "httpClient", "Q", "pages/messageModelHide", "text!templates/formallearning/catalog.hbs", "emberPageble",
        "text!templates/formallearning/addToLearningPlanModel.hbs", "services/formallearning/courseService", "services/formallearning/learningPlanService", "services/usersService", "pages/trainingCatalog"
    ],
    function (app, httpClient, Q, messageModelHide, catalogTemplate, emberPageble, addToLearningPlanModelTemplate, courseService, learningPlanService, usersService, trainingCatalog) {
        App.CatalogController = Ember.ObjectController.extend({
            queryParams: ['showMessage', 'pageNumber', 'searchText', 'type', 'sortByName', 'sortByType'],
            showMessage: false,
            isError: false,
            pageNumber: 1,
            searchText: '',
            type: '',
            sortByName: '',
            sortByPlpName: '',
            isProxyManager: false,
            selectedPlpids: [],
            prescribedLps: [],
            plpPageList: '',
            sortByType: 0,
            username: app.getUsername(),
            buttonDisabled: true,
            plpPageNumber: 1,
            userPageNumber: 1,
            searchName: '',
            buttonUserDisabled: true,
            allFacets: {},
            userSearchFacets: {},
            filters: '',
            userFilters: '',
            userSearchFilters: '',
            searchTermCategory: '',
            searchTermType: '',
            filterByDate: "",
            location: '',
            searchTermDate: '',
            searchTermLocation: '',
            learningPlans: '',
            userCount: '',
            months: '',
			plpSortValue: '',
            canAssignPLP: false,
            selfAssignPLP: false,
			learningPlanDate:"",
			showDate:false,
			sortPLPBy: '',
			sortPLPOrder:"asc",
			sortablePLPFields:[
              {text:'Name', value:'name'},
              {text:'Description', value:'description'},
              ],
            sortOrder: 'desc',
			sortableFields:[
              {text:'Name', value:'title'},
              {text:'Delivery Type', value:'deliverytype'},
              ],
			isPlpSelected: false,
            filterCatlogByDate: function () {
                var self = this,
                    filter = self.get("filterByDate"),
                    type = self.get('searchTermType');
                if (type == "") {
                    var typeArry = [];
                }
                else {
                    var typeArry = type.split(",");
                }
                var setIlt = _.contains(typeArry, "'ILT'"),
                    setWbt = _.contains(typeArry, "'WBT'");
                if (!(setIlt || setWbt)) {
                    if (!setIlt) {
                        typeArry.push("\'ILT\'")
                    }
                    if (!setWbt) {
                        typeArry.push("\'WBT\'")
                    }
                }
                if (filter == "all") {
                    filter = "";
                    var rIlt = _.without(typeArry, "'ILT'");
                    var rwbt = _.without(rIlt, "'WBT'");
                    typeArry = rwbt;
                }
                var filterData = {
                    "query": self.get("searchText"),
                    "category": self.get('searchTermCategory'),
                    "type": typeArry.join(','),
                    "pageNumber": 1,
                    "location": self.get('searchTermLocation'),
                    "date": filter
                };
                this.set('searchTermCategory', filterData.category);
                this.set('searchTermType', filterData.type);
                this.set('searchTermLocation', filterData.location);
                this.set('searchTermDate', filterData.date);
                courseService.getCourses(filterData).then(function (response) {
                    if (response) {
						App.DateUtil.setCategoriesToCatlog(response.courses);
                        self.courses.set("currentPage", 1);
                        self.set("totalResults", response.total);
                        self.set('courses.data', response.courses);
                        self.get("model").courses = response.courses;
                        self.set('pageNumber', 1);
                    } else {
                        $.gritter.add({title: '', text: 'Error in course Search.', class_name: 'gritter-error'});
                    }
                });
            }.observes("filterByDate"),
            learningPlanNameAdded: function () {
                var learningPlanName = this.get("learningPlanName");
                if (learningPlanName && learningPlanName.length > 0) {
					this.set("showDate", true);
                } else {
					this.set("showDate", false);
                }
            }.observes("learningPlanName"),
            _currentView: "list-view",
            isGridView: function () {
                return this.get('_currentView') == 'grid-view';
            }.property("_currentView"),
            courses: Ember.ArrayController.createWithMixins(VG.Mixins.Pageable, {
                perPage: app.PageSize
            }),
            prescribeLearningPlan: Ember.ArrayController.createWithMixins(VG.Mixins.Pageable, {
                perPage: app.PageSize
            }),
            users: Ember.ArrayController.createWithMixins(VG.Mixins.Pageable, {
                perPage: app.PageSize
            }),
            fetchUsers: function (queryParams) {
                var self = this;
                queryParams = queryParams ? queryParams : {};
                var users = [];
                var filters = queryParams.filters ? queryParams.filters.split(";") : [];
                var searchText = queryParams.searchText && queryParams.searchText.length > 0 ? queryParams.searchText : "*";
                var sortBy = queryParams.sortBy ? queryParams.sortBy : (searchText != "*" ? "relevance" : "shortName");
                var sortOrder = queryParams.sortOrder ? queryParams.sortOrder : 'asc';
                var pageNumber = (queryParams.pageNumber && queryParams.pageNumber > 0) ? queryParams.pageNumber : 1;
                usersService.allUsersWithFilters(searchText, filters, false, pageNumber, false, sortBy, sortOrder).then(function (usersData) {
                    self.set('users', usersData.allUsers);
                    self.set('usersData', usersData.allUsers);
                    self.set('userCount', usersData.totalResults);
                    self.set('userPageNumber', 1);
                    self.get("users").set('currentPage', 1);
                });
            },
            fetchLearningPlan: function () {
                var self = this;
                var data = {
                    "keyword": "",
                    "limitTo": app.Infinity
                };
                learningPlanService.fetchLearningPlans(data).then(function (learningPlans) {
                    var learningPlans = learningPlans.learningPlans;
                    var userlearningPlans = _.filter(learningPlans, function (ilps) {
                        return ilps.type == "Individual";
                    });
                    userlearningPlans = userlearningPlans.length > 0 ? userlearningPlans : [true]; // handling empty learning plan list
                    self.set('learningPlans', userlearningPlans);
                    userlearningPlans = self.get('learningPlans');
                    self.set('model.learningPlans', userlearningPlans);
                }, function (err) {
                    self.set('model.error', err.message);
                    self.set('model.learningPlans', []);
                })
            },
            fetchPerscribedPlansData: function () {
                var self = this;
                return learningPlanService.fetchPrescribedLearningPlanCatalog().then(function (learningPlans) {
                    var plpCount = learningPlans.plpCount,
                        learningPlans = learningPlans.learningPlans;
                    self.set('selectedPlpids', []);
                    learningPlans.forEach(function (learningPlan) {
                        learningPlan.plpSelectCheckbox = false;
                        learningPlan.plpCompleted = learningPlan.status == 3;
                        if ((learningPlan.managerEmail != "") && (learningPlan.managerEmail != app.getUsername())) {
                            learningPlan.isManagerAssigned = true;
                        }
                    });
                    self.setProperties({
                        'plpPageList': plpCount,
                        'plpPageNumber': 1,
                        'prescribeLearningPlan.data': learningPlans,
                        'prescribeLearningPlan.currentPage': 1,
                        'prescribedLps': learningPlans
                    });
                }, function (err) {
                    self.setProperties({
                        'model.error': err.message,
                        'prescribedLps': []
                    });
                });
            },
            filterSelected: function (courses, filters, allFacets) {
                App.DateUtil.searchFilterSelected(courses, allFacets, true, true);
                var self = this,
                    catIds = courses.content.get('catIds'),
                    typeArr = courses.content.get('typeArr'),
                    cityIds = courses.content.get('cityIds');

                var date = self.get("filterByDate");
                if (date == "1week" || date == "1month" || date == "3months")typeArr.push("\'ILT\', \'WBT\'");

                var searchCriteria = {
                    "query": self.get('searchTermCriteria'),
                    "category": catIds.join(','),
                    "type": typeArr.join(','),
                    "pageNumber": 1,
                    "location": cityIds.join(','),
                    "date": date
                };
                var subCategories = [];
                var categories = self.get("categories");
                catIds.forEach(function (catId) {
                    var selectedCategory = _.findWhere(categories, {id: catId});
                    selectedCategory["categories"].forEach(function (subCategory) {
                        subCategories.push(subCategory);
                    })
                })
                self.set("firstLevelCategories", subCategories.splice(0, 5));
                self.set('collapsedFirstLevelCategories', subCategories);

                self.set('secondLevelCategories', []);
                self.set('collapsedSecondLevelCategories', [])

                this.set('searchTermCategory', searchCriteria.category);
                this.set('searchTermType', searchCriteria.type);
                this.set('searchTermLocation', searchCriteria.location);
                this.set('searchTermDate', searchCriteria.date);
                courseService.getCourses(searchCriteria).then(function (response) {
                    if (response) {
						App.DateUtil.setCategoriesToCatlog(response.courses);
                        self.courses.set("currentPage", 1);
                        self.set('tcCount', response.length);
                        self.set("totalResults", response.total);
                        self.set('courses.data', response.courses);
                        self.get("model").courses = response.courses;
                        self.set('pageNumber', 1);
                    } else {
                        $.gritter.add({title: '', text: 'Error in course Search.', class_name: 'gritter-error'});
                    }
                });
            }.observes('filters'),
            shouldAssignPlp: function () {
                var selectedPlpids = this.get('selectedPlpids') ? this.get('selectedPlpids') : [];
                var checkboxesPLP = this.get('prescribedLps') ? this.get('prescribedLps') : [];
                for (var i = checkboxesPLP.length - 1; i >= 0; i--) {
                    if (checkboxesPLP[i].plpSelectCheckbox == true) {
                        selectedPlpids.push(checkboxesPLP[i].id);
                        selectedPlpids = _.uniq(selectedPlpids);
                    } else {
                        selectedPlpids = _.without(selectedPlpids, checkboxesPLP[i].id);
                    }
                }
                ;
                this.set('selectedPlpids', selectedPlpids);
                if (selectedPlpids.length > 0) {
                    this.set('buttonDisabled', false);
                } else {
                    this.set('buttonDisabled', true);
                }
            }.observes('prescribedLps.@each.plpSelectCheckbox'),
            shouldAssignUser: function () {
                var checkboxesUsers = this.get('users') ? this.get('users') : [],
                    buttonUserDisabled = false;
                var useremails = [];

                for (var i = checkboxesUsers.length - 1; i >= 0; i--) {
                    if (checkboxesUsers[i].isSelected == true) {
                        useremails.push(checkboxesUsers[i].email);
                    }
                }
                ;
                if (useremails.length > 0) {
                    this.set('selectedUserids', useremails);
                    this.set('buttonUserDisabled', false);

                } else {
                    this.set('buttonUserDisabled', true);
                }
            }.observes('users.@each.isSelected'),
            fetchMyRole: function () {
                var self = this;
                return usersService.myProfile().then(function (response) {
                    var roles = response.roles;
                    for (var i = 0; i < roles.length; i++) {
                        if (["Manager", "CatalogAdmin"].indexOf(roles[i]) > -1) {
                            self.set("isProxyManager", true);
                            break;
                        }
                    }
                    return true;
                }, function (error) {

                    $.gritter.add({title: '', text: 'Error while retrieving user roles', class_name: 'gritter-error'});
                })
            },
            hasAssignPLP: function() {
                var self = this;
                var permissionType = "canAssignPLP";
                usersService.hasPermission(permissionType).then(function (response) {
                    if (response.length) {
                        self.set("canAssignPLP", true);
                    }
                })     
            },
            hasSelfAssignPLP: function() {
                var self = this;
                var permissionType = "selfAssignPLP";
                usersService.hasPermission(permissionType).then(function (response) {
                    if (response.length) {
                        self.set("selfAssignPLP", true);
                    }
                })
            },
            actions: {
                onLaunch: function (courseDetails) {
                    var course = {id: courseDetails.id.toString(), title: courseDetails.name, resourceUrl : "#/learningCourse/" + courseDetails.id + "?coursetype=" + courseDetails.courseType };
                    setTimeout((function(){app.NotificationUtils.sendActivityStreamEvent(course, 'course', 'launch');}), 0);

                    window.open(courseDetails.launchUrl, '_blank');
                },
                transition: function (courseDetails) {
                    var course = {
                        id: courseDetails.id,
                        title: courseDetails.name,
                        resourceUrl : "#/learningCourse/" + courseDetails.id + "?coursetype=" + courseDetails.courseType
                    };

                    setTimeout((function(){app.NotificationUtils.sendActivityStreamEvent(course, 'course', 'launch');}), 0);
                    this.transitionTo('launchquiz', {
                        quizId: courseDetails.quizId,
                        courseId: courseDetails.id
                    }, {
                        courseId: courseDetails.id
                    });
                },
                gotoPage: function (pageValue) {
                    this.set('pageNumber', pageValue)
                },
                search: function () {
                    var self = this;
                    self.set("showMessage", false);
                    self.set('searchTermCriteria', this.get("searchText"));
                    if (typeof this.get("searchText") != "undefined") {
                        var courseDetails = {
                            "query": self.get("searchText"),
                            "category": self.get('searchTermCategory'),
                            "type": self.get('searchTermType'),
                            "pageNumber": 1,
                            "location": self.get('searchTermLocation'),
                            "date": self.get("searchTermDate")
                        };

                        courseService.getCourses(courseDetails).then(function (response) {
                            if (response) {
								App.DateUtil.setCategoriesToCatlog(response.courses);
                                self.courses.set("currentPage", 1);
                                self.set("totalResults", response.total);
                                self.set('courses.data', response.courses);
                                self.get("model").courses = response.courses;
                                self.set('pageNumber', 1);
                            } else {
                                $.gritter.add({title: '', text: 'Error in course Search.', class_name: 'gritter-error'});
                            }
                        })
                    }
                },
                gotoPlpPage: function (pageValue) {
                    var self = this;
                    var pageSize = app.PageSize,
                        from = (pageValue - 1) * pageSize,
                        to = pageValue * pageSize;

                    var plpDetails = {
                        "limitfrom": from,
                        "limitto": to,
                        "keyword": self.get("keyword")
                    };
                    var selectedPlpids = self.get("selectedPlpids");
                    learningPlanService.fetchPrescribedLearningPlanCatalog(plpDetails).then(function (response) {
                        var response = response.learningPlans;
                        response.forEach(function (learningPlan) {
                            if ((learningPlan.managerEmail != "") && (learningPlan.managerEmail != app.getUsername())) {
                                learningPlan.isManagerAssigned = true;
                            }
                            learningPlan.plpCompleted = learningPlan.status == 3;
                            learningPlan.plpSelectCheckbox = selectedPlpids.indexOf(learningPlan.id) > -1 ? true : false;
                        });

                        self.setProperties({
                            'selectedPlpids': selectedPlpids,
                            'prescribeLearningPlan.data': response,
                            'prescribeLearningPlan.currentPage': 1,
                            'prescribedLps': response,
                            'plpPageNumber': pageValue
                        });
                    });
                },
                searchPrescribedLearningPlans: function () {
                    var self = this;
                    var plpDetails = {
                        "sortName": self.get('plpSortValue') ? self.get('plpSortValue.sortName') : "" ,
                        "keyword": self.get("keyword") ? self.get("keyword") : "",
                        "sort": self.get('plpSortValue') ? self.get('plpSortValue.sort') : ""
                    };
                    learningPlanService.fetchPrescribedLearningPlanCatalog(plpDetails).then(function (response) {
                        var plpData = response.learningPlans;
                        plpData.forEach(function (learningPlan) {
                            learningPlan.plpCompleted = learningPlan.status == 3;
                            if ((learningPlan.managerEmail != "") && (learningPlan.managerEmail != app.getUsername())) {
                                learningPlan.isManagerAssigned = true;
                            }
                        });
                        self.setProperties({
                            'plpPageList': response.plpCount,
                            'prescribeLearningPlan.data': plpData,
                            'prescribeLearningPlan.currentPage': 1,
                            'prescribedLps': plpData,
                            'plpPageNumber': 1
                        });
                    });
                },
                enrollCourse: function (courseId, managerApproval) {
                    var self = this;
                    courseService.enrollCourse(courseId, managerApproval).then(function (response) {
                        var courses = self.get("courses.data");
                        self.get("courses").propertyWillChange("data");
                        for (var i = 0; i < courses.length; i++) {
                            if (courses[i].id == courseId) {
                                courses[i].isUserEnroled = true;
								courses[i].enrollmentId = response.entity ? response.entity.id : "";
								if (managerApproval) {
									courses[i].pendingApproval = response.entity.status == "PENDING" ? true : false;
								}
                                break;
                            }
                        }
                        self.set("courses.data", courses);
                        self.get("courses").propertyDidChange("data");
                        $.gritter.add({title: '', text: 'You have enrolled into the course successfully.', class_name: 'gritter-success'});
                    }, function (err) {
                        $.gritter.add({title: '', text: 'Error in course enrollment', class_name: 'gritter-error'});
                    });
                },
                unEnrollCourse: function (courseId, enrollmentId) {
                    var self = this;
                    courseService.cancelEnrollCourse(enrollmentId, courseId).then(function (response) {
                        var courses = self.get("courses.data");
                        self.get("courses").propertyWillChange("data");
                        for (var i = 0; i < courses.length; i++) {
                            if (courses[i].id == courseId) {
                                courses[i].isUserEnroled = false;
								courses[i].pendingApproval = false;
                                break;
                            }
                        }
                        self.set("courses.data", courses);
                        self.get("courses").propertyDidChange("data");
                        $.gritter.add({title: '', text: 'Course drop is successful.', class_name: 'gritter-success'});
                    }, function (err) {
                        $.gritter.add({title: '', text: 'Error in cancelling enrolling course', class_name: 'gritter-error'});
                    });
                },
                learningPlanModal: function (courseId, update) {
                    var controller = this;
                    var model = controller.get('learningPlans');
                   controller.set("courseId", courseId);
                    var learningPlanItem = {};
                    if (update) {
                        var learningPlans = controller.get("learningPlans"),
                            oldLearningPlanId = undefined,
                            learningPlanItemId = undefined;
                        for (var i = 0; i < model.length; i++) {
                            var learningPlan = learningPlans[i]
                            if (learningPlan.learningPlanItems) {
                                for (var j = 0; j < learningPlan.learningPlanItems.length; j++) {
                                    if (learningPlan.learningPlanItems[j].courseId == courseId) {
                                        learningPlanItemId = learningPlan.learningPlanItems[j].id;
                                        oldLearningPlanId = learningPlan.id;
                                        break;
                                    }
                                }
                                if (learningPlanItemId) {
                                    break;
                                }
                            }
                        }
                        controller.set("oldLearningPlanId", oldLearningPlanId);
                        controller.set("planId", oldLearningPlanId);
                        controller.set("learningPlanItemId", learningPlanItemId);
                        controller.set("update", true);
                    } else {
                        controller.set("update", false);
                    }
                    var errors = {}
                    model.set("errors", errors);
                    if (model) {
                        if (model.length > 0) {
                            controller.set("planId", model[0].id);
                        }
                    }
                    jQuery('#addACourseToLP').modal('show');
                },
                sortByPlanName: function (sortVal) {
                    var self = this,
                        plpDetails = {
                            "sortName": sortVal,
                            "keyword": self.get("keyword") ? self.get("keyword") : "",
                            "sort": self.get("sortPLPOrder")
                        };
					self.set('plpSortValue', plpDetails);
                    learningPlanService.fetchPrescribedLearningPlanCatalog(plpDetails).then(function (response) {
                        var response = response.learningPlans;
                        response.forEach(function (learningPlan) {
                            if ((learningPlan.managerEmail != "") && (learningPlan.managerEmail != app.getUsername())) {
                                learningPlan.isManagerAssigned = true;
                            }
                            learningPlan.plpCompleted = learningPlan.status == 3;
                        });
                        self.setProperties({
                            'prescribeLearningPlan.data': response,
                            'prescribeLearningPlan.currentPage': 1,
                            'prescribedLps': response,
                            'plpPageNumber': 1
                        });
                    });
                },
				togglePLPSortOrder: function(){
					var sortName = this.controllerFor('catalog').get('sortPLPBy') ? this.controllerFor('catalog').get('sortPLPBy') == "" : "name" ;
					if(!sortName){sortName = this.controllerFor('catalog').get('sortPLPBy')}
					if(this.sortPLPOrder == 'asc') this.controllerFor('catalog').set('sortPLPOrder', 'desc');
					else this.controllerFor('catalog').set('sortPLPOrder', 'asc')
					this.controllerFor('catalog').set('sortPLPBy', sortName);
					this.send('sortByPlanName', sortName);
				},
				updatePLPSortBy: function(sortName) {
					this.set('sortPLPBy', sortName);
					this.send('sortByPlanName', sortName);
				},
                addToLearningPlan: function (courseId, oldLearningPlanId, learningPlanItemId) {
                    var controller = this,
                        model = controller.get("model"),
                        learningPlanName = controller.get("learningPlanName"),
                        PlanId = controller.get("planId"),
						date = this.learningPlanDate,
                        message = "";
					var currDate = app.todayDateinUnix;
                    var updateModelData = function (response) {
                            controller.set("learningPlanName", "");
                            jQuery('#addACourseToLP').modal('hide');
                            controller.get("courses").propertyWillChange("data");
                            var courses = controller.get("courses.data");
                            for (var i = 0; i < courses.length; i++) {
                                if (courses[i].id == courseId) {
                                    courses[i].alreadyInLearningPlan = true;
                                    break;
                                }
                            }
                            controller.set("courses.data", courses);
                            controller.get("courses").propertyDidChange("data");
                            jQuery('#addACourseToLP').modal('hide');

                            if (oldLearningPlanId) {
                                learningPlanService.deleteIndividualLearningPlanTask(oldLearningPlanId, learningPlanItemId);
                                $.gritter.add({title: '', text: 'Course has been moved to learning plan successfully.', class_name: 'gritter-success'});
                            } else {
                                $.gritter.add({title: '', text: 'Course has been added to learning plan successfully.', class_name: 'gritter-success'});
                            }
                            controller.fetchLearningPlan();
                        },
                        handleError = function (err) {
                            var errors = {}
                            if (oldLearningPlanId) {
                                errors.title = 'Error in moving course to learning plan.';
                            } else {
                                errors.title = 'Unable to Create Learning Plan due to (Plan name already exists/Invalid title value)';
                            }
                            model.set("errors", errors);
                            return;
                        };
                    if (learningPlanName) {
						 if(date == ""){
							var msg = "Date Should Not Be Empty";
						}else{
							date = App.DateUtil.formatInputDateWithGmt(date);
							if (date < currDate) {
								var msg = "Date Should Be Future Date";
							}
						} 
                        var errors = {
                            date: msg,
                            title: !learningPlanName || learningPlanName.trim() == "" ? "Title Should Not Be Empty" : !app.checkTitle(learningPlanName) ? "Title has Invalid character" : undefined
                        };
                        if (errors.title || errors.date) {
                            model.set("errors", errors);
                            return;
                        }
                        learningPlanService.createIndividualLearningPlan(learningPlanName, App.DateUtil.formatGmtDateToNormal(date), courseId).then(updateModelData, handleError);
                    } else {
                        learningPlanService.addCourseToLearningPlan(PlanId, courseId, oldLearningPlanId, learningPlanItemId).then(updateModelData, handleError);
                    }
                },
                peopleSearch: function () {
                    var self = this;
                    var peopleSearchFilters = {};
                    var peopleSearchCriteria = this.get("searchPeople") ? this.get("searchPeople").trim(): "" ;
                    if (peopleSearchCriteria != "undefined" && peopleSearchCriteria != "") {
                        peopleSearchFilters.searchText = peopleSearchCriteria
                    }

                    if (self.get('userFilters') && self.get('userFilters') != undefined) {
                        peopleSearchFilters.filters = self.get('userFilters').join(';')
                    }
                    this.fetchUsers(peopleSearchFilters);
                },
                assignPLPsToUsers: function () {
                    var self = this,
                        useremails = this.get('selectedUserids'),
                        plpids = this.get('selectedPlpids'),
						completedByDate = this.learningPlanDate,
						currentDate = app.todayDateinUnix;
						jQuery('#plpDateError').hide();					
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
                    if (newCompletedByDate) {
                        learningPlanService.prescribeLearningPlanToUser(useremails, plpids, App.DateUtil.formatGmtDateToNormal(date)).then(function (response) {
                            $('#addPrescribedModal').modal('hide');
                            $.gritter.add({title: '', text: 'User(s) assigned to prescribed learning plan(s) successfully', class_name: 'gritter-success'});
                            $('.manager-plp-checkbox input[type=checkbox]').attr('checked', false);
                        }, function (err) {
                            $.gritter.add({title: '', text: 'Error in assigning user(s) to prescribed learning plan(s)', class_name: 'gritter-error'});
                        });
                    }
                    else {
                        jQuery('#plpDateError').show();
                    }
                },
                filter: function (filters) {
                    this.set('filters', filters.join(';'));
                    this.set('pageNumber', 1);
                },
                peopleSearchFilter: function(filters) {
                    this.set('userFilters', filters);
                    var peopleSearchFilters = {};
                    if (filters && filters != undefined) {
                        peopleSearchFilters.filters = filters.join(';')
                    }
                    var searchText = this.get("searchPeople");
                    if (searchText != "undefined" && searchText != undefined && searchText != "" ) {
                        peopleSearchFilters.searchText = searchText.trim();
                    }
                    this.fetchUsers(peopleSearchFilters);
                },
				toggleSortOrder: function(){
					var sortName = this.controllerFor('catalog').get('sortByName') ? this.controllerFor('catalog').get('sortByName') == "" : "title" ;
					if(!sortName){sortName = this.controllerFor('catalog').get('sortByName')}
					this.controllerFor('catalog').set('sortByName', sortName);
					if(this.sortOrder == 'desc') {this.set('sortOrder', 'asc'); this.controllerFor('catalog').set('sortByType', 1);}
					else {this.set('sortOrder', 'desc'); this.controllerFor('catalog').set('sortByType', 0);}
                    var date = this.get("filterByDate");
                    if (date == "all"){ date = ""; }
						else{ date = this.get('filterByDate');}
					this.controllerFor('catalog').set('searchTermDate', date);
				},
                updateSortBy: function(sortName) {
                    var date = this.get("filterByDate");
                    if (date == "all"){ date = ""; }
						else{ date = this.get('filterByDate');}
					this.set('sortByName', sortName);
					this.controllerFor('catalog').set('searchTermDate', date);
                },
                togglePrescribedLearningPlanEnrollment: function (actionType, plpId) {
                    var self = this,
                        type = "prescribed",
                        status = actionType == "enrol" ? 1 : 0,
                        successCallback = function (response) {
                            var learningPlans = self.get('prescribedLps').copy();
                            for (var i = 0; i < learningPlans.length; i++) {
                                var learningPlan = learningPlans[i];
                                if (learningPlan.id == plpId) {
                                    learningPlan.managerEmail = learningPlan.managerEmail ? undefined : app.getUsername();
                                    break;
                                }
                            }
                            self.get('prescribeLearningPlan').set('data', learningPlans);
                            if (status) {
                                $.gritter.add({title: '', text: 'You have enrolled into the prescribed learning plan successfully.', class_name: 'gritter-success'});
                                var plp = {id: learningPlan.id, title: learningPlan.name, resourceUrl: "/#/plpDetails/" + learningPlan.id};
                                app.NotificationUtils.sendActivityStreamEvent(plp, 'plp', 'enroll');
                            } else {
                                $.gritter.add({title: '', text: 'You have dropped from the prescribed learning plan successfully.', class_name: 'gritter-success'});
                            }
                        },
                        errorCallBack = function (err) {
                            $.gritter.add({title: '', text: 'Unable to enrol/drop to prescribed learning plan.', class_name: 'gritter-error'});
                        };
                    switch (actionType) {
                        case "enrol":
                            var currentDate = new Date(),
                                completedByDate = parseInt(currentDate / 1000),
                                useremail = [app.getUsername()],
                                plpIds = [plpId];
                            learningPlanService.prescribeLearningPlanToUser(useremail, plpIds, completedByDate).then(successCallback, errorCallBack);
                            break;
                        case "drop":
                            learningPlanService.deletePrescribedLearningPlan(plpId, type, status).then(successCallback, errorCallBack);
                            break;
                    }
                },
                gotoUserPage: function (pageValue) {
                    var self = this,
                        filters = [],
                        searchText = "*",
                        sortBy = "shortName",
                        sortOrder = 'asc',
                        userPageNumber = pageValue;
                    usersService.allUsersWithFilters(searchText, filters, false, userPageNumber, false, sortBy, sortOrder).then(function (response) {
                        self.set('users', response.allUsers);
                        self.get('model').set('usersData', response.allUsers);
                        self.get('users').set('currentPage', 1);
                    });
                    this.set('userPageNumber', pageValue);
                },
                showSubCategoriesAndCourse: function (category, isSecondLevel) {
                    var self = this,
						arrPopupCategories = [],
						popUpCat = self.get("model").popupCategories;
					_.each(popUpCat, function(cat) {
						if(cat.selected == "true"){
							delete cat.selected;
						}
						arrPopupCategories.push(cat)
					});
					self.set('popupCategories', arrPopupCategories);
                    category.selected = "true";
                    if (!isSecondLevel && category && category.categories) {
						var secondLevelCategories = category.categories.copy();
						self.set("secondLevelCategories", secondLevelCategories.splice(0, 5));
						self.set("collapsedSecondLevelCategories", secondLevelCategories);
                    }
                    var searchCriteria = {
                        "query": self.get("searchText"),
                        "category": category.id,
                        "type": self.get('searchTermType'),
                        "pageNumber": 1,
                        "location": self.get('searchTermLocation'),
                        "date": self.get("searchTermDate")
                    };
                    self.set('searchTermCategory', searchCriteria.category);
                    courseService.getCourses(searchCriteria).then(function (response) {
                        if (response) {
							App.DateUtil.setCategoriesToCatlog(response.courses);
                            self.courses.set("currentPage", 1);
                            self.set('tcCount', response.length);
                            self.set("totalResults", response.total);
                            self.set('courses.data', response.courses);
                            self.get("model").courses = response.courses;
                            self.set('pageNumber', 1);
                        } else {
                            $.gritter.add({title: '', text: 'Error in course Search.', class_name: 'gritter-error'});
                        }
                    });
                },
				setParentCategoryToFilter: function(category){
					var filter = this.get("filters").split(";");
					var searchFilter = _.filter(filter, function (filter) {
                        return filter;
                    });
					searchFilter.push("Category:" + category.parentCategoryName);
					searchFilter = _.uniq(searchFilter);
					this.set('filters', searchFilter.join(';'));
				}
            }
        });
    });