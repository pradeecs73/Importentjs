'use strict';

define(["app", "services/groupService","underscore","services/entitlementService"],
  function(app, groupService,_,entitlementService) {
    app.CommunityMembersRoute = Ember.Route.extend({
      renderTemplate: function() {
        this.render();
      },
      model:function(){
        var self=this;
          return groupService.getPaginatedMembersOfCommunity(this.modelFor('community'),1,app.PageSize).then(function(result){
                 return result;
               }).fail(function(err){
                Ember.Logger.error('[CommunityMembersRoute:model:]',err);
                return [];
               })
            },
      setupController: function(controller, model) {
            controller.set('model', model);
            controller.set('totalResults',model.get('totalResults'));
            controller.set('paginatedMembers',model.get('memberProfiles'));

            groupService.showCreateButtonBasedonPermissionsInDetailsPage(model,"ManageCommunityMembers").then(function(access){  
                  controller.set('roleActionDecision', access.permissionStatus);
            }).fail(function(err){
                  Ember.Logger.error('[CommunityMembersRoute :: setupController :: ]',error);
                  controller.set('roleActionDecision', false)
            });

            try{
                            if (_.contains(model.members, app.getUsername())) {
                                controller.set('isMember', true);
                                controller.set('roleAddRemoveMembersDecision', true);
                            } else {
                                controller.set('isMember', false);
                                controller.set('roleAddRemoveMembersDecision', false);
                            }
                            var isUserAuthored = false;
                            var isOwner =  false;
                            if(!model.creator || (model.creator === App.getUserLoginId())){
                                isOwner = true;
                                try{
                                    controller.set('isUserAuthored',true)
                                    controller.set('isUserAuthoredForDeletion', true)
                                    controller.set('roleAddRemoveMembersDecision', true);    
                                }catch(err){
                                    controller['isUserAuthored'] = true
                                    controller['isUserAuthoredForDeletion'] = true
                                    controller['roleAddRemoveMembersDecision']= true;
                                    Ember.Logger.error("Skippable: Issue in resolving key: isUserAuthored")
                                }                    
                            }
                            var isAdmin = false ;
                            if(!isOwner){
                                entitlementService.isAdmin().then(function(decision){
                                    isAdmin = decision;
                                    var decisionForUserAuthored= (isOwner || isAdmin);
                                        try{
                                            controller.set('isUserAuthored',decisionForUserAuthored)
                                            controller.set('isUserAuthoredForDeletion', decisionForUserAuthored)
                                            controller.set('roleAddRemoveMembersDecision', decisionForUserAuthored);    
                                        }catch(err){
                                            controller['isUserAuthored'] = decisionForUserAuthored
                                            controller['isUserAuthoredForDeletion'] = decisionForUserAuthored
                                            controller['roleAddRemoveMembersDecision']=  decisionForUserAuthored
                                            Ember.Logger.error("Skippable: Issue in resolving key: isUserAuthored")
                                        }                        
                                    if(!decisionForUserAuthored){
                                             groupService.showCreateButtonBasedonPermissionsInDetailsPage(model,"Moderator").then(function(access){
                                                    try{  
                                                        controller.set('isUserAuthoredForDeletion',access.permissionStatus);
                                                        controller.set('isUserAuthored',access.permissionStatus);
                                                        controller.set('roleAddRemoveMembersDecision', access.permissionStatus)
                                                    }catch(err){
                                                        controller['isUserAuthored'] = access.permissionStatus;
                                                        controller['isUserAuthoredForDeletion'] = access.permissionStatus;
                                                        controller['roleAddRemoveMembersDecision'] =access.permissionStatus;
                                                    }
                                              }).fail(function(err){
                                                    Ember.Logger.error('[CommunityRoute :: setupController :: ]',error);
                                                    try{  
                                                        controller.set('isUserAuthoredForDeletion', false);
                                                        controller.set('isUserAuthored', false);
                                                    }catch(err){
                                                        controller['isUserAuthored'] = false;
                                                        controller['isUserAuthoredForDeletion'] = false;
                                                    }
                                              });
                                       var deletionPermission = false;
                                       try{
                                           deletionPermission = controller.get('isUserAuthoredForDeletion')
                                       }catch(err){
                                           deletionPermission = controller['isUserAuthoredForDeletion']
                                       }        
                                       if(!deletionPermission){
                                            postService.permitActivityBasedonPermission("community","Delete").then(function(permissionData){
                                                if(permissionData && permissionData.permissionStatus){
                                                    try{
                                                        controller.set('isUserAuthoredForDeletion',permissionData.permissionStatus)    
                                                    }catch(err){
                                                        controller['isUserAuthoredForDeletion'] = permissionData.permissionStatus
                                                        Ember.Logger.error("Skippable: Issue in resolving key: isUserAuthoredForDeletion")
                                                    }                                     
                                                }
                                            }).fail(function(error){
                                                    try{
                                                        controller.set('isUserAuthoredForDeletion', false)    
                                                    }catch(err){
                                                        controller['isUserAuthoredForDeletion'] = false
                                                        Ember.Logger.error("Skippable: Issue in resolving key: isUserAuthoredForDeletion")
                                                    }                                 
                                                Ember.Logger.error("Community deletion permission validation failed >>>"+error);   
                                            })

                                            postService.permitActivityBasedonPermission("community","Edit").then(function(permissionData){
                                                if(permissionData && permissionData.permissionStatus){
                                                    try{
                                                        controller.set('isUserAuthoredForEdit',permissionData.permissionStatus)
                                                        controller.set('roleAddRemoveMembersDecision', permissionData.permissionStatus)    
                                                    }catch(err){
                                                        controller['isUserAuthoredForEdit'] = permissionData.permissionStatus
                                                        controller['roleAddRemoveMembersDecision'] =permissionData.permissionStatus
                                                        Ember.Logger.error("Skippable: Issue in resolving key: isUserAuthoredForEdit")
                                                    }                                     
                                                }
                                            }).fail(function(error){
                                                    try{
                                                        controller.set('isUserAuthoredForEdit', false)    
                                                    }catch(err){
                                                        controller['isUserAuthoredForEdit'] = false
                                                        Ember.Logger.error("Skippable: Issue in resolving key: isUserAuthoredForEdit")
                                                    }                                 
                                                Ember.Logger.error("Community 'edit' permission validation failed >>>"+error);   
                                            })                                
                                        }
                                    }
                                }).fail(function(error){
                                    Ember.Logger.error("Admin role validation failed >>>"+error);
                                    isAdmin = false;
                                    var decisionForUserAuthored= (isOwner || isAdmin);
                                    try{
                                        controller.set('isUserAuthored',decisionForUserAuthored)    
                                    }catch(err){
                                        controller['isUserAuthored'] = decisionForUserAuthored
                                        Ember.Logger.error("Skippable: Issue in resolving key: isUserAuthored")
                                    }
                                })                    
                            }else{
                                    try{
                                        controller.set('isUserAuthored',true)
                                        controller.set('isUserAuthoredForDeletion', true)    
                                    }catch(err){
                                        controller['isUserAuthored'] = true
                                        controller['isUserAuthoredForDeletion'] = true                   
                                        Ember.Logger.error("Skippable: Issue in resolving key: isUserAuthored")
                                    }
                                
                            } 
            }catch(error){
              Ember.Logger.error("[Members route :: setupcontroller :: ]", error)
            }


     }

    });
  });