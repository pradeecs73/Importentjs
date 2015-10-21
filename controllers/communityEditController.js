'use strict';

define(['app',
        'underscore',
        'services/groupService', 'services/usersService', 'pages/flashMessage', 'pages/wysiwyg+tags'
    ],
    function(app, _, groupService, usersService, flashMessage, wysiwygEditor) {

        app.CommunityEditController = Ember.ObjectController.extend({
            allTags: null,
            types: ['public', 'private', 'hidden'],
            from: function() {
                return this.get('model').get('_id');
            }.property('model'),
            allTagsLoaded: false,
            title: 'Edit Community',
            createCommunity: false,
            displayDeactivateMessage: false,
            storedActiveFeildValue: false,
            communityType: function(){
                 return this.get('model').get('type');
            }.property("types"),
            category:{},
            categorySelected: 0,
            createCommunityObject: function() {
                var contentDiv =CKEDITOR.instances['wysiwyg-editor'].getData();
                var community = this.get('model');

                var description = contentDiv;

                var category = community.category ? community.category : this.category;
                community.set('category', category);
                community.set('description', description);
                community.set('descriptionSansHtml', description)

                var tags = [];
                if($("#tagsField").val()){
                    tags = _.map($("#tagsField").val().split(","), function(tag) {
                        return tag.trim()
                    });                    
                }

                community.set('tags', ((tags.length && tags[0]) ? tags : []));
                
                community.set("newMembers", []);
                community.set("members", []);
                return community;
            },

            observeActivateValue: function() {
                if (!this.get("active")) {
                    this.set("displayDeactivateMessage", true)
                    wysiwygEditor.disableWysiwygEditor();
                } else {
                    wysiwygEditor.enableWysiwygEditor();
                    this.set("displayDeactivateMessage", false)
                }
            }.observes("active"),

            fromRoute: function() {
                return "#community/" + this.get("from")
            }.property("from"),

            actions: {
                createCommunity: function() {
                    var self = this;
                    var community = this.createCommunityObject();
                    community.errors.clear()
                    community.validate().then(function() {
                        var selectedCategory = $('select#categorySelector').val();
                        if (selectedCategory !="" && selectedCategory != null){
                            var categoryObject = _.findWhere(self.get('model').categories, {
                                _id: selectedCategory
                            });
                            community.set("category", categoryObject);
                        }else{
                            community.set('errors.category', "Select a valid category.");
                            return false;
                        }
                        var selectedType = $('select#communityTypeSelector').val();
                        if (!community.get('isValid')) {
                            community.set('errors.name', _.first(community.get('errors.name')))
                            community.set('errors.newMembers', _.first(community.get('errors.newMembers')))
                        } else {
                            community.set("newmembers", []);
                            var communityData = {
                                name: community.get('name'),
                                tags: community.get('tags'),
                                members: [],
                                description: community.get('description'),
                                category: community.get('category'),
								newmembers: [],
                                type: (selectedType || community.get('type'))
                            };
                            if (!community.active) {
                                if (self.storedActiveFeildValue) {
                                    return self.deactivateCommunity(community._id)
                                } else {
                                    self.transitionTo("community.details", community._id);
                                }
                            } else {
                                return groupService.updateGroup(community.get("_id"), communityData).then(function(){
                                    jQuery.gritter.add({
                                        title: "",
                                        text: "Community updation is successful.",
                                        class_name: "gritter-success"
                                    });
                                    if (!self.storedActiveFeildValue) {
                                        return self.reactivateCommunity(community._id)
                                    } else {
                                        self.transitionTo("community.details", community._id);
                                    }
                                }, function(error) {
                                    var communityCreationUpdateMessage = error.responseText;
                                    if (error.status == 504 || error.status == 500 || error.status == 417){
                                        communityCreationUpdateMessage = "Community updation has failed. Please contact site admin. Error code: " + error.status
                                    }
                                    community.set('createError', communityCreationUpdateMessage);
                                });
                            }

                        }
                    })
                },
                clear: function(id) {
                    this.controllerFor('communities').target.transitionTo('community.details', id)
                },
                manageMembers: function(id) {
                    this.controllerFor('communities').target.transitionTo('community.members', id)
                }
            },
            deactivateCommunity: function(communityId) {
                var self = this
                groupService.deactivateGroup(communityId)
                    .then(function() {
                        flashMessage.setMessage("Community deactivated successfully.", "success");
                        self.transitionTo("community.details", communityId);
                    })
                    .fail(function() {
                        self.set("createError", "Community deactivation failed.");
                    });
            },
            reactivateCommunity: function(communityId) {
                var self = this;
                groupService.reactivateGroup(communityId)
                    .then(function() {
                        flashMessage.setMessage("Community reactivated successfully.", "success");
                        self.transitionTo("community.details", communityId);
                    })
                    .fail(function() {
                        self.set("createError", "Community reactivation failed.");
                    });
            }
        });

    });