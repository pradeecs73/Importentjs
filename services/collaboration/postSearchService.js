
define(['app', 'httpClient', 'Q', 'underscore', 'services/searchService','services/groupService','services/collaboration/sharedPostService'],
        function(app, httpClient, Q, _, searchService,groupService,sharedPostService) {
    
    var tmpArrayForTopDiscussion = [];
    var getPosts = function(thisObject,queryParams,type) {
        var filters = queryParams.filters ? queryParams.filters.split(";") : [];
        var byFilter = queryParams.filterType;
        if(queryParams.filterType == "my" || queryParams.filterType == "all"){
            filters.push("author:"+app.getEmailId());
            filters.push("type:"+type);
            return getPostsData(queryParams,type,filters,queryParams.filterType);
        }
        else if(queryParams.filterType =="recent" || queryParams.filterType =="share") {
            filters.push("type:"+type);
            if(queryParams.filterType =="recent"){
                if((filters.indexOf("scope:restricted") != -1) || (filters.indexOf("status:draft") != -1) || (filters.indexOf("status:false") != -1) || (filters.indexOf("status:inactive") != -1) || (filters.indexOf("status:unlocked") != -1)){
                    filters.push("status:na");
                    filters.push("scope:na");                     
                }else{
                    filters.removeObject("status:draft");
                    filters.push("status:published");
                    filters.push("scope:public");                     
                }
            }
            return getPostsData(queryParams,type,filters,queryParams.filterType);
        }
        else if (queryParams.filterType =="liked" || queryParams.filterType =="favorite"  || queryParams.filterType =="followed") {
            filters.push("author:"+app.getEmailId());
            var entityType = (type == "FORUM")? "question" : type.toLowerCase();
            return gatCloudletPluginData(thisObject,queryParams,entityType);
        }else if(queryParams.filterType =="unAnswer"){
            filters.push("status:published");
            filters.push("scope:public");
            filters.push("type:"+type);
            filters.push("hasAtleastOneAnswer:false");
            return getPostsData(queryParams,type,filters,queryParams.filterType);
        }else if(queryParams.filterType =="discussionSpecifics.discussionsPostsCount"){
            filters.push("status:published");
            filters.push("scope:public");
            filters.push("type:"+type);
            return getPostsData(queryParams,type,filters,queryParams.filterType);
        }else if(queryParams.filterType == "top"){
            filters.push("status:published");
            filters.push("scope:public");
            filters.push("type:"+type);
            return getPostsData(queryParams,type,filters,queryParams.filterType);  
        }
    };
    
    /**
     * Construct post search call with queryParams(query,filters,type,pageNumber,PageSize SortType and SortOrder) and type(Post).
     * @author Mohan Rathour.
     */
    var getPostsData = function(queryParams,type,filters,filterType){
        var searchText = queryParams.searchText && queryParams.searchText.length > 0 ? queryParams.searchText : "*";
        var sortBy = queryParams.sortBy ? queryParams.sortBy : (searchText != "*" ? "relevance" : "updateDate");
        var sortOrder = queryParams.sortOrder ? queryParams.sortOrder : 'desc';
        var sortConfig;
        if(filterType == "share"){
            var obj={};
            obj[sortBy] = sortOrder;
            sortConfig =obj ;
        }else if(queryParams.filterType == "top"){
            sortConfig = [{"sortBy": "Comments","sortOrder":sortOrder}];
        }
        else{
            sortConfig = [{"sortBy":sortBy,"sortOrder":sortOrder}];
        }

        var pageNumber = (queryParams.pageNumber && queryParams.pageNumber > 0)? queryParams.pageNumber : 1;
        return searchPosts(searchText,filters,["post"], pageNumber, app.PageSize, sortConfig,filterType).then(function(res) {
            //file or image upload;
                if(!res){
                    return {"allPosts":tmpArrayForTopDiscussion};
                }else{
                    _.each(res.allPosts, function(res) {
                        var id = res._id;
                        _.each(res.files, function(data) {
                            var value = data.fName;
                            data.id = id;
                        });

                    });
                    return res;                
                }
        }, function(error) {
            return [];
        });
    }
    /**
     * search post call to get data from ES on the basis of queryParams.
     */
    var searchPosts = function(searchText, filters, type, pageNumber, pageSize, sortConfig,filterType) {
        if (filterType == "share"){
            return sharedPostService.genericSharedWithPost(searchText, filters, type[0], pageSize, pageNumber, {"type":"SHARE","recipients":["me","myGroups"]}, sortConfig)
                                .then(function(searchResponse) {
                                    searchResponse.allFacets = _.omit(searchService.facetsFor(searchResponse, "posts"), ["entitledSubjects", "read_ACL","shares","type","author","tags"]);
                                    searchResponse.allPosts = _.pluck(searchResponse.posts.results, "resource");
                                    searchResponse.totalResults = searchResponse.posts.totalResults;
                                    return searchResponse;
                                });
        }else if(filterType == "unAnswer"){
            return searchService.genericSearchWithPost(searchText, filters, type, pageSize, pageNumber, null, sortConfig)
                    .then(function(searchResponse) {
                        searchResponse.allFacets = _.omit(searchService.facetsFor(searchResponse, "posts"), ["entitledSubjects", "read_ACL","shares","type","author","tags"]);
                        searchResponse.allPosts = _.pluck(searchResponse.posts.results, "resource");
                        searchResponse.totalResults = searchResponse.posts.totalResults;
                        return searchResponse;
                    });
        }else{
            return searchService.genericSearchWithPost(searchText, filters, type, pageSize, pageNumber, null, sortConfig)
                    .then(function(searchResponse) {
                        searchResponse.allFacets = _.omit(searchService.facetsFor(searchResponse, "posts"), ["entitledSubjects", "read_ACL","shares","type","author","tags"]);
                        searchResponse.allPosts = _.pluck(searchResponse.posts.results, "resource");
                        searchResponse.totalResults = searchResponse.posts.totalResults;
                        return searchResponse;
                    });
        }

    };
    
    /**
     * Get data from Cloudlet on the basis of Cloudlet engine type and entityType.
     * @author mohan rathour
     */
    var gatCloudletPluginData = function(thisObject, queryParams, entityType) {
        var type = queryParams.filterType;
        var url = "";
        var self = thisObject;
        self.get('model').status = '';
        var _temp = {};
        _temp["allPosts"] = []
        _temp["totalResults"]=0;
        if (window.like && window.like.getConfig()) {
            var config = window.like.getConfig();
            config.userName = app.getEmailId();
            url += "/knowledgecenter/cclom/cloudlet";
            url += "/" + type + "/";
            url += config.appId + "/" + config.userName;
            url += "?entityType="+entityType+"&page=" + queryParams.pageNumber + "&pagesize=12&time=" + (new Date()).getTime() + "&fieldName=" + queryParams.sortBy + "&sortOrder="+queryParams.sortOrder;
        } else {
            var deferred = Q.defer();
            setTimeout(deferred.resolve(_temp), 0);
            return deferred.promise;
        }
        return httpClient.get(url).then(function(postsData) {
            _.each(postsData.posts, function(aPost) {
                if (aPost.status == 'published' || (aPost.status == 'draft' && _.findWhere(aPost.postShares, {
                    share: app.getEmailId()
                }))) {
                    _temp.allPosts.push(aPost);
                }
            });
            _temp.totalResults = postsData.total_Results;
            return _temp;
        });
    };


     /**
     * Get data for shared filter on the basis of  entityType.
     * @author mohan rathour
     */
     var gatSharedPluginData = function(thisObject,entityType) {
            var self = thisObject;
            self.get('model').status = '';
            var _temp = {};
            _temp["allPosts"] = []
            _temp["totalResults"]=0;
            return groupService.allGroups().then(function(response) {
                var groupList = [];
                _.each(response, function(group) {
                    groupList.push(group.name);
                });
                var inputjson = {
                        "email": app.getEmailId(),
                        "tenantid": "30",
                        "status": ["published", "draft"],
                        "groups": groupList,
                        "type": "BLOG"
                };
                return httpClient.post("/knowledgecenter/cclom/posts/shared", inputjson).then(function(blogsResult) {
                    _.each(blogsResult, function(blog) {
                        if (blog.author != app.getEmailId() || blog.status == 'published' || (blog.status == 'draft' && _.findWhere(blog.postShares, {
                            share: app.getEmailId()
                        }))) {
                            _temp.allPosts.push(blog);
                        }
                    });
                    _temp.totalResults = _temp.allPosts.length;
                    return _temp;
                });
            },
            function(err) {
                var inputjson = {
                        "email": app.getEmailId(),
                        "tenantid": "30",
                        "status": "published",
                        "groups": [],
                        "type": "BLOG"
                };
                return httpClient.post("/knowledgecenter/cclom/posts/shared", inputjson).then(function(blogsResult) {
                    _.each(blogsResult, function(blog) {
                        if (blog.author != app.getEmailId()) {
                            _temp.allPosts.push(blog)
                        }
                    });
                    _temp.totalResults = _temp.allPosts.length;
                    return _temp;
                });
            });
    };
    
    /**
     * Declare funcation.
     */
    return {
        getPosts : getPosts,
        gatCloudletPluginData:gatCloudletPluginData
    }
});