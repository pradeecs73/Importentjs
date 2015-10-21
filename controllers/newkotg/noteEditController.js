'use strict'

define(['app', 'text!templates/newkotg/noteEdit.hbs', 'services/newkotg/newkotgService'],
    function (app, noteEditTemplate, newkotgService) {
    	app.NoteEditController = Ember.Controller.extend({
            needs: ['note'],
            warning: "title can't be blank",
    		actions: {
    			cancel: function() {
    				var model = this.get("model");
					this.transitionToRoute("note", model.id);
    			}
    		},
			save: function() {
				var that = this,
    				model = that.get("model"),
    				title = that.get("title").trim(),
                    html = that.get("html"),
                    digest = that.get("digest");
                if(!title) return this.set("hasWarning", true);
				newkotgService.addOrUpdateNoteDocument(title, html, digest, model.id).done(function(data) {
                    setTimeout(function() {
                        var noteControlelr = that.get("controllers.note"),
                            noteModel = noteControlelr.get("model");
                        noteModel.title = title;
                        noteControlelr.set("model", noteModel);
                        that.transitionToRoute("note", model.id);
                    }, 1500);
				}).fail(function() {
				});
			}
    	});

        app.NoteEditRoute = Ember.Route.extend({
            beforeModel: function() {
            },
            model: function(params, transition) {
                var noteId = transition.params.note.id;
                return newkotgService.findOneDocument(noteId);
            },
            setupController: function(controller, model) {
                controller.set("model", model);
                controller.set("title", model.title);
                controller.set("hasWarning", false);
            },
            actions:{
                didTransition: function() {
                    this.renderTemplate();
                }
            },
            renderTemplate:function() {
                this.render('note.edit',{into: 'application'});
            }
        });

		app.NoteEditView = Ember.View.extend({
	        template: Ember.Handlebars.compile(noteEditTemplate),
		    didInsertElement: function() {
                if(CKEDITOR) {
                    CKEDITOR.config.readOnly = false;
                }
                CKEDITOR.replace("note-editor-area");
                var editor = CKEDITOR.instances['note-editor-area'];
                this.loadNote();
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
		    },
		    loadNote: function() {
		    	var model = this.controller.get("model");
                var editor = CKEDITOR.instances['note-editor-area'];
            	$.ajax({
                    url: model.rhref,
                    dataType: "text",
                    type: "GET",
                    beforeSend:function(xhr){
	                    app.encryptionService(xhr);
                    },
                    success: function (response) {
                        editor.setData(response);
                    },
                    error: function (xhr, errorInfo, exception) {
                        editor.setData('Service Unreachable.');
                    }
                });
		    }
		});
	});
