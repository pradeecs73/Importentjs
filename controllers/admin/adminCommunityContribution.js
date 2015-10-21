"use strict";

define(["app", "text!templates/communityContribution.hbs",'services/collaboration/communityContributionService',"underscore"],
    function (app, communityContributionTemplate,communityContributionService,_) {
        App.CollaborateCommunityContributionView = Ember.View.extend({
            template: Ember.Handlebars.compile(communityContributionTemplate)
        });

        App.CollaborateCommunityContributionRoute = Ember.Route.extend({
             model: function () {
                var self = this;
               return communityContributionService
                        .getContributions()
                        .then(function(contributions){
                            return contributions;
                        })
                        .fail(function(err){
                            Ember.Logger.error("[CollaborateCommunityContributionRoute::model::Error in retrieving contributions from server. Please contact admin.]",err);
                            return [];
                        });
            }
            
        });
        App.CollaborateCommunityContributionController = Ember.ObjectController.extend({
            actions: {
                disableContribution:function(Id,contribution,status){
                    var self=this;
                    var obj=self.get('model');
                    var objCont=_.findWhere(obj,{_id:Id});
                     return communityContributionService
                        .updateContribution(contribution)
                        .then(function(contributions){
                             var msg='';
                              if(status){ 
                                   msg='deactivated'; 
                                   objCont.active=false;
                                   jQuery("#div_"+Id).addClass("inactivecategory");
                                   jQuery("#span_"+Id).removeClass("icon-remove").addClass("icon-checkmark");
                                   jQuery("#span_"+Id).attr("data-original-title","Activate");
                                 }
                               else{
                                    msg='activated' ;
                                    objCont.active=true; 
                                    jQuery("#div_"+Id).removeClass("inactivecategory");
                                    jQuery("#span_"+Id).removeClass("icon-checkmark").addClass("icon-remove");
                                    jQuery("#span_"+Id).attr("data-original-title","De-activate");
                                 }
                               
                               jQuery.gritter.add({title:'', text: 'contribution has been successfully '+msg, class_name: 'gritter-success'});
                        })
                        .fail(function(err){
                            Ember.Logger.error("[CollaborateCommunityContributionController::disableContribution::Error in retrieving contributions from server. Please contact admin.]",err);
                            jQuery.gritter.add({title:'', text: 'Failed to disable contribution.', class_name: 'gritter-error'});
                        });
                }
            }

        });  
   });
   
      