define(['httpClient', 'Q'], function (httpClient, Q) {
  return {
    myProfile: function() {
        var fetchProfileRequest = "/knowledgecenter/userpi/user/myProfile";
        return httpClient.get(fetchProfileRequest);
    }
  }
})
