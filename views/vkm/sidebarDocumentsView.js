define(["app",
	"ember",
	"text!templates/vkm/sidebarDocuments.hbs",
	"httpClient",
	"services/vkmservices/landingDemoService",
	"services/vkmservices/topicDemoServices",
	"controllers/utils/vkmuiUtil"
	
], function(app, ember, sidebarDocuments, httpClient, landing_Demo, topic_demo, vkmui) {
		SidebarDocumentsView = Ember.View.extend({
			defaultTemplate: Ember.Handlebars.compile(sidebarDocuments)
			
		});
	return SidebarDocumentsView;
});


