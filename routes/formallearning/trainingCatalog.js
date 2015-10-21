"use strict";

define(["app", "httpClient", "Q", "pages/messageModelHide", "text!templates/formallearning/catalog.hbs", "emberPageble",
        "text!templates/formallearning/addToLearningPlanModel.hbs", "services/formallearning/courseService", "services/usersService", "text!templates/formallearning/plpUsersModel.hbs", "text!templates/popupTemplate.hbs"],
    function (app, httpClient, Q, messageModelHide, catalogTemplate, emberPageble, addToLearningPlanModelTemplate, courseService, usersService, plpUsersModelTemplate, modalPopupTemplate) {
        App.then(function (app) {
            var self = this;
            courseService.getCourseFilters().then(function (filters) {
                sessionStorage.setItem("categories", JSON.stringify(filters.categories ? filters.categories : ""));
                sessionStorage.setItem("types", JSON.stringify(filters.types ? filters.types : ""));
				sessionStorage.setItem("locations", JSON.stringify(filters.locations ? filters.locations : ""));
				sessionStorage.setItem("jobRoles", JSON.stringify(filters.jobRoles ? filters.jobRoles : ""));
				sessionStorage.setItem("skills", JSON.stringify(filters.skills ? filters.skills : ""));
            }, function (err) {
                sessionStorage.setItem("categories", JSON.stringify([]));
                sessionStorage.setItem("types", JSON.stringify([]));
				sessionStorage.setItem("locations", JSON.stringify([]));
				sessionStorage.setItem("jobRoles", JSON.stringify([]));
				sessionStorage.setItem("skills", JSON.stringify([]));
            });
            usersService.allUsersWithFilters("*", [], false, 1, false, "", 'asc').then(function (userSearchFilters){
                sessionStorage.setItem("cities", JSON.stringify(userSearchFilters.allFacets.city ? userSearchFilters.allFacets.city : ""));
                sessionStorage.setItem("organizations", JSON.stringify(userSearchFilters.allFacets.organization ? userSearchFilters.allFacets.organization: ""));
                sessionStorage.setItem("jobTitles", JSON.stringify(userSearchFilters.allFacets.jobTitle ? userSearchFilters.allFacets.jobTitle : ""));
            }, function (err) {
                sessionStorage.setItem("cities", JSON.stringify([]));
                sessionStorage.setItem("organizations", JSON.stringify([]));
                sessionStorage.setItem("jobTitles", JSON.stringify([]));
            });
        });
        App.CatalogRoute = Ember.Route.extend({
            queryParams: {
                pageNumber: {
                    refreshModel: true
                },
                searchText: {
                    refreshModel: true
                },
				type:{
					refreshModel: true
				},
				sortByName:{
				refreshModel: true
				},
				sortByType:{
					refreshModel: true
				},
				location:{
					refreshModel: true
				},
				date:{
					refreshModel: true
				},
				learningPlans: {
					refreshModel: true
				},
                selectedPlpids: {
                    refreshModel: true
                }
            },
            setProperties: function(key, val) {
                this.controllerFor('catalog').set(key, val);
            },
            setupControllers: function (controller, model) {
                if (!this.controllerFor('catalog').get('isError')) {
                    Ember.set(this.controllerFor('catalog'), "showMessage", false);
                }
                Ember.set(this.controllerFor('catalog'), "isError", false);
                var allFacets = {
                    Category : _.pluck(JSON.parse(sessionStorage.getItem('categories')),"name"),
                    Type: JSON.parse(sessionStorage.getItem('types')),
					Location: _.pluck(JSON.parse(sessionStorage.getItem('locations')),"cityName")
                }

                var userSearchFacets = {
                    jobTitle: JSON.parse(sessionStorage.getItem('jobTitles')),
                    city: JSON.parse(sessionStorage.getItem('cities')),
                    organization: JSON.parse(sessionStorage.getItem('organizations'))
                }

                controller.set("allFacets", allFacets);
                controller.set('userSearchFacets', userSearchFacets);
                controller.courses.set("currentPage", 1);
                controller.set('model', model);
				controller.set("totalResults", model.courses.total);
                controller.set('courses.data', model.courses.courses);
				controller.set("isPlpSelected", false);
				App.DateUtil.setDateToLearningPlan(controller);
            },
		    model: function (queryParams) {
                var model = Ember.Object.create({
                    "courses": {courses:[], total:0},
                    "types": [],
                    "categories" : [],
                    "categoriesArray" : []
                });
                var self = this;
                _.each(queryParams, function(val, key) {
                    self.setProperties(key, val);
                });
                    queryParams["query"] = this.controllerFor('catalog') ? this.controllerFor('catalog').get("searchText") : '';
                    queryParams["category"] = this.controllerFor('catalog') ? this.controllerFor('catalog').get('searchTermCategory') : '';
                    queryParams["type"] = this.controllerFor('catalog') ? this.controllerFor('catalog').get('searchTermType') : '';
					queryParams["sortByName"] = this.controllerFor('catalog') ? this.controllerFor('catalog').get('sortByName') : '';
					queryParams["sortByType"] = this.controllerFor('catalog').get('sortByType');
					queryParams["location"] = this.controllerFor('catalog') ? this.controllerFor('catalog').get('searchTermLocation') : '';
					queryParams["date"] = this.controllerFor('catalog') ? this.controllerFor('catalog').get('searchTermDate') : '';
					queryParams["learningPlans"] = this.controllerFor('catalog') ? this.controllerFor('catalog').get('learningPlans') : '';
					queryParams["selectedPlpids"] = this.controllerFor('catalog') ? this.controllerFor('catalog').get('selectedPlpids') : '';
				return courseService.getCourses(queryParams).then(function (courses) {
                    var model = Ember.Object.create({
                        "courses": courses,
                        "types": JSON.parse(sessionStorage.getItem('types')),
                        "categories" : JSON.parse(sessionStorage.getItem('categories')),
                        "categoriesArray" : _.pluck(JSON.parse(sessionStorage.getItem('categories')), ["name"]),
						"locations": JSON.parse(sessionStorage.getItem('locations')),
						"locationsArray": _.pluck(JSON.parse(sessionStorage.getItem('locations')), ["cityName"])
                    });
					App.DateUtil.setCategoriesToCatlog(courses.courses);
                    if (courses.length == 0) {
                        model.set('status', 'No courses to display');
                    }
                    return model
                }, function (error) {
                    return model;
                })
            },
			actions:{
				openUserSelectionModel: function (planid) {
					Ember.TEMPLATES['plpUsersOutlet'] = Ember.Handlebars.compile(plpUsersModelTemplate);
					this.render('plpUsersOutlet', {
						into: 'catalog',
						outlet: 'plpUsersOutlet'
					});
					if(planid){this.controllerFor('catalog').set('selectedPlpids', [planid]);}
					jQuery('#plpDateError').hide();
				},
                cancelAddToLp: function () {
                    this.controllerFor('catalog').set("learningPlanName", "");
                    this.controllerFor('catalog').set("model.errors", "");
                },
				openPopupTemplate: function(firstLevelCategories, collapsedCategories, title){
					var popupCategories = firstLevelCategories.concat(collapsedCategories);
					Ember.set(this.controllerFor('catalog'), "popupCategories", popupCategories);
					Ember.set(this.controllerFor('catalog'), "categoryTitle", title);
					Ember.TEMPLATES['popupTemplate'] = Ember.Handlebars.compile(modalPopupTemplate);
                    this.render('popupTemplate', {
                        into: 'catalog',
                        outlet: 'popupTemplate'
                    });		
				}
			}
        });
    });