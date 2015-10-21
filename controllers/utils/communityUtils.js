define(['app', "Q", "httpClient"], function(App, Q, httpClient) {

    App.communityUtils = Ember.Object.create({

        getLikesForAllResponse: function(response) {

            var deferred = Q.defer();

            var res = response;
            var idList = _.pluck(res, "_id");
            var type = _.pluck(res, "type")

            if (type && type[0] == "FORUM") {
                type[0] = "question";
            }

            _.each(res, function(data) {
                data['likesCount'] = 0;
            });

            if (!type || type[0] == undefined) {
                deferred.resolve(res);
                return deferred.promise;
            }


            App.communityUtils.getPostLikesCount(idList, type[0])
                .then(function(blogLikes) {

                    _.each(blogLikes, function(blogLike) {
                        var match = _.findWhere(res, {
                            _id: blogLike._id
                        });
                        if (match) {
                            match["likesCount"] = blogLike.count;
                        }
                    });

                    deferred.resolve(res);
                }, function(error) {
                    console.log(error);
                    //Doing resolve bcoz we are sending the sended request object only with appended value of likescount 
                    deferred.resolve(res)
                }).fail(function(err) {
                    console.log(error);
                    //Doing resolve bcoz we are sending the sended request object only with appended value of likescount 
                    deferred.resolve(res)
                });

            return deferred.promise;
        },

        getPostLikesCount: function(postsIdList, postType) {

            var url = "";

            if (window.like && window.like.getConfig()) {
                var config = window.like.getConfig();
                url += "/knowledgecenter/cloudlet/" + config.pluginType + "/" + config.appId;
                url += "?entityType=" + postType.toLocaleLowerCase() + "&entityIdList=" + postsIdList.join(",");
            } else {
                var deferred = Q.defer();
                setTimeout(deferred.resolve({
                    posts: []
                }), 0);
                return deferred.promise;
            }
            return httpClient.get(url);
        },
        populatePostsData: function(type, pageNumber, sortBy, sortOrder,self,groupService,PagSize) {
            var pageSize = parseInt(PagSize),
                searchText = '*',
                filters = ["status:published", "type:" + type],
                filterType = 'all';
            var sortConfig = {};
            sortConfig[sortBy] = sortOrder
            groupService.groupsPostsData(searchText, filters, "post", pageSize, parseInt(pageNumber), {
                "type": "SHARE",
                "recipients": [self.get('model')._id]
            }, sortConfig).then(function(posts) {
                self.set("shared", posts);
                switch (type) {
                    case 'BLOG':
                        self.set("allBlog", posts.allPosts);
                        self.set('totalBlogResult', posts.totalResults);
                        break;
                    case 'WIKI':
                        self.set("allWiki", posts.allPosts);
                        self.set('totalWikiResult', posts.totalResults);
                        break;
                    case 'FORUM':
                        self.set("allForum", posts.allPosts);
                        self.set('totalForumResult', posts.totalResults);
                        break;
                }
            });
        },
        sortCommunityDetailsData: function(fieldName, orderType,type,self) {
            var sortFieldName = fieldName;
            if (sortFieldName && sortFieldName != "") {
                var _tempData = [];

                if (fieldName == 'category.name') {
                    fieldName = fieldName.split('.')[0];
                }
                if (fieldName == 'location.city') {
                    fieldName = fieldName.split('.')[0];
                }
                switch (type) {
                    case 'BLOG':
                        self.get('sortedFieldName').Blogs = sortFieldName;
                        self.populatePostsData(type, self.blogPageNumber, sortFieldName, self.sortOrder);
                        $("#sortingDropdownIdBlogs li a").removeClass("selected");
                        $("#" + fieldName + type).addClass("selected");
                        break;
                    case 'WIKI':
                        self.get('sortedFieldName').Wikis = sortFieldName;
                        self.populatePostsData(type, self.wikiPageNumber, sortFieldName, self.sortOrder);
                        $("#sortingDropdownIdWikis li a").removeClass("selected");
                        $("#" + fieldName + type).addClass("selected");
                        break;
                    case 'FORUM':
                        self.get('sortedFieldName').Forums = sortFieldName;
                        self.populatePostsData(type, self.forumPageNumber, sortFieldName, self.sortOrder);
                        $("#sortingDropdownIdForums li a").removeClass("selected");
                        $("#" + fieldName + type).addClass("selected");
                        break;
                    case 'Members':
                        if (orderType == 'desc') {
                            orderType = false;
                        }
                        self.get('sortedFieldName').Members = sortFieldName;
                        _tempData = self.get('memberProfiles').copy();
                        if (_tempData && _tempData.length >= 2) {
                            _tempData = collaborationUtil.getSortedDataList(_tempData, sortFieldName, orderType);
                            self.get('memberProfiles').clear();
                            self.set('memberProfiles', _tempData);
                            $("#sortingDropdownIdMembers li a").removeClass("selected");
                            $("#" + fieldName + type).addClass("selected");
                        }
                        break;
                    case 'Library':
                        self.get('sortedFieldName').Library = sortFieldName;
                        self.populateSharedDocumentsByActionSearch(self.pageNumber, sortFieldName, self.sortOrder);
                        $("#sortingDropdownIdLibrary li a").removeClass("selected");
                        $("#" + fieldName + type).addClass("selected");
                        break;
                }
            }
        },
        getSortFieldName: function(type,self) {
            var fieldName;
            switch (type) {
                case 'Blogs':
                    fieldName = self.get('sortedFieldName').Blogs;
                    break;
                case 'Wikis':
                    fieldName = self.get('sortedFieldName').Wikis;
                    break;
                case 'Forums':
                    fieldName = self.get('sortedFieldName').Forums;
                    break;
                case 'Members':
                    fieldName = self.get('sortedFieldName').Members;
                    break;
                case 'Library':
                    fieldName = self.get('sortedFieldName').Library;
                    break;
            }
            return fieldName;
        },
        deleteCommunity:function(getCommunityData,controller){
            var self = this;
            self.getCommunityData = getCommunityData;
            self.controller = controller;
            var groupsDeleteUrl = "/knowledgecenter/groups/"
                $.ajax({
                    url: groupsDeleteUrl + getCommunityData._id,
                    type: 'DELETE',
                    beforeSend: function(xhr) {
                        httpClient.setRequestHeadersData(xhr);
                    },
                    success: function(result) {
                        jQuery.gritter.add({
                            title: "",
                            text: "You have deleted the community successfully",
                            class_name: "gritter-success"
                        });
                    },
                    error: function(error) {
                        jQuery.gritter.add({
                            title: "",
                            text: "Community deletion failed. Please try again.",
                            class_name: "gritter-error"
                        });
                    }
                }).then(function(data){
                     self.controller.transitionTo('communities.all')                    
                })

        }
    });
});