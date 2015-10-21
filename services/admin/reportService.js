define(['httpClient'], function (httpClient) {
    return {
        generateReports : function(reportType, applicationId) {
            return httpClient
                .post("/knowledgecenter/"+applicationId+"/report/"+reportType);
        },
        downloadReport : function(reportType) {
            return httpClient
                .get("/knowledgecenter/userpi/report/"+reportType+"/downloadUrl");
        },
        getReports : function() {
            return httpClient
                .get("/knowledgecenter/userpi/report?reportTypes=users,usersActivity,StorageUtilization");
        }
    }
});