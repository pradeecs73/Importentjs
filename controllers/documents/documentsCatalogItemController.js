'use strict';

define(['app', 'text!templates/documents/documentGrid.hbs', 'text!templates/documents/documentList.hbs', 'text!templates/documents/documentPopOver.hbs'],
    function (app, documentGrid, documentList, documentPopOver) {
        App.DocumentGridView = Ember.View.extend({
            template: Ember.Handlebars.compile(documentGrid)

        });

        App.DocumentListView = Ember.View.extend({
            template: Ember.Handlebars.compile(documentList),
            tagName: ''
        });

        App.ClickableView = Ember.View.extend({
            click: function(evt) {
                this.get('controller').send('onDocumentReadActivity');
            }
        });

        App.DocumentPopOver = Ember.View.extend({
            template: Ember.Handlebars.compile(documentPopOver),
            tagName: ''
        });

        app.DocumentsCatalogItemController = Ember.ObjectController.extend({
            appId : applicationIdConfig.contentstore,

            init: function() {
                if (!Ember.TEMPLATES["documentGrid"]) {
                    Ember.TEMPLATES["documentGrid"] = Ember.Handlebars.template(Ember.Handlebars.precompile(documentGrid));
                    Ember.TEMPLATES["documentPopOver"] = Ember.Handlebars.template(Ember.Handlebars.precompile(documentPopOver));
                }
                if (!Ember.TEMPLATES["documentList"]) {
                    Ember.TEMPLATES["documentList"] = Ember.Handlebars.template(Ember.Handlebars.precompile(documentList));
                }
            },

            actions: {
                onDocumentReadActivity: function() {
                    var model = this.get('model');
                    app.DocumentUtils.pushShareToActivityStream(model, "view")
                }
            },

            title: function() {
                var maxLength = this.get('parentController').maxLength('title');
                return this.shorten(this.get('model').title, maxLength);
            }.property('parentController._currentView'),

            canDelete: function() {
                return this.content.permissions && this.content.permissions.isDeletable;
            }.property('content'),
            ellipsiseTags: function() {
                return this.get('model').userTags && this.get('model').userTags.length > 1;
            }.property('model.userTags'),

            tagsToDisplay: function() {
                return _.first(this.get('model').userTags, 3);
            }.property('model.userTags'),

            tagsExists: function() {
                return this.get('model').userTags.length > 0;
            }.property('model.userTags'),

            hasShares: function() {
                return this.get('model').shares && this.get('model').shares.length > 0;
            }.property('model.shares'),

            shorten: function(string, descriptionLength) {
                var contentLength = string.length;
                var length = contentLength < descriptionLength ? contentLength : descriptionLength;
                return string.substring(0, length);
            },
            isGridView: function() {
                return this.parentController.get('_currentView') == 'grid-view';
            }.property("parentController._currentView"),

            documentDetailPath: function(){
              var path = this.controllerFor('application').get('currentPath').split('.');
              var docDetailPath = "#/document";
              docDetailPath += "/"+this.content.id;
              docDetailPath += "/"+path[1];
              return docDetailPath;

            }.property("parentController._currentView"),

            formattedDuration: function() {
                if (this.get('model').duration) {
                    return App.DateUtil.millisecondsToTime(this.get('model').duration);
                }
                return null;
            }.property('model.duration'),

            imageType: function() {
                if (_.contains(app.allowedVideoFileTypes, this.get('model').documentType.toLowerCase()))
                    return "video";
                else if ("epub" === this.get('model').documentType.toLowerCase())
                    return "ebook";
                else
                    return "document";
            }.property("model.documentType"),

            documentEditPath: function(){
              var path = this.controllerFor('application').get('currentPath').split('.');
              var docEditPath = "#/document";
              docEditPath += "/"+this.content.id;
              docEditPath += "/edit/"+path[1];
              return docEditPath;
            }.property("parentController._currentView"),

            isCreatedByCurrentUser : function() {
                return this.get('model').createdBy === app.getUsername();
            }.property('model.createdBy')
        });
    })