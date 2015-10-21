define(['app', 'moment'], function (App, moment) {
    App.DateUtil = Ember.Object.create({
        checkDateIsPassed: function (timeInSecons) {
            if (!timeInSecons) {
                return false;
            }
            var currentDate = new Date();
            currentDate.setDate(currentDate.getDate() - 1)
            var startDate = moment(timeInSecons * 1000);
            if (startDate <= currentDate) {
                return true;
            }
            return false;
        },
        dateForDescendingSorting: function (dateString) {
            return moment(dateString).valueOf() * -1;
        },

        millisecondsToTime: function (duration) {
            var seconds = parseInt(Math.round(duration / 1000) % 60)
                , minutes = parseInt((duration / (1000 * 60)) % 60)
                , hours = parseInt((duration / (1000 * 60 * 60)) % 24);

            hours = (hours < 10) ? "0" + hours : hours;
            minutes = (minutes < 10) ? "0" + minutes : minutes;
            seconds = (seconds < 10) ? "0" + seconds : seconds;

            return hours + ":" + minutes + ":" + seconds;

        },
        setDateForController: function (emberObject, date) {
            var setDate = date ? new Date(date) : new Date();
            emberObject.set("day", "" + setDate.getDate());
            emberObject.set("month", "" + (setDate.getMonth() - 1));
            emberObject.set("year", "" + setDate.getFullYear());
        },
        setDateForControllerLp: function (emberObject, date) {
            var setDate = date ? new Date(date) : new Date();
            emberObject.set("day", "" + setDate.getDate());
            emberObject.set("month", "" + (setDate.getMonth() + 1));
            emberObject.set("year", "" + setDate.getFullYear());
        },
        setMonthAndYear: function (emberObject) {
            var years = [],
                lastYear = (new Date()).getFullYear() + 3,
                stringMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                months = [];
            for (var year = (new Date()).getFullYear(); year <= lastYear; year++) {
                years.push({
                    label: "" + year,
                    value: "" + year
                })
            }
            for (var i = 1; i <= stringMonths.length; i++) {
                months.push({
                    label: "" + stringMonths[i - 1],
                    value: "" + i
                })
            }
            emberObject.set("years", years);
            emberObject.set("months", months);
        },
		setDateToLearningPlan: function(emberObject){
			var d = new Date();	var	t = d.getDate();var m = d.getMonth()+1;var y = d.getFullYear();
			currentDate = m+"/"+t+"/"+y
			emberObject.set("learningPlanDate", currentDate);
		},
		formatInputDateWithGmt: function(inputDate){
			var inputDateWithGMT = (new Date(inputDate).getTime() / 1000) + 86400;
			return inputDateWithGMT;
		},
		formatGmtDateToNormal: function(gmtDate){
			date = gmtDate - 86400;
			return date;
		},
        setMonthAndYearLp: function (emberObject) {
            var years = [],
                lastYear = (new Date()).getFullYear() + 3,
                stringMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                months = [];
            for (var year = (new Date()).getFullYear(); year <= lastYear; year++) {
                years.push({
                    label: "" + year,
                    value: "" + year
                })
            }
            for (var i = 1; i <= stringMonths.length; i++) {
                months.push({
                    label: "" + stringMonths[i - 1],
                    value: "" + i
                })
            }
            emberObject.set("years", years);
            emberObject.set("months", months);
        },
        searchFilterSelected: function (courses, allFacets, isLocationEnabled, isCategoryEnabled, isPlpType, isSplFilter) {
            var self = this;
            courses.set("currentPage", 1);
            var categoryArr = [],
                typeArr = [],
                locationArr = [],
                filters = courses.filters.split(";"),
                managerArr = [],
                jobTitleArr = [],
                organizationArr = [],
                allFacets = {};
            _.each(filters, function (filter) {
                var visualFilters = filter.split(":"),
                    isCatlog = courses.content.isCatlog;
                if (visualFilters[0] == "Category") {
                    categoryArr.push(visualFilters[1]);
                } else if (visualFilters[0] == "Type") {
                    if (visualFilters[1] == "WebEx Meeting") {
                        typeArr.push("\'" + "WBT" + "\'");
                    }else if (visualFilters[1] == "Instructor Led Training") {
                        typeArr.push("\'" + "ILT" + "\'");
                    } else if(visualFilters[1] == "Prescribed"){
                        typeArr.push(visualFilters[1]);					
                    }else if(visualFilters[1] == "Individual"){
                        typeArr.push(visualFilters[1]);					
                    }else {
                        typeArr.push("\'" + visualFilters[1] + "\'");
                    }
                } else if (visualFilters[0] == "Location") {
                    locationArr.push(visualFilters[1]);
                }else if(visualFilters[0] == "managerId"){
                    managerArr.push("\'" + visualFilters[1] + "\'");					
                }else if(visualFilters[0] == "jobTitle"){
                    jobTitleArr.push("\'" + visualFilters[1] + "\'");					
                }else if(visualFilters[0] == "organization"){
                    organizationArr.push("\'" + visualFilters[1] + "\'");					
                }
                
            });
            if(isCategoryEnabled){
                var catIds = [];
                var categories = courses.content.categories;
                _.each(categoryArr, function (name, index) {
                    _.each(categories, function (catObj, key) {
                        if (catObj.name === name) {
                            catIds.push(catObj.id);
                        }
                    });
                });
                courses.set('catIds', catIds);
                allFacets["Category"] = _.difference(_.pluck(JSON.parse(sessionStorage.getItem('categories')), "name"), categoryArr);
            }
            if (isLocationEnabled) {
                var cityIds = [];
                var locations = courses.content.locations;
                _.each(locationArr, function (cityName, index) {
                    _.each(locations, function (cityObj, key) {
                        if (cityObj.cityName === cityName) {
                            cityIds.push(cityObj.cityId);
                        }
                    });
                });
                courses.set('cityIds', cityIds);
                allFacets["Location"] = _.difference(_.pluck(JSON.parse(sessionStorage.getItem('locations')), "cityName"), locationArr)
                if(locationArr.length > 0 && typeArr.indexOf("ILT") < 0) typeArr.push("'ILT'");
            }
            if(isPlpType){
                courses.set('typeArr', typeArr);
                allFacets["Type"] = _.difference(JSON.parse(sessionStorage.getItem('plpTypes')), typeArr);
            }else{
                courses.set('typeArr', typeArr);
                allFacets["Type"] = _.difference(JSON.parse(sessionStorage.getItem('types')), typeArr);
            }
            if(isSplFilter){
                courses.set('managerArr', managerArr);
                allFacets["managerId"] = _.difference(JSON.parse(sessionStorage.getItem('managerId')), managerArr);
                courses.set('jobTitleArr', jobTitleArr);
                allFacets["jobTitle"] = _.difference(JSON.parse(sessionStorage.getItem('jobTitles')), jobTitleArr);
                courses.set('organizationArr', organizationArr);
                allFacets["organization"] = _.difference(JSON.parse(sessionStorage.getItem('organizations')), organizationArr);			
            }
            courses.set("allFacets", allFacets);
        },
        convertToHHMM: function (min) {
            var secs = min * 60,
                hours = Math.floor(secs / (60 * 60)),
                divisor_for_minutes = secs % (60 * 60),
                minutes = Math.floor(divisor_for_minutes / 60),
                divisor_for_seconds = divisor_for_minutes % 60,
                seconds = Math.ceil(divisor_for_seconds);
            if (hours != 0) {
                hours = hours + ' hour(s) '
            } else {
                hours = ""
            }
            if (minutes != 0) {
                minutes = minutes + ' minute(s) '
            } else {
                minutes = ""
            }
            var time = hours + minutes;
            return time;
        },
        setCategoriesToCatlog:function(courses){
             for (var i = 0; i < courses.length; i++) {
                var parentCategory = (courses[i].category).get('firstObject');
                var lastCategory = (courses[i].category).get('lastObject');
                courses[i].displayCategory = {"parentCategoryId":parentCategory.categoryid, "parentCategoryName":parentCategory.categoryname, "lastCategoryId":lastCategory.categoryid, "lastCategoryName": lastCategory.categoryname};
                courses[i].iltViewType = courses[i].courseType == "ILT" ? "Instructor Led Training" : courses[i].courseType;
                if (courses[i].enrollStatus == "PENDING") {
                    courses[i].pendingApproval = true;
                    courses[i].isUserEnroled = true;
                } else if (courses[i].enrollStatus == "APPROVED") {
                    courses[i].isUserEnroled = true;
                }
            }
        },
        validateStartDateAndEndDate: function (startDate, endDate) {
			var unixStartDate = new Date(startDate)/1000;
			var unixEndDate = new Date(endDate)/1000;
				unixEndDate = unixEndDate + 86400;
			if (unixEndDate < unixStartDate) {
				$.gritter.add({title: '', text: 'End date should be feature date', class_name: 'gritter-error'});
			}else{
				return {startDate: unixStartDate, endDate: unixEndDate}
			}
			
        },
        getGMTStartDateAndEndDate: function (startDate, endDate) {
            if(startDate && endDate){
                var unixStartDate = new Date(startDate)/1000;
                var unixEndDate = new Date(endDate)/1000;
                unixEndDate = unixEndDate + 86400;
                return {startDate: unixStartDate, endDate: unixEndDate}
            }else{
                return {startDate: "", endDate: ""}
            }
        },
        splitDate: function (iDate){
            var sDate = iDate.split('/');
            return sDate;
        },
        sessionFilter: (function () {
            var datefilter = {};
            datefilter.getFilters = function (sessions, isEndDate, dateFieldName, getRange) {
                var filters = {},
                    unixDates = [],
                    dates = [];
                dateFieldName = dateFieldName ? dateFieldName : "sessionStartdate";
                if (!sessions) {
                    return undefined
                }

                sessions.forEach(function (session) {
                    if (!session[dateFieldName]) {
                        console.log("Session " + dateFieldName + " not present");
                        return undefined;
                    }

                    var unixDate = parseInt(session[dateFieldName]) * 1000;
                    var date = new Date(unixDate);
                    var day = isEndDate ? date.getDate() + 1 : date.getDate(),
                        month = date.getMonth() + 1,
                        year = date.getFullYear();

                    var rangeStringDate = month + "/" + day + "/" + year;
                    if (!(unixDates.indexOf((new Date(rangeStringDate)).getTime()) > -1)) unixDates.push((new Date(rangeStringDate)).getTime());
                });
                unixDates.sort();
                unixDates.forEach(function (unixdate) {
                    var date = new Date(unixdate);
                    var day = isEndDate ? date.getDate() - 1 : date.getDate(),
                        month = date.getMonth() + 1,
                        year = date.getFullYear();
                    dates.push(day + "/" + month + "/" + year);
                });

                if (getRange) {
                    for (var i = 0; i < dates.length; i++) {
                        if (unixDates[i + 1]) {
                            filters[dates[i]] = unixDates[i] + "-" + unixDates[i + 1];
                        } else {
                            filters[dates[i]] = unixDates[i];
                        }
                    }
                } else {
                    for (var i = 0; i < dates.length; i++) {
                        filters[dates[i]] = unixDates[i];
                    }
                }
                return filters;
            };

            datefilter.getSessions = function (sessions, filterVal, isEndDate, stardateFieldName, enddateFieldName) {
                var filteredSessions = [];

                var dateRanges = [];
                if (isNaN(filterVal)) {
                    dateRanges = filterVal.split("-");
                } else {
                    dateRanges.push(filterVal);
                }
                if (!sessions) {
                    return filteredSessions;
                }

                stardateFieldName = stardateFieldName ? stardateFieldName : "sessionStartdate";
                enddateFieldName = enddateFieldName ? enddateFieldName : "sessionEnddate";

                if (dateRanges.length == 2) {
                    sessions.forEach(function (session) {
                        if (!session[stardateFieldName] || !session[enddateFieldName]) {
                            console.log("Session " + stardateFieldName + "," + enddateFieldName + " not present");
                            return filteredSessions;
                        }
                        if (((session[stardateFieldName] * 1000) >= dateRanges[0]) && ((session[enddateFieldName] * 1000) < dateRanges[1])) {
                            filteredSessions.push(session);
                        }
                    });

                } else if (dateRanges.length == 1) {
                    if (isEndDate) {
                        sessions.forEach(function (session) {
                            if (!session[enddateFieldName]) {
                                console.log("Session " + enddateFieldName + " not present");
                                return filteredSessions;
                            }
                            if (((session[enddateFieldName] * 1000) <= dateRanges[0])) {
                                filteredSessions.push(session);
                            }
                        });
                    } else {
                        sessions.forEach(function (session) {
                            if (!session[stardateFieldName]) {
                                return filteredSessions;
                            }
                            if (((session[stardateFieldName] * 1000) >= dateRanges[0])) {
                                filteredSessions.push(session);
                            }
                        });
                    }

                } else {
                    return filteredSessions;
                }
                return filteredSessions;
            }
            return datefilter;
        })()
    });
});