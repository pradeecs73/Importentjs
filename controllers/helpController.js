'use strict';

	define(['app', 'text!templates/help.hbs'],
		function(app, helpTemplate) {
		  app.HelpView = Ember.View.extend({
			template: Ember.Handlebars.compile(helpTemplate)
		  });
	});