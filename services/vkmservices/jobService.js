define(['httpClient'], function (httpClient) {
  return {
      allJobtitles: function() {
      return httpClient.get("/kmap/showcase/jobRoles");
    }
  }
});