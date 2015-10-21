define(['httpClient'], function(httpClient){
    var plpDetailsData = function(plp) {
        var self = this;
        var planCourse = [];
        _.each(plp.learningPlansData.learningPlanItems, function (course) {
            switch(course.modulename){
                case "extendedilt":
                    course.isILT = true;
                    break;
                case "elearningurl":
                case "thirdpartycontent":
                    course.isELearning = true;
                    break;
                case "cisscorm":
                    course.isScorm = true;
                    break;
                case "quiz":
                    course.isAssessment = true;
                    break;
                case "webexactivity":
                    course.isWebEx = true;
                    break;
            }
            if (plp.learningPlansData.enrollStatus == "PENDING") {
                    plp.learningPlansData.pendingApproval = true;
                    plp.learningPlansData.status = 1;
            }
            if (plp.learningPlansData.enrollStatus == "APPROVED") {
                plp.learningPlansData.status = 1;
            }
            if (course.enrollStatus == "PENDING" ) {
                    course.pendingApproval = true;
                    course.courseCompleted = 1;
            }
            if(plp.learningPlansData.status && (course.isELearning || course.isAssessment || course.isScorm)){
                course.showRegister = true;
            }
            if (course.course_completed == "Not Registered") {
                course.courseCompleted = 0;
            } else if (course.course_completed == "Registered") {
                course.courseCompleted = 1;
            } else if (course.course_completed == "completed") {
                course.courseCompleted = 2;
                course.isCourseCompleted = true;
            }
            planCourse.push(course);
            
        });
    };
	
	var prescribedLearningPlanStatus = function(plp) {
        if (plp.type == "Prescribed") {
			switch(plp.status) {
				case 0:
					plp.status = "Not Registered";
					break;
				case 1:
					plp.status = "Registered";
					break;
				case 2:
					plp.status = "In-progress";
					break;
				case 3:
					plp.status = "Completed";
					break;
			}
		} else {
			plp.status = "NA";
		}
	};
	
	var learningPlanHelper = function(learningPlan){
		_.each(learningPlan, function (learningPlan) {
			learningPlan.status = learningPlan.status == " " ? 0 : learningPlan.status;
				if (learningPlan.type == "Prescribed") {
					learningPlan.isTypePLP = true;
					if (learningPlan.enrollStatus == "PENDING") {
						learningPlan.pendingApproval = true;
						learningPlan.status = 1;
					}
					if (learningPlan.enrollStatus == "APPROVED") { learningPlan.status = 1; }
					switch(learningPlan.status) {
						case 0: 
							learningPlan.plpRegistered = false;
							learningPlan.plpAppeared = false;
							break;
						case 1:
							learningPlan.plpRegistered = true;
							learningPlan.plpAppeared = false;
							break;
						case 2:
							learningPlan.plpRegistered = true;
							learningPlan.plpAppeared = true;
							break;
						case 3:
							learningPlan.plpRegistered = false;
							learningPlan.plpAppeared = true;
							break;
					}
					if (learningPlan.learningPlanItems && learningPlan.enforceorder == 1) {
						for (var i = 0; i < learningPlan.learningPlanItems.length; i++) {
							if (learningPlan.learningPlanItems[i].courseCompleted != "completed") {
								learningPlan.learningPlanItems[i].isLaunch = true;
								break;
							}
						}
					}
				}

				_.each(learningPlan.learningPlanItems, function (val) {
					switch(val.moduleName){
						case "extendedilt":
							val.isILT = true;
							break;
						case "elearningurl":
						case "thirdpartycontent":
							val.isELearning = true;
							break;
						case "cisscorm":
							val.isScorm = true;
							break;
						case "quiz":
							val.isAssessment = true;
							break;
						case "webexactivity":
							val.isWebEx = true;
							break;
					}
					if (val.enrollStatus == "PENDING") {
						val.pendingApproval = true;
						val.courseCompleted = 1;
					}

					if(learningPlan.status && (val.isELearning || val.isAssessment || val.isScorm)){
						val.showRegister = true;
					}

					if (val.courseCompleted == "Not Registered") {
						val.courseCompleted = 0;
					} else if (val.courseCompleted == "Registered") {
						val.courseCompleted = 1;
					} else if (val.courseCompleted == "completed") {
						val.courseCompleted = 2;
						val.isCourseCompleted = true;
					}
				});
			});
	};
	
	var filterBySkillsAndJobroles = function(model, filters) {
		var skillsArr = [],
			jobroleArr = [],
			jobroleFilterArr = [],
			skillFilterArr = [];
		var filterData = filters.split(";");
		_.each(filterData, function (filter) {
			var searchFilters = filter.split(":");
			if (searchFilters[0] == "JobRoles") {
				jobroleFilterArr.push(searchFilters[1]);
				jobroleArr.push("\'" + searchFilters[1] + "\'");
			} else if (searchFilters[0] == "Skills"){
				skillFilterArr.push(searchFilters[1]);
				skillsArr.push("\'" + searchFilters[1] + "\'");
			}
		});
		var skillsWithName = _.pluck(JSON.parse(sessionStorage.getItem('skills')), "name");
		var jobroleWithName = _.pluck(JSON.parse(sessionStorage.getItem('jobRoles')), "name");
		var serachFilter = {
			"jobrole": jobroleArr.join(','),
			"skill": skillsArr.join(',')
		};
		model.serachFilter = serachFilter;
		var self = this;
		var allSkillFilters = {
			JobRoles: _.difference(jobroleWithName, jobroleFilterArr),
			Skills: _.difference(skillsWithName, skillFilterArr)
		};
		model.serachFilters = allSkillFilters;
	};
    
    return {
        plpDetailsData: plpDetailsData,
        prescribedLearningPlanStatus: prescribedLearningPlanStatus,
		filterBySkillsAndJobroles: filterBySkillsAndJobroles,
		learningPlanHelper:learningPlanHelper
    };

   
});