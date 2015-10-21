define(['app', 'services/documentsService'],
    function (app, documentsService) {
        app.DocumentsRouteMixin = Ember.Mixin.create({
            actions: {
                openFileUnavailableModal: function(fileType) {
                    var controller = this.controllerFor("fileUnavailable");
                    controller.set('content', {fileType: fileType});
                    this.render("fileUnavailable", {
                        into: 'application',
                        outlet: 'modal',
                        controller: controller
                    });
                },

                closeFileUnavailableModal: function() {
                    this.disconnectOutlet({
                        outlet: 'modal',
                        parentView: 'application'
                    });
                },

                openVideoPlayerModal: function(document, appId) {
                    var controller = this.controllerFor("videoPlayer");
                    controller.set('content', {document: document, appId: appId});
                    this.render("videoPlayer", {
                        into: 'application',
                        outlet: 'modal',
                        controller: controller
                    });
                },

                closeVideoPlayerModal: function() {
                    this.disconnectOutlet({
                        outlet: 'modal',
                        parentView: 'application'
                    });
                },

                openShareDocumentModal: function (model) {
                    var controller = this.controllerFor('documentShare');
                    controller.cleanPopUp();
                    controller.set('content', model);
                    this.render("documentShare", {
                        into: 'application',
                        outlet: 'modal',
                        controller: controller
                    });
                },

                closeShareDocumentModal: function() {
                    this.disconnectOutlet({
                        outlet: 'modal',
                        parentView: 'application'
                    });
                },

                openCreateDocumentModal: function() {
                    var controller = this.controllerFor("fileUpload");
                    controller.resetModel();
                    this.render("fileUpload", {
                        into: 'application',
                        outlet: 'modal',
                        controller: controller
                    });
                },

                closeCreateDocumentModal: function() {
                    this.controllerFor("fileUpload").resetModel();
                    this.refresh();
                },

                openDeleteConfirmationModal: function(model) {
                    var controller = this.controllerFor("confirmation");
                    controller.set('model', {entity: model});
                    controller.set('parentController', this);
                    controller.set('title', "Delete Files");
                    controller.set('message', "Are you sure you want to delete the selected file? Shared files will no longer be available to other users if deleted.");
                    controller.set('onConfirm', 'deleteFile')
                    controller.set('onClose', 'closeDeleteConfirmationModal')
                    this.render("confirmation", {
                        into: 'application',
                        outlet: 'modal',
                        controller: controller
                    });
                },

                closeDeleteConfirmationModal: function() {
                    this.disconnectOutlet({
                        outlet: 'modal',
                        parentView: 'application'
                    });
                },
                deleteFile: function(document) {
                    var self = this;
                    function flashMessage(messageDiv) {
                        messageDiv.fadeIn('slow');
                        setTimeout(function() {
                            messageDiv.fadeOut('slow');
                        }, 3000);
                    };
                    documentsService.deleteDocument(document.id).then(function(res) {
                        app.DocumentUtils.pushToActivityStreamForDocument(document, "delete");
                        self.refresh().then(function(res) {
                            var messageDiv = $("#messageDiv");
                            messageDiv.removeClass("alert-danger");
                            messageDiv.addClass("alert-success");
                            messageDiv.children("p").html("Selected file has been deleted successfully.")
                            flashMessage(messageDiv);
                            self.send("closeDeleteConfirmationModal");
                        });
                    }, function(error) {
                        self.send("closeDeleteConfirmationModal");
                        var messageDiv = $("#messageDiv");
                        messageDiv.removeClass("alert-success");
                        messageDiv.addClass("alert-danger");
                        if(error.status == 403) {
                            messageDiv.children("p").html("Not authorized to delete the file.")
                        } else if(error.status == 404){
                            messageDiv.children("p").html("File not found.")
                        } else {
                            messageDiv.children("p").html("File deletion failed. Please try again later.")
                        }
                        flashMessage(messageDiv);
                    });
                }
            }
        })
    });