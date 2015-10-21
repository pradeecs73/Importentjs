define(["app",
	"ember",
	"text!templates/vkm/topicAssetsBlogs.hbs",
	"services/vkmservices/topicDemoServices",
	"httpClient"
	

], function(app, Ember, topicAssetsBlogs, topicDemo, httpClient) {
		TopicAssetsBlogsView = Ember.View.extend({
		defaultTemplate: Ember.Handlebars.compile(topicAssetsBlogs),
		didInsertElement:function(){
			var self = this,
				vkmui = app.vkmui;
			topicDemo.getAssetsTopic('blog', skillLabel).then(function(topicAssetsBlogs){
				topicAssetsBlogs.forEach(function(blog){
					blog.creationDate = blog.creationDate.slice(0,10);
					blog.assetURL = blog.assetURL.substring(blog.assetURL.lastIndexOf('/')+1);
				});

				if (topicAssetsBlogs.length > 0){
	        		self.get('controller').set("topicAssetsBlogs", topicAssetsBlogs);
	                self.get('controller').set("assetsBlogsCount", topicAssetsBlogs.length);
	                Ember.run.schedule('afterRender', self, self.callAfterRender);
                }
                else{
                	self.get('controller').set("topicAssetsBlogs", []);
                	self.get('controller').set("assetsBlogsCount", 0);	
                }
        	});
		},
		callAfterRender:function(){
			app.vkmui.initSlider("#blog-slider");
		}
	});
	return TopicAssetsBlogsView;
});
