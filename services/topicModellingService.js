define(['httpClient'], function (httpClient) {
    return {
        documentsToModel: function () {
            return httpClient.get("/knowledgecenter/documents/preprocessed");
        },

        modelDocuments: function (documentIds) {
            return httpClient.post("/knowledgecenter/model", documentIds);
        },

        updateCategory: function (topicId, category) {
            return httpClient.put("/knowledgecenter/topics/" + topicId + "/category", {'category': category});
        },

        allCategories: function() {
            return httpClient.get("/knowledgecenter/documents/categories");
        }
    }
});