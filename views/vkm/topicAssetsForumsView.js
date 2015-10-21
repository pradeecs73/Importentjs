define(["app",
	"ember",
	"text!templates/vkm/topicAssetsForums.hbs",
	"services/vkmservices/topicDemoServices",
	"httpClient"
	

], function(app, Ember, topicAssetsForums, topicDemo, httpClient) {
		TopicAssetsForumsView = Ember.View.extend({
		defaultTemplate: Ember.Handlebars.compile(topicAssetsForums),
		didInsertElement:function(){
			var self = this,
				vkmui = app.vkmui;
			topicDemo.getAssetsTopic('forum', skillLabel).then(function(topicAssetsForums){
				topicAssetsForums.forEach(function(forum){
					forum.creationDate = forum.creationDate.slice(0,10);
					forum.assetURL = forum.assetURL.substring(forum.assetURL.lastIndexOf('/')+1);
				});
				
				if(topicAssetsForums.length > 0){
	        		self.get('controller').set("topicAssetsForums", topicAssetsForums);
	                self.get('controller').set("assetsForumsCount", topicAssetsForums.length);
	                Ember.run.schedule('afterRender', self, self.callAfterRender);
                }
                else{
                	self.get('controller').set("topicAssetsForums", []);
                	self.get('controller').set("assetsForumsCount", 0);
                }
        	});
		},
		callAfterRender:function(){
			app.vkmui.initSlider("#forums-slider");
		}
	});
	return TopicAssetsForumsView;
});
