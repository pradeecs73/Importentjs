define(["app",
    "ember",
    "text!templates/vkm/vkmTopNavTemplate.hbs",
    "httpClient",
    "pages/knowledgeMap",
    "pages/vkmui-topic-bubbles",
    "services/vkmservices/topicDemoServices"

], function(app, Ember, vkmTopNavTemplate, httpClient, knowledgeMap, vkm_bubble, topic_demo) {
    var VkmTopNavView = Ember.View.extend({
        defaultTemplate: Ember.Handlebars.compile(vkmTopNavTemplate),
        didInsertElement:function(){
             var self = this;
             var DummyUser = {"email": "",
                        "endorsementCount": "",
                        "expertRating": "",
                        "funcRole": "",
                        "networkUser": "",
                        "userName": ""
                      };
            httpClient.get("/knowledgecenter/kmap/topicsList", undefined, {"stringify" : "true"})
                .then(function (data) {
                    var jsonArray = []
                    $.each(data, function(i, topic){
                        if(topic.topic == ""){
                            return;
                        }else{
                            if($.inArray(topic.topic+'##'+topic.topicURI, jsonArray) === -1){
                            jsonArray.push(topic.topic+'##'+topic.topicURI);
                          }
                        }
                    });
                    knowledgeMap.instantTopicSearch('#searchTopicsInput', 4, jsonArray, "json", 10, function(event, ui){
                        
                        if(event.keyCode == 13 || event.keyPress){
                            event.preventDefault();
                           //return false;

                        }
                        // Setting the Global variables which are used at n number of places
                        skillUri = ui.item.value.split('##')[1];
                        skillLabel = ui.item.value.split('##')[0];

                        $('#searchTopicsInput').val(ui.item.value.split('##')[0]);
                        $('.kmap-menu').addClass("hide");
                        
                        // myTopicsArray is a global variable containing values of the buble names of the current graph
                       /* if(myTopicsArray.indexOf(ui.item.value.split('##')[0]) > -1){
                            app.vkmui.displayRhs(ui.item.value.split('##')[0]);
                        }else{*/
                            topic_demo.showKnowledgePeople(skillUri).then(function (experts){
                              expertsArr = experts;
                              peoples_entity = skillLabel;
                              if(expertsArr.length == 0){
                                expertsArr.push(DummyUser);
                                vkm_bubble.renderTopic(skillUri,expertsArr,skillLabel);
                              }else{
                                vkm_bubble.renderTopic(skillUri,expertsArr,skillLabel);
                               }
                            }); 
                            
                            topic_demo.showRelatedTopicsDemo(skillUri, skillLabel).then(function(relatedTopics){
                              if(relatedTopics.length == 0){
                                relatedTopicArr.push(DummyUser);
                              }else{
                                relatedTopicArr = relatedTopics;
                               }
                                
                            });
                          // change to pass preview args at this point only 
                          topic_demo.showCommunities(skillUri,skillLabel).then(function(relatedcommunities){
                            relatedcommunities.forEach(function(community){
                              community.communityURI = community.communityURI.substring(community.communityURI.lastIndexOf('/')+1);
                            });
                              relatedCommunities = relatedcommunities;
                              relatedcommunities = relatedcommunities.slice(0,3);
                              self.get('controller').set("relatedCommunities", relatedcommunities);
                          });

                          topic_demo.showCourses(skillUri,skillLabel).then(function(relatedcourses){  
                            relatedcourses.forEach(function(course){
                              course.courseURL = course.courseURL.substring(course.courseURL.lastIndexOf('/')+1);
                            });
                            relatedCourses = relatedcourses;
                            relatedcourses = relatedcourses.slice(0,3); 
                            self.get('controller').set("relatedCourses", relatedcourses);
                          });

                          topic_demo.getAssetsTopic('document', skillLabel).then(function(documents){
                            documents.forEach(function(doc){
                              doc.assetURL = doc.assetURL.substring(doc.assetURL.lastIndexOf('/')+1);
                            });
                            relatedDocuments = documents;
                            documents = documents.slice(0,3);    
                            self.get('controller').set("relatedDocuments", documents);
                          });

                          topic_demo.getAssetsTopic('blog', skillLabel).then(function(blogs){    
                              blogs.forEach(function(blog){
                                blog.assetURL = blog.assetURL.substring(blog.assetURL.lastIndexOf('/')+1);
                              });
                                blogs = blogs.slice(0,3);
                                self.get('controller').set("relatedBlogs", blogs);
                                relatedBlogs = blogs;
                          });

                          topic_demo.getAssetsTopic('forum', skillLabel).then(function(forums){    
                            forums.forEach(function(forum){
                              forum.assetURL = forum.assetURL.substring(forum.assetURL.lastIndexOf('/')+1);
                            });
                                forums = forums.slice(0,3);
                                self.get('controller').set("relatedForums", forums);
                                relatedForums = forums;
                          });

                          topic_demo.getAssetsTopic('wiki', skillLabel).then(function(wikis){    
                            wikis.forEach(function(wiki){
                              wiki.assetURL = wiki.assetURL.substring(wiki.assetURL.lastIndexOf('/')+1);
                            });
                               wikis = wikis.slice(0,3);
                               self.get('controller').set("relatedWikis", wikis);
                                relatedWikis = wikis;
                          });

                          
                       $('#searchTopicsInput').val('');
                    
                        return false;
                    });
                }, function(err){
                    throw err;
                });
        }
    });
    return VkmTopNavView;
});