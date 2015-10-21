'use strict';

define(['../../app', 'text!templates/documents/catalog.hbs'],
  function (app, documentsCatalogTemplate) {
    app.DocumentsMyView = Ember.View.extend({
      template: Ember.Handlebars.compile(documentsCatalogTemplate),
       didInsertElement:function(){
        //checking whether the call coming from community upload
         var comContrlr=this.get('controller');
         if(comContrlr && comContrlr.get('isUpload'))
          	jQuery('.upload-btn').trigger("click");
         return false;
       },
      toggleView: function (view) {
        this.controller.set('_currentView', view);
      },
      willClearRender: function() {
         this.controller.set('searchText','')
         this.controller.set('searchBoxText','')
      }
    });
  })