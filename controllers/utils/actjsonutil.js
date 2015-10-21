define(['app', 'httpClient'], function (App, httpClient) {
	App.ActJsonUtil = Ember.Object.create({
		getUniqueDiscussion : function(activities,loggedinuser) {
			var unique = {}, uniqueList = [];
			var disponj = _.groupBy(activities, function(item) { return item['_source']['object']['displayName'] || item['_source']['object']['objectType']});
			_.each(disponj, function(topic) {
				var flag = false;
				var filterres = _.filter(topic,function(item) {
					if(loggedinuser) {
						loggedinuser = loggedinuser.toLowerCase();
					}
					var dname = "";
					if(item['_source']['actor']['displayName']) {
						dname = item['_source']['actor']['displayName'].toLowerCase();
					}
					if(dname == loggedinuser) {
						flag = true; 
					}
				});
				if(flag) {
					topic = _.sortBy(topic, function (item) {
						return item._source.published;
					}).reverse();
					var parr = _.chain(topic).pluck("_source").flatten().pluck("actor").flatten().pluck("displayName");
					parr = _.uniq(parr._wrapped, false, function(item, k, v){
								    return item.toLowerCase();
								});
					topic.people = parr;
					var objtype = _.chain(topic).pluck("_source").flatten().pluck("object").flatten().pluck("objectType")
						 		.unique().value();
					topic.objtype = objtype[0];
					uniqueList.push(topic);
				}
			});
			return uniqueList;
		},
		getLoadData : function(uniquediscussion) {
			var darr = [], count = 0;
			var self = this;
			_.each(uniquediscussion, function(discussion) {
				darr[count] = {};
				darr[count].dtitle = discussion[0]._source.object.displayName;
				darr[count].dlatest = discussion[0]._source.published;
				darr[count].dactor = discussion[0]._source.actor.displayName;
				darr[count].dpeople = discussion.get("people");
				darr[count].objtype = discussion.get("objtype");
				darr[count].dcount = "";
				darr[count].uactivities = [];
				count++;
			});
			darr = _.sortBy(darr, function (item) {
						return item.dlatest;
					}).reverse();
			return darr;
		},
		setLikeIcons : function(self) {
			var me = this;
			var likearr = $("#divDiscussion span[class^='likeiconcls']");
            	var uniquediscussion = self.controller.get("uniquediscussion");
            	_.each(uniquediscussion, function(discussion) {
					me.getLikeCount(discussion).then(function(likecount) {
						var titlearr = $("#divDiscussion").find(".activityrow");
						_.each(titlearr, function(titleobj) {
							var likespan = $(titleobj).find(".likeiconcls");
							if($(titleobj).data('title') == discussion[0]._source.object.displayName) {
								$(likespan).html(likecount);
							}
						});
					});
				});
		},
		getLikeCount : function(currentactivities) {
			var idList = _.chain(currentactivities).pluck("_id").unique().value();
			var objtype = currentactivities.get("objtype");
			var url = "", totalcount = 0;
            if (window.like && window.like.getConfig()) {
                var config = window.like.getConfig();
                    url += "/knowledgecenter/cloudlet/" + config.pluginType + "/" + config.appId;
                    url += "?entityType="+objtype+"&entityIdList=" + idList.join(",");
            } else {
                var deferred = Q.defer();
                setTimeout(deferred.resolve({
                    posts: []
                }), 0);
                return deferred.promise;
            }
            return httpClient.get(url).then(function(blogLikes) {
                        _.each(blogLikes, function(blogLike) {
                        	totalcount = totalcount + blogLike.count;
                        });
                        return totalcount;
                    }, function(error) {
                        console.log(error);
                        return totalcount;
                    });
		},
		getCurrentTopics : function(uniquediscussion, newdiscussionTitle) {
			var darr = [], count = 0;
			_.each(uniquediscussion, function(discussion) {
				if(discussion[0]._source.object.displayName == newdiscussionTitle) {
					darr[count] = {};
					darr[count].dtitle = discussion[0]._source.object.displayName;
					darr[count].dlatest = discussion[0]._source.published;
					darr[count].dactor = discussion[0]._source.actor.displayName;
					darr[count].dpeople = discussion.get("people");
					darr[count].objtype = discussion.get("objtype");
					darr[count].dcount = uniquediscussion.length-1;
					darr[count].uactivities = [];
					darr[count].uactivities = discussion;
					count++;
				}
			});
			return darr;
		},
		getSearchFilterResults : function(search, self, filterobj) {
			var count = 0, filters = $("[class^='VS-input-width-tester']"), filterflag = false;
			for(var i = 0; i < filters.length; i++) {
				var fil = filters[i].innerHTML;
				if(fil != "") {
					filterflag = true;
				}
			}
			if (search != '') {
			    var fdiscussion = self.controller.get("uniquediscussion"), formatdiscussion = [];
			    _.each(fdiscussion, function(items) {
			        var filteredact = _.filter(items, function(item) {
			        								var title = "",content = "";
			        								if(item && item._source && item._source.title) {
			        									title = item._source.title.toLowerCase();
			        								}
			        								if(item && item._source && item._source.object 
			        									&& item._source.object.ellipsisedContent) {
			        									content = item._source.object.ellipsisedContent.toLowerCase();
			        								}
			            							return (title.match(search.toLowerCase())
			                							|| content.match(search.toLowerCase()));
			            						});
			        var isobjtype = false;
			        if(filterflag) {
						for(var i = 0; i < filters.length; i++) {
							var fil = filters[i].innerHTML;
							if(fil != "" && fil == items.objtype) {
								isobjtype = true;
							}
						}
			        }
			        if(isobjtype || !filterflag) {
			        	if(filteredact && filteredact.length > 0 
			            	|| (items[0]._source.object.displayName.toLowerCase().match(search.toLowerCase()))) {
			            		formatdiscussion[count] = {};
								formatdiscussion[count].dtitle = items[0]._source.object.displayName;
								formatdiscussion[count].dlatest = items[0]._source.published;
								formatdiscussion[count].dactor = items[0]._source.actor.displayName;
								formatdiscussion[count].dpeople = [];
								if(self.controller.get("_currentView") == "grid-view") {
									formatdiscussion[count].dpeople = items.get("people");
								}
								formatdiscussion[count].objtype = items.get("objtype");
								formatdiscussion[count].dcount = "";
								formatdiscussion[count].uactivities = [];
								formatdiscussion[count].uactivities = filteredact;
			            		count++;
			        	}
			        }
				});
				formatdiscussion = _.sortBy(formatdiscussion, function (item) {
										return item.dlatest;
									}).reverse();
				self.controller.get("formatdiscussions").clear();
				self.controller.set("formatdiscussions",formatdiscussion);
				if(formatdiscussion && formatdiscussion.length == 0) {
						self.controller.set('isnotification', "true");
						self.controller.set('nodatamsg', "No results found");
				} else {
					self.controller.set('isnotification', "false");
					self.controller.set('nodatamsg', "");
				}
			} else {
			    var fdiscussion = self.controller.get("uniquediscussion"), udiscussion = [];
			    self.controller.get("formatdiscussions").clear();
			    var prevstate = self.controller.get("prevstate");
			    var ldata = App.ActJsonUtil.getLoadData(fdiscussion);
			    _.each(ldata, function(items) {
				    var isobjtype = false;
				    if(filterflag) {
						for(var i = 0; i < filters.length; i++) {
							var fil = filters[i].innerHTML;
							if(fil != "" && fil == items.objtype) {
								isobjtype = true;
							}
						}
				    }
				    if(isobjtype || !filterflag) {
				    	udiscussion.push(items);
				    }
				});
			    self.controller.set("formatdiscussions",udiscussion);
			    if(udiscussion && udiscussion.length == 0) {
						self.controller.set('isnotification', "true");
						self.controller.set('nodatamsg', "No results found");
				} else {
					self.controller.set('isnotification', "false");
					self.controller.set('nodatamsg', "");
				}
			}
		}
	});
});