define(["app",
	"ember",
	"text!templates/vkm/topicCommunity.hbs",
	"services/vkmservices/topicDemoServices",
	"httpClient"
	

], function(app, Ember, topicCommunity, topicDemo, httpClient) {
		TopicCommunityView = Ember.View.extend({
		defaultTemplate: Ember.Handlebars.compile(topicCommunity),
		didInsertElement:function(){
			var self = this;
			topicDemo.showCommunities(skillUri,skillLabel).then(function(topicCommunity){

				topicCommunity.forEach(function(topic){
					topic.communityURI = topic.communityURI.substring(topic.communityURI.lastIndexOf('/')+1);
				});
        		
        		self.get('controller').set("topicCommunity", topicCommunity);
                self.get('controller').set("communitycount", topicCommunity.length);
        	});
		}
	});
	return TopicCommunityView;
});
