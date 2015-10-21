define(['app', 'httpClient', 'services/cloudletService', 'services/searchService', 'services/entitlementService', 'services/activityService', 'Q'],
  function (app, httpClient, cloudletService, searchService, entitlementService, activityService, Q) {
    return {
      facetIgnores : ["entitledSubjects", "shares", "userTags", "createdBy", "Read_ACL"],
      document: function (docId) {
       return httpClient.get("/knowledgecenter/contentstore/document/" + docId)
      },
      updateShares: function (docId, sharesMap) {
        return httpClient.put("/knowledgecenter/contentstore/document/" + docId + "/share", sharesMap);
      },
      getDownloadUrl: function(docId) {
          return httpClient.get("/knowledgecenter/contentstore/document/" + docId + "/downloadUrl");
      },
      allDocumentsWithFilters: function (params) {
        var self = this;
        var type = ["file"]
        var filters = params.filters ? params.filters.split(";") : [];
        var searchText = params.searchText && params.searchText.length > 0 ? params.searchText : "*";
        var pageNumber = (params.pageNumber && params.pageNumber > 0)? params.pageNumber : 1
        var pageSize = params.pageSize ? params.pageSize : app.PageSize
        var sortConfig = [];

        sortConfig.push({
          "sortBy" : params.sortBy,
          "sortOrder" : params.sortOrder

        });
        if(params.sortBy!= "uploadedOn")
        {
          sortConfig.push({
            "sortBy" : "uploadedOn",
            "sortOrder" : "desc"
          });
        }
        return this.searchDocuments(searchText, filters, type, pageNumber, pageSize, sortConfig).then(function (searchResult) {
          var transformedResult = self.transformDocumentResults(searchResult)
          return self.addDocumentPermissionsToSearchResult(transformedResult);
        }, function (err) {
          return {"allDocuments": [], allFacets: {}};
        });
      },

      activitySearch: function (params, activityParams) {
        var self = this;
        return activityService.search("files", params, activityParams).then(function (searchResponse) {
          return self.addDocumentPermissionsToSearchResult(searchService.responseByType(searchResponse, "files", self.facetIgnores));
        })
      },

      searchDocuments: function (searchText, filters, type, pageNumber, pageSize, sortConfig) {
        var self = this
        return searchService.genericSearchWithPost(searchText, filters, type, pageSize, pageNumber, null, sortConfig)
          .then(function (searchResponse) {
            return searchService.responseByType(searchResponse, "files", self.facetIgnores);
          });
      },

      getUploadUrl: function(metadata) {
        return httpClient.post("/knowledgecenter/contentstore/document/_uploadUrl", metadata);
      },

      uploadToObjectStore: function(data, file) {
        var fileSize = file.size;
        var chunkSize = data.chunkSize;
        var chunks = Math.ceil(fileSize / chunkSize);
        var uploads = []
        for(var i=0;i<chunks;i++) {
          var start = i * chunkSize;
          var end = start + chunkSize;
          if (end > fileSize) {
            end = fileSize;
          }

          var blob = file.slice(start, end);
          uploads[i] = this.uploadAChunk(i, data, chunks, blob);
        }
        return Q.all(uploads);
    },

    documentPermissions: function(documentIds) {
      return httpClient.post("/knowledgecenter/contentstore/document/_permissions", {documentIds: documentIds});
    },

    uploadAChunk: function(i, data, chunks, blob) {
      var deferred = $.Deferred();
      var formData = new FormData();
      formData.append('redirect', data.redirectUrl);
      formData.append('max_file_size', data.maxFileSize + '');
      formData.append('max_file_count', data.maxFileCount + '');
      formData.append('expires', data.expires + '');
      formData.append('signature', data.signature);
      var fileName = this.getFileName(chunks.toString(), i.toString());
      formData.append('file', blob, fileName);


      $.ajax({
        url: "/objectstore" + data.url,
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function (response, status, xhr) {
          deferred.resolve(new Object({response: response.result, status: xhr.status}));
        },
        error: function (xhr, errorInfo, exception) {
          deferred.reject(new Object({response: errorInfo, status: xhr.status}));
        }
      });
      return deferred.promise();
    },

    getFileName: function(chunks, n) {
      var numberOfTrailingZeros = chunks.length - n.length;
      var fileName="";
      for (var i = 0; i < numberOfTrailingZeros; i++) {
        fileName= fileName.concat("0");
      }
      fileName=fileName.concat(n);
      return fileName;
    },

    canUploadAFile: function(){
      return httpClient.get("/knowledgecenter/contentstore/document/canUploadAFile");
    },

    uploadToContentStore: function(metadata) {
      return httpClient.post("/knowledgecenter/contentstore/document", metadata);
    },

    addDocumentPermissionsToSearchResult: function (result) {
      var documentIds = _.map(result.allDocuments, function(document) {
        return document.id;
      });
      if(!documentIds || documentIds.length == 0) {
        return result;
      }
      return this.documentPermissions(documentIds).then(function(response) {
        _.forEach(result.allDocuments, function(aDocument) {
          aDocument.permissions = response.permissions[aDocument.id];
        });
        return result;
      }).fail(function() {
        return result;
      });
    },

    transformDocumentResults: function (result) {
        var newFacets = {};
        var facets = result.allFacets;
        _.each(Object.keys(facets), function (key) {
          if (facets[key].length > 0) {
            newFacets[key] = facets[key]
          }
        });
        result.allFacets = newFacets;
        return result;
      },
      updateDocument: function(document) {
        return httpClient.put("/knowledgecenter/contentstore/document/" + document.id, document);
      },

      canMakeFilePublic: function(document) {
        return httpClient.get("/knowledgecenter/contentstore/document/" + document.id + "/canMakeFilePublic");
      },

      changePublic: function(id, isPublic) {
        return httpClient.put("/knowledgecenter/contentstore/document/" + id + "/isPublic/" + isPublic);
      },

      deleteDocument: function(documentId) {
        return httpClient.remove("/knowledgecenter/contentstore/document/" + documentId);
      }
    };
  })