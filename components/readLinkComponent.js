'use strict';

define(["app", 'services/documentsService', "text!templates/components/readLinkComponent.hbs"],
    function(app, documentsService, readLinkComponentTemplate) {
    app.ReadLinkComponent = Ember.Component.extend(App.ViewFileComponentMixin, {
        template: Ember.Handlebars.compile(readLinkComponentTemplate),

        actions: {
            startDownload: function() {
                var document = this.get('document');
                documentsService.getDownloadUrl(document.id).then(function(response) {
                    window.open(response.downloadUrl, '_self');
                })
            }
        }
    });
});