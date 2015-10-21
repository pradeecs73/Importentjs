'use strict';

define(['app', 'httpClient', 'text!templates/playBooks.hbs', 'services/playBookService', 'text!templates/playBook.hbs', 'text!templates/playBookTransformational.hbs'],
    function(app, httpClient, playBooksTemplate, playBookService, playBookTemplate, transformationalTemplate) {
        app.CommunityTransformationalController  = Ember.ObjectController.extend({
            populateRecommendedSkill: function(skill, family) {
                if(this.get('allSkills')){
                    this.get('allSkills').clear();
                }    
                playBookService.getAssociatedLearnings(family, skill, this);
            }
        });
    });
