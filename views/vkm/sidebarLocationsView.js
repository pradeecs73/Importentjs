define(["app",
	"ember",
	"text!templates/vkm/sidebarLocations.hbs",
	"httpClient"
	

], function(app, Ember, sidebarLocations, httpClient) {
		SidebarLocationsView = Ember.View.extend({
			defaultTemplate: Ember.Handlebars.compile(sidebarLocations),
			
		});
	return SidebarLocationsView;
});
