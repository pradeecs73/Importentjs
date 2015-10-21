define(['text!templates/landingPage/landingPage.hbs', 'ember'],
  function (landingPageTemplate, Ember) {
      var LandingPageView = Ember.View.extend({
          template: Ember.Handlebars.compile(landingPageTemplate),
          detectIE: function() {
              var ua = window.navigator.userAgent;  
              var msie = ua.indexOf('MSIE ');
              if (msie > 0) {
                // IE 10 or older => return version number
                return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
              }
              var trident = ua.indexOf('Trident/');
              if (trident > 0) {
                // IE 11 => return version number
                var rv = ua.indexOf('rv:');
                return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
              }
              var edge = ua.indexOf('Edge/');
              if (edge > 0) {
                // IE 12 => return version number
                return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
              }
              // other browsers
              return false;
        },
        didInsertElement: function () {
            var IEversion = this.detectIE();
		        if (IEversion !== false) {
		            document.getElementById('landing-login-form-x').innerHTML = '<p></p><h2 class="msg_page-heading sub-heading">Error!</h2> <p>Your browser is not supported. Please update to  <a href="https://www.google.com/chrome/" target="_blank">Chrome</a> or <a  href="https://www.mozilla.org/en-US/firefox/new/" target="_blank">Firefox</a></p>';
		        }
	      }
      });

      return {
          LandingPageView : LandingPageView
      }
  });