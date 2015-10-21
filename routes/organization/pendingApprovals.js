'use strict'
define(['app', 'services/formallearning/courseService', 'pages/trainingCatalog', "text!templates/organization/pendingApprovals.hbs", 'services/usersService'], function(app, courseService, pageTraningCatalog, pendingApprovalTemplate, usersService) {
    app.PendingApprovalsRoute = Ember.Route.extend({
        setupController: function(controller, model) {
            controller.set('model', model);
			var self = this.controller;
			var allPendings = self.get("model").allPendings.entity;
			var emails = [];
			_.each(allPendings, function(object) {
				emails.push(object.userName);
			});
			emails = _.uniq(emails); 
			return usersService.users(emails).then(function(users) {
				_.each(users, function(user) {
					_.each(allPendings, function(pendings) {
						if (user.email == pendings.userName) {
							pendings.shortName = user.shortName;
						}
					});
				});
				 var pendings = pageTraningCatalog.pendingEnrollmentList(allPendings);
				 controller.set('pendingApprovals', pendings);
			}, function(err) {
					console.log(err);
					return [];
			});
        },
        model: function() {
            var self = this;
            var model = Ember.Object.create({
                "pendingApprovals": {},
				"allPendings":[]
            });
            return courseService.getListOfPendingApprovals().then(function (response) {
                model = Ember.Object.create({
                    "pendingApprovals": response,
					"allPendings":response
                });
                model.pendingApprovals = pageTraningCatalog.pendingEnrollmentList(response.entity);
                 return model;
            }, function(error) {
                return model;
            }); 
        },
		renderTemplate: function() {
			var self = this,
				permissionType = "viewPendingApprovals";
			this.render();
			usersService.hasPermission(permissionType).then(function (response) {
				if(!response.length) self.render("notAllowed"); 
			});
		}
        
    });
});