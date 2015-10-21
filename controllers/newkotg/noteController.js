'use strict'

define(['app', 'text!templates/newkotg/newkotg.hbs', 'services/newkotg/newkotgService', "controllers/newkotg/newkotgControllerMixin", "controllers/newkotg/newkotgRouteMixin", "controllers/newkotg/newkotgViewMixin", "controllers/newkotg/tagMixin"],
    function (app, newkotgTemplate, newkotgService) {
		app.NoteController = Ember.Controller.extend(app.NEWKOTGControllerMixin, app.NEWKOTGTagMixin, {
			actions: {
				edit: function() {
					var that = this;
					var documentId = that.get("model").id;
					this.transitionToRoute("note.edit", documentId);
				}
			}
		});

		app.NoteRoute = Ember.Route.extend(app.NEWKOTGRouteMixin, {
			setupController: function(controller, model) {
				controller.set("isStared", model.isStared);
				delete(model.isStared);
				controller.set("tags", model.tags);
				delete(model.tags);
				controller.set("usableTags", model.usableTags);
				delete(model.usableTags);
				controller.set("model", model);
				controller.set("isNote", true);
			},
			renderTemplate: function() {
				this.render('note',{into: 'application'});
			}
		});

		app.NoteView = Ember.View.extend(app.NEWKOTGViewMixin, {
			template: Ember.Handlebars.compile(newkotgTemplate),
			didInsertElement: function() {
				this.load();
				this.setAutocomplete();
				this.loadUYan();
			}
		});
	});
