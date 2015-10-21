define(['app', 'httpClient', 'Q', 'services/usersService', 'underscore', 'services/entitlementService', 'services/searchService', 'services/collaboration/sharedPostService','services/collaboration/postService'],
    function(app, httpClient, Q, usersService, _, entitlementService, searchService, sharedPostService,postService) {
        return {
             assignCommunityRole:function(data){
                return httpClient.put('/knowledgecenter/cclom/pdr/proxy?type=group&action=0&resourceType=community',data).then(function(result){
                      return result;
                   }).fail(function (err){
                      Ember.Logger.error('GropuService : get member role',err);
                      return err;
                   });

             },
              communityMemberRoles:function(){
                   return httpClient.get('/knowledgecenter/authorization/roles/_all?applicationId=userpi').then(function(roles){
                      return roles;
                   }).fail(function (err){
                      Ember.Logger.error('GropuService : get member role',err);
                      return err;
                   });
              },

            allGroups: function() {
                return this.allGroupsWithFilters({
                    pageSize: 99999
                }).then(function(response) {
                    return response.allGroups
                })
            },
            showCreateButtonBasedonPermissions:function(model){
                var hasPermissionOrnot;
                return true;
            },
            showCreateButtonBasedonPermissionsInDetailsPage:function(model,resourceType){
                   // Set default Type to 'Blogs'
                   if(!resourceType){
                        resourceType = 'Blogs';
                   }
                   var hasPermissionOrnot;
                   var permission;
                   var permissionDetails=Q.defer();
                   if((!model.creator) || (model.creator == App.getUserLoginId())){
                        var permissionData = {permissionStatus : true}
                        permissionDetails.resolve(permissionData);
                        return permissionDetails.promise;
                   }else{
                        if(resourceType == 'Blogs'){
                            permission = "ContributeBlogs";           
                        }else if(resourceType == 'Discussions'){
                            permission = "ContributeDiscussions";   
                        }else if(resourceType == 'Wikis'){
                            permission = "ContributeWikis"; 
                        }else if(resourceType == 'Files'){
                            permission = "ContributeFiles"; 
                        }else if(resourceType == 'CommunityProxyBlogger'){
                            permission = "CommunityProxyBlogger"; 
                        }else if(resourceType == 'ManageCommunityMembers'){
                            permission = "ManageCommunityMembers"; 
                        }else if(resourceType == 'Moderator'){
                            permission = "Community Moderator"; 
                        }
                        
                        
                        return postService.getRolesForUserInCommunity(model._id,App.getUserLoginId()).then(function(communityRoles){
                            var communityRoleIds=_.pluck(communityRoles,'roleId');
                            if(communityRoleIds.indexOf(permission) !=-1){
                                 permissionDetails.resolve({permissionStatus : true});
                                 return permissionDetails.promise;
                               
                            }
                            else {
                                permissionDetails.resolve({permissionStatus : false});
                                return permissionDetails.promise;
                            }

                        }).fail(function(err){
                            Ember.Logger.error('[groupService :: showCreateButtonBasedonPermissionsInDetailsPage]',err);
                            var permissionData = {permissionStatus:false}
                            permissionDetails.reject(permissionData);
                            return permissionDetails.promise;
                        })
                    }
            },
            getAllGroups: function() {
                return httpClient.get('/knowledgecenter/groups');
            },

            allAuthenticatedUsersGroups: function() {
                return httpClient.get('/knowledgecenter/groups/allAuthenticatedUsers');
            },

            allGroupsWithFilters: function(params) {
                var tagsSlice = "true";
                var type = ["group"]
                var filters = params.filters ? params.filters.split(";") : [];
                var searchText = params.searchText && params.searchText.length > 0 ? params.searchText : "*";
                var pageNumber = params.pageNumber ? params.pageNumber : 1
                var pageSize = params.pageSize ? params.pageSize : app.PageSize
                var sortBy = params.sortBy ? params.sortBy : 'createdOn';
                var sortOrder = params.sortOrder ? params.sortOrder : 'desc';

                var sortConfig = {};
                sortConfig["sortBy"] = sortBy;
                sortConfig["sortOrder"] = sortOrder;
                return this.searchGroups(searchText, filters, type, pageNumber, pageSize, [sortConfig], tagsSlice);
            },
            convertIdToUnderscoreId: function(allGroups) {
                return _.map(allGroups, function(group) {
                    return _.chain(group).extend({
                        _id: group.id
                    }).omit(["id"]).value()
                })
            },

            searchGroups: function(searchText, filters, type, pageNumber, pageSize, sortConfig, tagsSlice) {
                var self = this
                return searchService.genericSearchWithPost(searchText, filters, type, pageSize, pageNumber, null, sortConfig)
                    .then(function(searchResponse) {
                        searchResponse.allFacets = _.omit(searchService.facetsFor(searchResponse, "groups"), ["entitledSubjects", "members", "Read_ACL"]);
                        searchResponse.allGroups = _.pluck(searchResponse.groups.results, "resource");
                        if (tagsSlice) {
                            _.each(searchResponse.allGroups, function(groups) {

                                if (groups.tags.length > 4) {
                                    groups.tags = groups.tags.slice(0, 4);
                                }
                            });
                        }
                        var communityLimitedIds =_.pluck((_.pluck(searchResponse.groups.results,'resource')),'_id');
                        searchResponse.allGroups = self.convertIdToUnderscoreId(searchResponse.allGroups);
                        searchResponse.totalResults = searchResponse.groups.totalResults;
                        var stringifiedCommunityIds = communityLimitedIds.join();

                        return self.groupMembersCountLimitedIdsOnly(stringifiedCommunityIds).then(function(membersCountForEachCommunity){
                            if(membersCountForEachCommunity){
                                _.each(membersCountForEachCommunity, function(group){
                                    var groupDetails = _.findWhere(searchResponse.allGroups, {"_id":group.id})
                                    groupDetails.membersCount = group.membersCount
                                })
                                return searchResponse;
                            }else{
                                Ember.Logger.error("Error in ['membersCountForEachCommunity' for each community is 'null']. Falls back to _search ES data.");    
                                return searchResponse;                                
                            }
                        },function(error){
                            Ember.Logger.error("Error in getting members count for each community >>",error);
                            return searchResponse;
                        })
                    },function(error){
                            Ember.Logger.error("Error in getting members count for each community >>",error);
                            return searchResponse;
                    });
            },

            similarGroups: function(groupId) {
                return httpClient.get("/knowledgecenter/groups/" + groupId + "/related");
            },

            createGroup: function(groupData) {
                return httpClient.post("/knowledgecenter/groups/", groupData)
            },

            updateGroup: function(groupId, groupData) {
                return httpClient.put("/knowledgecenter/groups/" + groupId, groupData)
            },

            deactivateGroup: function(groupId) {
                return httpClient.put("/knowledgecenter/groups/" + groupId + "/deactivate")
            },

            reactivateGroup: function(groupId) {
                return httpClient.put("/knowledgecenter/groups/" + groupId + "/reactivate")
            },

            addMemberToGroup: function(groupId, userId) {
                return httpClient.put("/knowledgecenter/groups/" + groupId + "/addMember", {
                    member: userId
                });
            },
            removeMemberFromGroup: function(groupId, userId) {
                return httpClient.put("/knowledgecenter/groups/" + groupId + "/removeMembers", {
                    member: userId
                });
            },
             addSelectedMemberToGroup: function(groupId, userId) {
                return httpClient.put("/knowledgecenter/groups/" + groupId + "/addSelectedMember", {
                    member: userId
                });
            },
            removeSelectedMemberFromGroup: function(groupId, userId) {
                return httpClient.put("/knowledgecenter/groups/" + groupId + "/removeSelectedMember", {
                    member: userId
                });
            },
            createJoinCommunityRequest: function(groupId) {
                return httpClient.put("/knowledgecenter/groups/" + groupId + "/joinCommunityRequest", {
                    member: App.getUsername()
                });
            },
            approveCommunityRequest: function(groupId, members, shortName) {
                return httpClient.put("/knowledgecenter/groups/" + groupId + "/approveCommunityRequest", {
                    members: members,
                    shortName: shortName
                });
            },
            rejectCommunityRequest: function(groupId) {
                return httpClient.put("/knowledgecenter/groups/" + groupId + "/rejectCommunityRequest", {
                    member: App.getUsername()
                });
            },
            allGroupsFor: function(userId) {
                return httpClient.get("/knowledgecenter/groups/all/_accessible?forUser=" + userId).then(function(groups) {
                    var transformedGroups = _.map(groups, function(group) {
                        group.isLast = false
                        return group
                    })
                    var lastGroup = _.last(transformedGroups)
                    if (!_.isUndefined(lastGroup))
                        lastGroup.isLast = true
                    return transformedGroups
                })
            },
            allTabsFor: function(){
                return httpClient.get("knowledgecenter/cclom/getAttributes").then(function(result){
                    return result;
                });
            },

            group: function(groupId) {
                return httpClient.get("/knowledgecenter/groups/" + groupId).then(function(group) {
                    return group;                    
                }).fail(function(error){
                    Ember.Logger.error('[groupService::group::]',error);
                });;
            },
            groupMembersCountLimitedIdsOnly: function(groupIds) {
                return httpClient.get("/knowledgecenter/groups/search/memebrs/count/resource/" + groupIds).then(function(membersCountData) {
                    return membersCountData.membersCountForResources;                    
                }).fail(function(error){
                    Ember.Logger.error('Skippable [groupService::groupMembersCountLimitedIdsOnly::]',error);
                });;
            },            
            showBloggersList:function(getModel,permission) {
                var URL = "/knowledgecenter/cclom/bloggers/subject/"+getModel._id+"/pdr/"+permission
                return httpClient.get(URL).then(function(bloggersResponse) {    
                    getModel.set("bloggerProxies",bloggersResponse)
                    return getModel;
                }, function(error) {
                    Ember.Logger.error("Failed to get bloggers list >>>",error);
                    return [];
                });

            },
            showBloggersProxyList:function(getModel,permission) {
                var URL = "/knowledgecenter/cclom/v2/bloggers/subject/"+getModel._id+"/pdr/"+permission+'?resourceType=community'
                return httpClient.get(URL).then(function(bloggersResponse) {
                    bloggersResponse = _.without(bloggersResponse,null);
                    getModel.set("bloggerProxies",bloggersResponse)
                    return getModel;
                }, function(error) {
                    Ember.Logger.error("Failed to get bloggers list >>>",error);
                    return [];
                });

            },
            getBloggersAndProxies:function(getModel){
                var URL = "/knowledgecenter/cclom/proxy/all?resourceId="+getModel._id;
                return httpClient.get(URL).then(function(bloggersResponse) {
                    return bloggersResponse;
                }, function(error) {
                    Ember.Logger.error("Failed to get bloggers list >>>",error);
                    return [];
                });
            },
            asPreObjectFactory:function(categoryData) {
                categoryData._id = (categoryData.data._id || categoryData._id);
                categoryData.author = App.getUserLoginId();
                categoryData.title = (categoryData.data.categoryName || categoryData.name)
                categoryData.resourceUrl = 'Not applicable'
                categoryData.type = 'category'
                var resourceUrl = '#/admin/categories';
                return postService.pushToStream(categoryData, categoryData.verb, "na", resourceUrl).then(function(response){
                    Ember.Logger.info("Getting response for pushToStream>>",response)
                    return ({status:"Published to AS"})
                }, function(error){
                    Ember.Logger.error("[groupService :: ] [asPreObjectFactory ::: ] ", error)
                    return ({status:"Failed to publish activity to  AS"})
                })
            },
            groupsPostsData: function(searchText, searchFilters, resourceTypes, pageSize, pageNumber, activityParams, sortBy) {
                var genericSharedRequestWithPost = sharedPostService.constructGenericSharedRequestForPost(searchText, searchFilters, resourceTypes, pageSize, pageNumber, activityParams, sortBy);
                var postRequest = httpClient.post("/knowledgecenter/pipeline/actions/_search", genericSharedRequestWithPost);


                return postRequest.then(function(searchResponse) {
                  

                    var postResponse ;
					if(resourceTypes == 'post'){
						postResponse = _.pluck(searchResponse.posts.results, "resource");
					}else if(resourceTypes == 'file'){
						postResponse = _.pluck(searchResponse.files.results, "resource");
					}
					

                    if (postResponse && postResponse.length > 0 && resourceTypes == 'post') {

                        return App.communityUtils.getLikesForAllResponse(postResponse).then(function(resData) {
                            searchResponse.posts.results["resource"] = resData;	
                            searchResponse.allFacets = _.omit(searchService.facetsFor(searchResponse, "posts"), ["entitledSubjects", "read_ACL", "shares", "type", "author", "tags", "status", "scope"]);
                            searchResponse.allPosts = _.pluck(searchResponse.posts.results, "resource");
                            searchResponse.totalResults = searchResponse.posts.totalResults;
                            return searchResponse;
                        
                        });
                    } else {

                        if (resourceTypes == 'file') {
                            searchResponse.allFacets = _.omit(searchService.facetsFor(searchResponse, "files"), ["entitledSubjects", "createdBy", "shares", "documentType", "userTags", "Read_ACL"]);
                            searchResponse.allDocuments = _.pluck(searchResponse.files.results, "resource");
                            searchResponse.totalResults = searchResponse.files.totalResults;
                            return searchResponse;
                        }
                    }
                }, function(error) {

                    if (resourceTypes == 'post') {
                        var searchResponse = {
                            allFacets: [],
                            allPosts: [],
                            totalResults: 0
                        }
                        return searchResponse;
                    } else {
                        var searchResponse = {
                            allFacets: [],
                            allDocuments: [],
                            totalResults: 0
                        }
                        return searchResponse;
                    }
                    console.log("Error in getting shared posts: " + error);
                });
            },
             getPaginatedMembersOfCommunity:function(model,pageNumber,pageSize){
                    var self=this;
                     return  self.groupByPage(model,pageNumber,pageSize).then(function(results) {
                        return  self.showCreateButtonBasedonPermissionsInDetailsPage(model,"Moderator").then(function(access){  
                                model.set('members',results.members);
                                if(access.permissionStatus){
                                      _.each(results.memberProfiles,function(memberProfile){
                                          if(results.creator==memberProfile.username || App.getUserLoginId()==memberProfile.username)
                                             memberProfile.roleActionDecision=false;
                                          else 
                                             memberProfile.roleActionDecision=true;
                                       });
                                      model.set('totalResults',results.totalResults);
                                      model.set('memberProfiles',results.memberProfiles);
                                      model.set('joinRequesterProfiles',results.joinRequesterProfiles)
                                      return model;
                                }
                                else{
                                   return entitlementService.isAdmin().then(function(isAdmin){
                                      model.set('members',results.members);
                                      _.each(results.memberProfiles,function(memberProfile){
                                          if(results.creator==memberProfile.username || App.getUserLoginId()==memberProfile.username)
                                             memberProfile.roleActionDecision=false;
                                          else if(isAdmin)
                                             memberProfile.roleActionDecision=true;
                                          else
                                             memberProfile.roleActionDecision=false;  
                                       });
                                        model.set('totalResults',results.totalResults); 
                                        model.set('memberProfiles',results.memberProfiles);
                                        model.set('joinRequesterProfiles',results.joinRequesterProfiles)
                                        return model;
                                    }).fail(function(err){
                                         Ember.Logger.error('[CommunityMembersRoute :: model :: entitlementService.isAdmin]',err);
                                         model.set('members',[]);
                                         model.set('memberProfiles',[]);
                                         model.set('joinRequesterProfiles',[]);
                                         model.set('totalResults',0); 
                                    })     
                                }
                               
                              }).fail(function(err){
                                    Ember.Logger.error('[CommunityMembersRoute :: model ::groupService.showCreateButtonBasedonPermissionsInDetailsPage ]',err);
                                     model.set('members',[]);
                                     model.set('memberProfiles',[]);
                                     model.set('joinRequesterProfiles',[]);
                                     model.set('totalResults',0); 
                              });  
                     }).fail(function(err){
                         Ember.Logger.error("[CommunityMembersRoute::model::groupService.group::]",err);
                         model.set('members',[]);
                         model.set('memberProfiles',[]);
                         model.set('joinRequesterProfiles',[]);
                         model.set('totalResults',0); 
                     });
            },
             groupByPage: function(groupDetails,pageNumber,pageSize) {
                var self = this;
                window.__groupDetails = groupDetails;
                var groupId = groupDetails._id;
                return httpClient.get("/knowledgecenter/groups/search/resource/" + groupId+"/page/"+pageNumber+"/size/"+pageSize).then(function(group) {
                    var memberProfilesP = [];
                    var joinRequesterProfilesP = [];
                    var pendingJoinProfileData = _.where(window.__groupDetails.requests,{approvalStatus: "Pending"})
                    var joinProfileData = _.pluck(pendingJoinProfileData,"username")
                    
                    if (group.members.length>0) {
                          memberProfilesP = usersService.users(group.members);
                          joinRequesterProfilesP = usersService.users(joinProfileData);
                        }
                    return Q.spread([memberProfilesP, joinRequesterProfilesP], function(userProfiles, joinRequesterProfiles) {
                          group.memberProfiles = userProfiles;

                        group.joinRequesterProfiles = _.filter(joinRequesterProfiles, function(joinRequester) {
                            joinRequester.joinCommunityRequestContext = true;
                            return joinRequester;
                        });

                        var allMembers;
                        if (group.members.length > 0 && group.active) {
                            allMembers = group.members;
                        } else {
                            allMembers = group.oldMembers;
                        }
                        group["allMembers"] = allMembers;
                        return group;
                    })
                }).fail(function(error){
                    Ember.Logger.error('[groupService::groupByPage::]',error);
                });
            }
        }
    });
