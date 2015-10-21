define(['httpClient'], function (httpClient) {
    return {
        isSSOEnabled: function() {
            return httpClient.get("/knowledgecenter/userpi/identityProvider/ssoStatus").then(function(response){
                return response;
            })
        },

        getUserStatus: function(username) {
            return httpClient.get("/knowledgecenter/landingApp/users/" + username + "/status").then(function(response){
                return response;
            })
        },

        registerUser: function(userprofile) {
            return httpClient.post("/knowledgecenter/landingApp/users", userprofile);
        }
    }
});
