define(['app','httpClient', 'services/searchService'], function(app,httpClient,searchService) {
  return {
    allExpertise: function() {
      return httpClient.get('/knowledgecenter/userpi/expertise');
    },

    deleteExpertise: function(expertiseId, expertiseName, shortName, username) {
      var loginusername =  app.getUsername();
      return httpClient.remove('/knowledgecenter/userpi/expertise/' + expertiseId).then(function(response) {
        if (window.activityStream) {
          var streamDataContract = new activityStream.StreamDataContract(expertiseId, 'expertise', 'remove');
          var markedTarget = (new activityStream.TargetObject(expertiseId, expertiseName, "expertise")).toObject();
          streamDataContract.title = shortName;
          streamDataContract.resourceUrl = "na";
          streamDataContract.authorUserName = loginusername;
          streamDataContract.target = markedTarget;
          streamDataContract.displayMessage = shortName + " has removed expertise " + expertiseName;
          try {
              activityStream.pushToStream(streamDataContract);
          }
          catch (err) {
              console.log(err)
          }
      }
      
      return response;
      });
    },

    createExpertise: function(expertiseName, shortName, username) {
      var loginusername =  app.getUsername();
      return httpClient.post('/knowledgecenter/userpi/expertise', {expertiseName: expertiseName}).then(function(response) {
        var expertiseId = response.expertiseId;
        if (window.activityStream) {
          var streamDataContract = new activityStream.StreamDataContract(expertiseId, 'expertise', 'add');
          var markedTarget = (new activityStream.TargetObject(expertiseId, expertiseName, "expertise")).toObject();
          streamDataContract.title = shortName;
          streamDataContract.resourceUrl = "na";
          streamDataContract.authorUserName = loginusername;
          streamDataContract.target = markedTarget;
          streamDataContract.displayMessage = shortName + " has added expertise " + expertiseName;
          try {
              activityStream.pushToStream(streamDataContract);
          }
          catch (err) {
              console.log(err)
          }
      } 
        return response;
      });
    },

    updateExpertise: function(oldExpertiseId, newExpertiseName, oldExpertiseName, shortName, username) {
      var loginusername =  app.getUsername();
      return httpClient.put('/knowledgecenter/userpi/expertise/' + oldExpertiseId, {expertiseName: newExpertiseName}).then(function(response) {
        if (window.activityStream) {
          var streamDataContract = new activityStream.StreamDataContract(oldExpertiseId, 'expertise', 'update');
          var markedTarget = (new activityStream.TargetObject(oldExpertiseId, oldExpertiseName, "expertise")).toObject();
          streamDataContract.title = shortName;
          streamDataContract.resourceUrl = "na";
          streamDataContract.authorUserName = loginusername;
          streamDataContract.target = markedTarget;
          streamDataContract.displayMessage = shortName + " has updated Area of expertise from " + oldExpertiseName + " to " + newExpertiseName;
          try {
              activityStream.pushToStream(streamDataContract);
          }
          catch (err) {
              console.log(err)
          }
      }  
        return response;
      });
    },
    searchExpertise: function(searchText,searchFilters,pageSize,pageNumber){
      var sortConfig = {
        "sortBy" : "name",
        "sortOrder" : "asc"
      }
      return searchService.genericSearchWithPost(searchText, searchFilters, ["expertise"], pageSize, pageNumber, null, [sortConfig]).then(function(response){
        return {
          allFacets: searchService.facetsFor(response, "expertise"),
          allExpertise: _.pluck(response.expertises.results, "resource"),
          totalResults : response.expertises.totalResults
        }
      })
    },
    expertiseAutoSuggest: function() {
      return {
        url: searchService.getSuggestUrl(),
        requestBody: [
          { type: "expertise", fieldName: "name", excludes: {}, resultSize: 50}
        ],
        filter: function(response) {
          var expertises = _.pluck(response.expertises.results, "resource")
          return _.map(expertises, function(expertise) {
            return { value: expertise.id + "|" + expertise.name , text: expertise.name }
          })
        },
        limit: 50
      }
    }

  }
});