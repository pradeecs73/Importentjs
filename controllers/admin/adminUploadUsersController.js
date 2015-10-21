define(['app', 'text!templates/adminUploadUsers.hbs', "services/encryptionService"],
  function(app, adminUploadUsersTemplate, encryptionService) {
    app.AdminUploadUsersView = Ember.View.extend({
      layoutName: "modal_layout",
      template: Ember.Handlebars.compile(adminUploadUsersTemplate)
    });

    app.AdminUploadUsersController = Ember.ObjectController.extend({
      validationErrors: [],
      busy: false,
      success: false,
      setMessage: function(msg) {
        if (msg === null) {
          msg = [];
        } else if (typeof(msg) === "string") {
          msg = [msg];
        }

        this.set('validationErrors', msg);
      },
      reset: function() {
        this.set('validationErrors', []);
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
            url: '/knowledgecenter/userpi/upload',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            headers: headers
          }).done(function() {
            self.set('success', true);
          }).fail(function(err) {
            if (err.responseJSON)
              self.setMessage(err.responseJSON.errors);
          }).always(function() {
            self.set('busy', false);
          });
        }
      }
    });
  });
