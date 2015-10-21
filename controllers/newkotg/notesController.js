'use strict'

define(['app', 'text!templates/newkotg/newkotgs.hbs', 'text!templates/newkotg/newkotgsList.hbs', 'text!templates/newkotg/newkotgsGrid.hbs', 'services/newkotg/newkotgService', 'controllers/newkotg/newkotgsControllerMixin', "controllers/newkotg/newkotgsRouteMixin"],
    function (app, newkotgsTemplate, newkotgsListTemplate, newkotgsGridTemplate, newkotgService, NEWKOTGsControllerMixin) {
				app.NotesController = Ember.Controller.extend(app.NEWKOTGsControllerMixin, {
				    actions: {
				        add: function() {
				        	this.transitionToRoute("noteAdd");
				        },
				        edit: function(id) {
				        	this.transitionToRoute("noteEdit", id);
				        }
				    }
				});

				app.NotesRoute = Ember.Route.extend(app.NEWKOTGsRouteMixin, {
				    model: function(params){
                return {type: 'refresh'};
				    	// return newkotgService.search("note", 0, 10, "id", true);
				    },
            setupController: function(controller, model) {
                this._super(controller);
                // controller.set("model", model);
                controller.set("pageTitle", "My Notes");
                controller.set("isNotes", true);
                controller.set("searchText", "");
                controller.reset();
                controller.search(true);
            },
				    renderTemplate:function(){
				        this.render('notes',{into: 'application'});
				    }
				});

				app.NotesView = Ember.View.extend({
						template: Ember.Handlebars.compile(newkotgsTemplate),
						didInsertElement: function() {
						},
						toggleView: function (viewType) {
								this.controller.set('_currentView', viewType);
						}
				});

        app.NotesListView = Ember.View.extend({
            template: Ember.Handlebars.compile(newkotgsListTemplate),
            tagName: ''
        });

        app.NotesGridView = Ember.View.extend({
            template: Ember.Handlebars.compile(newkotgsGridTemplate),
            tagName: ''
        });
	});
