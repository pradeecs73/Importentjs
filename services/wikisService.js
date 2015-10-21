/**
 * @class wikiService 
 * This class is a client stub for the wiki related Cloud Endpoints.
 * 
 * @author Ashutosh
 * TODO We will move all the services calls from wikiController to services layer. 
 */
define(['httpClient'], function (httpClient) {
    return {
        /**
         * This function will used to make a call to create wiki endpoint.
         */
        createWiki: function() {
            return httpClient.post("/knowledgecenter/cclom/posts");
        },
        
        /**
         * This function will used to make a call to Update wiki endpoint.
         * @returns {unresolved}
         */
        updateWiki: function() {
            return httpClient.put("/knowledgecenter/cclom/posts");
        },
        
        /**
         * This function will used to make a call to Delete  wiki endpoint.
         * @returns {unresolved}
         */
        deleteWiki: function() {
            return httpClient.delete("/knowledgecenter/cclom/posts");
        }
    }
});