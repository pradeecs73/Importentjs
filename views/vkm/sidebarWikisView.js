define(["app",
	"ember",
	"text!templates/vkm/sidebarWikis.hbs",
	"httpClient",
	"services/vkmservices/landingDemoService",
	"controllers/utils/vkmuiUtil"

], function(app, ember, sidebarWikis, httpClient, landing_Demo, vkmui) {
		SidebarWikisView = Ember.View.extend({
			defaultTemplate: Ember.Handlebars.compile(sidebarWikis)

		});
	return SidebarWikisView;
});


