'use strict'

define(['app', 'text!templates/newkotg/newkotg.hbs', 'services/newkotg/newkotgService', "controllers/newkotg/newkotgControllerMixin", "controllers/newkotg/newkotgRouteMixin", "controllers/newkotg/newkotgViewMixin", "controllers/newkotg/tagMixin"],
    function (app, newkotgTemplate, newkotgService) {
		app.CollectionController = Ember.Controller.extend(app.NEWKOTGControllerMixin, app.NEWKOTGTagMixin, {
		});

		app.CollectionRoute = Ember.Route.extend(app.NEWKOTGRouteMixin, {
			setupController: function(controller, model) {
				controller.set("isStared", model.isStared);
				delete(model.isStared);
				controller.set("tags", model.tags);
				delete(model.tags);
				controller.set("usableTags", model.usableTags);
				delete(model.usableTags);
				controller.set("model", model);
				controller.set("isCollection", true);
			},
			renderTemplate: function() {
				this.render('collection',{into: 'application'});
			}
		});

		app.CollectionView = Ember.View.extend(app.NEWKOTGViewMixin, {
	      template: Ember.Handlebars.compile(newkotgTemplate),
		    didInsertElement: function() {
		    	this.load();
		    	this.setAutocomplete();
		    	this.loadUYan();
		    }
		});
	});
