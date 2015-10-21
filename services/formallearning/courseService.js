define(['app', 'httpClient', 'underscore', 'Q'], function (app, httpClient, _, Q) {

    var learningPlanGetRequest = function (URL, params) {
        var learningPlanGetRequest = constructLearningPlanRequest(URL, params);
        return httpClient.get(learningPlanGetRequest)
            .then(function (responseData) {
                return responseData;
            })
    };
    var learningPlanPostRequest = function (URL, body) {
        return httpClient.post("/knowledgecenter/ka/" + URL, body)
            .then(function (genericSearchResponse) {
                return genericSearchResponse;
            })
    };

    var constructLearningPlanRequest = function (URL, params) {
        var params = $.param(params);
        return "/knowledgecenter/ka/" + URL + "?" + params;
    };

    return {


        getCourseFilters: function () {
            return httpClient.get('/knowledgecenter/ka/proxy/lms/filter');
        },

        /**
         * searchCriterial ={query:, enrol:, type:, category }
         * @param searchCriteria
         * @param cb
         * @returns {*}
         */
        getCourses: function (searchCriteria, cb) {
            var self = this;
            var endPoint = "/knowledgecenter/ka/lms/user/courses";
            searchCriteria = searchCriteria ? searchCriteria : {};
            var courseDetails = {
                "query": searchCriteria.query,
                "enrol": searchCriteria.enrol,
                "type": searchCriteria.type,
                "category": searchCriteria.category,
                "courseIds":searchCriteria.courseIds,
                "limitTo": searchCriteria.limitTo ?  searchCriteria.limitTo :  searchCriteria.pageNumber ? (searchCriteria.pageNumber) * app.PageSize : app.PageSize, 
                "limitFrom":searchCriteria.limitFrom ? searchCriteria.limitFrom : searchCriteria.pageNumber ? (searchCriteria.pageNumber - 1) * app.PageSize : 0,
                "sortColumn":searchCriteria.sortByName ? searchCriteria.sortByName : "",
                "sortBy":searchCriteria.sortByType ? searchCriteria.sortByType: 0,
                "location":searchCriteria.location,
                "date":searchCriteria.date,
                "startDate":searchCriteria.startDate ? searchCriteria.startDate : 0,
                "endDate":searchCriteria.endDate ? searchCriteria.endDate : 0,
                "reporteesUsername": searchCriteria.reporteesUsername ? searchCriteria.reporteesUsername : ""
            };
            return httpClient.get(endPoint, courseDetails, {"stringify": "true"});
        },

        //to get course details
        getCourseDetails: function(courseId, courseType){
            var endPoint = "/knowledgecenter/ka/lms/user/course/"+ courseId;
            var data = {
                type: courseType
            }
            return httpClient.get(endPoint, data, {"stringify":"true"});
        },

        //to enroll session
        enrollSession: function(courseid, sessionid, managerApproval){
            managerApproval = managerApproval ? true : false;
            var endPoint = "/knowledgecenter/ka/lms/course/" + courseid + "/" + sessionid + "/enrollments" + "?approvalRequired=" + managerApproval;
            var data = {
                sessionId: sessionid,
                "fields": "enrollSession"
            };
            return httpClient.post(endPoint, data);
        },

        //to cancel Session
        cancelSession: function(enrollmentId, courseId, sessionId){
            var endPoint = "/knowledgecenter/ka/lms/enrollment/" + enrollmentId + "/drop";
            var data = {
                "fields": "unenrollSession",
                "entityType" : "COURSE",
                "courseId": courseId,
                "sessionId": sessionId
            };
            return httpClient.put(endPoint, data);
        },

        //to enroll course
        enrollCourse: function (courseid, managerApproval) {
            managerApproval = managerApproval ? true : false;
            var enrollEndpoint = "/knowledgecenter/ka/lms/course/" + courseid + "/enrollments" + "?approvalRequired=" + managerApproval,
                body = {
                    "objectType": "course",
                    "verb": "enroll",
                    "tenantId": "30",
                    "fields": "enrollCourse"
                };
            return  httpClient.post(enrollEndpoint, body);
        },

        //cancel course
        cancelEnrollCourse: function (enrollmentId, courseId) {
            var endPoint = "/knowledgecenter/ka/lms/enrollment/" + enrollmentId + "/drop";
            var body = {
                "fields": "unenrollCourse",
                "entityType" : "COURSE",
                "courseId": courseId
            };
            return  httpClient.put(endPoint, body);
        },
        //update markComplete
        updateMarkComplete: function(activityId, courseid){
            var endPoint = "/knowledgecenter/ka/lms/user/course/" + courseid;
            var data = {
                completionstate: 1,
                "fields": "markComplete",
                "coursemoduleid":activityId
            }
            return httpClient.put(endPoint, data);
        },
        //get quiz data
        getQuizData: function(courseId, quizId, wstoken){
            var endPoint = "/knowledgecenter/ka/proxy/lms/user/course/"+ courseId;
            var data = {
                "quizId": quizId,
                "wstoken": wstoken,
                "fields": "quizData",
                "courseId": courseId
            }
            return httpClient.get(endPoint, data, {"stringify":"true"});
        },
        //get quiz data
        getQuizReview: function(courseId, quizId, wstoken){
            var endPoint = "/knowledgecenter/ka/proxy/lms/user/course/"+ courseId;
            var data = {
                "quizId": quizId,
                "wstoken": wstoken,
                "fields": "quizReviewData"
            }
            return httpClient.get(endPoint, data, {"stringify":"true"});
        },
        //submitQuiz
        submitQuiz: function(courseid, data){
            var endPoint = "/knowledgecenter/ka/proxy/lms/user/course/" + courseid;
            var reqData = {
                quizData : data,
                fields : "submitQuiz"
            }
            return httpClient.put(endPoint, reqData);
        },
        //Recent Participants
        getRecentParticipants: function(params){
            var endPoint = "/knowledgecenter/ka/proxy/lms/user/course/" + params.courseid + "/participants"
            params = params ? params : {};
            var data = {
                sessionId: params.sessionid,
                completed: params.completed,
                month: params.month,
            }
            return httpClient.get(endPoint, data, {"stringify":"true"});
        },
        getLearnerReport: function (searchCriteria, cb) {
            var self = this;
            var endPoint = "/knowledgecenter/ka/lms/user/courses";
            searchCriteria = searchCriteria ? searchCriteria : {};
            var courseData = {
                "limitFrom":searchCriteria.limitFrom ? searchCriteria.limitFrom : searchCriteria.pageNumber ? (searchCriteria.pageNumber-1) * app.PageSize : 0,
                "limitTo": searchCriteria.limitTo ?  searchCriteria.limitTo :  searchCriteria.pageNumber ? (searchCriteria.pageNumber) * app.PageSize : app.PageSize,
                "jobTitle": searchCriteria.jobTitle ? searchCriteria.jobTitle : "",
                "manager": searchCriteria.manager ? searchCriteria.manager : "",
                "organization": searchCriteria.organization ? searchCriteria.organization : "",
                "type": searchCriteria.type,
                "startTime":searchCriteria.startDate ? searchCriteria.startDate : "",
                "endTime":searchCriteria.endDate ? searchCriteria.endDate : "",
                "fields": "getLearnerReport"
            };
            return httpClient.get(endPoint, courseData, {"stringify": "true"});
        },
        getListOfPendingApprovals: function() {
            var endPoint = "/knowledgecenter/ka/lms/enrollment/list";
            return httpClient.get(endPoint);
        },
        approveOrRejectEnrollment: function(id, approveType) {
            var endPoint = "/knowledgecenter/ka/lms/enrollment/"+ id +"/" + approveType;
            return httpClient.put(endPoint);
        }
    }
});