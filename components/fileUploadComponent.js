'use strict';

define(["app", "underscore", "text!templates/components/fileUploadComponent.hbs"], function(app, _, fileUploadComponentTemplate) {
    app.FileUploadComponent = Ember.Component.extend({
        template: Ember.Handlebars.compile(fileUploadComponentTemplate),
        tagName: "span",
        openFileUpload: function() {
            $('#files').click();
        },
        change: function(evt, controller) {
            var self = this;
            if (evt.target.files == null) return;

            var files = evt.target.files;
            var lengthText=files.length+" files has been selected";
            $("#selected-file").text(lengthText);
            for (var i = 0, f; f = files[i]; i++) {
                if (!self.validate(f)) {
                    self.resetFileInput();
                    self.resetFileInputContainer();
                    return;
                }
                else {
                    var fileInputWrap = $('.uploader-wrap');
                    self.resetFileInputContainer();
                    fileInputWrap.append(self.generateFileBullet(f));
                    fileInputWrap.removeClass('uploader-empty');
                }
            }
        },
   generateFileBullet: function(file) {
        var fileType = file.name.split('.').pop();
        var fileName = file.name;
        var fileSize = this.bytesToSize(file.size);
        return '<span class="uploaded-file-tag pull-left"><span class="inner-info"><i class="icon-file ' + fileType + '-file-icon"></i><span class="filename">' + fileName + '</span><span class="file-size">(' + fileSize + ')</span></span></span><span class="pull-right message-icon-container"><i class="icon-uploaded"></i></span>';
    },

    resetFileInputContainer: function() {
        var fileInputWrap = $('.uploader-wrap');
        fileInputWrap.find('span.uploaded-file-tag').remove();
        fileInputWrap.find('span.message-icon-container').remove();
        }.observes("reset"),

    resetFileInput: function() {
        var oldInput = document.getElementById("files");
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


    validate: function(file) {
        return this.validateFileType(file) && this.validateFileSize(file);
    },

    validateFileSize: function(file) {
        var maxSizeInMB = this.get("maxFileSizeInMB");
        if (!maxSizeInMB) maxSizeInMB = 5;

        if (file.size > maxSizeInMB * 1024 * 1024) {
        alert("File size cannot be more than " + maxSizeInMB + " MB");
        return false;
        }
        return true;
        },

    bytesToSize: function(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return 'n/a';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    },

    validateFileType: function(file) {
        var sFileName = file.name;
        var _valid_file_extensions = ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx','epub','png','jpg','jpeg']; //default allowed types

        var allowedFileTypes = this.get("allowedFileTypes")

        if (typeof(allowedFileTypes) === "object") {
        _valid_file_extensions = allowedFileTypes;
        } else if (typeof(allowedFileTypes) === "function") {
        _valid_file_extensions = allowedFileTypes();
        }

        if (sFileName.length > 0) {
        var blnValid = false;
        for (var j = 0; j < _valid_file_extensions.length; j++) {
        var sCurExtension = _valid_file_extensions[j];
        if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
        blnValid = true;
        break;
        }
        }

        if (!blnValid) {
        //alert("Chosen file " + sFileName + " is invalid, allowed extensions are: " + _valid_file_extensions.join(", "));
         jQuery("#selected-file").text("No file has been selected");
        jQuery("#fileTypesSupported").modal('show');
        return false;
        }
        else{
        jQuery("#fileTypesSupported").modal('hide');
        }
        }
        return true;
    },

    allowedFileTypesCommaSeparatedList: function() {
        var _valid_file_extensions = ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx', 'txt'];
        if (typeof(allowedFileTypes) === "object") {
        _valid_file_extensions = allowedFileTypes;
        } else if (typeof(allowedFileTypes) === "function") {
        _valid_file_extensions = allowedFileTypes();
        }
        return _valid_file_extensions.join(', ');
        }.property()
    })
})














 


