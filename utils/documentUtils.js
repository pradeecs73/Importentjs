define(['app'], function(app){
   var verbPastTense = {view: "viewed",
       delete: "deleted",
       download: "downloaded",
       upload: "uploaded",
       rate: 'rated',
       'un-rate': 'un-rated',
       follow: 'followed',
       favorite: 'favorited',
       like: 'liked',
       'un-follow': 'un-followed',
       'un-favorite': 'un-favorited',
       'un-like' : 'un-liked',
        edit: "edited",
        comment: "commented"
   };

   app.DocumentUtils = {
       allowedVideoFileTypes: function(){
         return app.allowedVideoFileTypes;
       },
       getDocumentDisplayType: function(fileType) {
           if(this.isVideo(fileType)) {
               return "video";
           }

           return "file";
       },
       getDocumentType: function(fileType) {
           if(this.isVideo(fileType)) {
               return "video";
           }

           return "document";
       },

       isVideo: function(fileType) {
           return _.contains(this.allowedVideoFileTypes(), fileType.toLowerCase())
       },
       pushShareToActivityStream: function(documentId, documentType, documentTitle, authorId, verb, message, target){
           if (window.activityStream) {
               try {
                   var documentDisplayType = this.getDocumentDisplayType(documentType);
                   var documentObjectType = this.getDocumentType(documentType);
                   var streamDataContract = new activityStream.StreamDataContract(documentId, documentObjectType, verb);
                   streamDataContract.title = documentTitle;
                   streamDataContract.resourceUrl = "/document/" + documentId + "/index";
                   streamDataContract.authorUserName = authorId;
                   if(message) {
                       streamDataContract.displayMessage = message;
                   } else {
                       streamDataContract.displayMessage = app.getShortname() + " has " + verbPastTense[verb] + " " + documentDisplayType + " with name " + documentTitle;
                   }
                   if(target) {
                       var markedTarget = (new activityStream.TargetObject(target.id, target.name, target.type)).toObject();
                       streamDataContract.sharedWith = [markedTarget];
                   }
                   activityStream.pushToStream(streamDataContract);
               }
               catch (err) {
                   console.log(err)
               }
           } else {
               console.log("Activity Stream is not enabled")
               return;
           }
       },
       pushToActivityStreamForDocument: function (document, verb, message, target) {
           this.pushShareToActivityStream(document.id, document.documentType, document.title, document.createdBy, verb, message, target);
       }
   }
});