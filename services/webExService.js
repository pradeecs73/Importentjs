define(['app', 'httpClient'], function (app, httpClient) {

  var startMeeting = function(attendees, successCallback, finallyCallback) {
      var userWebExAccountDetails = {
          attendees: attendees
      };
      return httpClient.post("/knowledgecenter/userpi/webex/meeting", userWebExAccountDetails)
          .then(function (response) {
              successCallback(response)
          }, function(error) {
              jQuery('#webexModalInvalid').modal('show');
              if(error.status === 404) {
                  jQuery('#webExServerError').hide();
                  jQuery('#webExLoginError').show();
              }
              else {
                  jQuery('#webExLoginError').hide();
                  jQuery('#webExServerError').show();
              }
          }).finally(finallyCallback);

  }



  return {
    instantMeeting: function (attendees, meetingStartedCallback, finallyCallback) {
        if(!meetingStartedCallback) {
            meetingStartedCallback = function() {
                console.log("No callback defined for Webed Meeting started");
            }
        }

        if(!finallyCallback) {
            finallyCallback = function() {
                console.log("Empty finally callback");
            }
        }

    	return startMeeting(attendees, function(startMeetingResponse){
               var loginWindow = new Object();
               if (startMeetingResponse.ticket != "") {
                   loginWindow = window.open(startMeetingResponse.loginUrl);
                   setTimeout(function(){
                       loginWindow.close();
                       if (startMeetingResponse.attendeeURL != "") {
                           var webexclientWindow =  window.open(startMeetingResponse.attendeeURL);
                           webexclientWindow.focus();
                           if(typeof meetingStartedCallback == "function") {
                               meetingStartedCallback(startMeetingResponse);
                           }
                           setTimeout(function(){
                               webexclientWindow.close();
                           },45000);
                       }
                   },3000);
               }
           }, finallyCallback);
    },
    validateCredentials: function(webExId, webExPassword){
        var userWebExAccountDetails = {
            webexId: webExId,
            webexPassword: webExPassword
        }
        return httpClient.post("/knowledgecenter/userpi/webex/validate", userWebExAccountDetails);
    }
  }
});