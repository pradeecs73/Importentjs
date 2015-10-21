define(['httpClient'], function (httpClient) {
  return {
      allOrgs: function() {
      return httpClient.get("/kmap/showcase/organizations");
    }
  }
});