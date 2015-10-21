define(['app', 'httpClient', 'underscore', 'Q'], function (app, httpClient, _, Q) {
    return {
        fetchLearningPlans: function (keyword) {
            var endPoint = "/knowledgecenter/ka/lms/user/lps/all";
            var queryParams = {
                "keyword": keyword.keyword,
                "limitTo": keyword.limitTo ? keyword.limitTo : keyword.pageNumber ? (keyword.pageNumber) * app.PageSize : app.PageSize,
                "limitFrom": keyword.limitFrom ? keyword.limitFrom : keyword.pageNumber ? (keyword.pageNumber - 1) * app.PageSize : 0,
                "startDate": keyword.startDate,
                "endDate": keyword.endDate,
                "reporteesUsername": keyword.reporteesUsername ? keyword.reporteesUsername : ""
            };
            return httpClient.get(endPoint, queryParams, {"stringify": "true"}).then(function (response) {
                return response;
            });
        },
        enrollOrDropPrescribedLearningPlan: function (learningPlanId, actionType, enrollmentId, managerApproval) {
            managerApproval = managerApproval ? true : false;
            var enrolPLP = "/knowledgecenter/ka/lms/lp/" + learningPlanId + "/enrollments?approvalRequired=" + managerApproval,
                dropPLP = "/knowledgecenter/ka/lms/enrollment/" + enrollmentId + "/drop",
                body = {"entityType": "LEARNING_PLAN", "learningPlanId": learningPlanId};
            httpRequest = actionType == "drop" ? httpClient.put(dropPLP, body) : httpClient.post(enrolPLP);
            return  httpRequest;
        },
        deletePrescribedLearningPlan: function (learningPlanId, type, status) {
            var endPoint = "/knowledgecenter/ka/proxy/lms/user/learningPlan/" + learningPlanId,
                body = {
                    "status": status,
                    "type": type,
                    "actions": "registerAndDropPLP"
                };
            return  httpClient.put(endPoint, body);
        },
        getPLPdetails: function (plpId) {
            var endPoint = "/knowledgecenter/ka/lms/user/lp/" + plpId;
            return httpClient.get(endPoint);
        },
        createIndividualLearningPlan: function (learningPlanName, completeByDate, courseId) {
            var endPoint = "/knowledgecenter/ka/lms/user/lps",
                body = {
                    "planName": learningPlanName,
                    "completeByDate": completeByDate,
                    "courseId": courseId
                };
            return  httpClient.post(endPoint, body);
        },
        updateIndividualLearningPlan: function (learningPlanId, learningPlanName, completeByDate) {
            var endPoint = "/knowledgecenter/ka/lms/user/learningPlan/" + learningPlanId,
                body = {
                    "planName": learningPlanName,
                    "completeByDate": completeByDate,
                    "actions": "updateILP"
                };
            return  httpClient.put(endPoint, body);
        },
        addCourseToLearningPlan: function (learningPlanId, courseId, oldLearningPlanId, learningPlanItemId) {
            var itemData = {courseId: courseId.toString(), status: 1, oldLearningPlanId: oldLearningPlanId ? oldLearningPlanId : undefined, learningPlanItemId: learningPlanItemId ? learningPlanItemId : undefined, "actions": "addCourse"};
            var endPoint = "/knowledgecenter/ka/lms/user/learningPlan/" + learningPlanId;
            return  httpClient.put(endPoint, itemData).then(function (response) {
                return response;
            });
        },
        deleteIndividualLearningPlan: function (learningPlanId) {
            var endPoint = "/knowledgecenter/ka/lms/user/learningPlan/" + learningPlanId;
            return  httpClient.del(endPoint);
        },
        createIndividualLearningPlanTask: function (learningPlanId, taskDesc, status) {
            var endPoint = "/knowledgecenter/ka/lms/user/learningPlan/" + learningPlanId,
                body = {
                    "taskDesc": taskDesc,
                    "status": status,
                    "actions": "addTask"
                };
            return  httpClient.put(endPoint, body);
        },
        deleteIndividualLearningPlanTask: function (learningPlanId, learningPlanItemId) {
            var endPoint = "/knowledgecenter/ka/lms/user/learningPlan/" + learningPlanId,
                body = {
                    "learningPlanItemId": learningPlanItemId,
                    "actions": "deleteTask"
                };
            return  httpClient.put(endPoint, body);
        },
        updateIndividualLearningPlanTask: function (learningPlanItemId, taskDesc) {
            var endPoint = "/knowledgecenter/ka/lms/user/learningPlan/" + learningPlanItemId,
                body = {
                    "lp_item_id": learningPlanItemId,
                    "taskdesc": taskDesc,
                    "actions": "updateTask"
                };
            return  httpClient.put(endPoint, body);
        },
        fetchPrescribedLearningPlan: function (queryParams) {
            var endPoint = "/knowledgecenter/ka/proxy/lms/learningPlans/prescribed";
            queryParams = {
                'jobrole': queryParams.jobrole ? queryParams.jobrole : '',
                'skill': queryParams.skill ? queryParams.skill : '',
                'searchtext': queryParams.searchtext ? queryParams.searchtext : ''
            };
            return  httpClient.get(endPoint, queryParams, {"stringify": "true"});
        },
        prescribeLearningPlanToUser: function (userNames, plpIds, completionDate) {
            var endPoint = "/knowledgecenter/ka/proxy/lms/user/prescribe",
                body = {
                    "userNames": userNames,
                    "plpIds": plpIds,
                    "completionDate": completionDate
                };
            return  httpClient.post(endPoint, body);
        },
        fetchUserPLPs: function (username, keyword) {
            var endPoint = "/knowledgecenter/ka/lms/lps",
                queryParams = {
                    "keyword": keyword,
                    "userName": username,
                };
            return httpClient.get(endPoint, queryParams, {"stringify": "true"}).then(function (response) {
                return response;
            });
        },
        coursesAssociatedPlans: function (learningPlanId) {
            var endPoint = "/knowledgecenter/ka/lms/user/learningPlan/" + learningPlanId;
            return  httpClient.get(endPoint);
        },

        fetchPrescribedLearningPlanCatalog: function (searchCriteria) {
            var endPoint = "/knowledgecenter/ka/lms/user/lps/prescribed";

            searchCriteria = searchCriteria ? searchCriteria : {};
            queryParams = {
                "keyword": searchCriteria.keyword,
                "columnname": searchCriteria.sortName,
                "sort": searchCriteria.sort,
                "limitFrom": searchCriteria.limitfrom,
                "limitTo": searchCriteria.limitto
            };
            return httpClient.get(endPoint, queryParams, {"stringify": "true"}).then(function (response) {
                return response;
            });
        },
        getLearningPlanReport: function (searchCriteria) {
            var type = (searchCriteria.type == undefined) || (searchCriteria.type == "") ? "all" : searchCriteria.type;
            var endPoint = "/knowledgecenter/ka/lms/user/lps/" + type;
            var queryParams = {
                "limitTo": searchCriteria.limitTo ? searchCriteria.limitTo : searchCriteria.pageNumber ? (searchCriteria.pageNumber) * app.PageSize : app.PageSize,
                "limitFrom": searchCriteria.limitFrom ? searchCriteria.limitFrom : searchCriteria.pageNumber ? (searchCriteria.pageNumber - 1) * app.PageSize : 0,
                "startDate": searchCriteria.startDate,
                "endDate": searchCriteria.endDate,
                "jobTitle": searchCriteria.jobTitle,
                "manager": searchCriteria.manager,
                "organization": searchCriteria.organization,
                "fields": "getLearningPlanReport",
                "isReport": true
            };
            return httpClient.get(endPoint, queryParams, {"stringify": "true"}).then(function (response) {
                return response;
            });
        }
    }
});