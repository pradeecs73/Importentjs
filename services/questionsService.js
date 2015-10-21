/**
 * @class QuestionsService 
 * This class is a client stub for the Questions related Cloud Endpoints.
 * 
 * @author Ashutosh
 * TODO We will move all the services calls from QuestionsController to services layer. 
 */
define(['httpClient'], function (httpClient) {
    return {
        /**
         * This function will used to make a call to create Questions endpoint.
         * @returns {unresolved}
         */
        createQuestions: function() {
            return httpClient.post("/knowledgecenter/cclom/posts");
        },
        
        /**
         * This function will used to make a call to Update Questions endpoint.
         * @returns {unresolved}
         */
        updateQuestions: function() {
            return httpClient.put("/knowledgecenter/cclom/posts");
        },
        
        /**
         * This function will used to make a call to Delete  Questions endpoint.
         * @returns {unresolved}
         */
        deleteQuestions: function() {
            return httpClient.delete("/knowledgecenter/cclom/posts");
        }
    }
});