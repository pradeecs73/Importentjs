'use strict';
define(['app', 'httpClient', 'underscore', 'services/formallearning/learningPlanService', 'services/formallearning/courseService', "pages/learningPlan"],
    function (app, httpClient, _, learningPlanService, courseService, learningPlan) {
        App.PlpDetailsController = Ember.ObjectController.extend({
			
			courseHelper: function(status) {
				var lpCourses = [];
				var model = this.get('model').learningPlanItems;
				model.forEach(function(course){
					if (status && (course.isELearning || course.isAssessment || course.isScorm)){
						course.showRegister = true;
					}
					else if(course.showRegister){
						delete course.showRegister;
					}
					lpCourses.push(course)
				});
				this.set('model.learningPlanItems', lpCourses);
			},
			
			plpItemHelper: function(plpId) {
				var self = this;
				return learningPlanService.getPLPdetails(plpId.toString()).then(function(plp){
					learningPlan.plpDetailsData(plp);
					self.set('model.learningPlanItems', plp.learningPlansData.learningPlanItems);
				});
			},
			showStatusMessage:function(alertClass,iconClass,alertMsg){
				jQuery('#status-message-div').removeClass('hide');
				jQuery('#status-message-div').removeClass().addClass("alert "+alertClass);
				jQuery('#status-message-icon').removeClass().addClass(iconClass);
				jQuery('#status-message-text').text(alertMsg);
			},
        	actions: {
				onLaunch: function(courseDetails) {
					var course = {
						id: courseDetails.courseid,
						title: courseDetails.fullname,
						resourceUrl: "#/learningCourse/" + courseDetails.courseid + "?coursetype=" + courseDetails.course_type
					};
					setTimeout((function(){app.NotificationUtils.sendActivityStreamEvent(course, 'course', 'launch');}), 0);
					window.open(courseDetails.launchurl, '_blank');
				},
				onInvalidLaunch: function() {
					$.gritter.add({title: '', text: 'This course cannot be launched unless the previous course is completed.', class_name: 'gritter-error'});
				},
				togglePrescribedLearningPlanEnrollment: function(actionType, plpId, enrollmentId, managerApproval) {
                    var self = this,
                        type = "Prescribed",
                        status = (actionType == "enrol") ? null : (actionType == "register") ? 1 : 0,
                        successCallback = function (response) {
							switch (status) {
								case null:
									$.gritter.add({title:'', text: 'You have enrolled into the prescribed learning plan successfully.', class_name: 'gritter-success'});
									self.set('model.learningPlan.assignStatus', true);
									self.set('model.learningPlan.assignedBy', app.getUsername());
									var plp = {id: self.get('model.id'), title: self.get('model.title'), resourceUrl: "/#/plpDetails/" + self.get('model.id')};
									app.NotificationUtils.sendActivityStreamEvent(plp, 'Prescribed Learning Plan', 'enroll');
									break;
								case 0:
									$.gritter.add({title:'', text: 'You have dropped from the prescribed learning plan successfully.', class_name: 'gritter-success'});
									self.set('model.learningPlan.status', status);
									self.courseHelper(status);
									self.set('model.learningPlan.registerStatus', false);
									self.set('model.learningPlan.pendingApproval', false);
									break;
								case 1:
									$.gritter.add({title:'', text: 'You have registered into the prescribed learning plan successfully.', class_name: 'gritter-success'});
									self.set('model.learningPlan.status', status);
									self.plpItemHelper(plpId);
									self.set('model.learningPlan.registerStatus', true);
									self.set('model.learningPlan.enrollmentId', response.entity.id);
									if (managerApproval) {
										self.set('model.learningPlan.pendingApproval', response.entity.status == "PENDING" ? true : false);
									}
									break;
							}
							app.CourseUtils.upDatePlpStatus(self);
                        },
                        errorCallBack = function (err) {
							$.gritter.add({title:'', text: 'Unable to register/drop to prescribed learning plan.', class_name: 'gritter-error'});
                        };
                    switch(actionType){
                        case "enrol":
                            var currentDate = new Date(), 
								completedByDate = parseInt(currentDate/1000),
								useremail = [app.getUsername()],
								plpId = [plpId];
								
							learningPlanService.prescribeLearningPlanToUser(useremail, plpId, completedByDate).then(successCallback, errorCallBack);
                            break;
                        case "register":
                            learningPlanService.enrollOrDropPrescribedLearningPlan(plpId, actionType, enrollmentId, managerApproval).then(successCallback, errorCallBack);
                            break;
						case 'drop':
							learningPlanService.enrollOrDropPrescribedLearningPlan(plpId, actionType, enrollmentId, managerApproval).then(successCallback, errorCallBack);
                            break;
                    }
				},
				enrollCourse: function(courseId, mangerApproval) {
					var self = this,
						plpCourseList = [];
					courseService.enrollCourse(courseId, mangerApproval).then(function (response) {
                        var courses = self.get("model.learningPlanItems");
						courses.forEach(function(course) {
							if (course.courseid == courseId) {
								course.courseCompleted = true;
								course.enrollmentId = response.entity ? response.entity.id : "";
								if (mangerApproval) {
									course.pendingApproval = response.entity.status == "PENDING" ? true : false;
								}
							}
							plpCourseList.push(course);
						});
                        self.set("model.learningPlanItems", plpCourseList);
						$.gritter.add({title:'', text: 'You have enrolled into the course successfully.', class_name: 'gritter-success'});
						app.CourseUtils.upDatePlpStatus(self);
                    }, function (err) {
						$.gritter.add({title:'', text: 'Unable to enroll/drop the course', class_name: 'gritter-error'});
                    });
				},
				cancelCourse: function(courseId, enrollmentId) {
					var self = this,
						plpCourseList = [];
					courseService.cancelEnrollCourse(enrollmentId, courseId).then(function (response) {
                        var courses = self.get("model.learningPlanItems");
						courses.forEach(function(course) {
							if (course.courseid == courseId) {
								course.courseCompleted = false;
								course.pendingApproval = false;
							}
							plpCourseList.push(course);
						});
                        self.set("model.learningPlanItems", plpCourseList);
						$.gritter.add({title:'', text: 'You have dropped into the course successfully.', class_name: 'gritter-success'});
						app.CourseUtils.upDatePlpStatus(self);
                    }, function (err) {
						$.gritter.add({title:'', text: 'Unable to enroll/drop the course', class_name: 'gritter-error'});
                    });
				},
				disabledCourse: function() {
                    $.gritter.add({title:'', text: 'Sorry, new registrations are disabled to this course.', class_name: 'gritter-error'});
                }
        	}

        });
 });