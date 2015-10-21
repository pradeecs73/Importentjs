'use strict';

define(["app", "text!templates/components/courseListItemComponent.hbs", 'controllers/utils/notificationUtils'], function(app, courseListItemTemplate, notificationUtils) {
    app.CourseListItemComponent = Ember.Component.extend({
        template: Ember.Handlebars.compile(courseListItemTemplate),
        actions: {
            onLaunch: function(courseDetails) {
                var course = {id: courseDetails.id, title: courseDetails.name, resourceUrl: "#/learningCourse/" + courseDetails.id + "?coursetype=" + courseDetails.courseType}
                setTimeout((function(){app.NotificationUtils.sendActivityStreamEvent(course, 'course', 'launch');}), 0);
                window.open(courseDetails.launchUrl, '_blank');
            },
            transition: function(courseDetails) {
                this.sendAction('transition', courseDetails);
            }
        }
    });
});