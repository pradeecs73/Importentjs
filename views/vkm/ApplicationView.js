define([
	"ember",
	"text!templates/vkm/applicationTemplate.hbs"


], function(Ember, applicationTemplate) {
	var ApplicationView = Ember.View.extend({
		defaultTemplate: Ember.Handlebars.compile(applicationTemplate),
        didInsertElement: function() {
			initializeSideMenu();
        }
	});
	return ApplicationView;
});