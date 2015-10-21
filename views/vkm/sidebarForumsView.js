define(["app",
	"ember",
	"text!templates/vkm/sidebarForums.hbs",
	"httpClient",
	"services/vkmservices/landingDemoService",
	"controllers/utils/vkmuiUtil"


], function(app, ember, sidebarForums, httpClient, landing_Demo, vkmui) {
		SidebarForumsView = Ember.View.extend({
			defaultTemplate: Ember.Handlebars.compile(sidebarForums)

			
		});
	return SidebarForumsView;
});