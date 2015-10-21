define(['app', 'httpClient', 'Q', 'services/collaboration/postSearchService', 'controllers/collaboration/utils/postUtil', 'services/tagsService'], function(app, httpClient, Q, postSearchService, postUtil, tagsService) {

    getPlayBooks = function(filterType) {
        return httpClient.get("/knowledgecenter/playbook/" + filterType).then(function(res) {
                return res;
            },
            function(error) {
                return err;
            });
    };

    getPlayBookDetails = function(playBook_id) {
        return httpClient.get("/knowledgecenter/playbook/details/" + playBook_id).then(function(res) {
                return res;
            },
            function(error) {
                return err;
            });
    };

    getAssociatedLearnings = function(family, skill, self) {
        return httpClient.get("/knowledgecenter/playbook/" + escape(family) + "/" + skill).then(function(res) {
            self.set('allSkills', res);
        });
    }


    //Handling all the posts requests.
    return {
        getPlayBooks: getPlayBooks,
        getPlayBookDetails: getPlayBookDetails,
        getAssociatedLearnings: getAssociatedLearnings,
    }
});
