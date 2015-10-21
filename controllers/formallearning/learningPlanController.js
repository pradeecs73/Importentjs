"use strict";
define(["app", "httpClient", "Q", "text!templates/formallearning/learningPlans.hbs", "services/formallearning/courseService", "services/formallearning/learningPlanService", "emberPageble", "pages/learningPlan"],
    function (app, httpClient, Q, learningPlansTemplate, courseService, learningPlanService, emberPageble, pageLearningPlan) {
        App.LearningPlansController = Ember.ObjectController.extend({
            queryParams: ['showMessage', 'pageNumber', 'keyword', 'reporteesUsername'],
            keyword: "",
            pageNumber: 1,
            _currentView: "list-view",
            showMessage: false,
            startDate: '',
            endDate: '',
            reporteesUsername: '',
            isGridView: function () {
                return this.get('_currentView') == 'grid-view';
            }.property("_currentView"),
            learningPlans: Ember.ArrayController.createWithMixins(VG.Mixins.Pageable, {
                perPage: app.PageSize
            }),
            setLearningPlanStatus: function (learningPlan) {
                var mandatoryCourses = _.filter(learningPlan.learningPlanItems, function (course) {
                    return course.mandatory
                });
                mandatoryCourses = mandatoryCourses.length > 0 ? mandatoryCourses : learningPlan.learningPlanItems;
                if ((_.filter(mandatoryCourses, function (course) {
                    return [1, 2].indexOf(course.courseCompleted) > -1
                })).length > 0) {
                    learningPlan.plpAppeared = true;
                    learningPlan.plpRegistered = learningPlan.plpRegistered && (_.filter(mandatoryCourses, function (course) {
                        return [0, 1].indexOf(course.courseCompleted) > -1
                    }).length > 0) ? true : false;
                } else {
                    learningPlan.plpAppeared = false;
                }
                return learningPlan;
            },
            searchFilters: {
                "limitTo": 2,
                "limitFrom": 0,
                "keyword": "",
                "startDate": "",
                "endDate": ""
            },
            setSearchFilters: function () {
                var searchFilters = {
                    "keyword": this.get("keyword"),
                    "limitTo": 2,
                    "limitFrom": 0
                };
				var dates = App.DateUtil.getGMTStartDateAndEndDate(this.get('startDate'), this.get('endDate'));
				searchFilters["startDate"] = dates["startDate"];
				searchFilters["endDate"] = dates["endDate"];
                this.set("searchFilters", searchFilters);
            }.observes("searchText", "startDate", "endDate"),
            getLearningPlans: function (searchFilters) {
                return learningPlanService.fetchLearningPlans(searchFilters);
            },
            formatCourseJSON: function (JSONData) {
                var formattedJSON = [];
                var formatDate = function (dateVal) {
                    var dateGMT = new Date(dateVal * 1000);
					return dateGMT.toUTCString().substring(4, dateGMT.length);
                };

                JSONData.forEach(function (plp) {
                    var learningPlanItems = plp["learningPlanItems"];
                    pageLearningPlan.prescribedLearningPlanStatus(plp);
					if(learningPlanItems.length != 0){
						learningPlanItems.forEach(function (learningPlanItem) {
							var learningPlanItemDetails = {
								"Name of Learning Plan": plp["name"],
								"Type of Plan": plp["type"],
								"Name of Assignee": plp["assignedBy"],
								"Completion Goal": formatDate(plp["completeByDate"]),
								"Learning Plan Status": plp["status"],
								"Course Name": learningPlanItem.fullName ? learningPlanItem.fullName : learningPlanItem.taskDesc,
								"Delivery Type": learningPlanItem.courseType ? learningPlanItem.courseType : "Task",
								"Score": learningPlanItem.score ? learningPlanItem.score : 'No Score',
								"Manager Approval": learningPlanItem.managerApproval ? true : false,
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
                       formattedJSON.push({"Name of Learning Plan": plp["name"], "Type of Plan": plp["type"], "Name of Assignee": plp["assignedBy"],"Completion Goal": formatDate(plp["completeByDate"]), "Learning Plan Status": plp["status"], "Manager Approval": plp["managerApproval"] ? true: false, "Course Name": "NA","Delivery Type": "NA", "Score": "NA", "Completion Status": "NA", "Enrolment Date": "NA", "Session Name": "NA", "Session Start Date": "NA", "Session End Date": "NA"});
					}
                });
                return formattedJSON;
            },
            actions: {
                onLaunch: function (data) {
                    var course = {
                        id: data.courseId,
                        title: data.fullName,
                        resourceUrl : "#/learningCourse/" + data.courseId + "?coursetype=" + data.courseType
                    };

                    setTimeout((function () {
                        app.NotificationUtils.sendActivityStreamEvent(course, 'course', 'launch');
                    }), 0);
                    window.open(data.launchURL, '_blank');
                },
                onInvalidLaunch: function() {
                    $.gritter.add({title: '', text: 'This course cannot be launched unless the previous course is completed.', class_name: 'gritter-error'});
                },
                enrollPrescribedLearningPlan: function (learningPlanId, status, type, actionType, enrollmentId, managerApproval) {
					
                    var self = this;
                    status = status ? 0 : 1;

                    learningPlanService.enrollOrDropPrescribedLearningPlan(learningPlanId, actionType, enrollmentId, managerApproval).then(function (response) {
						
                        var learningPlans = self.get('model').learningPlans.copy(),
                            learningPlan;
                        for (var i = 0; i < learningPlans.length; i++) {
                            learningPlan = learningPlans[i];
                            if (learningPlan.id == learningPlanId && learningPlan.type == type) {
                                learningPlan.status = status;
                                learningPlan.plpRegistered = learningPlan.status == 0 ? false : true;
								learningPlan.enrollmentId = response.entity ? response.entity.id : "";
								if (managerApproval) {
									learningPlan.pendingApproval = response.entity.status == "PENDING" ? true : false;
								}
                                learningPlan.learningPlanItems.forEach(function (learningItems) {
                                    if (learningPlan.status && (learningItems.isELearning || learningItems.isAssessment || learningItems.isScorm)) {
                                        learningItems.showRegister = true;
                                    }
                                    else if (learningItems.showRegister) {
                                        delete learningItems.showRegister;
                                    }
                                });
                                learningPlan = self.setLearningPlanStatus(learningPlan);
                                break;
                            }
                        }
                        self.get('model').set('learningPlans', learningPlans);
                        self.learningPlans.set("data", learningPlans);
                        if (status) {
                            $.gritter.add({title: '', text: 'You have Registered into the PLP Plan Successfully.', class_name: 'gritter-success'});
                        } else {
                            $.gritter.add({title: '', text: 'You have Dropped into the PLP Plan Successfully.', class_name: 'gritter-success'});
                        }
                    }, function (err) {
                        $.gritter.add({title: '', text: 'Unable to Register/Drop to PLP plan.', class_name: 'gritter-error'});
                    });
                },
                enrollCourse: function (courseId, managerApproval) {
                    var self = this;
                    courseService.enrollCourse(courseId, managerApproval).then(function (response) {
                            var modelData = self.get('model').learningPlans.copy();
                            _.each(modelData, function (learningPlan, index) {
                                _.each(learningPlan.learningPlanItems, function (data, index) {
                                    if (courseId == data.courseId) {
                                        learningPlan.plpAppeared = true;
                                        data.courseCompleted = 1;
										data.enrollmentId = response.entity ? response.entity.id : "";
										if (managerApproval) {
											data.pendingApproval = response.entity.status == "PENDING" ? true : false;
										}
                                    }
                                })
                            });
                            $.gritter.add({title: '', text: 'You have Registered into the Course Successfully', class_name: 'gritter-success'});
                            self.get('model').learningPlans = [];
                            self.get('model').set("learningPlans", modelData);
                            self.set('learningPlans.data', modelData);
                        },
                        function (err) {
                            $.gritter.add({title: '', text: 'Unable to Register course', class_name: 'gritter-error'});
                        });
                },
                cancelEnrollCourse: function (courseId, enrollmentId) {
                    var self = this;
                    courseService.cancelEnrollCourse(enrollmentId, courseId).then(function (response) {
                            var modelData = self.get('model').learningPlans.copy();
                            modelData.forEach(function (learningPlan) {
                                for (var i = 0; i < learningPlan.learningPlanItems.length; i++) {
                                    var course = learningPlan.learningPlanItems[i];
                                    if (courseId == course.courseId) {
                                        course.courseCompleted = 0;
										course.pendingApproval = false;
                                        learningPlan.learningPlanItems[i] = course;
                                        learningPlan = self.setLearningPlanStatus(learningPlan);
                                        break;
                                    }
                                }
                            });
                            $.gritter.add({title: '', text: 'You have Dropped into the Course Successfully.', class_name: 'gritter-success'});
                            self.get('model').learningPlans = [];
                            self.get('model').set("learningPlans", modelData);
                            self.set('learningPlans.data', modelData);
                        },
                        function (err) {
                            $.gritter.add({title: '', text: 'Unable to unEnroll course', class_name: 'gritter-error'});
                        });
                },
                disabledCourse: function () {
                    $.gritter.add({title: '', text: 'Sorry, new registrations are disabled to this course.', class_name: 'gritter-error'});
                },
                deleteIndividualLearningPlanTask: function (learningPlanId, learningPlanItemId) {
                    var self = this;
                    learningPlanService.deleteIndividualLearningPlanTask(learningPlanId, learningPlanItemId).then(function (response) {
                            var learningPlans = self.get("model").get("learningPlans");
                            var learningPlan = _.findWhere(learningPlans, {id: learningPlanId});
                            var component = _.findWhere(learningPlan.learningPlanItems, {id: learningPlanItemId});
                            learningPlan.learningPlanItems.removeObject(component);
                            $.gritter.add({title: '', text: 'Task/Course Deleted from Individual Plan Successfully', class_name: 'gritter-success'});
                            self.set("learningPlans.data", learningPlans);
                            self.learningPlans.set("currentPage", 1);
                        },
                        function (err) {
                            $.gritter.add({title: '', text: 'Unable to Task/Course Deleted from Individual Plan', class_name: 'gritter-error'});
                        });
                },
                searchLearningPlans: function (dateFilter) {
                    var self = this;
                    self.set('searchText', self.get("keyword"));
                    var learningPlanQuery = {
                        "keyword": self.get("keyword"),
                        "pageNumber": 1
                    };
                    if (dateFilter == true) {
                        var dates = App.DateUtil.validateStartDateAndEndDate(this.get('startDate'), this.get('endDate'));
                        if(!dates) return
						learningPlanQuery = _.extend(learningPlanQuery, {"startDate": dates["startDate"] ? dates["startDate"] : "" ,
						"endDate": dates["endDate"] ? dates["endDate"] : "" });
                    }
                    learningPlanService.fetchLearningPlans(learningPlanQuery).then(function (response) {
                        var filteredLearningPlans = response.learningPlans,
                            status = '';
						pageLearningPlan.learningPlanHelper(filteredLearningPlans);
                        if (filteredLearningPlans.length == 0) {
                            status = 'No learningPlans to display';
                        } else {
                            _.each(filteredLearningPlans, function (learningPlan) {
                                if (learningPlan.type == "Prescribed") {
                                    learningPlan.isTypePLP = true;
                                }
                            });
                        }
                        self.setProperties({
                            'model.learningPlans': filteredLearningPlans,
                            'learningPlans.data' : filteredLearningPlans,
                            'learningPlans.currentPage': 1,
                            'pageNumber': 1,
                            'status': status,
                            "totalResults": response.plpCount
                        });
                    });
                },
                transition: function (courseDetails) {
                    var course = {
                        id: courseDetails.courseId,
                        title: courseDetails.fullName,
                        resourceUrl : "#/learningCourse/" + courseDetails.courseId + "?coursetype=" + courseDetails.courseType
                    };

                    setTimeout((function () {
                        app.NotificationUtils.sendActivityStreamEvent(course, 'course', 'launch');
                    }), 0);
                    this.transitionTo('launchquiz', {
                        quizId: courseDetails.quizID,
                        courseId: courseDetails.courseId
                    }, {
                        courseId: courseDetails.courseId
                    });
                },

                gotoPage: function (pageValue) {
                    this.set('pageNumber', pageValue)
                }
            }
        });
        App.IndLearningPlanController = Ember.ObjectController.extend({
            _currentView: "list-view",
            queryParams: ['showMessage', 'ltype'],
            showMessage: false,
            isGridView: function () {
                return this.get('_currentView') == 'grid-view';
            }.property("_currentView"),
            isUpdate: false,
            isEdit: false,
			ilpDate:"",
			setIlpDate: function () {
				this.set("ilpDate", this.ilpDate);
            }.observes("ilpDate"),
            actions: {
                createIndividualLearningPlan: function (learningPlanName, completeByDate) {     
                    var self = this;
                    var model = self.get("model");
                    var learningPlanName = model.get("name");
                    var taskDesc = model.get("taskDesc");
                    try {
                        learningPlanName = app.HtmlCharsEncoder(learningPlanName);
                    } catch (err) {
                        console.log("Error in removing HTML chars: " + err);
                    }
                    var errors = {}
                    model.set("errors", errors);
                    if (!learningPlanName || learningPlanName.trim() == "") {
                        errors.title = "Title Should Not Be Empty";
                    }
                    if (!app.checkTitle(learningPlanName)) {
                        errors.title = "Title Has Invalid Character";
                    }
					var date = self.ilpDate;
                    var currDate = Math.round(new Date().getTime() / 1000);
					if(date == ""){
						errors.date = "Date Should Not Be Empty";
					}else{
						date = (new Date(date).getTime() / 1000) + 86400;
						if (date < currDate) {
							errors.date = "Date Should Be Future Date";
						}
					}

                    if (errors.date || errors.title) {
                        model.set("errors", errors);
                        return;
                    }
                    learningPlanService.createIndividualLearningPlan(learningPlanName, date-86400).then(function (response) {
                            if (response.id) {
                                $.gritter.add({title: '', text: 'Learning plan created successfully.', class_name: 'gritter-success'});
                                self.transitionTo('learningPlans');
                            } else {
                                var errors = {}
                                errors.title = "Unable to Create Learning Plan due to (Plan name already exists/Invalid title value)";
                                model.set("errors", errors);
                                if (errors.title) {
                                    return;
                                }
                            }
                        },
                        function (err) {
                            var errors = {}
                            errors.title = "Unable to Create Learning Plan due to (Plan name already exists/Invalid title value)";
                            model.set("errors", errors);
                            if (errors.title) {
                                return;
                            }
                        });
                },
                createIndividualLearningPlanTask: function (learningPlanId, taskDesc) {
                    var model = this.get("model"),
                        self = this;
                    var errors = {};
                    errors.taskDesc = !taskDesc || taskDesc.trim() == "" ? "Task Should Not Be Empty" : !app.checkTitle(taskDesc) ? "Task Has Invalid Character" : undefined;
                    taskDesc = taskDesc.trim();
                    if (taskDesc.length > 0) {
                        if (_.findWhere(model.learning_items, {
                            taskDesc: model.get("taskDesc").trim()
                        })) {
                            errors.taskDesc = "Task name already exists";
                        }
                    }
                    model.set("errors", errors);
                    if (errors.taskDesc) {
                        return;
                    }
                    var status = 1
                    learningPlanService.createIndividualLearningPlanTask(learningPlanId, taskDesc, status).then(function (response) {
                            model.learning_items = model.learning_items ? model.learning_items : [];
                            response.createTaskData.courseId = response.createTaskData.courseId == " " ? undefined : response.createTaskData.courseId;
                            model.learning_items.pushObject(response.createTaskData);
                            $.gritter.add({title: '', text: 'Task Created Successfully for Current Individual Learning Plan.', class_name: 'gritter-success'});
                            self.set("learning_items", model.learning_items);
                            self.set("model", model);
                            self.send("resetTask");
                        },
                        function (err) {
                            $.gritter.add({title: '', text: 'Unable to Create Task due to error', class_name: 'gritter-error'});
                        });
                },
                resetTask: function () {
                    this.get("model").set("taskDesc", "");
                },
                editTask: function (taskId, taskDesc) {
                    var self = this,
                        learningItems = self.get('model').learning_items;
                    var items = [];
                    learningItems.forEach(function (itemId) {
                        self.set('model.errors', '');
                        if (taskId == itemId.id) {
                            itemId.isEdit = true;
                        }
                        else {
                            itemId.isEdit = false;
                        }
                        items.push(itemId);
                        self.set('learning_items', items);
                    });
                },
                updateTask: function (taskId, taskName) {
                    var model = this.get("model"),
                        self = this,
                        errors = {};
                    errors.taskName = !taskName || taskName.trim() == "" ? "Task Should Not Be Empty" : !app.checkTitle(taskName) ? "Task Has Invalid Character" : undefined;
                    model.set("errors", errors);
                    if (errors.taskName) {
                        return;
                    }
                    learningPlanService.updateIndividualLearningPlanTask(taskId, taskName).then(function (response) {
                            if (response.id) {
                                var learningItems = self.get('model').learning_items,
                                    items = [];
                                learningItems.forEach(function (itemId) {
                                    if (itemId.id.toString() === response.id) {
                                        itemId.isEdit = false;
                                    }
                                    items.push(itemId);
                                    self.set('learning_items', items);
                                });
                                $.gritter.add({title: '', text: 'Task Updated Successfully for Current Individual Learning Plan.', class_name: 'gritter-success'});
                            } else {
                                $.gritter.add({title: '', text: 'Task name already exists', class_name: 'gritter-error'});
                            }
                        },
                        function (err) {
                            $.gritter.add({title: '', text: 'Unable to Update Task due to error', class_name: 'gritter-error'});
                        });
                },
                updateIndividualLearningPlan: function (learningPlanId, learningPlanName) {
                  Ember.set(this.controllerFor('indLearningPlan'), "showMessage", false);
                    var model = this.get("model");
                    var errors = {};
					var date = this.ilpDate;
                    var currDate = Math.round(new Date().getTime() / 1000);
					if(date == ""){
						errors.date = "Date Should Not Be Empty";
					}else{
						date = (new Date(date).getTime() / 1000) + 86400;
						if (date < currDate) {
							errors.date = "Date Should Be Future Date";
						}
					}

                    if (!learningPlanName || learningPlanName.trim() == "") {
                        errors.title = "Title Should Not Be Empty";
                    }
                    if (!app.checkTitle(learningPlanName)) {
                        errors.title = "Title Has Invalid Character";
                    }
                    model.set("errors", errors);
                    if (errors.date || errors.title) {
                        return;
                    }
                    learningPlanService.updateIndividualLearningPlan(learningPlanId, learningPlanName, date-86400).then(function (response) {
                            if (response.id) {
                                $.gritter.add({title: '', text: 'Learning Plan updated successfully', class_name: 'gritter-success'});
                            } else {
                                var errors = {}
                                errors.title = "Unable to Update Learning Plan due to Plan name already exists";
                                model.set("errors", errors);
                                if (errors.title) {
                                    return;
                                }
                            }
                        },
                        function (err) {
                            var errors = {}
                            errors.title = "Unable to Update Learning Plan due to Plan name already exists";
                            model.set("errors", errors);
                            if (errors.title) {
                                return;
                            }
                        });
                }
            }
        });
    });