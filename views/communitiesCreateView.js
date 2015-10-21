'use strict';

define(['app',
    'text!templates/createCommunity.hbs',
    'pages/wysiwyg+tags'],
  function(app, createCommunityTemplate, wysiwygEditor) {

    app.CommunitiesCreateView = Ember.View.extend({
      template: Ember.Handlebars.compile(createCommunityTemplate),
      didInsertElement: function() {
        CKEDITOR.config.readOnly = false;
        wysiwygEditor.initializeWysiwyg();

      },
      willClearRender: function() {
        this.controller.set('allTags', "")
        this.controller.set('allTagsLoaded', false)
        this.controller.set("allUsers", "")
        this.controller.set("allUsersLoaded", false)
      }
    });

  });

