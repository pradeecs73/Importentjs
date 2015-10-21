define(["app",
	"text!templates/vkm/sidebarTopicClassification.hbs",
	"httpClient"

], function(app, sidebarTopicClassification, httpClient) {
		SidebarTopicClassificationView = Ember.View.extend({
			defaultTemplate: Ember.Handlebars.compile(sidebarTopicClassification)

		});
	return SidebarTopicClassificationView;
});


