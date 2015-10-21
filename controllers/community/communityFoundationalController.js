'use strict';

define(['app', 'httpClient', 'text!templates/playBooks.hbs', 'services/playBookService', 'text!templates/playBook.hbs', 'text!templates/playBookFoundational.hbs'],
    function(app, httpClient, playBooksTemplate, playBookService, playBookTemplate, foundationalTemplate) {
        app.CommunityFoundationalController = Ember.ObjectController.extend({
            populateRecommendedSkill: function(skill, family) {
                playBookService.getAssociatedLearnings(family, skill, this);
            }
        });


    });
