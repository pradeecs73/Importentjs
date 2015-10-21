'use strict'

define(['app', 'text!templates/kotg/drives.hbs', 'services/kotg/kotgBoxService'],
	function (app, drivesTemplate, boxServices) {

		app.DrivesRoute = Ember.Route.extend({
            renderTemplate: function() {
                this.render({into:"application"});
            },
            setupController: function(controller, model) {
				var loginUrl = boxServices.authUrl + boxServices.domainUrl;
				controller.set("loginUrl", loginUrl);
            },
			actions: {
				didTransition: function() {
					var that = this;
					boxServices.checkToken().done(function(result) {
						that.transitionTo('drive', 0);
					}).fail(function(result) {
                        that.render();
                    	console.log(result);
                        boxServices.login().done(function(result){
							that.transitionTo('drive', 0);
                        }).fail(function(result){
                        	console.log(result);
                        });
					});
				}
			}
		});

		app.DrivesView = Ember.View.extend({
            template: Ember.Handlebars.compile(drivesTemplate)
		});
});
