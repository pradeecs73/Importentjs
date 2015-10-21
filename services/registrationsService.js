define(['httpClient', 'services/searchService'], function(httpClient,searchService) {
  return {
      searchRegistrations: function(searchText,pageSize,pageNumber, sortBy, sortOrder){
          var sortConfig = {
              "sortBy" : sortBy,
              "sortOrder" : sortOrder
          };
          return searchService.genericSearchWithPost(searchText, null, ["registration"], pageSize, pageNumber, "state:PENDING", [sortConfig]).then(function(response){
              return {
                  allRegistrations: _.pluck(response.registrations.results, "resource"),
                  totalResults : response.registrations.totalResults
              }
          })
      },
      accept: function(id){
          return httpClient.get("/knowledgecenter/userpi/registrations/" + id + "/_accept");
      },
      reject: function(id){
          return httpClient.get("/knowledgecenter/userpi/registrations/" + id + "/_reject");
      }
  }
});