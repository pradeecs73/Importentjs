'use strict';

define(['app',
        'text!templates/communities/joinCommunityRequest.hbs',
        'services/groupService', 'pages/flashMessage'
    ],
    function(app, joinCommunityRequestTemplate, groupService, flashMessage) {
        app.JoinCommunityRequestView = Ember.View.extend({
            template: Ember.Handlebars.compile(joinCommunityRequestTemplate),
            tagName: '',
            actions: {
                reject: function() {
                    var self = this;
                    var communittIndexController = this.container.lookup("controller:community");
                    if (communittIndexController && communittIndexController.get('model')) {
                        var groupId = communittIndexController.get('model')._id;
                        groupService.rejectCommunityRequest(groupId).then(function(res) {
                            flashMessage.setMessage("Community join request cancelled successfully.", "success");
                            communittIndexController.transitionTo("communities.my", {
                                queryParams: {
                                    filterType: "all",
                                    filters: "",
                                    searchText: "",
                                    pageNumber: 1
                                }
                            });
                        }).fail(function(error) {
                            communittIndexController.set("activationError", "Failed to cacel community join request");
                            //flashMessage.setMessage("Failed to cacel community join request.", "error");
                        });
                    }
                },
                accept: function() {
                    var self = this;
                    var communittIndexController = this.container.lookup("controller:community");
                    if (communittIndexController && communittIndexController.get('model')) {
                        var groupId = communittIndexController.get('model')._id;
                        var requestedMember = this.get("context").get("content").username;
                        var requestedMemberShortname = this.get("context").get("content").shortName;
                        groupService.approveCommunityRequest(groupId, [requestedMember],requestedMemberShortname).then(function(res) {
                            flashMessage.setMessage("Member added to community successfully.", "success");
                            communittIndexController.transitionTo("communities.my", {
                                queryParams: {
                                    filterType: "all",
                                    filters: "",
                                    searchText: "",
                                    pageNumber: 1
                                }
                            });
                        }).fail(function(error) {
                            communittIndexController.set("activationError", "Failed to accept community join request");
                            //flashMessage.setMessage("Failed to cacel community join request.", "error");
                        });
                    }
                }
            }
        });
    });