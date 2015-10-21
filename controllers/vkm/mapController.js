define(["app", "ember", "httpClient", "services/vkmservices/landingDemoService", "services/vkmservices/topicDemoServices", "pages/vkm-sidebar-filters", "pages/vkmui-topic-bubbles", "pages/vkmui-modals","pages/vkmui-circular-maps", "pages/vkmui-modals"], function(app, Ember, httpClient, landing_Demo, topic_demo, vkm_sidebar, vkm_bubble, vkm_modals, vkmui_maps, vkm_modals){
	App.MapController = Ember.ObjectController.extend({

		dropdown: [
                {"name": "Endorsed Topics",
                  "value": "myendorseMap",
                  "datatopic" : "endorsements",
                  "dataIcon" : "thumbs-up"
                },
                {"name": "Activity Topics",
                "value": "myMap",
                "datatopic" : "activities",
                "dataIcon" : "running"
                },
                {"name": "Job Role Topics",
                  "value": "jobRoleMap",
                  "datatopic" : "jobs",
                  "dataIcon" : "star"
                },
                {"name": "Organization Topics",
                 "value": "orgMap",
                 "datatopic" : "organizations",
                 "dataIcon" : "network"
                }
                ],
           DummyUser:{"email": "",
                       "endorsementCount": "",
                       "expertRating": "",
                       "funcRole": "",
                       "networkUser": "",
                       "userName": ""
                      },
                   
              relatedCommunities:[],
              relatedCourses : [],
              relatedDocuments : [],
              relatedBlogs :[],
              relatedWikis: [],
              relatedForums: [],

		redrawMap: function(){
		    $(".loading-spinner").css({'display':'inline'});
		    //$("#mapErrmsg").css({'visibility':'hidden'});
		    $('#successMessageDiv').addClass('hide')
		    var items = this.get("items") ? this.get("items") :[],
		    postObj = {}, 
		    data = '',
		    self = this;

		    items.forEach(function(item){
		    	if(postObj[item.category]){
		    		postObj[item.category].push(item.uri)
		    	}else{
		    		postObj[item.category] = [item.uri];
		    	}
		    })
		         //data = JSON.stringify(postObj);

		    landing_Demo.redrawMaps(postObj).then(function(skillArr){

		      var jsonObj = '{"children":['+skillArr+']}';
		    
		     clearSvg();
		      //Q.all([ self.createSampleGraph(jsonObj) ])
		      self.createSampleGraph(userName, 'map-content', "filter", jsonObj, "0")
		      //self.createSampleGraph(jsonObj);
		     $(".loading-spinner").css({'display':'none'});
		    });
		}, 
		getFilterBadgeCounter: function(category){
		 	counterName ={
		 		organizations : "organizationFilterCount",
		 		locations : "locationFilterCount",
		 		jobRoles : "jobTitleFilterCount"
		 	}
		 	return counterName[category];
		},
		
		createSampleGraph: function(entityId, mapContent, mapCategory, jsonData,  counter){
			vkmui_maps.clearSvg();
		 	$('#smap-legend').removeClass('display-kmap-legend');

		      var root = JSON.parse(jsonData);

		      if( root.children.length == 0){
		      	$('#successMessageDiv').removeClass("hide");
		      }else{
		      	$('#successMessageDiv').addClass('hide')
		      }
		    if(counter == "1"){   	  
		    if($(".filter-wrapper").length){

					   // items array is set to empty
	            	var items = [];
					this.set("items", items);
					// setting the badges to zero
					var categoryArray = ['locations', 'organizations', 'jobRoles'];
					for(var i=0; i<categoryArray.length; i++){
						this.set(this.getFilterBadgeCounter(categoryArray[i]), 0)
						var filterCategoryData = this.get(categoryArray[i]).copy();
						filterCategoryData.forEach(function(filter){
							delete filter.addToFilter;
						})
						this.set(categoryArray[i], filterCategoryData);	
						//console.log(this.get(categoryArray[i]));
					}
	              }else{
	            	  
	            	  
	              }
	        }

		     
		      // Create New Map
		      var diameter = 650,
		          format = d3.format(",d"),
		          	self = this;

		      var bubble = d3.layout.pack()
		          .sort(null)
		          .size([diameter, diameter])
		          .padding(15);

		          svg = d3.select('#'+mapContent).append("svg")
		          .attr("width", diameter)
		          .attr("height", diameter)
		          .attr("class", "bubble");

		      var topicColor = d3.scale.category10();

		      var directTopicObj ={
		        'topic_id': 'topic_id',
		        'value': 'size',
		        'userStrength': 'strength',
		        'filterLevel': 'level'
		      };

		      var indirectTopicObj = {
		        'topicName': 'topic_name'
		      }

		    
		        // Find Knowledge Map Data
		              $('#social-map').attr('data-map-view', 'knowledge');

		              $('#'+mapContent).attr('data-current-aggregate', mapCategory);
		              var clipCircle = null;

		              // Render Breadcrumbs
		              vkmui_maps.renderBreadcrumbs(['home', 'knowledge', mapCategory], currentUserIsMe);
		              if(mapCategory == "filter"){
		              	$('.kmap-menu').addClass("hide");
		              }else{
		               $('.kmap-menu').removeClass("hide");
		              }
		              
		              var node = svg.selectAll(".node")
		                  .data(bubble.nodes(classes(root))
		                  // .data(bubble.nodes(filterBubbleTopics([map.map_topics, filterNum]))
		                  .filter(function(d) { 
		                    if(!d.children){
		                        // console.log(d.topic_id);
		                        return d;
		                    }                  
		                  }))
		                  .enter().append("g")
		                  .attr("class", "node topic" )
		                  .attr("id", function(d){
		                    var topicId = (d.className.split('##')[0]);
		                    return "topic_"+topicId;
		                  })                  
		                  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		                  .attr("data-skill-uri", function(d) { return d.className; });     

		                var defs = svg.append("defs");

		                var filter = defs.append("filter")
		                    .attr("id", "dropshadow")

		                filter.append("feGaussianBlur")
		                    .attr("in", "SourceAlpha")
		                    .attr("stdDeviation", 3)
		                    .attr("result", "blur");
		                filter.append("feOffset")
		                    .attr("in", "blur")
		                    .attr("dx", 0)
		                    .attr("dy", 0)
		                    .attr("result", "offsetBlur")
		                filter.append("feFlood")
		                    .attr("in", "offsetBlur")
		                    .attr("flood-color", "#000000")
		                    .attr("flood-opacity", "0.6")
		                    .attr("result", "offsetColor");
		                filter.append("feComposite")
		                    .attr("in", "offsetColor")
		                    .attr("in2", "offsetBlur")
		                    .attr("operator", "in")
		                    .attr("result", "offsetBlur");

		                var feMerge = filter.append("feMerge");

		                feMerge.append("feMergeNode")
		                    .attr("in", "offsetBlur")
		                feMerge.append("feMergeNode")
		                    .attr("in", "SourceGraphic");

		              var bubbleBgHover = node.append("circle")
		                  .attr("r", function(d) { return d.r; })
		                  .attr("cx", "0")
		                  .attr("cy", "0")
		                  .attr("class", "bubble-hover")
		                  .style("fill", function(d, i){
		                    return d3.rgb(topicColor(i)).brighter(0.5);
		                  })
		                  .attr("stroke-width", 3)
		                  .attr("stroke", function(d, i){
		                    return topicColor(i);
		                  })
		                  .attr("filter", "url(#dropshadow)");


		              var bubbleBase = node.append("circle")
		                  .attr("r", function(d) { return d.r; })
		                  .attr("cx", "0")
		                  .attr("cy", "0")
		                  .style("fill", function(d, i){

		                    // apply to all instead to ensure consistency when switching between maps
		                    return d3.rgb(topicColor(i)).brighter(0.5);
		                    
		                  });

		              var bubbleTxt = node.append('foreignObject')
		                  .attr('x', function(d) { return -1*(d.r); } )
		                  .attr('y', function(d) { return -1*(d.r); } )
		                  .attr('width', function(d) { return (d.r)*2; } )
		                  .attr('height', function(d) { return (d.r)*2; } )

		                  .append('xhtml:p')
		                  .attr('class', 'topic-bubble-title')
		                  .style({
		                    "width": "100%",
		                    "padding": function(d){
		                      return "0px "+0.15*(d.r)+"px";
		                    },
		                    "text-anchor": "middle",
		                    "text-align": "center",
		                    "vertical-align": "middle",
		                    "color": "#000",
		                    "font-size": function(d){
		                      return vkm_bubble.topicBubbleFontSize(d)+"px";
		                    }                 
		                  })
		                  .text(function(d) { 

		                    //console.log(topicBubbleText(d, 2));
		                    // return d.topicName;
		                    return vkm_bubble.topicBubbleText(d, 2);

		                  }).style({
		                    "display":"inline-block",
		                    "margin": function(d){
		                      var topMargin = d.r - ($(this).height())/2;
		                      // console.log('this text: '+d.topicName);
		                      // console.log('this height: '+$(this).height());
		                      // console.log('this margin: '+topMargin)
		                      return topMargin+"px auto";
		                    }
		                  })
		                  
		                  
		              function classes(root) {
		            var classes = [];

		            function recurse(name, node) {
		              if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
		              else classes.push({packageName: name, className: node.name, value: node.size});
		            }

		            recurse(null, root);
		            return {children: classes};

		          }    
		              // Topic Clicks

		              svg.selectAll(".topic").each(function(){

		                //var skillUri    = $(this).attr('data-skill-uri').split('##')[1];
		                var thisTopic   = $(this),
		                    thisTopicId = thisTopic.attr('id').split('topic_')[1];
		                    

		                // Click Event for Topic Circles
		                thisTopic.on('click', function(){
	                	skillUri    = thisTopic.attr('data-skill-uri').split('##')[1];
	                    skillLabel    = thisTopic.attr('data-skill-uri').split('##')[0];
	                  	$('.kmap-menu').addClass("hide");
		                  jQuery('#successMessageDiv').addClass('hide');
		                  self.send("clearAllFilterForHome");	
		                  if($('.side-control-panel .compare').hasClass('active')){

		                  fakeModal('.fake-compare-modal', thisTopicId);


		                  } else {
		                    topic_demo.showKnowledgePeople(skillUri).then(function (experts){
		                      expertsArr = experts;
		                      peoples_entity = thisTopicId;
		                      if(expertsArr.length == 0){
		                      	var DummyUser = self.get("DummyUser");
		                      	expertsArr.push(DummyUser);
		                      	vkm_bubble.renderTopic(skillUri,expertsArr,thisTopicId);
		                      }else{
		                      	vkm_bubble.renderTopic(skillUri,expertsArr,thisTopicId);
		                  	  }	

		                    });
		                    topic_demo.showRelatedTopicsDemo(skillUri, skillLabel).then(function(relatedTopics){
		                        relatedTopicArr = relatedTopics;
		                        
		                    }); 
		                    
		                  }    
		                  // change to pass preview args at this point only 
		                  topic_demo.showCommunities(skillUri,skillLabel).then(function(relatedcommunities){
		                  	relatedcommunities.forEach(function(community){
								community.communityURI = community.communityURI.substring(community.communityURI.lastIndexOf('/')+1);
							});
							relatedCommunities = relatedcommunities;
							relatedcommunities = relatedcommunities.slice(0,3);
					        self.set("relatedCommunities", relatedcommunities);
					       
					      });

					      topic_demo.showCourses(skillUri,skillLabel).then(function(relatedcourses){
					      	relatedcourses.forEach(function(course){
								course.courseURL = course.courseURL.substring(course.courseURL.lastIndexOf('/')+1);
							});
							relatedCourses = relatedcourses;
							relatedcourses = relatedcourses.slice(0,3);	
					      	self.set("relatedCourses", relatedcourses);
					      	
					      });

					      topic_demo.getAssetsTopic('document', skillLabel).then(function(documents){
					      	documents.forEach(function(doc){
								doc.assetURL = doc.assetURL.substring(doc.assetURL.lastIndexOf('/')+1);
							});
							relatedDocuments = documents;
							documents = documents.slice(0,3);    
					        self.set("relatedDocuments", documents);
					      });

					      topic_demo.getAssetsTopic('blog', skillLabel).then(function(blogs){    
					        blogs.forEach(function(blog){
								blog.assetURL = blog.assetURL.substring(blog.assetURL.lastIndexOf('/')+1);
							});
							blogs = blogs.slice(0,3);
					        self.set("relatedBlogs", blogs);
					        relatedBlogs = blogs;
					        
					      });

					      topic_demo.getAssetsTopic('forum', skillLabel).then(function(forums){    
					        forums.forEach(function(forum){
								forum.assetURL = forum.assetURL.substring(forum.assetURL.lastIndexOf('/')+1);
							});
							forums = forums.slice(0,3);
					        self.set("relatedForums", forums);
					        relatedForums = forums;
					        
					      });

					      topic_demo.getAssetsTopic('wiki', skillLabel).then(function(wikis){    
					       wikis.forEach(function(wiki){
								wiki.assetURL = wiki.assetURL.substring(wiki.assetURL.lastIndexOf('/')+1);
							});
					       wikis = wikis.slice(0,3);
					       self.set("relatedWikis", wikis);
					        relatedWikis = wikis;
					      });

					      var topicClickOptions = {
							slidePanelEl:'#rightPanelTabs',
							appBody:'.widget-body', 
							slideAnimCls:'nav-slide',
							slideActiveCls:'active', 
							slideTimer: 150, 
							topicSearchField: '#searchTopicsInput',
							topicFormWrap: '#searchTopicsForm',
							topRightPanelTabs: '.vkm-top-panel-right',
							showTopicDetailCls: 'show-topic-contents'
						};

						app.vkmui.topicSlidePanel(topicClickOptions, 'in');
		                });
		              
		                thisTopic.on('mouseover', function(e){

		                    $(this).find('p').css({
		                      'color': "#fff"
		                    });

		                }).on('mouseleave', function(e){

		                    $(this).find('p').css({
		                      'color':"#000"
		                    });

		                });

		              });
					


		           
		    },
		renderConnections: function(entityId, entityType, mapLayout, types, category, type, renderData){
				vkmui_maps.renderConnections(entityId, entityType, mapLayout, types, category, type, renderData);
			},
		renderKnowledgeConn:function(entityId, contentType, category, renderData, renderVal){
					this.createSampleGraph(entityId, contentType, category, renderData, renderVal);
					vkmui_maps.renderBreadcrumbs(['home', 'knowledge', 'myendorseMap'], true);
			},
		getObjects: function(obj, key, val) {
			    var objects = [];
			    $.each(obj, function(i, objVal){
			       if (objVal[key] === val) {
			          objects.push(objVal);
			          return false;
			        }
			    });
			    return objects;
			},
		getObjectsAssets: function(obj, key, val) {
			    var objects = [];
			    $.each(obj, function(i, objVal){
			       if (objVal["object"][key] === val) {
			          objects.push(objVal);
			          return false;
			        }
			    });
			    return objects;
			},
		callVcard: function(dataValues){
			  vkm_modals.renderModal('vcard', '#pageContent', vkmModalTemplateHtml, {
			    "modal_title"       : window['vcardLayout_'+window['vcardType']].modal_title,
			    "modal_draggable"   : ".widget-body",
			    "vcard_entity_obj"  : dataValues,
			    "vcard_entity_id"   : window['vcardEntityId'],
			    "vcard_entity_type" : window['vcardType'],
			    "vcard_default_img" : window['vcardLayout_'+window['vcardType']].default_photo,
			    "vcard_related_max" : 5,
			    "modal_id"          : "vcard",
			    "modal_control_buttons": window['vcardLayout_'+window['vcardType']].control_buttons }, vkm_modals.vcardModalCallback);

			},
		toggleLegendCaret: function(toggle, collapsePane){
		  $(toggle).on('click', function(){
		    if($(collapsePane).hasClass('in')){
		      $(toggle).attr('data-icon-before', 'caret-up');
		    } else {
		      $(toggle).attr('data-icon-before', 'caret-down');
		    }
		  });
		},

		actions: {

			callConnections: function(mapClickTarget, e){
			var defaultMapLink = null,
			mapCategory        = null,
			mapDataPrefix      = null,
			fullTargetId       = null,
			targetType         = null,
			itemId             = null,
			currentEntityId    = userName,
			defaultMapLink     = mapClickTarget.attr('data-map-default'),
			mapCategory        = mapClickTarget.attr('data-map-category'),
			mapDataPrefix      = mapClickTarget.attr('data-array-prefix'),
			showMapStateClick  = mapClickTarget.attr('data-show-map-state'),
			clickElementId	   = mapClickTarget.attr('id'),

			mapst  = mapClickTarget.attr('data-show-map-state'),
            catg   = mapClickTarget.attr('data-show-map-category'),
            prefix = mapClickTarget.attr('data-array-prefix'),
            self = this;

			//to handle breadcrumbs links
			if(clickElementId === 'home'){
			  	self.send("clearAllFilterForHome");
              	$('.kmap-menu, .vkm-side-tabs').addClass("hide");
				$('#map-menu').html('');
				vkm_bubble.resetCompareBtn('.compare.btn');
				$('#smap-legend').removeClass('display-kmap-legend');
				vkm_sidebar.closeRightSidebar('#rightPanelTabs', '.widget-body');
				$('#social-map').attr('data-map-view', 'connections');
				$(".myendorseMap").addClass("active").siblings().removeClass("active");
				$('.vkm-tabs-wrap').css({display : "block"});
				$('.vkm-topic-wrap').css({display : "none"});
				$('#home').removeClass('knowledgeView');
				vkm_sidebar.displayTopicSlide('overview');
				$('.widget-body').removeClass('topic-view');
				jQuery('#successMessageDiv').addClass('hide');
				vkmui_maps.displayMainMenu(window['mapLayoutOptions'], 'user');
				

			}else if(clickElementId === 'knowledge'){
				$('#map-menu').html('');
				vkm_bubble.resetCompareBtn('.compare.btn');
				$('#smap-legend').removeClass('display-kmap-legend');
				// close right sidebar
				vkm_sidebar.closeRightSidebar('#rightPanelTabs', '.widget-body');

				landing_Demo.topicFootPrintEndorse(emailId,  userProfileData.personURI).then(function(graphData){
					self.createSampleGraph(userName, 'map-content', "knowledge", graphData, "1");
					vkmui_maps.renderBreadcrumbs(['home', 'knowledge', 'myendorseMap'], true);
				});
				$(".myendorseMap").addClass("active").siblings().removeClass("active");
				$('.vkm-side-tabs').removeClass("hide");
                $('.vkm-tabs-wrap').css({display : "block"});
                $('.vkm-topic-wrap').css({display : "none"});
                jQuery('#successMessageDiv').addClass('hide');
              	vkm_sidebar.displayTopicSlide('overview');

			}else if(clickElementId === 'topics'){
				$('#map-menu').html('');
				vkm_bubble.resetCompareBtn('.compare.btn');
				$('#smap-legend').removeClass('display-kmap-legend');
				// close right sidebar
				vkm_sidebar.closeRightSidebar('#rightPanelTabs', '.widget-body');
				// Reset SVG
				clearSvg();
				vkm_sidebar.resetFilters();
				landing_Demo.topicFootPrintEndorse(emailId,  userProfileData.personURI).then(function(graphData){ 
					self.createSampleGraph(userName, 'map-content', "knowledge", graphData, "1");
					vkmui_maps.renderBreadcrumbs(['home', 'knowledge', 'myendorseMap'], true);
				});
				$(".myendorseMap").addClass("active").siblings().removeClass("active");
				$('.vkm-side-tabs').removeClass("hide");
				$('.vkm-tabs-wrap').css({display : "block"});
				$('.vkm-topic-wrap').css({display : "none"});
				vkm_sidebar.displayTopicSlide('overview');
				$('.widget-body').removeClass('topic-view');
				jQuery('#successMessageDiv').addClass('hide');

			}else if(clickElementId === 'content'){
				self.renderConnections(currentEntityId, 'user', window['defaultMapLayout'], "courses", clickElementId, "course", courses);
			}else if(clickElementId === 'people'){
				self.renderConnections(currentEntityId, 'user', window['defaultMapLayout'], "communities", clickElementId, "community", communityarry );
			}else if(defaultMapLink === 'people'){
				//on click of people connections in knowledge map landing page
				landing_Demo.getAllExperts().then(function (expertsarray){
					experts = expertsarray;
				    self.renderConnections(currentEntityId, "user", window['defaultMapLayout'], "communities", mapCategory, "community", communityarry);
				});
				
			}else if(defaultMapLink === 'files'){
				//on click of content connections in knowledge map landing page
				landing_Demo.getAllFiles().then(function (datafiles){
					arry = [];
					var arrySummary = datafiles["Summary"];
					$.each(arrySummary, function(i, item){
						arry.push(arrySummary[i].object);
					});
				});
				landing_Demo.getAllBlogs().then(function (datablogs){
					blogs = [];
					var blogsSummary = datablogs["Summary"];
					$.each(blogsSummary, function(i, item){
						blogs.push(blogsSummary[i].object);
					});
				});
				landing_Demo.getAllWikis().then(function (datawikis){
					wikis = [];
					var wikisSummary = datawikis["Summary"];
					$.each(wikisSummary, function(i, item){
						wikis.push(wikisSummary[i].object);
					});
				});
				landing_Demo.getAllForums().then(function (dataforums){
					forums = [];
					var forumsSummary = dataforums["Summary"];
					$.each(forumsSummary, function(i, item){
						forums.push(forumsSummary[i].object);
					});
				});
				vkmui_maps.renderConnections(currentEntityId, "user", window['defaultMapLayout'], "courses", mapCategory, "course", courses);
				
			}else if(defaultMapLink === 'endorsements'){
				//on click of knowledge connections in knowledge map landing page
				$('.vkm-side-tabs').removeClass("hide");
				$('.myendorseMap').addClass("active");

				landing_Demo.topicFootPrintEndorse(emailId,  userProfileData.personURI).then(function(graphData){
					graphData = graphData;
					self.createSampleGraph(userName, 'map-content', "knowledge", graphData, "1");
					vkmui_maps.renderBreadcrumbs(['home', 'knowledge', 'myendorseMap'], true);
				});

			}

			if(showMapStateClick){
				var renderArry = null;
				switch(showMapStateClick) {
					case "files":
						renderArry = arry;
						break;
					case "courses":
						renderArry = courses;
						break;
					case "blogs":
						renderArry = blogs;
						break;
					case "forums":
						renderArry = forums;
						break;
					case "wikis":
						renderArry = wikis;
						break;
					case "communities":
						renderArry = communityarry;
						break;
					case "people":
						renderArry = experts;
						break;
					case "peoples":
						renderArry = expertsArr;
						break;
					case "topics":
						renderArry = relatedTopicArr;
						break;
				}
				self.renderConnections(currentEntityId, window['currentEntityType'], window['defaultMapLayout'], mapst, catg, prefix, renderArry);
			}

			// Arrows click
			if( mapClickTarget.is('path') && clickElementId.indexOf('arrow') > -1 ){
				var arrowNavDirection = clickElementId.split('-')[2];
				vkmui_maps.carouselUpdate(arrowNavDirection)
			}

			if( mapClickTarget.is('circle')){
				if(mapClickTarget.attr('class') === 'carousel-dot'){
					//onClick of Dot for pagination
			  var targetSlide = parseInt(clickElementId.split('-')[2]);
			  var currentSlide = parseInt($('#map-content').attr('data-active-content-state'));
			  vkmui_maps.carouselGoTo(currentSlide, targetSlide);
			  	}else if(mapClickTarget.attr('class').indexOf('circle-image') > -1){
			//Onclick of nodes for VCARD model
				var fullTargetId = mapClickTarget.prev('circle').attr('id');
		        window['vcardEntityId'] = fullTargetId.split("_")[1];
				window['vcardType'] = fullTargetId.split("_")[0];
                var communityId,
                getObject;
                if(window['vcardEntityId'] !== "noVcard"){
	                switch(window['vcardType']) {
	                  case "user":
	                      var userEmail = emailId;
	                      var expertEmail = window['vcardEntityId'] +'@'+ userEmail.substring(userEmail.lastIndexOf("@") +1);
	                      landing_Demo.getExpertUserData(expertEmail).then(function(getExpertData){
	                          self.callVcard(getExpertData);
	                      });
	                      break;
	                  case "community":
	                      communityId = "http://clks.cisco.com/km/group/" + window['vcardEntityId'];
	                      getObject = self.getObjects(communityarry, "communityURI", communityId);
	                      self.callVcard(getObject);
	                      break;
	                  case "course":
	                      communityId = "http://clks.cisco.com/km/course/" + window['vcardEntityId'];
	                      getObject = self.getObjects(courses, "url", communityId);
	                      self.callVcard(getObject);
	                      break;
	                  case "blog":
	                      communityId = "http://clks.cisco.com/km/asset/" + window['vcardEntityId'];
	                      getObject = self.getObjectsAssets(blogsRawData.Summary, "id", communityId);
	                      self.callVcard(getObject);
	                      break;
	                  case "forum":
	                      communityId = "http://clks.cisco.com/km/asset/" + window['vcardEntityId'];
	                      getObject = self.getObjectsAssets(forumsRawData.Summary, "id", communityId);
	                      self.callVcard(getObject);
	                      break;
	                  case "wiki":
	                      communityId = "http://clks.cisco.com/km/asset/" + window['vcardEntityId'];
	                      getObject = self.getObjectsAssets(wikisRawData.Summary, "id", communityId);
	                      self.callVcard(getObject);
	                      break;
	                  case "file":
	                      communityId = "http://clks.cisco.com/km/asset/" + window['vcardEntityId'];
	                      getObject = self.getObjectsAssets(filesRawData.Summary, "id", communityId);
	                      self.callVcard(getObject);
	                      break;
	                }
            	}
        	}
	        }

        	//on legend click
        	if(clickElementId === 'smap-legend-toggle'){
				e.preventDefault();
				self.toggleLegendCaret('#smap-legend-toggle', '#smap-legend-content');
			}

    		},
			changeTopbarListItem:function(mapSelect){
				var classname;
					
				$('#successMessageDiv').addClass('hide');
				
					var dropdown = this.get("dropdown");
					for(var i=0; i < dropdown.length; i++){
						if(dropdown[i]["value"] == mapSelect){
							  classname = dropdown[i]['value'];
							  
							break;
						}
					}
              		this.set("dropdown", dropdown);
				//if filters are present clear all filters
				   if($(".filter-wrapper").length){

					   // items array is set to empty
	            	var items = [];
					this.set("items", items);
					// setting the badges to zero
					var categoryArray = ['locations', 'organizations', 'jobRoles'];
					for(var i=0; i<categoryArray.length; i++){
						this.set(this.getFilterBadgeCounter(categoryArray[i]), 0)
						var filterCategoryData = this.get(categoryArray[i]).copy();
						filterCategoryData.forEach(function(filter){
							delete filter.addToFilter;
						})
						this.set(categoryArray[i], filterCategoryData);	
						//console.log(this.get(categoryArray[i]));
					}
	              }else{
	            	  
	            	  
	              };
			// clearing filters code end	
			   	var dataPayloadOrg =  { organizations : [userProfileData.organizationURI] },
			   		dataPayloadjobRoles = { jobRoles : [userProfileData.jobRoleURI] },
			   		url = '/knowledgecenter/kmap/topicFootprint',
			   		self = this,
			   		param = '';
			   	switch(mapSelect){
			   		case "myMap":
			   			param = { persons: [userProfileData.personURI] };
			   			url = url +'?view=extended';
				   		break;
				   	case "myendorseMap":
				   		param = { persons: [userProfileData.personURI] };
			   			break;
			   		case "orgMap":
			   			param = { organizations : [userProfileData.organizationURI] };
			   			break;
			   		default:
			   			param = { jobRoles : [userProfileData.jobRoleURI] }
			   			break;	 
				   	}

				landing_Demo.changeTopbarListItems(param, url).then(function(skillArr){
					clearSvg();
				   $('.'+ classname ).addClass("active").siblings().removeClass("active");
				   self.createSampleGraph(userName, 'map-content', mapSelect,'{"children":['+skillArr+']}', "0")
				});

			},

			selectFilter: function(term, termURI, category){
					
				//check the filter selected count

				// setting the filter item in the filter list
				var filterItem = {term: term, uri: termURI, category: category},
					items = this.get("items") ? this.get("items").copy() : [];
					
					if( items.length == 5){

					jQuery('#successMessageDiv').html('Maximum 5 filters are permissible. Please deselect existing filters to apply new filters.').removeClass('hide');
					return

				}
				items.push(filterItem);
				this.set("items", items),
				termKey = {organizations:"orgName", locations:"locationName", jobRoles: "jobRole"};

				// Updating the model for current tab clicked data
				var filterCategoryData = this.get(category) ? this.get(category).copy() : [];
				for(var i=0; i < filterCategoryData.length; i++){
					if(filterCategoryData[i][termKey[category]] == term){
						filterCategoryData[i].addToFilter = true;

						var counter = this.get(this.getFilterBadgeCounter(category)) ?  this.get(this.getFilterBadgeCounter(category)) : 0;
						this.set(this.getFilterBadgeCounter(category), counter + 1)
						break;
					}
				}
				
				this.set(category, filterCategoryData);

				if( items.length > 0){
				this.redrawMap();
				}else{
				    
					jQuery('#successMessageDiv').removeClass('hide');
					
				}
			
				
			},
			
			removeFilter: function(term, category){

				// remove filter terms
				var self = this;
				var items = this.get("items") ? this.get("items").copy() : [],
				termKey = {organizations:"orgName", locations:"locationName", jobRoles: "jobRole"};
				for(var i=0; i < items.length; i++){
					if(items[i].term == term){
						items.splice(i,1);
						break;
					}
				};

				this.set("items", items);

				// remove the selected checkbox from the tabbed filter
				var filterCategoryData = this.get(category) ? this.get(category).copy() : [];
				for(var i=0; i < filterCategoryData.length; i++){
					if(filterCategoryData[i][termKey[category]] == term){
						filterCategoryData[i].addToFilter= false;

						var counter = this.get(this.getFilterBadgeCounter(category));
						this.set(this.getFilterBadgeCounter(category), counter - 1)
						break;
					}
				}

				this.set(category, filterCategoryData);
				
				if( items.length > 0 ){

					this.redrawMap();

				} else {
				    // Create the bubble map with Endorsement Map as default
				   clearSvg();
					landing_Demo.topicFootPrintEndorse(userName, userProfileData.personURI).then(function(graphData){
						jQuery('#successMessageDiv').addClass('hide');
						self.createSampleGraph(userName, 'map-content', "myendorseMap", graphData, "0");
						 //$("#mapErrmsg").css({'visibility':'hidden'});

					}); 

				}		
			},
			
			clearAllFilters: function(){
				this.set("items", []);
				var self = this;

					// setting the badges to zero
				var categoryArray = ['locations', 'organizations', 'jobRoles'];
				for(var i=0; i<categoryArray.length; i++){
					this.set(this.getFilterBadgeCounter(categoryArray[i]), 0)
					var filterCategoryData = this.get(categoryArray[i]).copy();
					filterCategoryData.forEach(function(filter){
						delete filter.addToFilter;
					})
					this.set(categoryArray[i], filterCategoryData);	
					//console.log(this.get(categoryArray[i]));
				}
				clearSvg();
				landing_Demo.topicFootPrintEndorse(userName, userProfileData.personURI).then(function(graphData){
					jQuery('#successMessageDiv').addClass('hide');
					self.createSampleGraph(userName, 'map-content', "myendorseMap", graphData);
					 //$("#mapErrmsg").css({'visibility':'hidden'});

				});
			},
			clearAllFilterForHome: function(){
				this.set("items", []);
				var self = this;

					// setting the badges to zero
				var categoryArray = ['locations', 'organizations', 'jobRoles'];
				for(var i=0; i<categoryArray.length; i++){
					this.set(this.getFilterBadgeCounter(categoryArray[i]), 0)
					var filterCategoryData = this.get(categoryArray[i]).copy();
					filterCategoryData.forEach(function(filter){
						delete filter.addToFilter;
					})
					this.set(categoryArray[i], filterCategoryData);	
					//console.log(this.get(categoryArray[i]));
				}
				clearSvg();
				
			}


		}
	
	});

	return App.MapController;
});
