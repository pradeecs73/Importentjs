"use strict";

define(["app", "text!templates/newkotg/fileupload.hbs", 'services/newkotg/newkotgService'],
    function(app, fileuploadTemplate, newkotgService) {
        app.NEWKOTGFileuploadView = Ember.View.extend({
            template: Ember.Handlebars.compile(fileuploadTemplate),
            actions: {
                change: function() {
                    var self = this,
                        controller = self.controller,
                        jFiles = $("#files");

                    controller.set('file', null);
                    controller.set("error", "");

                    if(jFiles.get(0).files == null) return;
                    var file = jFiles.get(0).files[0]; // FileList object
                    if(file) {
                        var result = self.validateFileSize(file);
                        if (!result.valid) {
                            return controller.set("error", result.message);
                        }
                        controller.set('file', {
                            fileType: file.type,
                            fileName: file.name,
                            fileSize: self.bytesToSize(file.size)
                        });
                    } else {
                        controller.set('file', null);
                        controller.set('error',"Please choose a file");
                    }
                },
                openFileChooser: function() {
                    if(!$("#files").get(0).files[0]) {
                        $("#files").click();
                    } else {
                        $("#files").trigger("change").click();
                    }
                }
            },
            validateFileSize: function(file) {
                var fileSizeLimit = this.controller.parentController.get("fileSizeLimit");
                if(!fileSizeLimit) {
                    fileSizeLimit = 10485760;
                }
                var maxSizeInMB = parseInt(fileSizeLimit) / (1024 * 1024);
                if (file.size > fileSizeLimit) {
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
            bytesToSize: function(bytes) {
                var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                if (bytes == 0) return 'n/a';
                var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
                return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
            }
        });
        app.NEWKOTGFileuploadController = Ember.ObjectController.extend({
            init: function() {
                if (!Ember.TEMPLATES["nEWKOTGFileupload"]) {
                    Ember.TEMPLATES["nEWKOTGFileupload"] = Ember.Handlebars.template(Ember.Handlebars.precompile(fileuploadTemplate));
                }
            },
            model: function() {return {};},
            file: null,
            error: "",
            reset: false,
            uploading: false,
            xhr: null,
            resetModel: function() {
                this.set("error", "");
                this.toggleProperty("reset");
                this.set("file", null);
                this.set("uploading", false);
                this.set("xhr", null);
            },
            preprocessPreviewImg: function(item) {
                var that = this;
                var d = item.document;
                switch (d.type){
                    case "File":
                        // Notice: use external tools "utils"
                        d.img = that.parseIcon(d.contentType);
                        d.hasImg = true;
                        break;
                    case "Image":
                        d.img = d.href;
                        d.hasImg = true;
                        break;
                    default :
                        if (d.attachments&&d.attachments.length>0){
                            d.img = d.attachments[0].href? d.attachments[0].href: d.attachments[0].url;
                            d.hasImg = true;
                        }else{
                            d.img = "";
                            d.hasImg = false;
                        }
                }
            },
            parseIcon: function(filetype) {
                var thumImage = "";
                switch (filetype) {
                    case 'application/pdf':
                        thumImage = "assets/img/upload-file-type/PDF.png";
                        break;
                    case 'application/msword':
                        thumImage = "assets/img/upload-file-type/DOC.png";
                        break;
                    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                        thumImage = "assets/img/upload-file-type/DOCX.png";
                        break;
                    case 'application/epub+zip':
                        thumImage = "assets/img/upload-file-type/epub.png";
                        break;
                    case 'application/vnd.ms-powerpoint':
                        thumImage = "assets/img/upload-file-type/PPT.png";
                        break;
                    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                        thumImage = "assets/img/upload-file-type/PPTX.png";
                        break;
                    case 'text/plain':
                        thumImage = "assets/img/upload-file-type/TXT.png";
                        break;
                    case 'application/vnd.ms-excel':
                        thumImage = "assets/img/upload-file-type/XLS.png";
                        break;
                    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                        thumImage = "assets/img/upload-file-type/XLSX.png";
                        break;
                    case 'application/zip':
                        thumImage = "assets/img/upload-file-type/ZIP.png";
                        break;
                    default :
                        thumImage = "assets/img/upload-file-type/unknown.png";
                        break;
                }
         
                return thumImage;
            },
            actions: {
                cancel: function() {
                    var self = this,
                        xhr = self.get("xhr");
                    if(xhr) {
                        xhr.abort();
                        self.resetModel();
                        $("#files").change();
                    }
                },
                upload: function() {
                    var self = this;
                    if(!self.get("file")){return; }
                    self.set("uploading", true);
                    var file = $('#files').get(0).files[0];
                    var xhr = doUpload(file);
                    self.set("xhr", xhr);

                    function showProcess(evt) {
                        if (evt.lengthComputable) {
                            var percentComplete = evt.loaded / evt.total * 95;
                            $(".progress-bar").css("width", percentComplete + "%");
                        }
                    }
                    function doneUpload(evt) {
                        // Todo 
                        console.log("upload done", evt);
                    }

                    function doUpload(file) {
                        var formData = new FormData();
                        formData.append('file', file);
                        return $.ajax({
                            url:'/knowledgecenter/kotg/fileupload',
                            xhr: function() {
                                var xhr = new window.XMLHttpRequest();
                                //Upload progress
                                xhr.upload.addEventListener("progress", showProcess, false);
                                //Download progress
                                xhr.addEventListener("progress", doneUpload, false);
                                return xhr;
                            },
                            beforeSend:function(xhr,data){
                                app.encryptionService(xhr);
                            },
                            type: 'POST',
                            data: formData,
                            contentType: false,
                            processData: false
                        }).done(function(fileId) {
                            newkotgService.addFileDocument(fileId, null).done(function(document) {
                                $(".progress-bar").css("width", 100 + "%");
                                setTimeout(function() {
                                    self.resetModel();
                                    $("#fileuploadDialog").modal('hide');
                                    self.parentController.send("refreshModel");
                                }, 500);
                            }).fail(function() {
                                self.set("error", "Upload failed");
                            });
                        }).fail(function() {
                            self.set("error", "Upload failed");
                        });
                    }
                },
                clear: function() {
                    this.resetModel();
                }
            }
        });
    });
