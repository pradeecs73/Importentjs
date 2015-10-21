'use strict';

define(['app', 'underscore', 'services/groupService', 'services/usersService', 'services/tagsService', 'emberValidator', 'pages/flashMessage'],
    function(app, _, groupService, usersService, tagsService, emberValidator, flashMessage) {

        app.CommunitiesCreateController = Ember.ObjectController.extend({
            queryParams: ['from'],
            from: 'all',
            types: ['public', 'private', 'hidden'],
            createCommunity: true,
            allTags: null,
            allTagsLoaded: false,
            title: 'Create Community',
            categorySelected: 0,
            fromRoute: function() {
                return "#communities/" + this.get("from")
            }.property("from"),

            allUsersConfig: function() {
                return usersService.usersAutoSuggest()
            }.property(),
            selectedCategory: function() {
                return this.get('category');
            }.property("category"),
            actions: {
                createCommunity: function() {
                    var self = this,
                        contentDiv=CKEDITOR.instances['wysiwyg-editor'].getData(),
                        community = this.get('model');

                    var description = contentDiv
                    community.set('description', description);
                    community.set('descriptionSansHtml', description);

                    //Setting error message blank before showing error that we get from server.
                    community.set('createError', '');

                    var rawTags = $("#tagsField").val();
                    var tags = [];
                    if (rawTags != "") {
                        _.each(rawTags.split(","), function(tag) {
                            tags.push(tag.trim());
                        });
                    };

                    community.set('tags', tags);

                    var members = [];
                    
                    community.set("members", members.join());
                    if(sessionStorage.getItem("membersDetailWithShortname"))
                    {

                        var members=sessionStorage.getItem("membersDetailWithShortname");
                        var newmembers=JSON.parse(members);
                         community.set("newmembers",newmembers);
                    }else{

                         community.set("newmembers",[]);
                    }

						community.errors.clear()
						community.validate().then(function() {
                        community.set('write',true);
                        var selectedCategory = $('select#categorySelector').val();
                        if (selectedCategory) {
                            var categoryObject = _.findWhere(self.get('model').categories, {
                                _id: selectedCategory
                            });
                            community.set("category", categoryObject);
                        }

                        if (!community.get('isValid')) {
                            community.set('errors.name', _.first(community.get('errors.name')))
                            community.set('errors.members', _.first(community.get('errors.members')))
                            community.set('errors.tags', _.first(community.get('errors.tags')))
                        } else {
                            var communityMembers = _.isEmpty(community.get('members')) ? [] : community.get('members').split(",");
                            return groupService.createGroup({
                                type: community.get('type'),
                                name: community.get('name'),
                                tags: community.get('tags'),
                                members: communityMembers,
                                membersCount: 1 + communityMembers.length,
                                description: community.get('description'),
                                active: community.get('active'),
                                category: community.get('category'),
                                newmembers:community.get('newmembers')
                            }).then(function(data) {
                                var location = (window.location).hash;
                                if (data._id) {
                                    flashMessage.setMessage("Your Community has been created.It can be viewed under My Communities.", "success");
                                    self.get('model').set("_id", data._id);
									self.get('model').set("members",data.members);
                                    self.transitionTo('community.details', self.get('model'));
                                } else {
                                    community.set('createError', 'Sorry, I am not able to get required data. Please report to Admin.')
                                }

                            }, function(error) {
                                var communityCreationUpdateMessage = error.responseText;
                                if(error.status == 504){
                                    communityCreationUpdateMessage = "Community creation successful. Added Image is being processed in background due to the large size and will take a while. Please go back to the Community list page"
                                }
                                else if(error.status == 500){
                                    communityCreationUpdateMessage = "Community creation is failed. Please contact site admin. Error code: " + error.status
                                }
                                else if(error.status == 417){
                                    communityCreationUpdateMessage = "Community creation is failed. Please contact site admin.  Error code: " + error.status
                                }

                                community.set('createError', communityCreationUpdateMessage );
                            });
                        }
                    })
                },
                clear: function() {
                    this.get('model').errors.clear();
                    this.controllerFor('communities').target.transitionTo('communities');
                }
            }
        });

    });