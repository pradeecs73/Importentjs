define(['app', 'httpClient'],
  function (app, httpClient) {
    return {
      getPermissions: function () {
        return httpClient.get("/knowledgecenter/authorization/management/permissions?applicationId=userpi").then(function (response) {
          return response;
        });
      }
    };
  })
