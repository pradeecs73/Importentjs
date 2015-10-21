'use strict';

define(['app', 'underscore', 'services/groupService',
        'services/usersService', 'services/webExService',
        'services/searchService', 'services/documentsService',
        'pages/flashMessage', 'emberPageble',
        'services/collaborationUtil', 'httpClient'
    ],
    function(app, _, groupService, userService,
        webExService, searchService, documentsService,
        flashMessage, emberPageble, collaborationUtil, httpClient) {
        /*This function will fetch list of all categories from groups Api and store in a session varibale*/
        app.then(function(app) {
            var self = this;
            httpClient.get("/knowledgecenter/cclom/categories")
                .then(function(categories) {
                    sessionStorage.setItem("groupsCategories", JSON.stringify(categories));
                    sessionStorage.setItem("postsCategories", JSON.stringify(categories));
                }, function(err) {
                    sessionStorage.setItem("groupsCategories", JSON.stringify([]));
                    sessionStorage.setItem("postsCategories", JSON.stringify([]));
            });
        });

        app.CommunityController = Ember.ObjectController.extend(app.PeoplePopoverControllerMixin, {
            currentUser: app.getUserLoginId(),
            isGridView:true,
            isMember: function(){
                return (this.controllerFor('community').isMember || this.isMember) ? (this.controllerFor('community').isMember || this.isMember) : false
            },
            populatePostsData: function(type, pageNumber, sortBy, sortOrder) {
                    app.communityUtils.populatePostsData(type, pageNumber, sortBy, sortOrder,this,groupService,app.PageSize);
            },            
            isPublic: function() {
                return this.get('model').type == "public";
            }.property('model.type'),
            displayAllViews: function() {
                return (this.get('model').type == "public" || this.get('model').type == "hidden" || (this.get('model').type == "private" && (this.controllerFor('community').isMember || this.isMember)));
            }.property('model.type'),
            isTenantHavingAccessToPlaybook: function(){
                if(this.get('model').hasPlaybook){
                    return this.get('model').hasPlaybook;    
                }else{
                    return false;
                }
                
            }.property('model.hasPlaybook'),
            isJoinRequestSent: function() {
                var group = this.get('model');
                if (group.type == "private" && !this.isMember) {
                    if(!group.requests){
                        group.requests=[];
                    }
                    var request = group.requests.findBy("username", app.getUserLoginId());
                    return (request && request.approvalStatus === "Pending") ? true : false;
                }
                return false;
            }.property('model.type'),
            userNameAttribute: "username",
            populateSimilarCommunities: function() {
                var self = this;
                groupService.similarGroups(this.get('model')._id).then(function(communities) {
                    self.set("similarCommunities", communities);
                });
            },

            getAllUsers: function() {
                return this.get('model').memberProfiles;
            },

           actions: {
                editCommunity: function(communityId) {
                    this.transitionTo("communityEdit", communityId)
                },
                deleteCommunity:function(communityData){
                    var self = this;
                    self.getCommunityData = communityData;
                    self.controller = this.controllerFor("community");
                    var groupsDeleteUrl = "/knowledgecenter/groups/"
                        $.ajax({
                            url: groupsDeleteUrl + communityData._id,
                            type: 'DELETE',
                            beforeSend: function(xhr) {
                                httpClient.setRequestHeadersData(xhr);
                            },
                            success: function(result) {
                                jQuery.gritter.add({
                                    title: "",
                                    text: "You have deleted the community successfully",
                                    class_name: "gritter-success"
                                });
                            },
                            error: function(error) {
                                jQuery.gritter.add({
                                    title: "",
                                    text: "Community deletion failed. Please try again.",
                                    class_name: "gritter-error"
                                });
                            }
                        }).then(function(data){
                             self.controller.transitionTo('communities.all')                    
                        })
                },
                deactivateCommunity: function(communityId) {
                    var self = this;
                    groupService.deactivateGroup(communityId)
                        .then(function() {
                            flashMessage.setMessage("Community deactivated successfully.", "success");
                            self.transitionTo("communities.my", {
                                queryParams: {
                                    filterType: "all",
                                    filters: "",
                                    searchText: "",
                                    pageNumber: 1
                                }
                            });
                        })
                        .fail(function(error) {
                            self.set("activationError", "Community deactivation failed.");
                        });
                },
                reactivateCommunity: function(communityId) {
                    var self = this;
                    groupService.reactivateGroup(communityId)
                        .then(function() {
                            flashMessage.setMessage("Community reactivated successfully.", "success");
                            self.transitionTo("communities.my", {
                                queryParams: {
                                    filterType: "all",
                                    filters: "",
                                    searchText: "",
                                    pageNumber: 1
                                }
                            });
                        })
                        .fail(function(error) {
                            self.set("activationError", "Community reactivation failed.");
                        });
                },
                joinCommunity: function(fromJoinDialog) {
                    var self = this;
                    var currentUser = app.getEmailId();
                    if (!fromJoinDialog && this.get('model').type === "private") {
                        groupService.createJoinCommunityRequest(self.get('model')._id).then(function() {
                            jQuery('.detail-title-btn').text('Join Request Status: Pending');
                            self.set("joinMessage", "Join request has been sent.");
                        }).fail(function(error) {
                            self.set("joinError", "Failed to make join community request");
                        });
                        return;
                    }
                    groupService.addMemberToGroup(this.get("content._id"),currentUser).then(function() {
                        self.set("joinMessage", "Congratulations! You have successfully joined this community.")
                        var model = self.get('model');
                        if (model.members && model.members.indexOf(currentUser) < 0) {
                            userService.users([currentUser]).then(function(userProfiles) {
                                model.memberProfiles.pushObject(userProfiles[0]);
                            })

                            model.members.pushObject(self.currentUser);
                            self.set('isMember', true);
                            self.set('model', model);
                        }
                    }).fail(function(error) {
                        self.set("joinError", "Failed to join the community or you are already a member.");
                    });
                },
                instantMeeting: function() {
                    var self = this;
                    var members = this.get('model').memberProfiles;
                    var expertsDetails = _.map(members, function(member) {
                        if (member.username === self.currentUser) {
                            return;
                        }
                        return {
                            expertId: member.shortName,
                            expertEmail: member.email
                        };
                    });
                    expertsDetails = _.compact(expertsDetails)

                    webExService.instantMeeting(expertsDetails);
                },
                gotoPage: function(pageValue) {
                    this.set('pageNumber', pageValue);
                    this.send('populateSharedDocumentsByActionSearch', pageValue, this.get('sortedFieldName').Library, this.sortOrder);

                },
                assignCommunityRole:function(){
                    var self=this;
                    var obj={actor:{},roles:[],resource:{}};
                    var selectedMember=self.get('selectedMember');
                    if(selectedMember)
                         obj.actor=selectedMember;
                    jQuery(".chkBoxOpacity").each(function(){
                        if(jQuery(this).prop('checked')){
                            var item={ roleId: jQuery(this).attr('data-role-id'),
                            roleName:jQuery(this).attr('data-role-id')}
                            obj.roles.push(item);
                         }
                    });
                    var communityController=self.controllerFor('community');
                    if(communityController){
                      obj.resource={communityId:communityController.get('_id'),
                                   communityName:communityController.get('name')};
                    }
                    try{
                        obj.roles = _.reject(obj.roles, function(roleVal){ return roleVal == null; });
                        obj.roles = app.uniqObjects(obj.roles);
                    }catch(error){
                        Ember.Logger.error("[assignCommunityRole ::] [communityMembersController :::] ", error)
                    }
                    
                    groupService.assignCommunityRole(obj).then(function(result){
                    jQuery.gritter.add({
                                title: '',
                                text: 'Content contribution / proxy assignment is successful.',
                                class_name: 'gritter-success'
                    });
                    }).fail(function(err){
                         jQuery.gritter.add({
                                title: '',
                                text: 'Content contribution / proxy assignment has failed.',
                                class_name: 'gritter-error'
                            });
                         Ember.Logger.error("[assignCommunityRole] [communityMemberController] >>>:",err);
                    })

                }
            }
        });

    });