define(['httpClient'], function (httpClient) {
    return {
        fetchTenantLicenseBatches: function () {
            return httpClient.get('/knowledgecenter/tenantmanagement/licenseBatches/list').then(function (response) {
                return  response["licenseBatches"];
            }, function(error){
                return [];
            });
        }
    }
});