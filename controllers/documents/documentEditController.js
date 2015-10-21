'use strict';

define(['app', 'text!templates/documents/documentEdit.hbs', 'services/documentsService', 'services/tagsService', 'pages/wysiwyg+tags', 'controllers/documents/documentValidator'],
    function (app, documentEditTemplate, documentsService, tagsService, wysiwygEditor) {

        function newModel(doc) {
            return Ember.Object.create({
                id: doc.id,
                title: doc.title,
                createdBy: doc.createdBy,
                description: doc.description,
                documentType: doc.documentType,
                fileName: doc.uri.replace(/^.*[\\\/]/, ''),
                userTags: doc.userTags
            });
        }

        app.DocumentEditRoute = Ember.Route.extend({
            renderTemplate: function(controller, model) {
                this.render()
                if (model && model.error) {
                    if (model.error.status === 403)
                        this.render("notAllowed")
                    else if(model.error.status === 404) {
                        this.controllerFor("somethingWentWrong").message = "File not found. It may have been deleted.";
                        this.render("somethingWentWrong")
                    }
                    else {
                        this.controllerFor("somethingWentWrong").message = "Some error occured while getting file for editing.";
                        this.render("somethingWentWrong")
                    }
                }
            },
            model: function (params) {
                var docId = params.document_id;
                var self = this;
                var docPromise = documentsService.document(docId);
                return docPromise.then(function (doc) {
                    tagsService.allTags().then(function (tags) {
                      self.controller.set('allTags', tags);
                    });
                    return newModel(doc);
                }).fail(function(err){
                    return {"error": err};
                });
            }
        })

        app.DocumentEditView = Ember.View.extend({
            template: Ember.Handlebars.compile(documentEditTemplate),
            didInsertElement: function() {
              this.controller.set("errors", {});
              this.controller.set("status", {success: true});
              if(CKEDITOR){
                CKEDITOR.config.readOnly = false;  
              }
              wysiwygEditor.initializeWysiwyg();
          }
        });

        app.DocumentEditController = Ember.ObjectController.extend({
            errors: {},
            pageTitle: 'Edit File',
            allTags: [],

            allTagsLoaded: function () {
              var tags = this.get('allTags');
              return tags && tags.length > 0
            }.property('allTags', 'allTags.@each'),

            status: {
                success: true,
                message: ""
            },
            fromRoute: function () {
                return "#/document/" + this.documentId()+"/"+this.controllerFor('application').get('currentPath').split('.')[1];
            }.property("model"),

            documentId: function () {
                var model = this.get('model');
                return model.id;
            },

            actions: {
                cancel: function () {
                    this.set("status", {});
                    this.set("errors", {});
                    //TODO: <Vaibhav> - Temporary till we figure out a way to go to the previous page
                    window.history.go(-1);
                },

                update: function() {
                    var self = this;
                    var descriptionDiv = CKEDITOR.instances['wysiwyg-editor'].getData();
                    var updatedDoc = {
                        title: this.get('model').title.trim(),
                        userTags: this.get('model').userTags,
                        id: this.get('model').id,
                        description: descriptionDiv.trim(),
                        descriptionSansHtml: descriptionDiv.replace(/(<([^>]+)>)/ig, "").trim().replace(/&nbsp;/gi, '').replace(/\n/g, '')
                    }
                    var document = app.DocumentEdit.create(updatedDoc);
                    document.validate().then(function() {
                        if(document.get("isValid")) {
                          documentsService.updateDocument(document).then(function() {
                              self.set("errors", {});
                              self.transitionToRoute("/document/" + document.id +"/"+self.controllerFor('application').get('currentPath').split('.')[1]);
                              app.DocumentUtils.pushToActivityStreamForDocument(self.get("model"), "edit");
                          }).fail(function(error) {
                              if(error.status === 403)
                                self.set("status", {success: false, message: "Not authorized to edit."});
                              else if(error.status === 404)
                                  self.set("status", {success: false, message: "File not found to update."})
                              else
                                  self.set("status", {success: false, message: "Update failed"})
                          })
                        } else {
                          self.set('errors', document.errors)
                        }
                    })
                },

                addTag: function(tag) {
                  this.get("content").userTags.pushObject(tag);
                },

                removeTag: function(tag) {
                  this.get("content").userTags.removeObject(tag);
                }
            }

        })
    })

