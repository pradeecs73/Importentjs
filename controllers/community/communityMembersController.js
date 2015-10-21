'use strict';

define(['app', 'underscore', 'services/groupService',
        'services/usersService', 'services/webExService',
        'services/searchService', 'services/documentsService',
        'pages/flashMessage', 'emberPageble',
        'services/collaborationUtil', 'httpClient',
		'services/collaboration/postService','Q'
    ],
    function(app, _, groupService, usersService,
        webExService, searchService, documentsService,
        flashMessage, emberPageble, collaborationUtil, httpClient, postService,Q) {
        app.CommunityMembersController = Ember.ObjectController.extend(app.PeoplePopoverControllerMixin, {
            pageNumber: 1,
            totalResults:0,
            paginatedMembers:[],
            queryParams: ['pageNumber'],
            currentUser:app.getUserLoginId(),
            isMember: false,
            isGridView:false,
            allMemberRoles:[],
            communitySpecificRoles: [],
            selectedMember:{},
            isPublic: function() {
                return this.get('model').type == "public";
            }.property('model.type'),
            isGridView:function(){
                return this.get("model").get("isGridView") == true; 
            }.property("model.isGridView"),
            displayAllViews: function() {
                return (this.get('model').type == "public" || this.get('model').type == "hidden" || (this.get('model').type == "private" && (this.controllerFor('community').isMember || this.isMember)));
            }.property('model.type'),
            userNameAttribute: "username",
            sortedFieldName: {
                'Members': 'name'
            },
            sortOrder: 'desc',
            getAllUsers: function() {
                return this.get('model').memberProfiles;
            },
            sortCommunityDetailsData: function(fieldName, orderType, type) {
             app.communityUtils.sortCommunityDetailsData(fieldName, orderType, type,this);
            },
            getSortFieldName: function(type) {
                app.communityUtils.getSortFieldName(type,this);
            },
            allUsersConfig: (function() {
                return usersService.usersAutoSuggest();
            }).property(),
            roleAddRemoveMembersDecision: false,
            actions: {
                gotoPage: function(pageValue) {
                     var self=this;
                     if(typeof pageValue !="number")
                         pageValue=parseInt(pageValue);
                     self.set('pageNumber', pageValue);
                     return groupService.getPaginatedMembersOfCommunity(self.controllerFor('community').get('model'),pageValue,app.PageSize).then(function(result){
                        try{
                            result.memberProfiles = _.sortBy(result.memberProfiles, function(member){
                              return member.username
                            })
                        }catch(err){
                            Ember.Logger.error("[CommunityMembersRoute:model:] Failed to sort members :: ",err)
                        }
                        self.set('paginatedMembers',result.memberProfiles);
                     }).fail(function(err){
                       Ember.Logger.error('[CommunityMembersRoute:model:]',err);
                       self.set('paginatedMembers',[]);
                     });
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

                },
                communitySpecificRoles:function(shortName,email){
                    var self = this;
                    var obj = [];
                    var communityController=self.controllerFor('community');
                     communityController.set('selectedMember',{displayName:shortName,userId:email});
                     self.set('selectedMember',{displayName:shortName,userId:email});
                      jQuery(".chkBoxOpacity").remove();
                      // jQuery(".chkBoxOpacity").each(function(){
                      //         jQuery(this).removeProp('checked');
                      //       });
                        postService.getPredefinedRolesForUser(email).then(function(assignedRoles){
                           postService.getRolesForUserInCommunity(communityController.get('_id'),email).then(function(communityRole){
                                var communityRolesId=[],assignedRolesId=[];
                                if(assignedRoles.length>0 ){
                                     assignedRoles = _.reject(assignedRoles, function(roleVal){ return roleVal == null; });
                                    communityRolesId=_.pluck(assignedRoles,"roleId");
                                 }
                                 if(communityRole.length>0){
                                   communityRole = _.reject(communityRole, function(roleVal){ return roleVal == null; });
                                    assignedRolesId=_.pluck(communityRole,"roleId");
                                 }
                                 var intersectResult=_.intersection(assignedRolesId,communityRolesId);

                                 if(assignedRoles && assignedRoles.length>0){
                                    _.each(assignedRoles,function(assignedRoles){
                                        var item = {};
                                        item._id = assignedRoles.roleId;
                                        item.name = assignedRoles.roleName;
                                        if(intersectResult.indexOf(assignedRoles.roleId) !=-1)
                                            item.assigned = true;
                                        else
                                            item.assigned = false;
                                        obj.push(item);
                                    }) 
                                  }
                                 if(communityRole && communityRole.length>0){
                                     _.each(communityRole,function(communityRole){
                                        if(intersectResult.indexOf(communityRole.roleId) ==-1){
                                            var item = {};
                                            item._id = communityRole.roleId;
                                            item.name = communityRole.roleName;
                                            item.assigned = true;
                                            obj.push(item);
                                        }
                                    }) 
                                 } 
                                communityController.set('communitySpecificRoles',obj);
                                self.set('communitySpecificRoles',obj);
                                
                           }).fail(function(err){
                            Ember.Logger.error("[communityMemberController ::][getPredefinedRolesForUser:getRolesForUserInCommunity :]",err);
                            self.set('communitySpecificRoles',obj);                            
                           });
                        }).fail(function(err){
                            Ember.Logger.error("[communityMemberController::] [getAssignedRole:]",err);
                            self.set('communitySpecificRoles',obj);
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
                getSortedDataByFiledType: function(fieldName, type, dropId) {
                    if (fieldName && fieldName != "") {
                        this.sortCommunityDetailsData(fieldName, this.get('sortOrder'), type);
                    }
                },
                toggleViewCommunity: function(view) {
                    if(view == "grid-view"){
                        this.controllerFor("communityMembers").isGridView = true; 
                        this.get("model").set("isGridView",true);                       
                    }else{
                         this.controllerFor("communityMembers").isGridView = false;
                         this.get("model").set("isGridView",false);  
                    }
                   this.send('gotoPage',1);
                },
                changeSortedDataDirection: function(dropId, type) {
                    this.sortCommunityDetailsData(this.getSortFieldName(type), !this.get('sortOrder'), type);
                },
                deleteMember:function(username){
                  var self=this;
                  var communityController=self.controllerFor('community');
                  var userId=[];
                  userId.push(username);
                   groupService.removeSelectedMemberFromGroup(communityController.get("_id"),userId).then(function() {
                   var paginatedMembers=self.get('paginatedMembers');
                      paginatedMembers=_.reject(paginatedMembers,function(member){
                        return  member.username==username
                      });
                      self.set('paginatedMembers',paginatedMembers);
                        jQuery.gritter.add({
                            title: '',
                            text: "Member has been deleted successfully.",
                            class_name: 'gritter-success'
                        });
                    }).fail(function(error) {
                        jQuery.gritter.add({
                            title: '',
                            text: 'Failed to delete the member.',
                            class_name: 'gritter-error'
                        });
                    });
                },
                addMember:function(value,handleFailure,handleSuccess){
                  var self=this;
                  var communityController=self.controllerFor('community');
                   groupService.addSelectedMemberToGroup(communityController.get("_id"),value).then(function(result) {
                        handleSuccess();
                        self.send('gotoPage',1);
                        jQuery.gritter.add({
                            title: '',
                            text: "Member has been added successfully.",
                            class_name: 'gritter-success'
                        });
                        try{
                            self.toggleProperty("reset");
                        }catch(error){
                            Ember.Logger.error("[communityMembersController :: addMember] Failed to reset the add member box.", error);
                        }
                    }).fail(function(error) {
                        handleFailure();
                        jQuery.gritter.add({
                            title: '',
                            text: 'Failed to add the member. Please try again or contact admin',
                            class_name: 'gritter-error'
                        });
                        Ember.Logger.error("[communityMembersController :: addMember] Failed to add member.", error);
                    });

                }
              
            }
        });

    });
