'use strict';
define(['app', 'pages/learningOfferings', 'text!templates/formallearning/plpDetails.hbs', 'services/formallearning/learningPlanService', "pages/learningPlan", "services/usersService", "text!templates/shareTemplete.hbs", "services/formallearning/userService", 'services/activityService'],
	function (app, learningOfferings, plpDetailsTemplate, learningPlanService, learningPlan, usersService, shareTemplete, learningUserServices, activityService) {
		App.PlpDetailsRoute = Ember.Route.extend({
			model: function (params) {
				var self = this,
					plpId = params.id,
					model = {};
				return learningPlanService.getPLPdetails(plpId).then(function(plp) {
					if (plp.learningPlansData.enrollStatus == "PENDING") {
						plp.learningPlansData.pendingApproval = true;
						plp.learningPlansData.status = 1;
					}
					switch(plp.learningPlansData.status) {
						case null:
							plp.learningPlansData.assignStatus = false;
							plp.learningPlansData.registerStatus = false;
							break;
						case 0:
							plp.learningPlansData.assignStatus = true;
							plp.learningPlansData.registerStatus = false;
							break;
						case 1:
							plp.learningPlansData.assignStatus = true;
							plp.learningPlansData.registerStatus = true;
							break;
					};
					learningPlan.plpDetailsData(plp);
					model = Ember.Object.create({
						"username": app.getUsername(),
						share: "",
						stats: Ember.Object.create({
							likes: 0,
							views: 0
						}),
						learningPlan: plp.learningPlansData,
						learningPlanItems : plp.learningPlansData.learningPlanItems,
						id: plp.learningPlansData.id,
						title: plp.learningPlansData.title,
						description: plp.learningPlansData.description
					});

					if (plp.learningPlansData.learningPlanItems && plp.learningPlansData.enforceOrder == 1) {
						for (var i = 0; i < plp.learningPlansData.learningPlanItems.length; i++) {
							if (plp.learningPlansData.learningPlanItems[i].courseCompleted != "completed") {
								plp.learningPlansData.learningPlanItems[i].isLaunch = true;
								break;
							}
						}
					}
					var plpIdList = [plpId];
					App.StatsUtil.getLikesCount(plpIdList, 'plp')
					 .then(function (_likedCourses) {
						 if (_likedCourses.length == 1) {
						 	model.stats.set("likes", _likedCourses[0].count);
						 } else {
							 model.stats.set("likes", 0);
						 }
					 });
					 App.StatsUtil.getViewCount(plpIdList).then(function (viewStats) {
						 var viewsCount = JSON.parse(viewStats)
						 if (viewsCount.length == 1) {
							model.stats.set("views", viewsCount[0].views);
						 } else {
							model.stats.set("views", 0);
						 }
					  });
					try {
					 	if (window.activityStream) {
					 		self.pushPlpAccessData(model);
					 	}
					 } catch (err) {
					 }
					return model;
				}, function (error) {
					jQuery('#status-message-div').addClass('hide');
					Ember.set(self.controllerFor('plpDetails'), "showMessage", true);
					Ember.set(self.controllerFor('plpDetails'), "isError", true);
					return {
						"recentReadersUserData": []
					};
				});
			},
			setupController: function (controller, model) {
				controller.set('model', model);
			},
			pushPlpAccessData: function(model) {
				try {
					var plp = {id: "FLPLP" + model.id, title: model.title, resourceUrl: "/#/plpDetails/" + model.id};
					app.NotificationUtils.sendActivityStreamEvent(plp, 'Prescribed Learning Plan', 'view');
				} catch (err) {
					$.gritter.add({title: '', text: 'Error in capturing Activity Stream data while course View' + err, class_name: 'gritter-error'});
				}
			},
			existingSharesFromActivity: function (plpId) {
				var self = this;
				return activityService.activities("share", "Prescribed Learning Plan", plpId, applicationIdConfig.cclom).then(function (share) {
					var existingShares = _.chain(share.recipients)
						.filter(function (recipient) {
							return (recipient.id !== app.getUsername());
						})
						.map(function (recipient) {
							return {
								"value": recipient.id + "|" + recipient.name + "|" + recipient.type + "|" + recipient.applicationId,
								"text": recipient.name
							}
						}).value();
					self.controller.set('alreadySharedData', existingShares);
					return existingShares;
				});
			},
			actions: {
				openShareModel: function (plpId) {
					var self = this;
					var shareModelData = Ember.Object.create({
						plpId: plpId,
						userAndGroupdata: []
					});
					usersService.allUsers().then(function (users) {
						jQuery('#shareCourse').modal('show');
						var userData = [];
						_.each(users, function (user, key) {
							userData.push({
								"id": user.username + "|" + user.shortName,
								"name": user.shortName
							});
						});
						shareModelData.set("userAndGroupdata", userData);
						self.controller.set('sharing', false);
						self.controller.set('messageStatus', false);
						self.controller.set('messages', "");
						self.controller.set('shareModelData', shareModelData);
					}).catch(function (error) {
						console.log("error", error);
					}).done(function () {
						self.existingSharesFromActivity(self.controller.get('id'))
							.then(function (alreadySharedData) {
								var userList = [];
								_.each(shareModelData.userAndGroupdata, function (value) {
									if (!_.findWhere(alreadySharedData, {
											share: value.id.split("|")[0]
										})) {
										userList.pushObject(value);
									}
								});

								self.controllerFor('plpDetails').set('alreadySharedData', alreadySharedData);
								if (alreadySharedData.length > 0) {
									learningOfferings.shareAutotag(userList, alreadySharedData);
								} else {
									learningOfferings.shareAutotag(userList);
								}
							});
					});
					Ember.TEMPLATES['shareCourseModelOutletModal'] = Ember.Handlebars.compile(shareTemplete);
					self.render('shareCourseModelOutletModal', {
						into: 'plpDetails',
						outlet: 'shareCourseModelOutlet'
					});
				},
				clearShare: function () {
					$('input[type=text]').val('');
					$('textarea').val('');
					$('input[type=select]').val('');
					$('input[type=radio]').val('');
					$('input[type=checkbox]').val('');
				},

				shareCourse: function (courseId, share) {
					var self = this;
					var comment = this.controller.get("model").comment;
					var alreadySharedData = this.controller.get('alreadySharedData');
					if (!share && !alreadySharedData.length) {
						try {
							Ember.FlashQueue.pushFlash('warning', 'No user to share');
						} catch (e) {
							console.log("Error in hiding share dialog");
						}
						return;
					}
					self.controller.set("sharing", true);
					self.controller.set("messageStatus", false);
					self.controller.set("messages", "");

					var sharedJson = [];
					var sharedWith = share.split(",");
					var sharedBy = app.getUsername();
					_.each(sharedWith, function (emailNamePair) {
						if (emailNamePair == "") {
							return;
						}
						var sharedObject = {};
						var emailNamePairArr = emailNamePair.split('|')
						sharedObject.applicationId = applicationIdConfig.cclom;
						sharedObject.id = emailNamePairArr[0].trim();
						sharedObject.name = emailNamePairArr[1].trim();
						if (emailNamePairArr[0].indexOf("@") == -1) {
							sharedObject.type = "group";
						} else
							sharedObject.type = "user";
						sharedObject.permission = ["read"];
						sharedJson.push(sharedObject)
					});
					var userName = app.getUsername(), userShortName = app.getShortname();
					learningUserServices.sharePlpDetails(self.controller.get('id'), sharedJson, [], userName, applicationIdConfig.cclom).then(function (plpSharedDetails) { //TODO how about plp
						self.controller.set("messageStatus", true);
						self.controller.set("sharing", false);
						self.controller.set("messages", "The changes made to sharing have been updated successfully");
						var coursesStreamResponse = App.ResourceShareUtil.pushEntitySharesToStream(plpSharedDetails, alreadySharedData, self.controller.get('title'), "plp", self.controller.get('type'));
						if (coursesStreamResponse) {
							coursesStreamResponse.then(function () {}, function (err) {
								console.log("Error", err);
							});
						}
					}, function (err) {
						self.controller.messageStatus = false;
						self.controller.sharing = false;
						self.controller.messages = "Unexpected error while sharing";
						console.log("Error", err);
					});
				},
			}
		});
	});
