define([
		'ember'
	], function(
		Ember
	) {
	"use strict";
	
	var IndexRoute = Ember.Route.extend({
		setupController: function (indexController, model) {
			indexController.set('model', model);
		},
		renderTemplate: function() {	

		}
	});

	return IndexRoute;
});