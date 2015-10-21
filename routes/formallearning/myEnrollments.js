"use strict";
define(["app", "httpClient", "Q", "text!templates/formallearning/enrollments.hbs", "pages/trainingCatalog", 'emberPageble', "pages/messageModelHide", "services/formallearning/courseService"],
    function (app, httpClient, Q, enrollmentsTemplate, trainingCatalog, emberPageble, messageModelHide, courseService) {
        App.MyEnrollmentRoute = Ember.Route.extend({
			queryParams: {
                searchText: {
                    refreshModel: true
                }				
            },
            setProperties: function(key, val) {
                this.controllerFor('myEnrollment').set(key, val);
            },
            setupControllers: function (controller, model) {
                var courses = []
                _.each(model.courses, function (val, ind) {
                    if (val.completed != 1) {
                        courses.push(val);
                    }
                });
                var allFacets = {
                    Category : _.pluck(JSON.parse(sessionStorage.getItem('categories')),"name"),
                    Type: JSON.parse(sessionStorage.getItem('types'))
                }
                controller.set("allFacets", allFacets);
                controller.courses.setProperties({"currentPage": 1, 'data': courses });
                controller.setProperties({"sort": model.reporteesSort, model: model});
            },
			deactivate: function() {
				this._super();
				this.get('controller').set('sort', "");
			},
            model: function (queryParams) {
                var self = this;
                var model = Ember.Object.create({
                    "courses": [],
                    "types": [],
                    "categories" : [],
                    "categoriesArray" : [],
                    "reporteesUsername": queryParams.reporteesUsername ? queryParams.reporteesUsername : "",
					"reporteesSort":queryParams.reporteesSort
                });
				_.each(queryParams, function(val, key) {
                    self.setProperties(key, val);
                });
				var sDate = this.controllerFor('myEnrollment').get("startDate") ? this.controllerFor('myEnrollment').get("startDate"):'',
					eDate = this.controllerFor('myEnrollment').get("endDate") ? this.controllerFor('myEnrollment').get("endDate"):'',
					seletedType = this.controllerFor('myEnrollment').get("searchTermType") ? this.controllerFor('myEnrollment').get("searchTermType"): '',
                    selectedcategory = this.controllerFor('myEnrollment').get("searchTermCategory") ? this.controllerFor('myEnrollment').get("searchTermCategory"): '';
					var dates = App.DateUtil.getGMTStartDateAndEndDate(sDate, eDate);
					var selectedFilters = {
						enrol: 1,
						limitTo:app.Infinity,
						startDate:dates["startDate"],
						endDate:dates["endDate"],
						type: seletedType,
						category: selectedcategory,
                        reporteesUsername: queryParams.reporteesUsername
					};
				selectedFilters["query"] = this.controllerFor('myEnrollment') ? this.controllerFor('myEnrollment').get("searchText") : '';//--
                return courseService.getCourses(selectedFilters).then(function (courses){
                    model = Ember.Object.create({
                        "courses": courses,
                        "types": JSON.parse(sessionStorage.getItem('types')),
                        "categories" : JSON.parse(sessionStorage.getItem('categories')),
                        "categoriesArray" : _.pluck(JSON.parse(sessionStorage.getItem('categories')), ["name"]),
                        "reporteesUsername": queryParams.reporteesUsername,
						"reporteesSort":queryParams.reporteesSort
                    });
                    model.courses = self.controllerFor("myEnrollment").formatCourses(model.courses.courses, true);
                    return model;
                }, function (error) {
                    return model;
                });
            }

        });

    });