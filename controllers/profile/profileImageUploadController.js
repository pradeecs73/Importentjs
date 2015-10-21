"use strict";

define(["app", "httpClient", "text!templates/profileImageUploadModal.hbs"],
  function(app, httpClient , profileImageUploadModalTemplate) {

    app.ProfileImageUploadView = Ember.View.extend({
      template: Ember.Handlebars.compile(profileImageUploadModalTemplate)
    });

    app.ProfileImageUploadController = Ember.ObjectController.extend({
      model: function() {
        return {};
      },
      modalTitle: "Upload Photo",
      disableClick: "",
      tags: [],
      errors: "",
      reset: false,
      fileMessage: null,
      allowedFileTypes : ['jpg', 'png', 'bmp', 'gif', 'jpeg'],
      uploading: false,
      isValid: function(file) {
        if (!file) {
          this.set("errors", "Please choose a file");
          return false;
        }
        if(!this.iasInstance) {
          this.set("errors", "Corrupted/invalid image file. Please choose a different file");
          return false;
        }
        if(this.iasInstance.getSelection().width == 0 || this.iasInstance.getSelection().height == 0) {
          this.set("errors", "Please select an area on the image");
          return false;
        }
        this.set("errors", "");
        return true;
      },
      resetModel: function() {
        this.set("errors", "");
        this.toggleProperty("reset");
        this.set("uploading", false);
        this.set('modalTitle', "Upload photo");
        this.set('fileMessage', null);
        this.set('profileImageSrc',null)
        if(this.iasInstance) {
          this.iasInstance.cancelSelection();
        }
      },

      profileImageSrc: null,
      updatePreviewImage : function(){
        var file = $('#kc-files').get(0).files[0];
        var self = this;
        if(file) {
          var reader = new FileReader();
          reader.onload = function (e) {
            self.set('profileImageSrc', e.target.result);

            var img = $("#profileImage");
            img.off('load');
            if (self.iasInstance) {
              self.iasInstance.cancelSelection();
            }
            // Clear older instance so that a valid image should instantiate
            // a new iasInstance
            self.iasInstance = null;
            img.on('load', function () {
              self.iasInstance = self.initializeCroppingForImage();
              self.setDefaultSelection($(this));
            });
          }
          reader.readAsDataURL(file);
        }
        else{
          self.set('profileImageSrc',null);
        }
      },
      initializeCroppingForImage : function(){
        var img = $('#profileImage');
        var imgAreaSelect = img.imgAreaSelect({
          instance: true,
          handles: true,
          inModal: true,
          show: true,
          parent: '#profileImagePreviewContainer',
          aspectRatio : '1:1'
        });

        return imgAreaSelect;
      },
      setDefaultSelection: function(img) {
        var width = img.innerWidth();
        var height = img.innerHeight();
        width = height = width < height ? width : height;
        this.iasInstance.setSelection(5, 5, width - 5, height - 5);
        this.iasInstance.update();
      },
      actions: {
        showFileErrors: function(errorMessage) {
          if (errorMessage) {
            this.set('fileMessage', {'error': errorMessage});
          }
          this.set("errors", "");
          this.updatePreviewImage();
        },
        selectionErrors: function(){
          this.set("errors", "Please choose a file");
          this.set('profileImageSrc', null);
          var img = $("#profileImage");
          img.off('load');
          if (this.iasInstance) {
            this.iasInstance.cancelSelection();
          }
          this.iasInstance = null;
        },
        tryAgain: function() {
          this.resetModel();
        },
        cancelUpload: function() {
          this.resetModel();
        },
        uploadFile: function() {
          var file = $('#kc-files').get(0).files[0];
          if(!this.isValid(file)){
            return;
          }

          var self = this;
          var metadata = {};
          metadata.fileName = file.name;

          self.set('model.errors', "")
          self.set("uploading", true);
          self.set("disableClick", "disabled");
          var img = $('#profileImage');
          var imgAreaSelect = img.imgAreaSelect({disable: true});
          var fetchUploadLocationDetailsPromise = httpClient.get("/knowledgecenter/userpi/user/profile/image/_uploadUrl");
          fetchUploadLocationDetailsPromise
            .then(function(details){
              uploadUsing(details);
            }).fail()

          var failureCallBack = function(){
            self.set("disableClick", "");
            self.set("uploading", false);
            self.set('fileMessage', {'error': "Error in uploading profile image."});
          }

          function successCallBack(metadata) {
            var selection = self.iasInstance.getSelection();
            var shortName = app.getShortname();
            var userName = app.getUserLoginId();
            metadata["selection"] = {
              "x" : selection.x1,
              "y" : selection.y1,
              "width" : selection.width,
              "height" : selection.height,
              "imgWidth" : $('#profileImage').innerWidth(),
              "imgHeight" : $('#profileImage').innerHeight()
            }
            httpClient.post("/knowledgecenter/userpi/user/profile/image/upload", metadata)
              .then(function () {
                self.set("disableClick", "");
                self.set("modalTitle", "Upload Profile Image Successful");
                self.set('fileMessage', {'success': "This action has been completed. The image will be changed soon."});

                _($('img.avatar')).each( function(ele) { trigger(ele, "refresh") } );

              if (window.activityStream) {
                var streamDataContract = new activityStream.StreamDataContract(userName, 'USER', 'edit');
                streamDataContract.title = shortName;
                streamDataContract.resourceUrl = "/#/profile/my";
                streamDataContract.authorUserName = userName;
                streamDataContract.displayMessage = shortName + " has edited self-profile - photo";
                try {
                  activityStream.pushToStream(streamDataContract);
                }
                catch (err) {
                  console.log(err)
                }
              }
              
              }).fail(failureCallBack);
          }

          //could not get the jquery trigger working, hence writing an equivalent trigger.
          function trigger(elem, name) {
            var func = new Function('app', elem.getAttribute('on' + name)).bind(elem);
            func(app);
          }

          function uploadUsing(details) {
            var formData = new FormData();
            formData.append('redirect', details.redirectUrl);
            formData.append('max_file_size', details.maxFileSize + '');
            formData.append('max_file_count', details.maxFileCount + '');
            formData.append('expires', details.expires + '');
            formData.append('signature', details.signature);
            formData.append('file', file);
            $.ajax({
              url: "/objectstore" + details.url,
              type: 'POST',
              data: formData,
              contentType: false,
              processData: false
            }).done(function () {
                metadata.imageUploadUrl = details.objectRelativePath + metadata.fileName;
                successCallBack(metadata);
              }).fail(failureCallBack);
          }
        }
      }
    });
  });
