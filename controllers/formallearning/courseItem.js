define(['app', 'httpClient', 'pages/documentItems', 'emberPageble', 'text!templates/formallearning/course.hbs', 'services/formallearning/courseService', 'services/usersService'],
  function (app, httpClient, documentItems, emberPageble, courseTemplate, courseService, usersService) {
	
	app.CourseItemView = Ember.View.extend({
    });
    
    app.CourseItemController = Ember.ObjectController.extend({
    	init: function() {
            if(!Ember.TEMPLATES["courseItem"]) {
                Ember.TEMPLATES["courseItem"] = Ember.Handlebars.template(Ember.Handlebars.precompile(courseTemplate));
            }
            var reporteesUsername = this.controllerFor('myEnrollment').get("reporteesUsername") ? this.controllerFor('myEnrollment').get("reporteesUsername"):'';
            this.set('reporteesUsername', reporteesUsername);
            
        },
    	isGridView: function () {
            return this.parentController.get('_currentView') == 'grid-view';
        },
        showStatusMessage:function(alertClass,iconClass,alertMsg){
                jQuery('#status-message-div').removeClass('hide');
                jQuery('#status-message-div').removeClass().addClass("alert "+alertClass);
                jQuery('#status-message-icon').removeClass().addClass(iconClass);
                jQuery('#status-message-text').text(alertMsg);
        },
        prepareDetailsForLaunchNotification: function(courseDetails) {
            return {
                id: courseDetails.Id,
                title: courseDetails.title,
                resourceUrl: "#/learningCourse/" + courseDetails.Id + "?coursetype=" + courseDetails.courseType
            }
        },
    	actions: {
            onLaunch: function(courseDetails) {
                 setTimeout((function(){app.NotificationUtils.sendActivityStreamEvent(this.prepareDetailsForLaunchNotification(courseDetails), 'course', 'launch');}), 0);
                 window.open(courseDetails.launchUrl, '_blank');
            },
            enrollCourse:  function (courseId, managerApproval) {
                var self = this.parentController; // since all the changes needs to be done in the parentcontroller for the current view
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
					$.gritter.add({title:'', text: 'You have enrolled into the course successfully.', class_name: 'gritter-success'});
                }, function (err) {
                    self.showStatusMessage('alert-danger', 'icon-remove', 'Error in course enrollment');
                });
            },
            unEnrollCourse: function(courseId, enrollmentId) {
                var self = this.parentController;
                courseService.cancelEnrollCourse(enrollmentId, courseId).then(function (response) {
                    var courses = self.get("courses.data");
                    self.get("courses").propertyWillChange("data");
                    for (var i = 0; i < courses.length; i++) {
                        if (courses[i].id == courseId) {
                            if(self.get('removeOnUnenroll') == true) {
                                self.get("model").courses.removeObject(courses[i]);
                                courses.removeObject(courses[i]);
                                break;
                            }
                            courses[i].isUserEnroled = false;
							courses[i].pendingApproval = false;
                            break;
                        }
                    }
                    self.set("courses.data", courses);
                    self.get("courses").propertyDidChange("data");
				   $.gritter.add({title:'', text: 'Course drop is successful.', class_name: 'gritter-success'});
                }, function (err) {
                    self.showStatusMessage('alert-danger', 'icon-remove', 'Error in cancelling enrolling course');
                });
            },
            deleteLearningAssetFromShare : function(courseId, sharedBy) {
            	var self = this;
                usersService.myProfile().then(function(profile){
                    var data = {
                        courseId : courseId,
                        email : profile.username,
                        sharedBy : sharedBy
                    }
                    httpClient.post("/knowledgecenter/cclom/shared/course/delete", data).then(function (response){
                        var model = self.parentController.get("courses.data");
                        var courses = [];
                        _.each(model, function(course, coukey) {
                            if (courseId == course.id) {
                                if(self.parentController.get('shared') == true  && course.sharedByEmail == sharedBy)
                                    return;
                            }
                            courses.push(course);
                        });
                        self.parentController.set('courses.data', courses);
                        $.gritter.add({title:'', text: 'You have successfully removed the course from shared list.', class_name: 'gritter-success'});
                    });
                });
            },
            transition: function(courseDetails) {
                setTimeout((function(){app.NotificationUtils.sendActivityStreamEvent(this.prepareDetailsForLaunchNotification(courseDetails), 'course', 'launch');}), 0);
                this.transitionTo('launchquiz', {
                    quizId: courseDetails.quizId,
                    courseId: courseDetails.id
                }, {
                    courseId: courseDetails.id
                });
            }
        }
    });
    
    
  })