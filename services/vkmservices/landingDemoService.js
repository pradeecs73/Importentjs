var myTopicsArray = [];
var userName;
var emailId;
var jobTitle;
var shortName;
var profileImgUrl;
var skillLabel;
var blogsRawData;
var forumsRawData;
var wikisRawData;
var filesRawData;

 window['defaultMapLayout']= {
            radius: 250,
            vertical: 450,
            startAngle: 180,
            nodeRadius: 34,
            outer: "#social-map",
            inner: "#map-content",
            maxNodesPerPage: 9,
            maxNodePages: 3
      };
define(['app','httpClient', 'Q', 'controllers/utils/vkmui-helpers'],
    function(app, httpClient, Q, vkmui_helpers){
    	
    	
    	(function() {
    		 httpClient.get('/knowledgecenter/userpi/user/myProfile', undefined, {"stringify":"true"})
    		.then(function (data) { 
    			 userName = data.username;
    			 jobTitle = data.jobTitle;
    			 shortName = data.shortName;
    			 profileImgUrl = data.profileImageUrl;
    			console.log(userName);
    			httpClient.get('/knowledgecenter/kmap/'+'email?'+'userId='+userName , undefined, {"stringify":"true"})
	    		.then(function (data){
	    			emailId = data.email;
	    			console.log(emailId);
	    		}, function(err){
	    			throw err;
	    		});
    		}, function(err){
    			throw err;
    		});  
    	})();

		var getUserData = function(){
			
			return httpClient.get('/knowledgecenter/kmap/'+emailId+'/profileSummary', undefined, {"stringify":"true"})
		        .then(function (data) {
		          	userProfileData = data;
		          	return userProfileData;
		      }, function(err){

		        throw err;
		      });
		       
		},


	//function for adding multiple array objects 
	
	 topicfootprintObjOrg = function (array) {
	return {
	    organizations : array,
	    
	};
	},
	
	uniqueArr = function (array){
		
			var arr = array;
			var len = arr.length;
			var results = [];
			for (var i = 0; i < len; i++) {
			  if (arr[i + 1] !== arr[i]) {
			    results.push(arr[i]);
			  }
			}
			return results;

	},

	 topicfootprintObjJobrole = function (array) {
	return {
	    jobRoles : array,
	    
	};
	},
				
	openThirdPanel = function (){
	  openTabPanel('#collapseThree');
	},

	changeMapSelection = function (dropVal){
	  $('#changeKnowledgeView .dropdown-toggle .toggle-text').text(dropVal);
	},

	yearChangeCallback = function (yearVal){
	 
	},

	doNothing = function (){
	  return false;
	},
		
	redrawMaps = function (postObj) {
		//postObj = {}, 
        //data = '',
        self = this,
        url =  '/knowledgecenter/kmap/topicFootprint',
        data = JSON.stringify(postObj);

		 return httpClient.post(url , data, {"Content-Type":"application/json","stringify":"true"}).then(function (ajaxResponse) {
		          var skillArr = [];
		          if(ajaxResponse.topicList.length == 0){
		        	 /* $("#mapErrmsg").css({'visibility':'visible'});*/
		        	 jQuery('#successMessageDiv').html('No Knowledge Topic Map to display for the selected User or Filter Values.');
		        	 jQuery('#successMessageDiv').removeClass('hide');
		          }else{
		        	  
		              $.each(ajaxResponse.topicList, function(i, topic){
		                  myTopicsArray.push(topic.topicName);
		                 skillArr.push(JSON.stringify(createskillObj(topic.source, topic.topicName+'##'+topic.topic, topic.weight)));
		               });
		        	  
		          }
		 
		          return skillArr;
		       
		        },function(err){
		        	$("#social-map").html("");
		        	jQuery('#successMessageDiv').html('No Knowledge Topic Map to display for the selected User or Filter Values.');
		        	jQuery('#successMessageDiv').removeClass('hide');
		            return err;  

		        });
	},  	
	changeTopbarListItems = function(param, url) {
		var dataPayloadOrg =  { organizations : [userProfileData.organizationURI] },
	   		dataPayloadjobRoles = { jobRoles : [userProfileData.jobRoleURI] },
	   		//url = '/knowledgecenter/kmap/topicFootprint',
	   		self = this;
	   		return httpClient.post(url, JSON.stringify(param) , {"Content-Type":"application/json", "stringify":"true"}).then(function (ajaxResponse) {
			var skillArr = [];
		   	$.each(ajaxResponse.topicList, function(i, topic){
		   		//topic.weight = "1.0";
		   		myTopicsArray.push(topic.topicName);
		   		skillArr.push(JSON.stringify(createskillObjgrp(topic.source, topic.topicName+'##'+topic.topic, topic.weight)));
		   	});	
		   return skillArr;
		}, function(err){
			return err;
		});
	},
	showRelatedTopics = function (skillUri, skillLabel){
		
		var relatedTopicArry = [];
		var topicClassArray = [];
		querypart 	 = "topicURI="+ escape(skillUri),
		queryPayload = "topicLabel="+ escape(skillLabel)+"&limit=10",
		url1 = '/knowledgecenter/km/topics/relatedTopics',
		url2 = '/knowledgecenter/km/topics/relatedTopicsByLabel';
		
		
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
							var topicObj = [uniqueRelTopics, uniqueTopicClass];
							return topicObj;
							//renderRelatedTopics(totalAjaxArray);
			  		},function(err){
	            	
	       			 });
				 },function(err){
	            	
	        	});	
	},


	getAssets = function (assetType, topicLabel){
			
			var noOfItems ;
			var divId = '#'+assetType+'List';
			var spanId = '#no'+assetType;
			var totalAjaxArray = [];

			return httpClient.get('/knowledgecenter/kmap/'+emailId+'/assets?assetType='+assetType+'&topicString='+topicLabel+'&limit=3', undefined, {"Content-Type":"application/x-www-form-urlencoded"})
			.then(function (ajaxResponse) {
						var htmlStr = "";
							$.each(ajaxResponse, function(i, item){
								totalAjaxArray.push(item);
								
							});
							//totalAjaxArray = totalAjaxArray.slice(0,3);
							return totalAjaxArray;
						
						
				}, function(err){
				throw err;
			});
			
	},

	getTopExpertsconn = function (skillUri){
		   
		   var topicUriData =  "topicURI="+ escape(skillUri),
		   	 totalAjaxArray = [],
		   				url =  '/knowledgecenter/kmap/'+emailId+'/experts';

		   return httpClient.post(url , topicUriData , {"Content-Type":"application/json", "stringify":"true"}).then(function (ajaxResponse) {
				var htmlStr = "";
				$.each(ajaxResponse, function(i, item){
					totalAjaxArray.push(item);
					/*htmlStr += '<li class="person-wrap"><img class="person-photo" src="assets/avatars/'+userId+'.jpg" onerror="this.src=assets/avatars/noimage_mini.jpg"><span class="person-info" style="width: 179px;"><p class="person-name">'+item.userName+'</p><span class="person-endorsements"> No. of Endorsements: '+item.endorsementCount+' </span><span class="person-endorsements" > Expert Rating: '+item.expertRating+' </span><span class="progress person-progress"><span class="progress-bar" style="width: '+item.expertRating*4+'%;" aria-valuemax="100" aria-valuemin="0" aria-valuenow="1" role="progressbar"> </span></span></span></li>';*/
					});
				return totalAjaxArray;
				
			}, function(err){
				return err;
			});
		   
	},

	getCommunities = function (topicTag){
			var communityQuery,
			totalAjaxArray = [],
			url = '/knowledgecenter/kmap/'+emailId+'/communities';

			/*if(topicTag){
				communityQuery = 'topicTag='+topicTag+'&limit=10';
			}else{
				//VKM2.0 where we limit communities for 25
				communityQuery = 'limit=25';
			}*/

			return httpClient.post(url , communityQuery , {"Content-Type":"application/json", "stringify":"true"}).then(function (ajaxResponse) {
					
				$.each(ajaxResponse.topics, function(i, item){
					totalAjaxArray.push(item);
				});
				//totalAjaxArray = totalAjaxArray.slice(0,3);
				return totalAjaxArray;
					
			}, function(err){
				return err;
			});
			
				
	},

	getCourses = function(topicTag){
			
			var coursePayload = 'topicString='+topicTag,
				url = '/knowledgecenter/kmap/'+emailId+'/courses',
			   totalAjaxArray = [];

			return httpClient.post(url , coursePayload , {"Content-Type":"application/x-www-form-urlencoded", "stringify":"true"}).then(function (ajaxResponse) {
				if(!(ajaxResponse.message)){
					$.each(ajaxResponse, function(i, item){
						totalAjaxArray.push(item);
						
					});
				}
				//totalAjaxArray = totalAjaxArray.slice(0,3);
				return totalAjaxArray;
				
			}, function(err){
				return err;
			});
			
			
	},

	getAllCourses = function(){
		var totalAjaxArray = [];
	
		return httpClient.get('/knowledgecenter/kmap/'+emailId+'/courses', undefined, {"stringify":"true"})
		        .then(function (ajaxResponse) {
		          	if(!(ajaxResponse.message)){
					$.each(ajaxResponse, function(i, item){
						totalAjaxArray.push(item);
						
					});
				}
				return totalAjaxArray;
		      }, function(err){

		        throw err;
		      });
	},

	getAllExperts = function(){
		//var expertQuery = 'topicURI=http://clks.cisco.com/km/t_DataCenterConsolidation',
		var expertQuery = '',
		totalAjaxArray = [];
		return httpClient.post('/knowledgecenter/kmap/'+emailId+'/experts', expertQuery, {"Content-Type":"application/x-www-form-urlencoded", "stringify":"true"}).then(function (ajaxResponse) {
		$.each(ajaxResponse, function(i, item){
			totalAjaxArray.push(item);
		});
		return totalAjaxArray;
	}, function(err){
		throw err;
	});
	},
	
	getAllFiles = function(){
		var totalAjaxArray = [];
	
		return httpClient.get('/knowledgecenter/kmap/'+emailId+'/file', undefined, {"stringify":"true"})
		        .then(function (ajaxResponse) {
		        	filesRawData = ajaxResponse;
				return filesRawData;
		      }, function(err){

		        throw err;
		      });
	},

	

	getAllBlogs = function(){
		var totalAjaxArray = [];
	
		return httpClient.get('/knowledgecenter/kmap/'+emailId+'/blog', undefined, {"stringify":"true"})
		        .then(function (ajaxResponse) {
		        	blogsRawData = ajaxResponse;
				return blogsRawData;
		      }, function(err){

		        throw err;
		      });
	},

	getAllWikis = function(){
		var totalAjaxArray = [];
	
		return httpClient.get('/knowledgecenter/kmap/'+emailId+'/wiki', undefined, {"stringify":"true"})
		        .then(function (ajaxResponse) {
		        	wikisRawData = ajaxResponse;
				return wikisRawData;
		      }, function(err){

		        throw err;
		      });
	},

	getAllForums = function(){
		var totalAjaxArray = [];
	
		return httpClient.get('/knowledgecenter/kmap/'+emailId+'/forum', undefined, {"stringify":"true"})
		        .then(function (ajaxResponse) {
		        	forumsRawData = ajaxResponse;
				return forumsRawData;
		      }, function(err){

		        throw err;
		      });
	},


/*
	fetchUserProfile = function (userId){
		
	},
*/
	createskillObjgrp = function (skillSource, skillName, skillWeight) {

	          
	      
	 
	 return {"name": skillSource, 
		"children": [
			{"name": skillName, "size": skillWeight}
	      
		   ]};
	},


	createskillObj = function(skillSource, skillName, skillWeight) {

	return {"name":skillSource, "children":[{
	    name: skillName,
	    size: skillWeight
	}]};
	},



	createFinalskillObj = function(skillArray) {
		var array = "[" + skillArray + "]";
		return { "children":skillArray};
	},

	/* this function is introduced to give a random number. In future the service will provide the weight for each skill*/
	getSkillWeight = function(min, max) {
	  return Math.round(Math.random() * (max - min) + min);
	},



	topicFootPrintEndorse = function (userId, userUri){
	   		 var arrayData = [],
		   	   skillArray = [],
		   	   endorsedDate,
			   experts = 0,
		   	   prof = 0,
	       	   competent = 0,
	       	   payLoad = {"persons" : [ userUri ]},
	       	   url = '/knowledgecenter/kmap/topicFootprint',
	       	   param = JSON.stringify(payLoad);
							
	       
			return httpClient.post(url , param , {"Content-Type":"application/json", "stringify":"true"}).then(function (ajaxResponse) {
				var skillArr = [];
			   	
			   	$.each(ajaxResponse.topicList, function(i, topic){
			   		myTopicsArray.push(topic.topicName);
			   		skillArr.push(JSON.stringify(createskillObjgrp(topic.source, topic.topicName+'##'+topic.topic, topic.weight)));
			   	});
			   	
			   	var jsonObj = '{"children":['+skillArr+']}';
			  
			   	//$("#sample-bubble-chart").html("");
		        //createSampleGraph(jsonObj);
		        return jsonObj;
			}, function(err){
				return err;
			});

			
	},

	   
		   

	 populateOrg = function (){
	 	/*	
		 	httpclient get expects three parameters url, query and headers, 
		 	since we need to pass headers as the last parameter we are passing undefined as query param 
	 	*/
	 	return httpClient.get('/knowledgecenter/kmap/organizations', undefined, {"Content-Type":"application/x-www-form-urlencoded"})
	 		.then(function(ajaxResponse){
	 			var htmlStr = "";
	 			var totalAjaxArray = [];
		   		$.each(ajaxResponse, function(i, orgName){
		   		totalAjaxArray.push(orgName);
			   	});
			   	return totalAjaxArray;
			   },function(err){
	 			throw err;
	 		})
	 		
	 },
	 
	populateLocation = function(){

		return httpClient.get('/knowledgecenter/kmap/locations', undefined, {"Content-Type":"application/x-www-form-urlencoded"})
			.then(function(ajaxResponse){
					var htmlStr = "";
					var totalAjaxArray = [];
			   		$.each(ajaxResponse, function(i, locName){
			   		totalAjaxArray.push(locName);
				});
			   	return totalAjaxArray;
			   	
			}, function(err){
				throw err;
			})
	 		
			
	 },
	 

	populateJobtitle = function(){

		return httpClient.get('/knowledgecenter/kmap/jobRoles', undefined, {"Content-type": "application/x-www-form-urlencoded"})
			.then(function(ajaxResponse){
				var htmlStr = "";
				var totalAjaxArray = [];
		   		$.each(ajaxResponse, function(i, jobTitle){
		   		totalAjaxArray.push(jobTitle);
		   		});
		   	
		   		return totalAjaxArray;
		   	}, function(err){
			throw err;
		})
			
	 },

		topicBubbleFontSize = function(d){
					console.log('d:-'+d.className);
				    var innerCircleWidth = (d.r)*1.5,
				        fullText      = d.className.split('#')[0],
				        fullTextArr   = fullText.split(" "),
				        originalSize  = 14,
				        maxFontSize   = 19,
				        origFontSet   = originalSize+'px arial',
				        sizeFactor    = null,
				        longestWord   = null;
				        console.log("fullText:- "+fullText);

				    if(fullTextArr.length > 1) {
				    		console.log("fullTextArr: "+fullTextArr+" fullTextArrLong:- "+fullTextArr.longestString());
				      longestWidth = (fullTextArr.longestString()).calculateTextWidth(origFontSet);
				      sizeFactor   = innerCircleWidth / longestWidth;

				    } else {

				      sizeFactor = innerCircleWidth / fullText.calculateTextWidth(origFontSet); 
				    }        

				    updatedFontSize = Math.floor(originalSize * sizeFactor);
				    if(Math.floor(originalSize * sizeFactor) > maxFontSize){
				      updatedFontSize = maxFontSize;
				    }
				    console.log("updatedFontSize: "+updatedFontSize);
				    return updatedFontSize;
				},

				topicBubbleText = function (d, lineLimit){

				    var topicLinesArr = d.className.split('#')[0].createLines({
				        numLines: lineLimit,
				        widthLimit: (d.r)*1.5,
				        fontProps: topicBubbleFontSize(d)+'px Arial, sans-serif',
				        elipsize: true            
				    });

				    var topicLabel = topicLinesArr.join(" "),
				    trimmedLabel   = topicLabel.trim(); 
				    console.log("trimmedLabel:- "+trimmedLabel);
				    return trimmedLabel;

				},


	getExpertUserData = function(userEmail){
		return httpClient.get('/knowledgecenter/kmap/'+userEmail+'/profileSummary', undefined, {"stringify":"true"})
		.then(function (ajaxResponse) {
			return ajaxResponse;
		}, function(err){
			throw err;
		});
	};
		

	 return {
	 	showRelatedTopics : showRelatedTopics,
	 	populateJobtitle : populateJobtitle,
	 	populateLocation : populateLocation,
	 	populateOrg : populateOrg,
	 	topicFootPrintEndorse : topicFootPrintEndorse,
	 	getCourses : getCourses,
	 	getCommunities : getCommunities,
	 	getTopExpertsconn : getTopExpertsconn,
	 	getAssets : getAssets,
	 	changeMapSelection : changeMapSelection,
	 	createskillObjgrp :createskillObjgrp,
	 	createskillObj : createskillObj,
	 	getUserData : getUserData,
	 	redrawMaps : redrawMaps,
	 	changeTopbarListItems : changeTopbarListItems,
	 	topicBubbleText : topicBubbleText,
	 	topicBubbleFontSize : topicBubbleFontSize,
	 	getAllCourses : getAllCourses,
		getAllExperts : getAllExperts,
		getAllFiles : getAllFiles,
	 	getAllBlogs : getAllBlogs,
	 	getAllWikis : getAllWikis,
	 	getAllForums : getAllForums,
	 	getAllFiles : getAllFiles,
	 	getExpertUserData : getExpertUserData

 	}

});

