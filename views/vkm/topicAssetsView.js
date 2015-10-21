define(["app",
	"ember",
	"text!templates/vkm/topicAssets.hbs",
	"httpClient"

], function(app, Ember, topicAssets, httpClient) {
		TopicAssetsView = Ember.View.extend({
		defaultTemplate: Ember.Handlebars.compile(topicAssets),
		
	});
	return TopicAssetsView;
});
