define(["app",
	"ember",
	"text!templates/vkm/topicAssetsWikis.hbs",
	"services/vkmservices/topicDemoServices",
	"httpClient"
	
	

], function(app, Ember, topicAssetsWikis, topicDemo, httpClient) {
		TopicAssetsWikisView = Ember.View.extend({
		defaultTemplate: Ember.Handlebars.compile(topicAssetsWikis),
		didInsertElement:function(){
			var self = this,
				vkmui = app.vkmui;
			topicDemo.getAssetsTopic('wiki', skillLabel).then(function(topicAssetsWikis){
				topicAssetsWikis.forEach(function(wiki){
					wiki.creationDate = wiki.creationDate.slice(0,10);
					wiki.assetURL = wiki.assetURL.substring(wiki.assetURL.lastIndexOf('/')+1);
				});

				if (topicAssetsWikis.length > 0){
	        		self.get('controller').set("topicAssetsWikis", topicAssetsWikis);
	                self.get('controller').set("assetsWikisCount", topicAssetsWikis.length);
	                Ember.run.schedule('afterRender', self, self.callAfterRender);
                }
                else{
                	self.get('controller').set("topicAssetsWikis", []);
                	self.get('controller').set("assetsWikisCount", 0);
                }
        	});
		},
		callAfterRender:function(){
			app.vkmui.initSlider("#wiki-slider");
		}
	});
	return TopicAssetsWikisView;
});
