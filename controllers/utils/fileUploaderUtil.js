 define(['app', 'httpClient'], function(App, httpClient) {
     App.FileUploaderMixin = Ember.Mixin.create({
         isAnyFilesSelected: function() {
             return ($('#files') && $('#files').get(0).files.length > 0) ? true : false;
         },
         uploadFiles: function() {
             var self = this;
             if (!this.isAnyFilesSelected()) {
                 var deferred = Q.defer();
                 setTimeout(deferred.resolve("NO_FILES_SELECTED"), 0);
                 return deferred.promise;
             }
             self.currentlySelectedFiles = [];
             var formData = new FormData();
             _.each($('#files').get(0).files, function(file) {
                 formData.append('file', file);
                 self.currentlySelectedFiles.push({
                     id: file.name,
                     displayName: file.name
                 });

             });

             self.fileMetaData.set("title", $('#files').get(0).files[0].name);
             formData.append('metadata', JSON.stringify(self.fileMetaData));

             self.statusMessageObject.message.set("text", self.statusMessageObject.fileUploadStatus.FILE_UPLOAD_IN_PROGRESS);
             return $.ajax({
                 url: '/knowledgecenter/files/upload',
                 type: 'POST',
                 data: formData,
                 contentType: false,
                 processData: false
             }).then(function(response) {
                 if (response.status == "failure") {
                     return "FILE_UPLOAD_FAILED";
                 }
                 return "FILE_UPLOAD_IN_PROCESS";
             }).fail(function(err) {
                 return "FILE_UPLOAD_FAILED";
             });
         },
         constructFileMetaDataModel: function(self) {
             Ember.set(self, "fileMetaData", Ember.Object.create({
                 title: "",
                 description: "",
                 tags: [],
                 type: "public"
             }));

             Ember.set(self, "statusMessageObject", {
                 fileUploadStatus: {
                     "FILE_UPLOAD_IN_PROCESS": "File upload has been successful, analysis is in progress",
                     "FILE_UPLOAD_FAILED": "Error in uploading file",
                     "FILE_UPLOAD_IN_PROGRESS": "File upload is in progress, please wait...",
                     "NO_FILES_SELECTED": "Please choose files for Upload"
                 },
                 message: Ember.Object.create({
                     text: ""
                 })
             });
             Ember.set(self, "reset", false);
             Ember.set(self, "allowedFileTypes", ['epub', 'pdf', 'doc', 'docx', 'ppt', 'pptx', 'png', 'gif', 'jpg']);
             Ember.set(self, "types", [{
                 "displayName": "Public",
                 "value": "public"
             }, {
                 "displayName": "Restricted",
                 "value": "private"
             }]);

             self.toggleProperty("reset");

         },
         fileMetaData: Ember.Object.create({
             title: "",
             description: "",
             tags: [],
             type: "public"
         }),
         reset: false,
         allowedFileTypes: ['epub', 'pdf', 'doc', 'docx', 'ppt', 'pptx', 'png', 'gif', 'jpg'],
         types: [{
             "displayName": "Public",
             "value": "public"
         }, {
             "displayName": "Restricted",
             "value": "private"
         }],
         statusMessageObject: {
             fileUploadStatus: {
                 "FILE_UPLOAD_IN_PROCESS": "File upload has been successful, analysis is in progress",
                 "FILE_UPLOAD_FAILED": "Error in uploading file",
                 "FILE_UPLOAD_IN_PROGRESS": "File upload is in progress, please wait...",
                 "NO_FILES_SELECTED": "Please choose files for Upload"
             },
             message: Ember.Object.create({
                 text: ""
             })
         }
     });

 });