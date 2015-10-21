"use strict";
define(["app", "httpClient", "Q", "text!templates/formallearning/shared.hbs", "pages/trainingCatalog", "emberPageble", "pages/messageModelHide", "services/formallearning/courseService", "services/formallearning/userService"],
    function (app, httpClient, Q, sharedTemplate, trainingCatalog, emberPageble, messageModelHide, courseService, learningUserServices) {

        App.SharedRoute = Ember.Route.extend({
			queryParams: {
                searchText: {
                    refreshModel: true
                }				
            },
            setProperties: function(key, val) {
                this.controllerFor('shared').set(key, val);
            },
            setupControllers: function (controller, model) {
                var allFacets = {
                    Category : _.pluck(JSON.parse(sessionStorage.getItem('categories')),"name"),
                    Type: JSON.parse(sessionStorage.getItem('types'))
                }
                controller.set("allFacets", allFacets);
                controller.courses.set("currentPage", 1);
                controller.set('courses.data', model.courses);
                controller.set('model', model);
            },
            model: function (queryParams) {
                var self = this;
                var model = Ember.Object.create({
                    "courses": [],
                    "types": JSON.parse(sessionStorage.getItem('types')),
                    "categories": JSON.parse(sessionStorage.getItem('categories')),
                    "categoriesArray": _.pluck(JSON.parse(sessionStorage.getItem('categories')), ["name"])
                });
				_.each(queryParams, function(val, key) {
					self.setProperties(key, val);
				});
               return learningUserServices.getSharedList().then(function (sharedList) {
                     var sharedCourses = _.filter(sharedList.data, function (share) {
                            return share.type == "course";
                        }), 
                        courseIds = _.pluck(sharedCourses, 'id');
                    if (courseIds.length == 0) {
                        model.status = "No shared courses ";
                        model.set("nodata", 1);
                        return model;
                    } else {
                        model.set("nodata", 0);
                        model.set("courseIds", courseIds);
                        model.set("sharedCourses", sharedCourses);
                    }
					var selectedType = self.controllerFor("shared").get('searchTermType') ? self.controllerFor("shared").get('searchTermType') : "",
						selectedCategory = self.controllerFor("shared").get('searchTermCategory') ? self.controllerFor("shared").get('searchTermCategory') : "";
					var selectedFilters = {
							courseIds: courseIds,
							limitTo: app.Infinity,
							type: selectedType,
							category: selectedCategory
						};
					selectedFilters["query"] = self.controllerFor('shared') ? self.controllerFor('shared').get("searchText") : '';
                    return courseService.getCourses(selectedFilters).then(function (courses) {
                        if (courses.courses.length == 0) {
                            model.status = "No shared courses";
                            model.set("nodata", 1);
                            return model;
                        }
                        courses = self.controllerFor("shared").formatCourse(courses.courses, sharedCourses);
                        model.set("nodata", 0);
                        model.set("courses", courses);

                        model.courses.sort(self.activitySorter)

                        App.StatsUtil.getCourseLikesCount(courseIds)
                            .then(function (_likedCourses) {
                                var _favoritedCourses = model.courses;
                                _.each(_likedCourses, function (course) {
                                    var match = _.where(_favoritedCourses, {
                                        id: parseInt(course._id)
                                    });
                                    if (match) {
                                        _.each(match, function (_course, ind) {
                                            _course.stats.set("likes", course.count);
                                        })
                                    }
                                });

                            });
                        App.StatsUtil.getCourseCommentsCount(courseIds)
                            .then(function (courseComments) {
                                var _favoritedCourses = model.courses;
                                _.each(courseComments, function (course) {
                                    var match = _.where(_favoritedCourses, {
                                        id: parseInt(course._id)
                                    });
                                    if (match) {
                                        _.each(match, function (_course, ind) {
                                            _course.stats.set("comments", course.entries[0].value.comments.length);
                                        })
                                    }
                                });

                            });
                        App.StatsUtil.getViewCount(courseIds)
                            .then(function (viewStats) {
                                var _favoritedCourses = model.courses;
                                _.each(viewStats, function (viewStat) {
                                    var match = _.where(_favoritedCourses, {
                                        id: parseInt(viewStat.objectId)
                                    });
                                    if (match) {
                                        _.each(match, function (_course, ind) {
                                            _course.stats.set("views", viewStat.views);
                                        });
                                    }
                                });

                            });
                        return model;
                    }, function (error) {
                        return model;
                    });
                  }, function (error) {
                    return model;
                })  
            },
            activitySorter: function comp(a, b) {
                return new Date(b.sharedDate).getTime() - new Date(a.sharedDate).getTime();
            }
        });
    });