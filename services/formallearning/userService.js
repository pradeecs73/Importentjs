define(['httpClient', '../usersService'], function (httpClient, usersService) {
    return {
        createLMSUser: function () {
            return usersService.myProfile().then(function (data) {
                var email = data.email ? data.email : "",
					firstname = data.firstName ? data.firstName : "",
					lastname = data.lastName ? data.lastName : "",
					username = data.username ? data.username : "";
                try {
                    username = username.toLowerCase();
                    email = email.toLowerCase();
                }
                catch (err) {
                    console.log("Error in converting alpha chars to match lms data contract." + err);
                }
                var userdata = {
                    "userName": username,
                    "email": email,
                    "firstname": firstname,
                    "lastname": lastname
                };
                return httpClient.post("/knowledgecenter/ka/proxy/lms/users", userdata).then(function (response) {
                    return response;
                });
            });
        },
        shareCourseDetails: function (courseid, sharedJson, sharedBy, sharedByDisplayName) {
            var endPoint = "/knowledgecenter/cclom/share/course";
            sharedJson.forEach(function (share) {
                share.tenantId = 30;
            })
            var data = {
                id: courseid,
                type: "course",
                entityShares: sharedJson,
                sharedBy: sharedBy,
                sharedByDisplayName: sharedByDisplayName,
                tenantId: 30
            };
            return httpClient.post(endPoint, data).then(function (response) {
                return response;
            });
        },
        getSharedCourseDetails: function (courseId) {
            return usersService.myProfile().then(function (profile) {
                var endPoint = "/knowledgecenter/cclom/shared/course/" + courseId + "/" + profile.username;
                return httpClient.get(endPoint).then(function (response) {
                    return response;
                });
            })
        },
        getUserEnrolCourses: function () {
            var endPoint = "/knowledgecenter/ka/lms/api/user/enroll/courses";
            return httpClient.get(endPoint);
        },
        getSharedList: function () {
            return usersService.myProfile().then(function (profile) {
                var url = "/knowledgecenter/cclom/shared/entities/";
                url += profile.username;
                return httpClient.get(url);
            });
        },
        getUserToken: function () {
            var endPoint = "/knowledgecenter/ka/proxy/lms/user";
            return httpClient.get(endPoint).then(function (response) {
                return response;
            });
        },
		//assign role to the user in moodle
        assignRole: function(userName, roleName, assign){
			if(roleName == "Instructor" || roleName == "CatalogAdmin"){
				roleName = roleName == "Instructor" ? 1 : 2;
			}
			if (assign) {
				var data = {
					"fields": "assign",
					"userName": userName
				}
			}
			else{
				var data = {
					"fields": "unassign",
					"userName": userName
				}
			}
			var endPoint = "/knowledgecenter/ka/proxy/lms/user/role/"+ roleName;
			return httpClient.post(endPoint, data);
        }
    }
});