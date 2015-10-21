define(["services/pipelineResourceService"], function(pipelineService) {
    return {
        playVideo: function() {
            var queryParams = this._getQueryParams();
            var playerID = queryParams["playerID"];
            var playerKey = queryParams["playerKey"];
            var title = queryParams["title"];
            return pipelineService.getResourceByRawResourceId("files", queryParams["documentId"], queryParams["appId"])
                .then(function(resource) {
                    document.getElementsByName("playerID")[0].value = playerID;
                    document.getElementsByName("playerKey")[0].value = playerKey;
                    document.title = decodeURIComponent(title);
                    document.getElementsByName("@videoPlayer")[0].value = resource.videoId;
                    brightcove.createExperiences();
                }, function(err){
                    var errorMessage = err.status + " " + err.statusText;
                    document.getElementById('popUpPlayerMessageHolder').innerText = errorMessage;
                })
        },

        _getQueryParams: function() {
            var params = {};
            var queryParams = location.search.substring(1);
            var tokens = queryParams.split("&");
            for (var i = 0; i < tokens.length; i++) {
                params[tokens[i].split('=')[0]] = tokens[i].split('=')[1];
            }
            return params;
        }
    }
});