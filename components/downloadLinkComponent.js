'use strict';

define(["app", 'services/documentsService', "text!templates/components/downloadLinkComponent.hbs"], function(app, documentsService, downloadLinkComponentTemplate) {
  app.DownloadLinkComponent = Ember.Component.extend({
    template: Ember.Handlebars.compile(downloadLinkComponentTemplate),

    actions: {
    startDownload: function() {
      var self = this;
      var document = this.get('document');
      documentsService.getDownloadUrl(document.id).then(function(response) {
          var document = self.get("document");
            app.DocumentUtils.pushToActivityStreamForDocument(document, "download")
          window.open(response.downloadUrl, '_self');
        }, function(err) {
        function showError(id,document) {
          var elementId = id + "_" + document.id;
          $(elementId).removeClass("hide");
          var delay = 4000;
          setTimeout(function () {
            $(elementId).addClass("hide");
          }, delay);
        }

        if(err.status===404){
          showError("#notFoundErrorMessage",document);
        }
        else if(err.status===403) {
          showError("#forbiddenErrorMessage",document);
        }
      });
    }
    }
  });
});