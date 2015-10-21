define(['httpClient', 'Q'], function (httpClient, Q) {
    var preferenceInfo = null;
    var featureFlagInfo = null;
    return {
        getPreferences: function () {
            if(preferenceInfo != null){
              return Q(preferenceInfo);
            }
            var body = {"configurationNames": ["FormalLearning", "KC", "Collaboration", "KOTG", "VKM"]};
            return httpClient.post("/knowledgecenter/tenantmanagement/configurations/preference", body).then(function(response) {
                preferenceInfo = response;
                return preferenceInfo;
            })
        },

        getFeatureFlags: function () {
            if(featureFlagInfo != null){
              return Q(featureFlagInfo);
            }var body = {"configurationNames": ["abc"]};
            return httpClient.post("/knowledgecenter/tenantmanagement/configurations/featureFlag", body).then(function(response) {
                featureFlagInfo = response;
                return featureFlagInfo;
            })
        },

        fetchTenantPreferences: function () {
            return httpClient.get('/knowledgecenter/tenantmanagement/systemAdmin/preferences').then(function (response) {
                return  {
                    allConfigurations: response.configurations
                };
            }, function(error){
                return {};
            });
        }
    };
});