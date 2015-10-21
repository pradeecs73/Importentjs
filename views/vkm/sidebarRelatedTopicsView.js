define(["app",
	"text!templates/vkm/sidebarRelatedTopics.hbs",
	"httpClient"

	
], function(app, sidebarRelatedTopics, httpClient) {
		SidebarRelatedTopicsView = Ember.View.extend({
			defaultTemplate: Ember.Handlebars.compile(sidebarRelatedTopics)

		});
	return SidebarRelatedTopicsView;
});


