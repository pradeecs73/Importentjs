'use strict';

define(["app", "underscore", "text!templates/components/fileChooserComponent.hbs"], function(app, _, fileChooserComponentTemplate) {
    app.IconView = Ember.View.extend({
        click: function(evt) {
            this.get('parentView').resetFileInput();
            $('.uploader-wrap').removeClass('hovered');
        },
        mouseEnter: function(evt) {
            $('.uploader-wrap').addClass('hovered');
        },
        mouseLeave: function(evt) {
            $('.uploader-wrap').removeClass('hovered');
        }
    })

    app.FileChooserComponent = Ember.Component.extend({
        template: Ember.Handlebars.compile(fileChooserComponentTemplate),
        tagName: "div",
        file: null,
        isVideoUploadEnabled: app.videoUploadEnabled(),

        openFileChooser: function() {
            $('#kc-files').click();
        },

        change: function(evt) {
            var self = this;
            if (evt.target.files == null) return;

            var files = evt.target.files; // FileList object
            if(files.length >= 1) {
                for (var i = 0, f; f = files[i]; i++) {
                    var results = [self.validateFileType(f), self.validateFileSize(f)];
                    _.each(results, function (result) {
                        if (!result.valid) {
                            self.resetFileInput();
                            self.sendAction('action', result.message);
                            return false;
                        }
                    });
                    this.set('file', {
                        fileType: f.name.split('.').pop(),
                        fileName: f.name,
                        fileSize: self.bytesToSize(f.size)
                    });
                    self.sendAction('action', null);
                }
            }
            else{
                this.set('file', null);
                self.sendAction('selectionCancelAction',"Please choose a file");
            }
        },

        resetFileInputContainer: function() {
            var fileInputWrap = $('.uploader-wrap');
            fileInputWrap.find('span.uploaded-file-tag').remove();
            fileInputWrap.find('span.message-icon-container').remove();
            }.observes("reset"),

        bytesToSize: function(bytes) {
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (bytes == 0) return 'n/a';
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
            return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
        },

        resetFileInput: function() {
            this.set('file', null);
            var oldInput = document.getElementById("kc-files");
            var newInput = document.createElement("input");
            newInput.type = "file";
            newInput.id = oldInput.id;
            newInput.name = oldInput.name;
            newInput.className = oldInput.className;
            newInput.style.cssText = oldInput.style.cssText;

            if (this.get("multiple")) {
                $(newInput).attr("multiple", this.get("multiple"));
            }

            oldInput.parentNode.replaceChild(newInput, oldInput);
        }.observes("reset"),

        validateFileSize: function(file) {
            var maxSizeInMB = this.get("maxFileSizeInMB");
            if (!maxSizeInMB) maxSizeInMB = 5;

            if (file.size > maxSizeInMB * 1024 * 1024) {
                return {
                    valid: false,
                    message: "File size cannot be more than " + maxSizeInMB + " MB"
                }
            }
            return {
                valid: true,
                message: null
            };
        },

        validateFileType: function(file) {
            var sFileName = file.name;
            var self = this;

            if (sFileName.length > 0) {
                var blnValid = false;
                for (var j = 0; j < self.get('validFileExtensions').length; j++) {
                    var sCurExtension = self.get('validFileExtensions')[j];
                    if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
                        blnValid = true;
                        break;
                    }
                }
                if (!blnValid) {
                    return {
                        valid: false,
                        message: "This action cannot be completed because a file type you are attempting to upload is restricted. Permissible file types are: " + self.get('validFileExtensionsCommaSeparated')
                    };
                }
            }
            return {
                valid: true,
                message: null
            };
        },
        validFileExtensions: function() {
            //default allowed types
            var _valid_file_extensions = app.videoUploadEnabled() ?
            ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx','epub','png','jpg','jpeg', 'mp4', 'mov', 'avi', 'wmv', 'flv', 'mpg', 'mpeg', 'webm', 'mkv', 'ogg', 'ogv', 'divx', 'xvid', '3gp', '3g2']: ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx','epub','png','jpg','jpeg'];


            var allowedFileTypes = this.get("allowedFileTypes")

            if (typeof(allowedFileTypes) === "object") {
                _valid_file_extensions = allowedFileTypes;
            } else if (typeof(allowedFileTypes) === "function") {
                _valid_file_extensions = allowedFileTypes();
            }
            return _valid_file_extensions;
        }.property(),

        validFileExtensionsCommaSeparated: function() {
          return this.get('validFileExtensions').join(', ');
        }.property(),

        allowedFileTypesDisplayMessage: function() {
           return this.get('allowedFileTypesMessage') ? this.get('allowedFileTypesMessage') : "Accepted: <strong>" + this.allowedFileTypes.join(", ") + "</strong>"
        }.property()

    })
})