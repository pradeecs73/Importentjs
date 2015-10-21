var relatedTopicArr = [];
var expertsArr = [];
define(["app","ember","httpClient"], 
	function(app, Ember, httpClient){

		showRelatedTopicsDemo = function (skillUri, skillLabel){
		
		var relatedTopicArry = [];
		var topicClassArray = [];
		var querypart 	 = "topicURI="+ escape(skillUri);
			var queryPayload = "topicLabel="+ escape(skillLabel)+"&limit=10";
			var	url1 = '/knowledgecenter/km/topics/relatedTopics?topicURI='+escape(skillUri),
			    url2 = '/knowledgecenter/km/topics/relatedTopicsByLabel?topicLabel='+escape(skillLabel);
		
		
			return httpClient.post(url1 , querypart , {"Content-Type":"application/x-www-form-urlencoded", "stringify":"true"}).then(function (ajaxResponse) {
				$.each(ajaxResponse.results, function(j, topic){
					relatedTopicArry.push(topic.topicTitle);
					topicClassArray.push(topic.ClassName);
				});
					return httpClient.post(url2 , queryPayload , {"Content-Type":"application/x-www-form-urlencoded", "stringify":"true"}).then(function (ajaxResponse) {
						
						$.each(ajaxResponse.results, function(k, topic){
							relatedTopicArry.push(topic.topicTitle);
							topicClassArray.push(topic.ClassName);
							
						});
							var uniqueRelTopics = _.without(_.uniq(relatedTopicArry), "Undefined");
							var uniqueTopicClass = _.without(_.uniq(topicClassArray), "Undefined");
							var topicObj = _.union(uniqueRelTopics , uniqueTopicClass);
						
							return topicObj;
							//renderRelatedTopics(totalAjaxArray);
			  		},function(err){
	            	
	       			 });
				 },function(err){
	            	
	        	});	
	},

		
		showKnowledgePeople = function(skillUri){
			var totalAjaxArray = [];
			//querypart 	 = "topicURI="+ escape(skillUri);
			//var queryPayload = "topicLabel="+ escape(skillLabel)+"&limit=10";

			var url= '/knowledgecenter/kmap/experts?topicURI='+escape(skillUri);

				return httpClient.post(url , undefined , {"Content-Type":"application/x-www-form-urlencoded", "stringify":"true"}).then(function (ajaxResponse) {
					$.each(ajaxResponse, function(j, topic){
						totalAjaxArray.push(topic);
					});
						return totalAjaxArray;
					
				});

		},

		showCourses = function (skillUri,skillLabel){
			

			var totalAjaxArray = [];
			querypart 	 = "topicString="+ escape(skillUri);
			var queryPayload = "topicString="+ escape(skillLabel),
				url = '/knowledgecenter/kmap/courses?topicString='+escape(skillLabel)+"&exclude="+emailId;

			 return httpClient.post(url , undefined , {"Content-Type":"application/x-www-form-urlencoded", "stringify":"true"}).then(function (ajaxResponse) {
					if(!(ajaxResponse.message)){
						$.each(ajaxResponse, function(j, topic){
							totalAjaxArray.push(topic);
						});
					}
					//totalAjaxArray = totalAjaxArray.slice(0,3);
					return totalAjaxArray;
			});

		},

		showCommunities = function (skillUri,skillLabel){
			var totalAjaxArray = [],
			querypart 	 = "topicTag="+ escape(skillUri),
			queryPayload = "topicTag="+ escape(skillLabel),
			url = '/knowledgecenter/kmap/communities?topicTag='+escape(skillLabel)+"&exclude="+emailId;

			return httpClient.post(url , undefined , {"Content-Type":"application/x-www-form-urlencoded", "stringify":"true"}).then(function (ajaxResponse) {
				$.each(ajaxResponse.topics, function(j, topic){
					totalAjaxArray.push(topic);
				});
				
				//totalAjaxArray = totalAjaxArray.slice(0,3);
				return totalAjaxArray;
			});

		},
		
		getAssetsTopic = function (assetType, topicLabel ){
				var totalAjaxArray = [];
				var url = '/knowledgecenter/kmap/assets?assetType='+assetType+'&topicString='+topicLabel+"&exclude="+emailId;

				return httpClient.get(url , undefined, {"Content-Type":"application/x-www-form-urlencoded"})
				.then(function (ajaxResponse) {
					$.each(ajaxResponse, function(j, topic){
						totalAjaxArray.push(topic);
					});
				//totalAjaxArray = totalAjaxArray.slice(0,3);
				return totalAjaxArray;
				
				}, function(err){
				throw err;
			});
				
		};
	return {
		getAssetsTopic : getAssetsTopic,
		showCommunities : showCommunities,
		showCourses : showCourses,
		showKnowledgePeople : showKnowledgePeople,
		showRelatedTopicsDemo :showRelatedTopicsDemo
	}
});