'use strict';

define(['app',
    'text!templates/createCommunity.hbs',
    'pages/wysiwyg+tags'],
  function(app, createCommunityTemplate, wysiwygEditor) {

    app.CommunityEditView = Ember.View.extend({
      template: Ember.Handlebars.compile(createCommunityTemplate),
      didInsertElement: function() {
        CKEDITOR.config.readOnly = false;
        wysiwygEditor.initializeWysiwyg();
        if(this.controller.get("status") === "deactivated") {
          CKEDITOR.config.readOnly = true;
          wysiwygEditor.disableWysiwygEditor();
        }
      },
      willClearRender: function() {
        this.controller.set('allTags', "");
        this.controller.set('allTagsLoaded', false);
        this.controller.set('displayDeactivateMessage', false);
      }
    });

  });
