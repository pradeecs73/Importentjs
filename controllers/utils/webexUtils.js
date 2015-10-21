define(['app'],
    function (app) {
        app.WebexUtils = Ember.Object.create({
          meetingLink: function(response) {
              return "<a target='_blank' href='" + response.attendeeURL + "'>" + response.attendeeURL + "</a>"
          },
          meetingPassword: function() {
              return "123456";
          }
        });
    });
