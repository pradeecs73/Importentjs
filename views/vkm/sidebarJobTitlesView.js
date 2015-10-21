define(["app",
	"ember",
	"text!templates/vkm/sidebarJobTitles.hbs",
	"httpClient"

], function(app, Ember, sidebarJobTitles, httpClient) {
		SidebarJobTitlesView = Ember.View.extend({
			defaultTemplate: Ember.Handlebars.compile(sidebarJobTitles)
		});
	return SidebarJobTitlesView;
});
