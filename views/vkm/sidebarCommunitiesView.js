define(["app",
	"ember",
	"text!templates/vkm/sidebarCommunities.hbs",
	"httpClient",
	"services/vkmservices/landingDemoService",
	"services/vkmservices/topicDemoServices",
	"controllers/utils/vkmuiUtil"
], function(app, ember, sidebarCommunities, httpClient, landing_demo, topic_demo, vkmui) {
		SidebarCommunitiesView = Ember.View.extend({
			defaultTemplate: Ember.Handlebars.compile(sidebarCommunities)


		});
	return SidebarCommunitiesView;
});


