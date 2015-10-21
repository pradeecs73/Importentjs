define(["app",
	"ember",
	"text!templates/vkm/topicAssetsDocuments.hbs",
	"services/vkmservices/topicDemoServices",
	"httpClient"

], function(app, Ember, topicAssetsDocuments, topicDemo, httpClient) {
		TopicAssetsDocumentsView = Ember.View.extend({
		defaultTemplate: Ember.Handlebars.compile(topicAssetsDocuments),
		didInsertElement:function(){
			var self = this;
			var userId = app.getUsername().replace(/[@\.\-]/g, '_');
			var user;	
			
			topicDemo.getAssetsTopic('document', skillLabel).then(function(topicAssetsDocuments){
				
				topicAssetsDocuments.forEach(function(doc){

					user = doc.authorId;
					
					doc.assetURL = doc.assetURL.substring(doc.assetURL.lastIndexOf('/')+1);
					
					doc.creationDate = doc.creationDate.slice(0,10);
					
					doc.mediaExtension = doc.mediaExtension.toLowerCase();
					switch(doc.mediaExtension){
							case "pdf":
								doc.img = 'assets/images/docs/pdf-file.png';
								break;
							case "xls":
								doc.img = 'assets/images/docs/xls-file.png';
								break;
							case "xlsx":
								doc.img = 'assets/images/docs/xlsx-file.png';
								break;
							default:
								doc.img = 'assets/images/docs/doc-file.png';
								break;
						}
				});
				if(userId == user){
					self.get('controller').set("match", true);
				}
				if(topicAssetsDocuments.length > 0){
					self.get('controller').set("topicAssetsDocuments", topicAssetsDocuments);
	                self.get('controller').set("documentsCount", topicAssetsDocuments.length);
	                Ember.run.schedule('afterRender', self, self.callAfterRender);
                }
                else{
                	self.get('controller').set("topicAssetsDocuments", []);
                	self.get('controller').set("documentsCount", 0);
                }
        	});
		},
		callAfterRender:function(){
			app.vkmui.initSlider('#docs-slider');
		}
	});
	return TopicAssetsDocumentsView;
});
