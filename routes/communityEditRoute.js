'use strict';

define(['app', 'services/groupService', 'services/tagsService', 'underscore'],
    function(app, groupService, tagsService, _) {

        app.CommunityEditRoute = Ember.Route.extend({
            model: function() {
                sessionStorage.setItem('membersDetailWithShortname', '');

                return groupService.group(this.modelFor('community')._id).then(function(community) {
                    community.members = []
                    community.filteredMembers = []
                    return App.Community.create(community)
                })
            },

            setupController: function(controller, model) {
                tagsService.allTags().then(function(tags) {
                    controller.set('allTags', tags);
                    controller.set('allTagsLoaded', tags);
                });
                controller.set('storedActiveFeildValue', model.active);
                var categoryObject = {
                    "_id": model.category._id,
                    "name": model.category.name
                };
                setTimeout(function() {
                    if (categoryObject && categoryObject._id) {
                        $('#categorySelector').val(categoryObject._id);
                        controller.set('category', categoryObject);
                        return categoryObject;
                    }
                }, 100);
                controller.set('categorySelected', model._id);
                controller.set('model', model);
                controller.set('categories', JSON.parse(sessionStorage.getItem('groupsCategories')));
            }
        });

    });