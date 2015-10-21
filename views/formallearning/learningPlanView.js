"use strict";
define(["app", "pages/messageModelHide", "text!templates/formallearning/learningPlans.hbs", "text!templates/formallearning/indLearningPlan.hbs", 'emberPageble'],
    function(app, messageModelHide, learningPlansTemplate, indLearningPlanTemplate, emberPageble) {
        App.LearningPlansView = Ember.View.extend({
            template: Ember.Handlebars.compile(learningPlansTemplate),
            didInsertElement: function() {
                messageModelHide.addHideMessageModelEvent("successMessageDiv");
            },
            toggleView: function(view) {
                Ember.set(this.controller, "showMessage", false);
                this.controller.set('_currentView', view);
                var courses = this.controller.get('courses.data');
                _.each(courses, function(course, key) {
                    if (view == 'list-view')
                        course.listView = true;
                    else
                        course.listView = false;
                });
                this.controller.set('courses.data', courses);
            }
        });  
        App.IndLearningPlanView = Ember.View.extend({
            template: Ember.Handlebars.compile(indLearningPlanTemplate),
            didInsertElement: function() {
				var self = this;
                messageModelHide.addHideMessageModelEvent("successMessageDiv");
				var model = self.controller.get('model');
				jQuery('.plp-date').datepicker('setDate', model.ilpDate);
            },
            toggleView: function(view) {
                Ember.set(this.controller, "showMessage", false);
                this.controller.set('_currentView', view);
                var courses = this.controller.get('courses.data');
                _.each(courses, function(course, key) {
                    if (view == 'list-view')
                        course.listView = true;
                    else
                        course.listView = false;
                });
                this.controller.set('courses.data', courses);
            }
        });
});