'use strict'

define(['app', 'text!templates/newkotg/noteEdit.hbs', 'services/newkotg/newkotgService'],
    function (app, noteEditTemplate, newkotgService) {
    	app.NotesAddController = Ember.Controller.extend({
            warning: "title can't be blank",
    		actions: {
    			cancel: function() {
					this.transitionToRoute("notes");
    			}
    		},
			save: function() {
				var that = this,
    				title = that.get("title").trim(),
    				html = that.get("html"),
    				digest = that.get("digest");
                if(!title) return this.set("hasWarning", true);
				newkotgService.addOrUpdateNoteDocument(title, html, digest).done(function(response) {
                    var id = JSON.parse(response).id;
                    that.transitionToRoute("note", id);
				}).fail(function() {
				});
			}
    	});

        app.NotesAddRoute = Ember.Route.extend({
            beforeModel: function() {
            },
            model: function(params, transition) {
                var model = {};
                model.title = transition.queryParams.title? transition.queryParams.title: "";
                return model;
            },
            setupController: function(controller, model) {
                controller.set("hasWarning", false);
                controller.set("title", model.title);
            },
            actions:{
                didTransition: function() {
                    this.renderTemplate();
                }
            },
            renderTemplate:function() {
                this.render('notes.add',{into: 'application'});
            }
        });

		app.NotesAddView = Ember.View.extend({
	        template: Ember.Handlebars.compile(noteEditTemplate),
		    didInsertElement: function() {
                if(CKEDITOR) {
                    CKEDITOR.config.readOnly = false;
                    CKEDITOR.replace("note-editor-area");
                }
		    },
		    actions: {
		    	save: function() {
                    var editor = CKEDITOR.instances["note-editor-area"];
                    var html = editor.getData().trim();
                    var digest = html.replace(/(<([^>]+)>)/ig, "").trim().replace(/&nbsp;/gi, '').replace(/\n/g, '')
		    		this.controller.set("html", html);
                    this.controller.set("digest", digest);
		    		this.controller.save();
		    	}
		    }
		});
	});
