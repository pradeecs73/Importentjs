define(['app', 'services/tagsService', 'services/usersService', 'services/groupService',
        'applicationController', 'text!templates/blogView.hbs', 'text!templates/createBlog.hbs',
        'text!templates/blogLandingView.hbs', 'httpClient', "Q", 'pages/wysiwyg+tags',
        "emberValidator", 'jabberService', "text!templates/collaboration/blogsCatalog.hbs",
        "pages/blog", 'services/kotg/taggingService', 'services/collaborationUtil', 'services/collaboration/postSearchService',
        'services/jabberUsersService', 'services/collaboration/postService', 'services/collaboration/postService_create', 'controllers/collaboration/utils/postUtil', 'services/collaboration/postService_update'
    ],
    function(app, tagsService, usersService, groupService, appController, blogViewTemplate,
        createBlogTemplate, blogLandingViewTemplate, httpClient, Q, ui, emberValidator,
        jabberService, blogsCatalogTemplate, blogJs, taggingService, collaborationUtil, postSearchService, jabberUsersService, postService, postService_create, postUtil, postService_update) {

        App.BlogsController = Ember.Controller.extend({});

        App.Blog = Ember.Object.extend(Ember.Validations.Mixin, {
            validations: postUtil.validationCriteria,
            files: [],
            deletedfile: [],
            type: "BLOG",
            author: App.getUserLoginId(),
            authorName: app.getShortname(),
            tenantId: 30,
            permissions: ['view'],
            tags: [],
            id: "",
            fileuploadMetaData: Ember.Object.create({
                files: []
            }),
            fileuploadData: [],
            existingShares: []

        });

        App.BlogsIndexView = Ember.View.extend(App.ConfirmDeleteDialogViewMixin, {
            confirmModelDialogController: postUtil.confirmModelDialogController('blog'),
            template: Ember.Handlebars.compile(blogsCatalogTemplate),
            toggleView: function(view) {
                this.controller.set('_currentView', view);
            },
            didInsertElement: function() {
                postService.postsIndexViewDidInsertElement('blog', this);
            }
        });

        App.BlogsView = Ember.View.extend({
            template: Ember.Handlebars.compile("{{outlet blogsContainer}}")
        });
        App.BlogsIndexRoute = Ember.Route.extend({
            queryParams: postUtil.queryParams,
            setupController: function(controller, model) {
                controller.setProperties({
                    content: model,
                    totalResults: model.totalResults,
                    status: this.controllerFor('blogs').status
                })
            },
            model: function(queryParams) {
                return postService.getPostsModel('blogs', this, queryParams).then(function(response){
                    return response;
                }, function(error){
                    return error;
                })
            },
            renderTemplate: function() {
                this.render('blogsIndex', {
                    outlet: 'blogsContainer',
                    into: 'blogs'
                });
            }
        });

        App.BlogsIndexController = Ember.ObjectController.extend({
            pageNumber: 1,
            totalResults: 0,
            queryParams: ['showMessage', 'searchText', 'filters', 'filterType', 'pageNumber', 'sortBy', 'sortOrder'],
            searchText: '',
            filters: '',
            filterType: 'all',
            sortBy: 'updateDate',
            sortOrder: 'desc',
            sortableFields:[
                {text: 'Name', value: 'title'},
                {text:'Category', value:'category.name'},
                {text:'Date Updated', value:'updateDate'},
                {text:'Views', value:'viewsCount'},
                {text:'Author Name', value:'authorName'}
            ],
            showMessage: false,
            searchBoxText: '',
            isUserHasAccess: function() {
                var user = App.getUserLoginId();
                return this.get('author') === user;
            }.property('content'),
            isDraft: function() {
                return this.get("status") === "draft";
            }.property("status"),
            isPublished: function() {
                return this.get("status") === "published";
            }.property("status"),
            isPublic: function() {
                return this.get("scope") === "public";
            }.property("scope"),
            filter: "",
            filterSelected: function() {
                postService.filterSelected("blogs", this);
            }.observes('filter'),
            _currentView: "list-view",
            setFilterData: function(type) {
                this.get('model').status = '';
                this.set("filterType", type);
                this.set("searchText", "");
                this.set('pageNumber', 1)
            },
            isGridView: function() {
                return this.get('_currentView') == 'grid-view';
            }.property("_currentView"),
            isMostRecentView: function() {
                return this.get('filter') == 'recent';
            }.property("filter"),
            actions: {
                /**
                 * sort data by sort icon toggle.
                 * @author mohan rathour
                 */
                changeSortedDataDirection: function(dropId) {
                    //collaborationUtil.getCommunitySortedDataByDirection(this, dropId, true);
                    this.send('getChangedFieldDirection', this.get('sortBy'));
                },
                sortDataByFiledType: function(fieldName, dropId) {
                    if (fieldName && fieldName != "") {
                        this.set('sortBy', fieldName);
                        this.send('getChangedFieldDirection', fieldName);
                    }
                },
                getChangedFieldDirection: function(fieldName) {
                    $("#sortingDropdownId li a").removeClass("selected");
                    if (fieldName == 'category.name') {
                        fieldName = fieldName.split('.')[0];
                    }
                    $("#" + fieldName).addClass("selected");
                },
                gotoPage: function(pageValue) {
                    this.set('pageNumber', pageValue)
                },
                filter: function(filters) {
                    this.set('filters', filters.join(';'));
                    this.set('pageNumber', 1);
                },
                search: function() {
                    this.set('searchText', this.get('searchBoxText'))
                    this.set('filters', '')
                    this.set('pageNumber', 1);
                },
                downloadAttachFile: function(fileName, postId) {
                    postService.downloadAttachFile(fileName, postId);
                },
				delete: function(blog) {
                    postService.deletePosts("blog", this, blog);
                },
                toggleSortOrder: function(){
                  if(this.sortOrder == 'asc') this.set('sortOrder', 'desc');
                  else this.set('sortOrder', 'asc')
                },
                updateSortBy: function(sortByField) {
                    this.set('sortBy', sortByField);
                }
            }

        });

        App.BlogController = Ember.ObjectController.extend({
            showRelatedBlogs: false,
            currentUser: App.getUserLoginId(),
            currentUserShortName: app.getShortname(),
            statusLabel: function() {
                return this.get("status").capitalize();
            }.property("status"),
            isDraft: function() {
                return this.get("status") === "draft";
            }.property("status"),
            isPublic: function() {
                return this.get("scope") === "public";
            }.property("scope"),
            isUserAuthored: function() {
                return (this.get("author") === App.getUserLoginId()) ? true : false;
            }.property("author"),
            isUserHasEditPermission: function() {
                var sharedProperty = this.get("postShares").findBy("share", App.getUserLoginId());
                if (sharedProperty) {
                    return sharedProperty.permission.contains("edit");
                }
                return false;
            }.property("postShares"),
            isMyTabSeleted: function() {
                return (this.parentController.get("currentTab") === "my") ? true : false;
            }.property("currentTab"),
            isSharedTabSelected: function() {
                return (this.parentController.get("currentTab") === "shared") ? true : false;
            }.property("currentTab"),
            mapFavouriteActionMethod: function() {
                return (this.get("postFavourites").findBy("user", App.getUserLoginId())) ? 'removeFavourite' : 'addFavourite';
            }.property("postFavourites"),
            mapViewActionMethod: function() {
                return (this.get("views").findBy("user", App.getUserLoginId())) ? 'removeView' : 'addView';
            }.property("views"),
            mapLikeActionMethod: function() {
                return (this.get("userOpinions").findBy("user", App.getUserLoginId())) ? 'removeOpinions' : 'addOpinions';
            }.property("userOpinions"),
            mapFollowActionMethod: function() {
                return (this.get("follows").findBy("user", App.getUserLoginId())) ? 'removeFollow' : 'addFollow';
            }.property("follows"),
            actions: {
                delete: function(blog) {
					postService.deleteAPost("blog", this, blog);
                },
                goBack: function() {
                    history.back();
                },
                back: function() {
                    this.controllerFor('blogs').target.transitionTo('blogs.index');
                },
                postComment: function() {
					postService.postComment("blog", this);
                },
                updatePost: function(updateMethodName, blog) {
                    window.__blogControllerInstance__ = this;
                    var data = {
                        user: App.getUserLoginId(),
                        displayName: app.getShortname()
                    };
                    if (updateMethodName === "addRatings") {
                        data.score = $('.ratings').raty('score');
                    }
                    return this.postUtilService(updateMethodName, blog._id, data).then(function(response) {
                        if (response.post) {
                            var oldModel = window.__blogControllerInstance__.get('model');
                            var model = response.post;
                            model["relatedBlogs"] = oldModel.relatedBlogs;
                            window.__blogControllerInstance__.set('model', model);
                        }
                    }, function(error) {
                        console.log(error);
                    });
                },
                sharePost: function(postId, share) {
                    postService.sharePost("blog", this, postId, share);
                }
            },
            postUtilService: function(serviceType, _blogId, data) {
                return httpClient.put("/knowledgecenter/cclom/posts/" + serviceType + "/" + _blogId, data);
            }
        });


        App.BlogRoute = Ember.Route.extend({
            usersAndGroupsForAutoSuggest: function() {
                var exclusionList = [];
                return usersService.usersAndGroupsAutoSuggest(exclusionList);
            }.property('share'),
			actions: {
                openShareModel: function(postId) {
                   return  postService.openShareModel("blog", this, postId);
                },
                clearShare: function() {
                    postUtil.clearShare();
                }
            },
            beforeModel: function() {
                this.controllerFor('blog.index').set('isActiveTransition', false);
            },
            model: function(params) {
                this.controllerFor('blog.index').set('isActiveTransition', true);
                return this.controllerFor('blog.index').buildModel(params.blog_id);
            },
            afterModel: function(model) {
                if (this.controllerFor('blog.index').get('isActiveTransition')) {
                    if (model._id) {
                        postService.updatePostView(model, "blog");
                    }
                }
            },
            serialize: function(model) {
                return {
                    blog_id: model._id
                };
            }
        });

        App.BlogIndexController = Ember.ObjectController.extend({
            isActiveTransition: false,
            currentUser: App.getUserLoginId(),
            isUserAuthored: function() {
                return (this.get("author") === App.getUserLoginId()) ? true : false;
            }.property("author"),
            usersAndGroupsForAutoSuggest: function() {
                var exclusionList = [];
                 var sharesValuesOnly =postUtil.formatIntoShares(_.pluck(this.get("share"), "value"))
                var existingShares = _.map(sharesValuesOnly,function(share){
                    return share.entityId;
                });

                exclusionList = exclusionList.concat([this.get("model").author, App.getUserLoginId()]);
                exclusionList = exclusionList.concat(existingShares);
                return usersService.usersAndGroupsAutoSuggest(exclusionList);
                //return postUtil.getShareAutoSuggest(this);
            }.property('share'),
            actions: {
                delete: function(blog, tabKey) {
                    this.controllerFor('blog').send('delete', blog, "blog");
                },
                sharePost: function(postId, share) {
                    this.controllerFor('blog').send('sharePost', postId, share);
                },
                downloadAttachFile: function(fileName, postId) {
                    postService.downloadAttachFile(fileName, postId);
                }
            },
            getBlogDetails: function(blogId) {
                return httpClient.get("/knowledgecenter/cclom/posts/" + blogId);
            },
            getRelatedBlogs: function(blogId) {
                return httpClient.get("/knowledgecenter/cclom/posts/related/" + blogId + "?type=BLOG");
            },
            buildModel: function(blogId) {
                return postService.buildModel("blog", this, blogId);
            }
        });


        App.BlogIndexView = Ember.View.extend(App.ConfirmDeleteDialogViewMixin, {
            confirmModelDialogController: postUtil.confirmModelDialogController('blog'),
            template: Ember.Handlebars.compile(blogViewTemplate),
            didInsertElement: function() {
                postService.postIndexDidInsertElement("blog", this);
                postUtil.autoHideMessageNotifications();
            },
            createActivityStreamObject: function(model){
                return postService.createActivityStreamObject("blog", model);
            },
            usersAndGroupsForAutoSuggest: function() {
                var exclusionList = [];
                return usersService.usersAndGroupsAutoSuggest(exclusionList);
            }.property('share'),
            fetchSelectedTags: function(entityId) {
                var self = this;
                taggingService.fetchSelectedTags(entityId, "blog").then(function(tags) {
                    self.controller.set("selectedTags", tags);
                });
            }
        });


        App.BlogsNewRoute = Ember.Route.extend({
            queryParams: postUtil.postsNewRouteQueryParams,
            enter: function() {
                this.controllerFor('blogs').set('newPath', true)
            },
            setupController: function(controller, model) {
             return postService_create.postsNewRouteSetupController("blog", controller, model);
            },
            model: function(queryParameters) {
               return postService_create.postsModelForNewRoute("blog", this, queryParameters);
            },
            renderTemplate: function() {
                this.render('blogsNew', {
                    outlet: 'blogsContainer',
                    into: 'blogs'
                });
            },
            tabTitle: "New Blog"
        });
        App.BlogsNewController = Ember.ObjectController.extend({
            queryParams: ['chatSession', "session", "chatRoom", 'communityId'],
            chatSession: "",
            chatRoom: "",
            session: "",
            communityId: "",
            needs: ['blogs'],
            isPublic: function() {
                return this.get("scope") === "public";
            }.property("scope"),
            selected: "public",
            scopes: postUtil.postScopes,
            selectedName: "draft",
            statuses: postUtil.postStatuses,
            mode: 'Create',
            allTags: null,
            allTagsLoaded: false,
            proxyUsersList:null,
            allUsersConfig: function() {
                return usersService.usersAutoSuggest()
            }.property(),
            usersAndGroupsForAutoSuggest: function() {
                var exclusionList = [];
                var sharesValuesOnly=postUtil.formatIntoShares(this.get("existingShares"))
                var existingShares = _.map(sharesValuesOnly,function(share){
                    return share.entityId;
                });

                exclusionList = exclusionList.concat([App.getUserLoginId()]);
                exclusionList = exclusionList.concat(existingShares);
                return usersService.usersAndGroupsAutoSuggest(exclusionList);
            }.property('share'),
			actions: {
                createBlog: function() {
                       postService_create.createPost("blog", this);
                       postUtil.autoHideMessageNotifications();
                },
                clear: function() {
                    postService_create.postNewControllerClearAction("blogs", this);
                },
                deleteAttachment: function(name, id) {
                    postService_create.deleteAttachmentPostsNewController(this, name, id);
                }
            }
        });

        App.BlogsNewView = Ember.View.extend(App.FileUploadDialogViewMixin, {
            template: Ember.Handlebars.compile(createBlogTemplate),
            didInsertElement: function() {
                var self = this;
                 postService.validateBloggerProxy(self.get('controller').get('communityId')).then(function(status){
                    self.get('controller').set('userHasBloggerProxyAccess',status);
                    if(status)
                          postService.getProxyUsersInAutoSuggestBox(self.get('controller').get('communityId'),self.get('controller'),'Blogs');
                  }).fail(function(err){
                     Ember.Logger.error('[BlogsController :: setupController:]',err);
                     self.get('controller').set('userHasBloggerProxyAccess',false);
                  });
                 
                postService_create.didInsertElementPostsNewController(this);
            },
            observeModelChange: function() {
                this.rerender()
            }.observes("controller.model.shares.@each"),
            willClearRender: function() {
                this.controller.set('allTags', "");
                this.controller.set('allTagsLoaded', false);
            }
        });

        App.BlogEditView = Ember.View.extend(App.FileUploadDialogViewMixin, {
            template: Ember.Handlebars.compile(createBlogTemplate),
            didInsertElement: function() {
                this._super();
                Ember.run.scheduleOnce('afterRender', this, this.afterRenderEvent);
            },
            afterRenderEvent: function() {
                 postService_update.afterRenderEventPostEditView(this);
                 postUtil.autoHideMessageNotifications();
            }
        });

        App.BlogEditRoute = Ember.Route.extend({
            needs: ['blog'],
            setupController: function(controller, model) {
                return postService_update.postEditSetupController(controller, model);
            },
            model: function() {
                return postService_update.postEditModel("blog", this);
            },
            afterModel: function() {
                Ember.run.next(this, function() {
                    Ember.set(this.controllerFor('application'), "currentPath", "blogs.edit");
                });
            },
            usersAndGroupsForAutoSuggest: function() {
                var exclusionList = [];
                return usersService.usersAndGroupsAutoSuggest(exclusionList);
            }.property('share'),
            renderTemplate: function() {
                this.render();
            }
        });


        App.BlogEditController = Ember.ObjectController.extend({
            needs: ['blogs'],
            scopes: postUtil.postScopes,
            statuses: postUtil.postStatuses,
            selectedCategory: function() {
                postService_update.setSelectedCategory(this);
            }.property("category"),
            selected: function() {
                return this.get('scope');
            }.property("scope"),
            selectedName: function() {
                return this.get('status');
            }.property("status"),
            isPublic: function() {
                return this.get("scope") === "public";
            }.property("scope"),
            allTags: null,
            allTagsLoaded: function() {
                return (this.get('allTags') != null);
            }.property('allTags'),
            mode: 'Update',
            usersAndGroupsForAutoSuggest: function() {
                var exclusionList = [];
                var sharesValuesOnly=postUtil.formatIntoShares(this.get("existingShares"))
                var existingShares = _.map(sharesValuesOnly,function(share){
                    return share.entityId;
                });
                exclusionList = exclusionList.concat([this.get("model").author, App.getUserLoginId()]);
                exclusionList = exclusionList.concat(existingShares);
                return usersService.usersAndGroupsAutoSuggest(exclusionList);
            }.property('share'),
            updateBlog: function() {
                  return postService_update.updatePost("blog", this);
            },
            actions: {
                createBlog: function() {
                    this.updateBlog();
                },
                clear: function() {
                    this.get('model').errors.clear();
                    this.controllerFor('blogs').target.transitionTo('blogs.index');
                },
                deleteAttachment: function(name, id) {
                    postService_update.postEditDeleteAttachment(this, name, id);
                }
            }
        });
    });
