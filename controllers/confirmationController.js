'use strict';

define(['../app','services/documentsService','text!templates/confirmationModal.hbs'], function(app, documentsService, confirmationModal){
    app.ConfirmationView = Ember.View.extend({
        layoutName: "modal_layout",
        template: Ember.Handlebars.compile(confirmationModal)
    });

    app.ConfirmationController = Ember.ObjectController.extend({
        actions: {
            onConfirmation: function() {
                var entity = this.get("entity");
                this.parentController.send(this.get("onConfirm"), entity);
            },
            closeModal: function() {
                this.parentController.send(this.get("onClose"));
            }
        }
    });
})