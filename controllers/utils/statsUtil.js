/**
 * Created by sandepan on 10/31/2014.
 */

define(["app", "httpClient"],
    function (app, httpClient) {
        App.StatsUtil = Ember.Object.create({
            getCourseLikesCount: function (courseIdList) {
                var url = "";
                if (window.like && window.like.getConfig()) {
                    var config = window.like.getConfig();
                    url += "/knowledgecenter/cloudlet/" + config.pluginType + "/" + config.appId;
                    url += "?entityType=course&entityIdList=" + courseIdList.join(",");
                }
                return httpClient.get(url);
            },
            getLikesCount: function (idList, type) {
                var url = "";

                if (window.like && window.like.getConfig()) {
                    var config = window.like.getConfig();
                    url += "/knowledgecenter/cloudlet/" + config.pluginType + "/" + config.appId;
                    url += "?entityType=" + type + "&entityIdList=" + idList.join(",");
                }
                return httpClient.get(url);
            },
            getCourseCommentsCount: function (courseIdList) {
                var url = "";

                if (window.comments && window.comments.getConfig()) {
                    var config = window.comments.getConfig();
                    url += "/knowledgecenter/cloudlet/" + config.pluginType + "/" + config.appId;
                    url += "?entityType=course&entityIdList=" + courseIdList.join(",");
                }
                return httpClient.get(url);
            },
            getViewCount: function (courseIdList) {
                var url = "/knowledgecenter/cclom/activities/courses/views?courseIds=" + courseIdList.join(',');
                return httpClient.get(url);
            },
            getLikesForCourse: function(courseId) {
                var requestUrl = "";
                if (window.like && window.like.getConfig()) {
                    var config = window.like.getConfig();
                    requestUrl += "/knowledgecenter/cloudlet/" + config.pluginType + "/" + config.appId + "?entityType=course&entityIdList=" + courseId;
                }
                return httpClient.get(requestUrl);
            },
            getTagsForCourse: function(courseId) {
                var baseUrl = "/cloudlet";
                // hardcoded the value, it should come from moodle.
                var appId = "KCOG_001";
                baseUrl = baseUrl + "/cloudlet/tagging/" + appId + "/default/" + courseId + "?entityType=course";
                return httpClient.get(baseUrl);
            }
			
        });
    });