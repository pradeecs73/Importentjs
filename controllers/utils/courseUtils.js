define(['app'],
    function (app) {
        app.CourseUtils = Ember.Object.create({
            upDatePlpStatus: function(context) {
                var self = this;
                var plpData = context.get('learningPlan');

                if (!("assignedBy" in plpData) || plpData.assignedBy == null) {
                    context.set('learningPlan.currentStatus', 'Not Enrolled');
                } else if (plpData.assignedBy != undefined && plpData.assignedBy != "") {
                    if (plpData.registerStatus) {
                        if (self.wereAllMandatoryCoursesCompleted(plpData.learningPlanItems)) {
                            context.set('learningPlan.currentStatus', "Completed");
                        } else if (self.wasAnyCourseInProgressOrCompleted(plpData.learningPlanItems)){
                            context.set('learningPlan.currentStatus', "In Progress");
                        } else {
                            context.set('learningPlan.currentStatus', "Registered");
                        }
                    } else {
                        context.set('learningPlan.currentStatus', "Enrolled");
                    }
                }
            },
            wereAllMandatoryCoursesCompleted: function(courses) {
                var self = this;
                if(self.doMandatoryCoursesExist(courses)) {
                    for(var i = 0; i < courses.length; i++) {
                        if(self.isCoursemandatory(courses[i])) {
                            if (!self.isCourseCompleted(courses[i])) {
                                return false;
                            }
                        }
                    }
                } else {
                    for(var i = 0; i < courses.length; i++) {
                        if (!self.isCourseCompleted(courses[i])) {
                            return false;
                        }
                    }
                }
                return true;
            },
            wasAnyCourseInProgressOrCompleted: function(courses){
                var self = this;
                for(var i = 0; i < courses.length; i++) {
                    if (self.isCourseInProgress(courses[i]) || self.isCourseCompleted(courses[i])) {
                        return true;
                    }
                }
                return false;
            },
            doMandatoryCoursesExist: function(courses) {
                var self = this;
                for(var i = 0; i < courses.length; i++) {
                    if (self.isCoursemandatory(courses[i])) {
                        return true;
                    }
                }
                return false;
            },
            isCoursemandatory: function(course) {
                return course.mandatory == 1;
            },
            isCourseCompleted: function(course) {
                return course.isCourseCompleted;
            },
            isCourseInProgress: function(course) {
                var self = this;
                return (!self.isCourseCompleted(course) && course.courseCompleted);
            }
        });
    });
