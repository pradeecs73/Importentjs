"use strict";

define(["app", "httpClient", "text!templates/createDocumentModal.hbs", "pages/uploader", "services/tagsService", "services/encryptionService",'controllers/documents/documentValidator', "services/documentsService" ],
  function(app, httpClient , createDocumentModalTemplate, uploader, tagsService, encryptionService, documentValidator, documentsService) {

    app.FileUploadView = Ember.View.extend({
      template: Ember.Handlebars.compile(createDocumentModalTemplate),
      willClearRender: function() {
        this.controller.set("tags", [])
        this.controller.set("allTagsLoaded", false)
      },
      didInsertElement: function() {
        var self = this;
        tagsService.allTags().then(function(tags) {
          self.controller.set('tags', tags)
          self.controller.set('allTagsLoaded', true)
        }).fail(function(err) {
            self.controller.set("allTagsLoaded", false)
            Ember.set(self.controller.errors, "tags", "Not able to get tags");
          })
      }
    });

    app.FileUploadController = Ember.ObjectController.extend({
	  needs:['documentsMy','documentShare'],
	  model: function() {
        return {};
      },
      content: {
        title: "",
        description: "",
        userTags: []
      },
      modalTitle: "Upload File",
      tags: [],
      errors: {},
      reset: false,
      fileMessage: null,
      allowedVideoFileTypes: app.allowedVideoFileTypes,
      allowedNonVideoFileTypes: ['epub', 'pdf', 'doc', 'docx', 'ppt', 'pptx'],
      allowedFileTypes : function() {
        if(app.videoUploadEnabled()) {
          return this.allowedVideoFileTypes.concat(this.allowedNonVideoFileTypes)
        } else {
          return this.allowedNonVideoFileTypes
        }
      }.property(),
     allowedFileTypesMessage: function() {
       var message = "Accepted: <strong>" + this.allowedNonVideoFileTypes.join(", ") + "</strong>"
        if(app.videoUploadEnabled()) {
          message = message + " and all common video file types (<strong>mp4, flv, .etc</strong>)";
        }
       return message;
      }.property(),
      allTagsLoaded: false,
      isValid: function(file) {
        if (!file) {
          this.set("errors", {file: "Please choose a file"});
          return false;
        } else if(file.size < 1) {
          this.set("errors", {file: "The file is empty. Please choose a file with some content."});
          return false;
        }
        this.set("errors", {});
        return true;
      },
      resetModel: function() {
        this.set("content", {
          title: "",
          description: "",
          userTags: []
        });
        this.set("errors", {});

        this.toggleProperty("reset");
        this.set("uploading", false);
        this.set('modalTitle', "Upload File");
        this.set('fileMessage', null);
      },
      pushCreateToActivityStream: function(metadata) {
          var title = metadata.title;
          var lastDot = metadata.fileName.lastIndexOf(".");
          var extension = metadata.fileName.substring(lastDot + 1)
          if(!title) {
            title = metadata.fileName.substring(0, lastDot);
          }

        app.DocumentUtils.pushShareToActivityStream(metadata.documentId, extension, title, app.getUsername(), "upload")
      },
      actions: {
        showFileErrors: function(errorMessage) {
            if (errorMessage) {
                this.set('fileMessage', {'error': errorMessage});
            }
            this.set("errors", {file: null});
        },
        tryAgain: function() {
          this.resetModel();
        },
        addTag: function(tag) {
          this.get("content").userTags.pushObject(tag);
        },
        removeTag: function(tag) {
          this.get("content").userTags.removeObject(tag);
        },
        cancelUpload: function() {
          this.resetModel();
        },
        uploadFile: function() {
          var file = $('#kc-files').get(0).files[0];
          var self = this;

          if(!self.isValid(file)){
            return;
          }
          var metadata = self.get('content');
          metadata.fileName = file.name;

          var newDocument = app.DocumentCreate.create(this.get('content'));
          newDocument.errors.clear()

          newDocument.validate().then(function() {
            self.set('model.errors', {})
            if (newDocument.get('isValid')) {
              self.set("uploading", true);
              metadata.fileSize = file.size;
              documentsService.getUploadUrl(metadata)
                .then(function(data){
                  documentsService.uploadToObjectStore(data, file).done(function() {
                    metadata.uri = data.objectRelativePath + metadata.fileName;
                    metadata.documentId = data.documentId;
                    documentsService.uploadToContentStore(metadata).then(function() {
                        self.pushCreateToActivityStream(metadata);
                        tagsService.allTags().then(function(tags) {
                          self.set('tags', tags)
                          self.set('allTagsLoaded', true)
                          self.set("modalTitle", "Upload Files Successful");
                          self.set('fileMessage', {'success': "This action has been completed. The file will be added to My Files."});
                        }).fail(function() {
                          self.set("allTagsLoaded", false)
                          Ember.set(self.errors, "tags", "Not able to get tags");
                        })
                      }
                    ).fail(failureCallBack);
                  }, failureCallBack);

                 //based on the isUpload property of documentsMyController decide to share the file or not
                  var myContrlr=self.get('controllers.documentsMy');
                  if(myContrlr.get('isUpload')) {
                    var shareContrlr=self.get('controllers.documentShare');
                    shareContrlr.set('comDocId',data.documentId);
                    //calling the action in documentshare controller
                    shareContrlr.send('shareDocument');
                  }
                }).fail(failureCallBack);
            } else {
              self.set('errors', newDocument.errors)
            }
          });

          var failureCallBack = function(){
            self.set("uploading", false);
            self.set('fileMessage', {'error': "Error in uploading file."});
          }
        }
      }
    });
  });
7