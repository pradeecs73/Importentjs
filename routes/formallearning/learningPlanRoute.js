"use strict";
define(["app", "httpClient", "services/formallearning/learningPlanService", "pages/learningPlan"],
    function (app, httpClient, learningPlanService, pageLearningPlan) {

        App.LearningPlansRoute = Ember.Route.extend({
            queryParams: {
                pageNumber: {
                    refreshModel: true
                },
				keyword: {
					refreshModel: true
				},
                reporteesUsername : {
                  refreshModel: true  
                }
            },
            setProperties: function(key, val) {
                this.controllerFor('learningPlans').set(key, val);
            },
            model: function (queryParams) {
                var self = this;
                var reporteesUsername = queryParams.reporteesUsername;
                var model = {
                    learningPlans: [],
                    userName: '',
                    shortUserName: '',
                    status: '',
                    username: app.getUsername() 
                };

                _.each(queryParams, function(val, key) {
                    self.setProperties(key, val);
                });
                queryParams["reporteesUsername"] = reporteesUsername ? reporteesUsername : "";
				queryParams["query"] = this.controllerFor('learningPlans') ? this.controllerFor('learningPlans').get("searchText") : '';
				var sDate = this.controllerFor('learningPlans').get("startDate") ? this.controllerFor('learningPlans').get("startDate"):'';
				var eDate = this.controllerFor('learningPlans').get("endDate") ? this.controllerFor('learningPlans').get("endDate"):'';
				var dates = App.DateUtil.getGMTStartDateAndEndDate(sDate, eDate);
					queryParams["startDate"] = dates["startDate"];
					queryParams["endDate"] = dates["endDate"];
                return learningPlanService.fetchLearningPlans(queryParams).then(function (learningPlans) {
						var totalResults = learningPlans.plpCount;
						var learningPlans = learningPlans.learningPlans;
                        var shortName = '';
                        var userName = app.getUsername().toString();
                        if (userName != "" && userName) {
                            shortName = userName.split('@')[0];
                        }
                        model = Ember.Object.create({
                            learningPlans: learningPlans,
                            username: userName,
                            shortUserName: shortName,
                            status: '',
							"pageNumber": 1,
							totalResults:totalResults
                        });
						pageLearningPlan.learningPlanHelper(model.learningPlans);
						model.status = model.learningPlans.length > 0 ? " " : "No learning plans to display.";
						if (learningPlans.length == 0) {
							model.set('status', 'No learningPlans to display');
						}
						return model;
                    }, function (error) {
                    return model;
                })
            },
            setupControllers: function (controller, model) {
                controller.learningPlans.set("currentPage", 1);
                controller.set('learningPlans.data', model.learningPlans);
                controller.set('model', model);
                controller.set('username', model.username);
            }
        });
        App.IndLearningPlanRoute = Ember.Route.extend({
            setupControllers: function (controller, model) {
                if (model.completionDateInt) {
                    controller.set('isUpdate', true);
                } else {
                    controller.set('isUpdate', false);
                }
                controller.set('showMessage', false);
                controller.set('model', model);
                App.DateUtil.setDateForControllerLp(controller, model.completionDateInt);
				App.DateUtil.setMonthAndYearLp(controller);
				var d = new Date();	var	t = d.getDate();var m = d.getMonth()+1;var y = d.getFullYear();
				controller.setProperties({"ilpDate": m+"/"+t+"/"+y});
			},
            model: function (params) {
                var model = Ember.Object.create({
                    learning_items: [],
                    name: "",
                    taskDesc: "",
                    errors: {},
					ilpDate: new Date()
                });
                var lpId = parseInt(params.id);
                var learningPlans = this.controllerFor('learningPlans').get('model').learningPlans;
                var lp = _.findWhere(learningPlans, {
                    id: lpId
                });
                if (lp) {
                    var completionDateInt = lp.completeByDate * 1000;
                    var completionDate = new Date(completionDateInt);
                    model.name = lp.name;
                    model.day = completionDate.getDate();
                    model.month = completionDate.getMonth() + 1;
                    model.year = completionDate.getFullYear();
                    model.learningPlanId = lp.id;
					model.ilpDate = completionDate;
					lp.learningPlanItems.forEach(function(items){
						items.courseId = items.courseId == " "? undefined : items.courseId;
					})
                    model.learning_items = lp.learningPlanItems;
                }
                model.completionDateInt = completionDateInt;
                return model;
            }
        });
    });