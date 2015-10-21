'use strict';

define(["app"],
  function(app) {
    app.CommunityDocumentsRoute = Ember.Route.extend({
      renderTemplate: function() {
        this.render();
      },
      model:function(){
       	return this.modelFor('community');
      },
      setupController: function(controller, model) {
                if (model.isMember || this.controllerFor('community').isMember) {
                    controller.set('isMember', true);
                } else {
                    controller.set('isMember', false);
                }
                controller.set('model', model);
                controller.set('pageNumber', 1);
                controller.get('sortedFieldName').Library = 'uploadedOn';
                controller.populateSharedDocumentsByActionSearch(1, controller.get('sortedFieldName').Library, controller.get('sortOrder'));
      }
    });
  });