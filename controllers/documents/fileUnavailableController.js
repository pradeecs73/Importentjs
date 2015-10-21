define(["app", "text!templates/fileUnavailableModal.hbs"],
    function(app, fileUnavailableModalTemplate) {
        app.FileUnavailableView = Ember.View.extend({
            layoutName: "modal_layout",
            template: Ember.Handlebars.compile(fileUnavailableModalTemplate)
        });

        app.FileUnavailableController = Ember.ObjectController.extend({
            lowercaseFileType: function() {
                return this.get('model').fileType.toLowerCase();
            }.property('model.fileType')
        });
    });