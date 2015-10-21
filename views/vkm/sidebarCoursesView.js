define(["app",
	"ember",
	"text!templates/vkm/sidebarCourses.hbs",
	"httpClient",
	"services/vkmservices/landingDemoService",
	"services/vkmservices/topicDemoServices",
	"controllers/utils/vkmuiUtil"

], function(app, ember, sidebarCourses, httpClient, landing_demo, topic_demo, vkmui) {
		SidebarCoursesView = Ember.View.extend({
			defaultTemplate: Ember.Handlebars.compile(sidebarCourses),
			relatedcourses: []

			

		});
	return SidebarCoursesView;
});


