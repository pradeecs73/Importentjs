define(['app', 'text!templates/adminUploadExpertise.hbs', "services/encryptionService"],
  function(app, adminUploadExpertiseTemplate, encryptionService) {
    app.AdminUploadExpertiseView = Ember.View.extend({
      layoutName: "modal_layout",
      template: Ember.Handlebars.compile(adminUploadExpertiseTemplate)
    });

    app.AdminUploadExpertiseController = Ember.ObjectController.extend({
      message: "",
      busy: false,
      success: false,
      setMessage: function(msg) {
        this.set('message', msg);
      },
      reset: function() {
        this.set('message', "");
        this.set('busy', false);
        this.set('success', false);
      },
      actions: {
        upload: function() {
          var self = this;

          var $file = $('#file').get(0);
          var files = $file.files;
          if (files.length < 1) {
            return;
          }

          var suffix = ".csv";
          if ($file.value.indexOf(suffix, this.length - suffix.length) === -1) {
            self.setMessage('Invalid file format. Please upload a valid .csv file.');
            return;
          }

          var formData = new FormData();
          formData.append('file', files[0]);

          self.setMessage(null);
          self.set('busy', true);

          var tagValue = $.cookie("auth-token");
          var headers = {}
          headers["XSS-Tag"] = encryptionService.assymEncrypt(tagValue)

          $.ajax({
            url: '/knowledgecenter/userpi/expertise/upload',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            headers: headers
          }).done(function(response) {
            var msg = response.recordsProcessed + " records have been added successfully into the application. There are " + response.failedRecords + " validation errors. A more detailed report will be sent to your registered email address.";
            if(response.ignoredRecords > 0)
             msg += " The number of records is more than 100. Please do upload the remaining data separately."
            self.setMessage(msg);
            self.set('success', response.success);
          }).fail(function(err) {
            if (err.responseJSON)
              self.setMessage(err.responseJSON.errors.join(" "));
            else
              self.setMessage("Some Error Occurred");
          }).always(function() {
            self.set('busy', false);
          });
        }
      }
    });
  });
