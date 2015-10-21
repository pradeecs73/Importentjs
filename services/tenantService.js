define(['httpClient', 'Q'], function (httpClient, Q) {
    var tenantInfo = null;
    return {
        getTenantInfo: function () {
            if(tenantInfo != null){
              return Q(tenantInfo);
            }
            return httpClient.get("/knowledgecenter/tenant/my").then(function(response) {
                tenantInfo = response;
                return tenantInfo;
            })
        }
    };
});