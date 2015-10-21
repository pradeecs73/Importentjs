define(["app",
	"ember",
	"text!templates/vkm/topicsTemplate.hbs",
	"services/vkmservices/topicDemoServices",
	"httpClient",
	"controllers/utils/vkmuiUtil"
	
	

], function(app, Ember, topicsTemplate,topicDemo, httpClient, vkmuiUtil) {
	var TopicsView = Ember.View.extend({

		defaultTemplate: Ember.Handlebars.compile(topicsTemplate),
		
        didInsertElement: function() {
        	var self = this,
        		vkmui = app.vkmui;
        	self.get('controller').set('skillLabel', skillLabel);
        	topicDemo.showRelatedTopicsDemo(skillUri,skillLabel).then(function(relatedTopics){
        		self.get("controller").set("relatedTopics", relatedTopics);
        		
        	});
        		vkmui.createAccordion('#topicDetailAccordion', true); // true means panels are independent of each other

			}
	});
	return TopicsView;
});