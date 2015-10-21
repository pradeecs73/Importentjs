define(["app",
	"ember",
	"text!templates/vkm/sidebarBlogs.hbs",
	"httpClient",
	"services/vkmservices/landingDemoService",
	"controllers/utils/vkmuiUtil"

], function(app, ember, sidebarBlogs, httpClient, landing_Demo, vkmui) {
		SidebarBlogsView = Ember.View.extend({
			defaultTemplate: Ember.Handlebars.compile(sidebarBlogs)

		});
	return SidebarBlogsView;
});


