/**
 * @class BlogService 
 * This class is a client stub for the Blogs related Cloud Endpoints.
 * 
 * @author Ashutosh
 * TODO We will move all the services calls from blogsController to services layer. 
 */
define(['httpClient'], function (httpClient) {
    
    return {
        /**
         * This function will used to make a call to create blog endpoint.
         * @returns {unresolved}
         */
        
        createBlog: function() {
            return httpClient.post("/knowledgecenter/cclom/posts");
        },
        
        /**
         * This function will used to make a call to Update blog endpoint.
         * @returns {unresolved}
         */
        updateBlog: function() {
            return httpClient.put("/knowledgecenter/cclom/posts");
        },
        
        /**
         * This function will used to make a call to Delete  blog endpoint.
         * @returns {unresolved}
         */
        deleteBlog: function() {
            return httpClient.delete("/knowledgecenter/cclom/posts");
        },
        
        /**
         * This function will used to make a call to get list of all categories.
         * @returns {unresolved}
         */
        getAllCategory: function() {
            return httpClient.get("/knowledgecenter/cclom/categories");
        }
    };
});