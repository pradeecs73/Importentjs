"use strict";

define(["app", "httpClient", "Q", "text!templates/formallearning/shared.hbs", "pages/trainingCatalog", 'emberPageble', "pages/messageModelHide", "services/formallearning/courseService"],
    function (app, httpClient, Q, sharedTemplate, trainingCatalog, emberPageble, messageModelHide, courseService) {

        App.SharedController = Ember.ObjectController.extend({
			queryParams:['searchText'],
            _currentView: "list-view",
            shared: true,
            allFacets: {},
			searchTermType: '',
			searchTermCategory: '',
            filters: '',
			searchText: '',
			sortByName:"",
            sortOrder: 'asc',
			sortByType:0,
			sortableFields:[
              {text:'Name', value:'title'},
              {text:'Delivery Type', value:'deliverytype'},
			  {text:'Shared by', value:'sharedby'},
			  {text:'Date Shared', value:'dateshared'}
              ],
            isGridView: function () {
                return this.get('_currentView') == 'grid-view';
            }.property("_currentView"),
            courses: Ember.ArrayController.createWithMixins(VG.Mixins.Pageable, {
                perPage: app.PageSize
            }),
            activitySorter: function comp(a, b) {
                return new Date(b.sharedDate).getTime() - new Date(a.sharedDate).getTime();
            },
            formatCourse: function (courses, sharedCourses) {
                var model = this.get("model"),
                    sharedCourses = sharedCourses ? sharedCourses : model.get("sharedCourses");
                for (var i = 0; i < courses.length; i++) {
                    var course = courses[i];
                    var sharedCourse = _.find(sharedCourses, function (share) {
                        return share.id == course.id
                    });
                    if (course.isWebex || course.isIlt) {
                        course.hideRegister = true;
                    }
					trainingCatalog.pendingApprovalStatus(course);
                    course.shared = true;
                    course.sharedBy = sharedCourse.sharedByDisplayName
                    course.sharedByEmail = sharedCourse.sharedBy;
                    course.isGridView = this.isGridView ? this.isGridView() : this.get('_currentView') == 'grid-view';
                    for (var j = 0; j < sharedCourse.entityShares.length; j++) {
                        if (app.getUsername() == sharedCourse.entityShares[j].share) {
                            course.comment = sharedCourse.entityShares[j].comment;
							course.sharedDate = moment(sharedCourse.entityShares[j].date).unix();
                            break;
                        }
                    }
                }
                return courses;
            },
            filterSelected: function (courses, filters, allFacets) {
                App.DateUtil.searchFilterSelected(courses, allFacets, false, true);
                var self=this,
                    model = self.get("model"),
                    courseIds = model.get("courseIds"),
                    catIds = courses.content.get('catIds'),
                    typeArr = courses.content.get('typeArr');
                var searchCriteria = {
                    "query": this.get('searchTermCriteria'),
                    "category": catIds.join(','),
                    "type": typeArr.join(','),
                    "courseIds": courseIds,
                    'limitTo':app.Infinity
                };
                this.set('searchTermCategory', searchCriteria.category);
                this.set('searchTermType', searchCriteria.type);
                courseService.getCourses(searchCriteria).then(function (response) {
                    var courses = response.courses;
                    if (courses.length == 0) {
                        model.status = "No shared courses";
                        model.set("nodata", 1);
                        self.courses.setProperties({"currentPage": 1, "data": courses});
                        return;
                    }
                    var sharedCourses = model.get("sharedCourses");
                    model.set("nodata", 0);
                    for (var i = 0; i < courses.length; i++) {
                        var course = courses[i];
                        var sharedCourse = _.find(sharedCourses, function (share) {
                            return share.id == course.id
                        })
                        course.shared = true;
                        course.sharedBy = sharedCourse.sharedByDisplayName;
                        course.sharedByEmail = sharedCourse.sharedBy;
                        course.isGridView = self.isGridView;
						trainingCatalog.pendingApprovalStatus(course);
                          for (var j = 0; j < sharedCourse.entityShares.length; j++) {
                            if (app.getUsername() == sharedCourse.entityShares[j].share) {
                                course.comment = sharedCourse.entityShares[j].comment;
                                course.sharedDate = sharedCourse.entityShares[j].date
                                break;
                            }
                        }
                    }
                   courses.sort(self.activitySorter)
                   self.courses.setProperties({"currentPage": 1, "data": courses});
                });
            }.observes('filters'),
            actions: {
                search: function () {
                    var self = this,
                        query = this.get("searchText"),
                        model = this.get("model"),
                        courseIds = model.get("courseIds"),
                        courseCriteria = {
                            "query": query,
                            "courseIds": courseIds,
                            'limitTo':app.Infinity
                        };
                    courseService.getCourses(courseCriteria).then(function (responseData) {
                        var courses = responseData.courses;
                        if (courses.length == 0) {
                            model.status = "No shared courses";
                            model.set("nodata", 1);
                            self.set('courses.data', courses);
                            return;
                        }
                        courses = self.formatCourse(courses);
                        model.set("nodata", 0);
                        courses.sort(self.activitySorter);
                        self.courses.setProperties({"currentPage": 1, "data": courses});
                    })
                },
                sortCoursesByHeader: function (sortName) {
                    var self = this,
                        query = this.get("searchText"),
                        model = this.get("model");
                    var courseIds = model.get("courseIds");
					self.set("showMessage", false);
						if (sortName == "sharedby" || sortName == "dateshared") {
							self.set("sortByName", "");
						}else{self.set("sortByName", sortName);}
                        var courseDetails = {
                            "query": query,
                            "courseIds": courseIds,
                            "sortByName":self.get('sortByName'),
							"sortByType":self.controllerFor('shared').get('sortByType'),
                            'limitTo':app.Infinity
                        };
                    courseService.getCourses(courseDetails).then(function (response) {
                        var courses = response.courses;
                        if (response) {
                            if (courses.length == 0) {
                                model.status = "No shared courses";
                                model.set("nodata", 1);
                                self.set('courses.data', courses);
                                return;
                            }
                            courses = self.formatCourse(courses);
                            model.set("nodata", 0);
							if (sortName == "sharedby") {
								if(self.controllerFor('shared').get('sortByType') == 1){courses = _.sortBy(courses, "sharedBy");
								}else{courses = _.sortBy(courses, "sharedBy").reverse();}
							} else if (sortName == "dateshared"){
								if(self.controllerFor('shared').get('sortByType') == 0){courses = _.sortBy(courses, "sharedDate");
								}else{courses = _.sortBy(courses, "sharedDate").reverse();}
							}
							self.set("sortByName", sortName);
                            self.courses.setProperties({"currentPage": 1, "data": courses});
                        } else {
                            self.showStatusMessage('alert-danger', 'icon-remove', 'Error in course sorting.');
                        }
                    });
                },
				toggleSortOrder: function(){
					var sortName = this.controllerFor('shared').get('sortByName') ? this.controllerFor('shared').get('sortByName') == "" : "title" ;
					if(!sortName){sortName = this.controllerFor('shared').get('sortByName')}
					if(this.sortOrder == 'asc') {this.set('sortOrder', 'desc'); this.controllerFor('shared').set('sortByType', 0)}
					else {this.set('sortOrder', 'asc'); this.controllerFor('shared').set('sortByType', 1)}
					this.send('sortCoursesByHeader', sortName);
				},
                updateSortBy: function(sortName) {
					this.set('sortByName', sortName);
					this.send('sortCoursesByHeader', sortName);
                },
                filter: function (filters) {
                    this.set('filters', filters.join(';'));
                    this.set('pageNumber', 1);
                },
				disabledCourse: function() {
                    $.gritter.add({title:'', text: 'Sorry, new registrations are disabled to this course.', class_name: 'gritter-error'});
                }
            }
        })
        ;
    })
;