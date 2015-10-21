define(["app",
	"text!templates/vkm/sidebarExperts.hbs",
	"httpClient"
	
], function(app, sidebarExperts, httpClient) {
		SidebarExpertsView = Ember.View.extend({
			defaultTemplate: Ember.Handlebars.compile(sidebarExperts)

		});
	return SidebarExpertsView;
});


