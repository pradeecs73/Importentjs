'use strict'

define(['app', 'services/newkotg/newkotgService'],
	function (app, newkotgService) {
		App.NEWKOTGControllerMixin = Ember.Mixin.create({
			actions: {
				star: function() {
					var that = this,
						model = that.get("model"),
						documentId = model.id,
						isStared = that.get("isStared");
					if(isStared) {
						newkotgService.unBindTag(documentId, "starred").done(function() {
							that.set("isStared", false);
						}).fail(function() {
						});
					} else {
						newkotgService.bindTag(documentId, "starred").done(function() {
							that.set("isStared", true);
						}).fail(function() {
						});
					}
				},
				delete: function() {
					var that = this;
					var documentId = that.get("model").id;
					newkotgService.deleteOne(documentId).done(function() {
						// ToDo use clks' notification
						if(that.get("isCollection")) {
							that.transitionToRoute("collections");
						} else if(that.get("isNote")) {
							that.transitionToRoute("notes");
						} else if(that.get("isShared")) {
							that.transitionToRoute("sharedItems");
						}
					}).fail(function(result) {
						// ToDo use clks' notification 
						console.log("Delete document " + documentId + " failed.");
					});
				}
			}
		});
	});
