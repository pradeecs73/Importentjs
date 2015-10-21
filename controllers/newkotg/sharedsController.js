'use strict'

define(['app', 'text!templates/newkotg/newkotgs.hbs', 'text!templates/newkotg/newkotgsList.hbs', 'text!templates/newkotg/newkotgsGrid.hbs', 'services/newkotg/newkotgService', 'controllers/newkotg/newkotgsControllerMixin', "controllers/newkotg/newkotgsRouteMixin"],
    function (app, newkotgsTemplate, newkotgsListTemplate, newkotgsGridTemplate, newkotgService, NEWKOTGsControllerMixin) {
    	
				app.SharedItemsController = Ember.Controller.extend(App.NEWKOTGsControllerMixin, {

				});

				app.SharedItemsRoute = Ember.Route.extend(app.NEWKOTGsRouteMixin, {
				    model: function(params){
                return {type: 'refresh'};
				    	// return newkotgService.search("friend-share", 0, 10, "id", true);
				    },
		        setupController: function(controller, model) {
		            this._super(controller);
		            // controller.set("model", model);
		            controller.set("pageTitle", "Shared Folders");
		            controller.set("isShareds", true);
                controller.set("searchText", "");
		            controller.reset();
		            controller.search(true);
		        },
				    renderTemplate:function(){
				        this.render('sharedItems',{into: 'application'});
				    }
				});

				app.SharedItemsView = Ember.View.extend({
			      template: Ember.Handlebars.compile(newkotgsTemplate),
				    didInsertElement: function() {
				    },
				    toggleView: function (viewType) {
				    	this.controller.set('_currentView', viewType);
				    }
				});

		    app.SharedItemsListView = Ember.View.extend({
		        template: Ember.Handlebars.compile(newkotgsListTemplate),
		        tagName: ''
		    });

		    app.SharedItemsGridView = Ember.View.extend({
		        template: Ember.Handlebars.compile(newkotgsGridTemplate),
		        tagName: ''
		    });
		});
