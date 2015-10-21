'use strict';

define(['app', 'httpClient', 'text!templates/playBooks.hbs', 'services/playBookService', 'text!templates/playBook.hbs', 'text!templates/playBookFoundational.hbs', 'text!templates/playBookSpecialized.hbs', 'text!templates/playBookTransformational.hbs'],
    function(app, httpClient, playBooksTemplate, playBookService, playBookTemplate, foundationalTemplate, specializedTemplate, transformationalTemplate) {

        app.PlayBookView = Ember.View.extend({
            template: Ember.Handlebars.compile(playBookTemplate),
        });

        app.PlayBookRoute = Ember.Route.extend({

            renderTemplate: function() {
                this.render();
                this.controller.transitionToRoute('playBook.foundational');
            },

            setupController: function(controller, model) {
                controller.set('model', model);
            },

            model: function(params) {
                return;
            },
        });

        app.PlayBookFoundationalView = Ember.View.extend({
            template: Ember.Handlebars.compile(foundationalTemplate)
        });

        app.PlayBookFoundationalRoute = Ember.Route.extend({

            renderTemplate: function() {
                this.render();
            },

            setupController: function(controller, model) {
                controller.set('model', model);
                controller.populateRecommendedSkill(controller.get('model').name, "1");
            },

            model: function() {
                return this.modelFor('community');
            }
        });

        app.PlayBookFoundationalController = Ember.ObjectController.extend({
            populateRecommendedSkill: function(skill, family) {
            if(this.get('allSkills')){
                this.get('allSkills').clear();
            }
                playBookService.getAssociatedLearnings(family, skill, this);
            }
        });


        app.PlayBookSpecializedView = Ember.View.extend({
            template: Ember.Handlebars.compile(foundationalTemplate)
        });

        app.PlayBookSpecializedRoute = Ember.Route.extend({

            renderTemplate: function() {
                this.render()
            },

            setupController: function(controller, model) {
                controller.set('model', model);
                controller.populateRecommendedSkill(controller.get('model').name, "3");
            },

            model: function() {
                return this.modelFor('community');
            }
        });

        app.PlayBookSpecializedController = Ember.ObjectController.extend({
            populateRecommendedSkill: function(skill, family) {
                if(this.get('allSkills')){
                this.get('allSkills').clear();
            }
                playBookService.getAssociatedLearnings(family, skill, this);
            }
        });




        app.PlayBookTransformationalView = Ember.View.extend({
            template: Ember.Handlebars.compile(foundationalTemplate)
        });

        app.PlayBookTransformationalRoute = Ember.Route.extend({

            renderTemplate: function() {
                this.render()
            },

            setupController: function(controller, model) {
                controller.set('model', model);
                controller.populateRecommendedSkill(controller.get('model').name, "2");
            },

            model: function() {
                return this.modelFor('community');
            }
        });

        app.PlayBookTransformationalController = Ember.ObjectController.extend({
            populateRecommendedSkill: function(skill, family) {
                if(this.get('allSkills')){
                this.get('allSkills').clear();
            }
                playBookService.getAssociatedLearnings(family, skill, this);
            }
        });


    });
