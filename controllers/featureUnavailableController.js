'use strict';

	define(['app', 'text!templates/featureUnavailable.hbs'],
		function(app, featureUnavailableTemplate) {
		  app.FeatureUnavailableView = Ember.View.extend({
			template: Ember.Handlebars.compile(featureUnavailableTemplate)
		  });
	});