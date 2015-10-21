'use strict';

define(['app', 'services/tagsService', 'pages/myFileUploads', 'text!templates/mySpaceFileUpload.hbs', 'services/usersService', 'httpClient', "Q", 'pages/wysiwyg+tags'],
    function(app, tagsService, myFileUploads, mySpaceFileUploadTemplate, usersService, httpClient, Q, ui) {

        app.MyFileUploadsView = Ember.View.extend({
            template: Ember.Handlebars.compile(mySpaceFileUploadTemplate),

            didInsertElement: function() {
                try {
                    myFileUploads.filePreviewPreparationForFTPUpload();
                } catch (e) {
                    console.log("Error in file preview.");
                }

            },
            willClearRender: function() {
                this.controller.set('allTags', "");
                this.controller.set('allTagsLoaded', false);
            }
        });

        app.MyFileUploadsRoute = Ember.Route.extend({
            setupController: function(controller, model) {
                tagsService.allTags().then(function(tags) {
                    controller.set('allTags', tags);
                    controller.set('allTagsLoaded', tags);
                });

                controller.set('model', model);
            },
            model: function() {
                var self = this;
                window.clearMyFilesPollingEvent = setInterval(function() {
                    self.refreshContent(self);
                }, 30000);
                return this.getMyFiles();
            },
            getMyFiles: function() {

                var query = '/knowledgecenter/cclom/file_uploads/?tenantId=30' + '&author=' + app.getUsername();
                var fileModel = Ember.Object.create({
                    author: app.getUsername(),
                    authorName: app.getShortname(),
                    tenantId: 30,
                    tags: []
                });

                return httpClient.get(query).then(function(response) {
                    return {
                        uploadedFiles: response.files,
                        fileModel: fileModel
                    };
                }, function(error) {
                    console.log(error);
                    return {
                        uploadedFiles: [],
                        fileModel: fileModel
                    }
                });
            },
            actions: {
                willTransition: function(transition) {
                    window.clearInterval(window.clearMyFilesPollingEvent);
                }
            },
            refreshContent: function(cntlr) {
                cntlr.getMyFiles().then(function(data) {
                    cntlr.context.uploadedFiles.clear();
                    cntlr.context.uploadedFiles.pushObjects(data.uploadedFiles);
                });
            }

        });



        app.MyFileUploadsController = Ember.ObjectController.extend({

            allTags: null,
            allowedFileTypes: ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'xml', 'zip'],
            resetFileChooser: false,

            allTagsLoaded: false,
            actions: {
                uploadFiles: function() {
                    window.__FileUploadCntlerInstance = this;
                    var fileModel = this.get('fileModel')
                    _.each($('#kc-files').get(0).files, function(obj, index) {

                        var formData = new FormData();
                        formData.append('files[]', obj);
                        formData.append('author', fileModel.get('author'));
                        formData.append('authorName', fileModel.get('authorName'));
                        formData.append('tenantId', fileModel.get('tenantId'));

                        var tags = [];
                        try {
                            $("#tagsField").val().split(",");
                        } catch (err) {
                            console.log("Error in saving tags / no tags available for saving.");
                        }
                        formData.append('tags', tags);

                        $.ajax({
                            url: '/knowledgecenter/cclom/file_uploads/',
                            type: 'POST',
                            data: formData,
                            cache: false,
                            contentType: false,
                            beforeSend: function(xhr){
                        		httpClient.setRequestHeadersData(xhr);
                            },
                            processData: false
                        }).done(function(data) {
                            var uploadedFiles_ = __FileUploadCntlerInstance.get('model').uploadedFiles;
                            var found = uploadedFiles_.findBy('name', data.name);
                            if (found) {
                                uploadedFiles_.removeObject(found);
                                uploadedFiles_.unshiftObject(data);

                            } else {
                                uploadedFiles_.unshiftObject(data);
                            }
                            $("#tagsField").tagsinput('removeAll');

                            __FileUploadCntlerInstance.toggleProperty("resetFileChooser");
                            $(".form-group span.tag").remove();
                        }).fail(function(err) {
                            __FileUploadCntlerInstance.toggleProperty("resetFileChooser");
                            $(".form-group span.tag").remove();
                        });
                    })
                }
            }

        });

    });