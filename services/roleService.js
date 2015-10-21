define(['app', 'httpClient'],
  function (app, httpClient) {
    return {
      create: function (role) {
        return httpClient.post("/knowledgecenter/authorization/management/roles?applicationId=userpi", role).then(function (response) {
          return response;
        });
      },

      getRoles: function (query) {
        return httpClient.post("/knowledgecenter/authorization/management/roles/_fetch?applicationId=userpi", query).then(function (response) {
          return response;
        });

      },
      activateRole: function (role) {
        return httpClient.put("/knowledgecenter/authorization/management/roles/_activate/" + encodeURIComponent(role._id) + "?applicationId=userpi", role).then(function (response) {
          return response;
        });
      },
      deactivateRole: function (role) {
        return httpClient.put("/knowledgecenter/authorization/management/roles/_deactivate/" + encodeURIComponent(role._id) + "?applicationId=userpi", role).then(function (response) {
          return response;
        });
      },
      deleteRole: function (role) {
        return httpClient.remove("/knowledgecenter/authorization/management/roles/" + encodeURIComponent(role._id) + "?applicationId=userpi", role).then(function (response) {
          return response;
        });
      },
      updatePermissions: function (role) {
        return httpClient.put("/knowledgecenter/authorization/management/roles/" + encodeURIComponent(role._id) + "?applicationId=userpi", role).then(function (response) {
          return response;
        });
      }
    };
  })
