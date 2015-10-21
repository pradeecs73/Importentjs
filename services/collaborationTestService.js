/**
 * @class collaborationTestService 
 * This class is a client stub for the Blogs,Questions,Wikis related Cloud Endpoints.
 * 
 * @author Mohan Rathour
 * TODO We will move all the services calls from blogsController,wikiController,QuestionController to services layer. 
 */
define(["services/collaborationUtil"], function (collaborationUtil) {
    return {
        /**
         * This function is used to return the sorted data on the basis of field name.
         * @author mohan rathour
         * @returns {json}
         */
        sortedData: function(_tempData,sortFieldName,oderType){
        	return collaborationUtil.getSortedDataList(_tempData, sortFieldName, oderType);
        }
        
    }
});