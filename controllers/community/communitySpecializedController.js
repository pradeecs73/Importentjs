'use strict';

define(['app', 'httpClient', 'text!templates/playBooks.hbs', 'services/playBookService', 'text!templates/playBook.hbs', 'text!templates/playBookSpecialized.hbs'],
    function(app, httpClient, playBooksTemplate, playBookService, playBookTemplate, specializedTemplate) {
        app.CommunitySpecializedController  = Ember.ObjectController.extend({
            populateRecommendedSkill: function(skill, family) {
                playBookService.getAssociatedLearnings(family, skill, this);
            }
        });

    });
