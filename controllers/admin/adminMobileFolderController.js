"use strict";

define(["app", "text!templates/adminMobileFolder.hbs","services/newkotg/newkotgService"],
    function (app, adminMobileFolderTemplate, newkotgService) {

        App.MobileMobileFolderController = Ember.Controller.extend({
            formatFileSizeLimit: 0,
            successMessage: null,
            errorMessage: null,
            actions: {
                updateFileSizeLimit: function() {
                    var that = this,
                        model = that.get('model'),
                        formatFileSizeLimit = that.get('formatFileSizeLimit'),
                        fileSizeLimit = null;
                    if(that.isValidateNumber(formatFileSizeLimit)) {
                        fileSizeLimit = that.unFormatFileSize(parseInt(formatFileSizeLimit));
                    } else {
                        return null;
                    }

                    that.set("errorMessage", null);
                    newkotgService.postUploadLimit(fileSizeLimit).done(function(data) {
                        if(data != fileSizeLimit) {
                            that.set("errorMessage", "Set failed");
                        } else {
                            that.set("successMessage", "Set successfully");
                            model.fileSizeLimit = fileSizeLimit;
                        }
                    }).fail(function(err) {
                        that.set("errorMessage", "Set failed");
                    });
                }
            },
            inputObserver: function() {
                var formatFileSizeLimit = this.get("formatFileSizeLimit");
                this.set("successMessage", null);
                if(this.isValidateNumber(formatFileSizeLimit)) {
                    this.set("errorMessage", null);
                } else {
                    this.set("errorMessage", "Invalid input");
                }
            }.observes('formatFileSizeLimit'),
            isValidateNumber: function(number) {
                var regex = /^[1-9]\d*$/;
                var result = false; 
                if(regex.test(number) && parseInt(number)) {
                    result = true;
                }
                return result;
            },
            formatFileSize: function(bytes) {
                return bytes / (1024 * 1024);
            },
            unFormatFileSize: function(size) {
                return size * 1024 * 1024;
            }
        });

        App.MobileMobileFolderRoute = Ember.Route.extend({
            model: function () {
                return newkotgService.getUploadLimit();
            },
            setupController: function (controller, model) {
                var settings = {fileSizeLimit: model}
                controller.set('model', settings);
                controller.set('errorMessage', null);
                controller.set('formatFileSizeLimit', controller.formatFileSize(model));
            }
        });

        App.MobileMobileFolderView = Ember.View.extend({
            template: Ember.Handlebars.compile(adminMobileFolderTemplate)
        });

    });