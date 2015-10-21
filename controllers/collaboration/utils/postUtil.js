/**
 * Handle all posts common  properties.
 * File Name : postUtil.js
 * @author Mohan Rathour
 */
define(['app', 'httpClient', 'Q', 'services/usersService','underscore'], function(app, httpClient, Q, usersService,_) {
    var cloudletURL = "/knowledgecenter/cloudlet/",
        groupsCategoriesURL = "/knowledgecenter/groups/all/categories",
        postsCategoriesURL = "/knowledgecenter/cclom/categories";

    /*App Ready event
     *set postsCategories and groupsCategories data into session.
	 */
    App.then(function(app) {
        Ember.Logger.info('[postService] >>[getCategories]!');
        var self = this;
        httpClient.get("/knowledgecenter/cclom/categories")
            .then(function(categories) {
                sessionStorage.setItem("groupsCategories", JSON.stringify(categories));
                sessionStorage.setItem("postsCategories", JSON.stringify(categories));
            }, function(err) {
                sessionStorage.setItem("groupsCategories", JSON.stringify([]));
                sessionStorage.setItem("postsCategories", JSON.stringify([]));
        });
    });

    /**
     * Post delete dialog box.
     */
    var confirmModelDialog = function(postType) {
        var modalTitle = "Delete " + postType.replace(/^./, function(match) {
            return match.toUpperCase();
        });
        var confirmMessage = "Please confirm you want to delete the " + postType + ".";
        var confirmModelDialogController = Ember.Object.create({
            modalTitle: modalTitle,
            confirmMessage: confirmMessage,
            buttonName: modalTitle
        });
        return confirmModelDialogController;
    };

    //Post validation criteria.
    var postValidation = {
        title: {
            presence: true,
            presence: {
                message: "title can't be blank"
            },
            length: {
                minimum: 5,
                maximum: 255,
                allowBlank: true,
                message: "title is too short (minimum is 5 characters)"
            }
        },
        content: {
            presence: true,
            presence: {
                message: "content can't be blank"
            }
        },
        status: {
            inclusion: { in : ['draft', 'published', 'inactive'],
                message: "status cannot be empty, Please choose one of the status"
            }
        },
        scope: {
            inclusion: { in : ['public', 'restricted'],
                message: "scope cannot be empty, Please choose one of the scope"
            }
        },
        category: {
            presence: true,
            presence: {
                message: "Please choose one of the category"
            }
        }
    };

    /*
     * Query params properties.
     */
    var queryParams = {
        searchText: {
            refreshModel: true
        },
        filters: {
            refreshModel: true
        },
        filterType: {
            refreshModel: true
        },
        pageNumber: {
            refreshModel: true
        },
        sortBy: {
            refreshModel: true
        },
        sortOrder: {
            refreshModel: true
        },
        showMessage: {
            refreshModel: true
        }
    };

    //Convert first character to uppercase.
    var firstCharToUpperCase = function(postType) {
        return postType.replace(/^./, function(match) {
            return match.toUpperCase();
        });
    };

    //Clear share data.
    var clearShare = function() {
        $('input[type=text]').val('');
        $('textarea').val('');
        $('input#form-field-mask-2').tagsinput('removeAll');
        jQuery('#sharePost').modal('hide');
    };

    //Query Params for New Route.
    var postsNewRouteQueryParams = {
        chatSession: {
            refreshModel: true
        },
        chatRoom: {
            refreshModel: true
        },
        session: {
            refreshModel: true
        },
        communityId: {
            refreshModel: true
        }
    };

    //Post stats util.
    App.PostStatsUtil = Ember.Object.create({
        getAppliedTags: function(postsIdList, postType) {
            Ember.Logger.info('[postService] >> [PostStatsUtil] >> [getAppliedTags]!');
            var url = "";
            if (window.tags && window.tags.getConfig()) {
                var config = window.tags.getConfig();
                url += cloudletURL + config.pluginType + "/" + config.appId;
                url += "?entityType=" + postType + "&entityIdList=" + postsIdList.join(",");
            } else {
                var deferred = Q.defer();
                setTimeout(deferred.resolve({
                    posts: []
                }), 0);
                return deferred.promise;
            }
            return httpClient.get(url);
        },
        getPostsLikesCount: function(postsIdList, postType) {
            Ember.Logger.info('[postService] >> [PostStatsUtil] >> [getPostsLikesCount]!');
            var url = "";
            if (window.like && window.like.getConfig()) {
                var config = window.like.getConfig();
                url += cloudletURL + config.pluginType + "/" + config.appId;
                url += "?entityType=" + postType + "&entityIdList=" + postsIdList.join(",");
            } else {
                var deferred = Q.defer();
                setTimeout(deferred.resolve({
                    posts: []
                }), 0);
                return deferred.promise;
            }
            return httpClient.get(url);
        },
        getPostsCommentsCount: function(postsIdList, postType) {
            Ember.Logger.info('[postService] >> [PostStatsUtil] >> [getPostsCommentsCount]!');
            var url = "";
            if (window.comments && window.comments.getConfig()) {
                var config = window.comments.getConfig();
                url += cloudletURL + config.pluginType + "/" + config.appId;
                url += "?entityType=" + postType + "&entityIdList=" + postsIdList.join(",");
            } else {
                var deferred = Q.defer();
                setTimeout(deferred.resolve({
                    posts: []
                }), 0);
                return deferred.promise;
            }
            return httpClient.get(url);
        },
        statsService: function(modelItem) {
            Ember.Logger.info('[postService] >> [PostStatsUtil] >> [statsService]!');
            _.each(modelItem, function(post) {
                post.stats = Ember.Object.create({
                    comments: 0,
                    likes: 0
                });
            });
            var postIdList = _.pluck(modelItem, "_id");
            App.PostStatsUtil.getPostsCommentsCount(postIdList, postType)
                .then(function(postComments) {
                    var posts = modelItem;
                    _.each(postComments, function(postComment) {
                        var match = _.findWhere(posts, {
                            _id: postComment._id
                        });
                        if (match) {
                            match.stats.set("comments", postComment.entries[0].value.comments.length);
                        }
                    });

                }, function(error) {
                    Ember.Logger.error("Stats Service error in getting post comment count :>>", error);
                });

            App.PostStatsUtil.getPostsLikesCount(postIdList, postType)
                .then(function(postLikes) {
                    var posts = modelItem;
                    _.each(postLikes, function(postLike) {
                        var match = _.findWhere(posts, {
                            _id: postLike._id
                        });
                        if (match) {
                            match.stats.set("likes", postLike.count);
                        }
                    });

                }, function(error) {
                    Ember.Logger.error("Stats Service error in getting post likes count :>>", error);
                });

        },
        cloudstats: function(model, postType) {
            Ember.Logger.info('[postService] >> [PostStatsUtil] >> [cloudstats]!');
            var postIdList = _.pluck(model, "_id");
            _.each(model, function(post) {
                post.stats = Ember.Object.create({
                    comments: 0,
                    likes: 0
                });
            });
            App.PostStatsUtil.getPostsCommentsCount(postIdList, postType)
                .then(function(comments) {
                    var commentsInfo = _.groupBy(comments, function(comment) {
                        return comment._id
                    })
                    _.each(model, function(aPost) {
                        var info = commentsInfo[aPost._id];
                        _.isEmpty(info) ? aPost.stats.comments = 0 : aPost.stats.comments = info.entries[0].value.comments.length;
                    });
                    return;
                }, function(error) {
                    Ember.Logger.error("Cloud stats error in getting post comment count :>>", error);
                });

            App.PostStatsUtil.getPostsLikesCount(postIdList, postType)
                .then(function(likes) {
                    var posts = model;
                    _.each(likes, function(likes) {
                        var match = _.findWhere(posts, {
                            _id: likes._id
                        });
                        if (match) {
                            match.stats.set("likes", JSON.stringify(likes.count));
                        }
                    });
                    return;
                }, function(error) {
                    Ember.Logger.error("Cloud stats error in getting post likes count :>>", error);
                });
            return;
        }

    });

    //Post Status.
    var postStatuses = [{
        label: "Draft",
        value: "draft"
    }, {
        label: "Published",
        value: "published"
    }, {
        label: "Inactive",
        value: "inactive"
    }];

    //Post Scope.
    var postScopes = [{
        label: "Public",
        value: "public"
    }, {
        label: "Restricted",
        value: 'restricted'
    }];

    //Create Ember Object on the basis of postType.
    var postObjectModel = function(postType, flag, modelObject) {
        var model;
        var object = modelObject ? modelObject : {};
        switch (postType) {
            case "blog":
                model = flag ? App.Blog.create(object) : App.Blog.create();
                break;
            case "question":
                model = flag ? App.Question.create(object) : App.Question.create();
                break;
            case "wiki":
                model = flag ? App.Wiki.create(object) : App.Wiki.create();
                break;
            default:
                Ember.Logger.info("No filter type is matching.");
                break;
        }
        return model;

    };

    // Format the shared Object.
	var formatIntoShares= function(shares) {
		return _.map(shares, function(share) {
			if(typeof(share)=='string'){
			  var idNameAndTypeArray = share.trim().split('|');
				return {
				'entityId': idNameAndTypeArray[0],
				'entityName': idNameAndTypeArray[1],
				'entityType': idNameAndTypeArray[2]
			};

		  }else{
			var idNameAndTypeArray = share.share.trim(); 
			  return {
				'entityId': idNameAndTypeArray
			};

		  }
		});
	}
    
    // Auto-hide message notifications
    var autoHideMessageNotifications = function(){
        try{
            jQuery("#successMessageDiv").fadeTo(2000, 500).slideUp(500, function(){
                jQuery("#successMessageDiv").alert('close');
            });
        }catch(error){
            Ember.Logger.error("Skippable: [postUtils :: ][autoHideMessageNotifications :: >>>] ", error);
        }
    }

    //Handling all common posts properties .
    return {
        validationCriteria: postValidation,
        confirmModelDialogController: confirmModelDialog,
        queryParams: queryParams,
        firstCharToUpperCase: firstCharToUpperCase,
        clearShare: clearShare,
        postsNewRouteQueryParams: postsNewRouteQueryParams,
        postStatuses: postStatuses,
        postScopes: postScopes,
        postObjectModel: postObjectModel,
        formatIntoShares: formatIntoShares,
        autoHideMessageNotifications: autoHideMessageNotifications
    }
});
