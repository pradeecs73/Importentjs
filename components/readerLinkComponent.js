'use strict';

define(["app", "text!templates/components/readerLinkComponent.hbs", "services/statesService"], function (app, readerLinkComponentTemplate, statesService) {
    app.ReaderLinkComponent = Ember.Component.extend({
        tagName: 'span',
        template: Ember.Handlebars.compile(readerLinkComponentTemplate),
        isReaderDelivered: false,

        documentReadUrl: function () {
            var document = this.get('document');
            var id = document.id;
            return this.iPadBaseUrl().replace("{documentId}", id).replace("{token}", App.getAuthToken()).replace("{userId}",App.getUsername()).replace("{appId}",this.get("appId"));
        }.property(),

        createGuid: function() {
            return '4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },

        isReader: function(){
            return (this.get('isReadable') && !this.isMobile());
        }.property(),

        readerTarget: function () {
            if (this.get('isReadable'))
                return "_blank";
            else
                return "_self";
        }.property(),

        retrieveStatuses: function() {
            var document = this.get('document');
            var appId = this.get('appId');
            var self=this;
            statesService.statusFor("READER_DELIVER", appId, "files",document.id).then(function(status){
                self.set("isReaderDelivered", status);
            })
        },

        isReadable : function(){
            this.retrieveStatuses();
            var document = this.get('document');
            var fileExtensionRegex =  /(?:\.([^.]+))?$/
            return _.contains(['epub'],fileExtensionRegex.exec(document.uri).pop())
        }.property(),

        isMobile: function () {
            return (navigator.userAgent.match(/iPhone|iPad|iPod|Android/i) !== null);
        },

        iPadBaseUrl: function () {
            return "ciscob2breader://?appId={appId}&documentId={documentId}&token={token}&userId={userId}&tenant=" + document.location.protocol + "//" + document.location.host;
        },

        actions: {
            openOnlineReader: function() {
                if(!this.get("isReaderDelivered")) return;

                var document = this.get('document');
                var appId = this.get('appId');
                var id = document.id;
                var url="/knowledgecenter/reader/content/show?x="+id+"&y="+this.createGuid()+"&z="+appId;
                window.open(url);
            }
        }
    });

});