'use strict';

define(['app',
        'services/tagsService'
    ],
    function(app, tagsService) {

        app.CommunitiesCreateRoute = Ember.Route.extend({
            model: function() {
                sessionStorage.setItem('membersDetailWithShortname','');
                return app.Community.create({
                    type: 'public',
                    active: true
                });
            },
            enter: function() {
                this.controllerFor('communities').set('myPath', false)
                this.controllerFor('communities').set('allPath', false)
                this.controllerFor('communities').set('createPath', true)
            },
            setupController: function(controller, model) {

                tagsService.allTags().then(function(tags) {
                    controller.set('allTags', tags)
                    controller.set('allTagsLoaded', true)
                })

                controller.set('model', model);
                controller.set('categories', JSON.parse(sessionStorage.getItem('groupsCategories')));
            },
            tabTitle: "Create Community"
        });

    });