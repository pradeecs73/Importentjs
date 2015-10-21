define(['text!templates/landingPage/selfRegistration.hbs', 'ember'],
  function (selfRegistration, Ember) {

      var SelfRegistrationView = Ember.View.extend({
          template: Ember.Handlebars.compile(selfRegistration)
      });

      return {
          SelfRegistrationView : SelfRegistrationView
      }
  });