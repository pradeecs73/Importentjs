define(['app', 'services/tagsService', 'services/usersService', 'services/groupService', 'applicationController', 'text!templates/wikis.hbs', 'text!templates/wikis.hbs', 'text!templates/myWikis.hbs', 'text!templates/wikiView.hbs', 'text!templates/createWiki.hbs', 'text!templates/wikiLandingView.hbs', 'httpClient', "Q", 'pages/wysiwyg+tags',
        "emberValidator", 'jabberService', "text!templates/collaboration/wikiCatalog.hbs", "pages/blog", 'services/kotg/taggingService', 'services/collaborationUtil', 'services/collaboration/postSearchService', 'services/jabberUsersService', 'services/collaboration/postService', 'services/collaboration/postService_create', 'controllers/collaboration/utils/postUtil', 'services/collaboration/postService_update'
    ],
    function(app, tagsService, usersService, groupService, appController, wikisTemplate, wikiTemplate, myWikiTemplate, wikiViewTemplate, createWikiTemplate, wikiLandingViewTemplate, httpClient, Q, ui, emberValidator, jabberService, wikisCatalogTemplate, blogJs, taggingService, collaborationUtil, postSearchService, jabberUsersService, postService, postService_create, postUtil, postService_update) {

        App.WikisController = Ember.Controller.extend({});

        App.Wiki = Ember.Object.extend(Ember.Validations.Mixin, {
            validations: postUtil.validationCriteria,
            files: [],
            deletedfile: [],
            type: "WIKI",
            author: App.getUserLoginId(),
            authorName: app.getShortname(),
            tenantId: 30,
            permissions: ['view'],
            tags: [],
            fileuploadMetaData: Ember.Object.create({
                files: []
            }),
            id: "",
            existingShares: []
        });

        App.WikisIndexView = Ember.View.extend(App.ConfirmDeleteDialogViewMixin, {
            template: Ember.Handlebars.compile(wikisCatalogTemplate),
            confirmModelDialogController: postUtil.confirmModelDialogController('wiki'),
            toggleView: function(view) {
                this.controller.set('_currentView', view);
            },
            didInsertElement: function() {
                postService.postsIndexViewDidInsertElement('wiki', this);
            }
        });
        App.WikisView = Ember.View.extend({
            template: Ember.Handlebars.compile("{{outlet wikisContainer}}")
        });
        App.WikisIndexRoute = Ember.Route.extend({
            queryParams: postUtil.queryParams,
            setupControllers: function(controller, model) {
                controller.setProperties({
                    content: model,
                    totalResults: model.totalResults,
                    status: this.controllerFor('wikis').status
                })
            },
            model: function(queryParams) {
                return postService.getPostsModel('wikis', this, queryParams).then(function(response){
                    return response;
                }, function(error){
                    return error;
                })
            },
            renderTemplate: function() {
                this.render('wikisIndex', {
                    outlet: 'wikisContainer',
                    into: 'wikis'
                });
            }

        });

        App.WikisIndexController = Ember.ObjectController.extend({
            pageNumber: 1,
            totalResults: 0,
            queryParams: ['showMessage', 'searchText', 'filters', 'filterType', 'pageNumber', 'sortBy', 'sortOrder'],
            searchText: '',
            filters: '',
            filterType: 'my',
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
            usersAndGroupsForAutoSuggest: function() {
                var exclusionList = [];
                var sharesValuesOnly=postUtil.formatIntoShares(_.pluck(this.get("share"), "value"))
                var existingShares = _.map(sharesValuesOnly,function(share){
                    return share.entityId;
                });

                exclusionList = exclusionList.concat([this.get("model").author, App.getUserLoginId()]);
                exclusionList = exclusionList.concat(existingShares);
                return usersService.usersAndGroupsAutoSuggest(exclusionList);
            }.property('share'),
            filterSelected: function() {
                postService.filterSelected("wikis", this);
            }.observes('filter'),
            _currentView: "list-view",
            isGridView: function() {
                return this.get('_currentView') == 'grid-view';
            }.property("_currentView"),
            isMostRecentView: function() {
                return this.get('filter') == 'recent';
            }.property("filter"),
            actions: {
                changeSortedDataDirection: function(dropId) {
                    this.send('getChangedFieldDirection', this.get('sortBy'));
                },
                sortDataByFiledType: function(fieldName, dropId) {
                    if (fieldName && fieldName != "") {
                        this.set('sortBy', fieldName);
                        //collaborationUtil.getCommunitySortedDataByDirection(this, dropId, false);
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
                delete: function(wiki) {
					postService.deletePosts("wiki", this, wiki);
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

        App.WikiController = Ember.ObjectController.extend({
            currentUser: App.getUserLoginId(),
            showRelatedWikis: false,
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
                delete: function(wiki) {
					postService.deleteAPost("wiki", this, wiki);
                },
                goBack: function() {
                    history.back();
                },
                back: function() {
                    this.controllerFor('wikis').target.transitionTo('wikis.index');
                },
                postComment: function() {
					postService.postComment("wiki", this);
                },
                updatePost: function(updateMethodName, wiki) {
                    window.__wikiControllerInstance__ = this;
                    var data = {
                        user: App.getUserLoginId(),
                        displayName: app.getShortname()
                    };

                    if (updateMethodName === "addRatings") {
                        data.score = $('.ratings').raty('score');
                    }

                    return this.postUtilService(updateMethodName, wiki._id, data).then(function(response) {

                        if (response.post) {
                            var oldModel = window.__wikiControllerInstance__.get('model');
                            var model = response.post;
                            model["relatedWikis"] = oldModel.relatedWikis;
                            window.__wikiControllerInstance__.set('model', model);
                        }

                    }, function(error) {
                        console.log(error);
                    });
                },
                sharePost: function(postId, share) {
                   postService.sharePost("wiki", this, postId, share);
                }
            },
            postUtilService: function(serviceType, _wikiId, data) {
                return httpClient.put("/knowledgecenter/cclom/posts/" + serviceType + "/" + _wikiId, data);
            }
        });


        App.WikiRoute = Ember.Route.extend({
            getUsers: function() {
                return usersService.allUsers();
            },
            getGroups: function() {
                return groupService.allGroups();
            },
			actions: {
                openShareModel: function(postId) {
                    postService.openShareModel("wiki", this, postId);
                },
                clearShare: function() {
                    postUtil.clearShare();
                }
            },
            beforeModel: function() {
                this.controllerFor('wiki.index').set('isActiveTransition', false);
            },
            model: function(params) {
                this.controllerFor('wiki.index').set('isActiveTransition', true);
                return this.controllerFor('wiki.index').buildModel(params.wiki_id);
            },
            afterModel: function(model) {
                if (this.controllerFor('wiki.index').get('isActiveTransition')) {
                    if (model._id) {
                        postService.updatePostView(model, "wiki");
                    }
                }
            },
            serialize: function(model) {
                return {
                    wiki_id: model._id
                };
            }
        });

        App.WikiIndexController = Ember.ObjectController.extend({
            isActiveTransition: false,
            currentUser: App.getUserLoginId(),
            isUserAuthored: function() {
                return (this.get("author") === App.getUserLoginId()) ? true : false;
            }.property("author"),
            usersAndGroupsForAutoSuggest: function() {
                var exclusionList = [];
                return usersService.usersAndGroupsAutoSuggest(exclusionList);
            }.property('share'),
            actions: {
                delete: function(wiki, tabKey) {
                    this.controllerFor('wiki').send('delete', wiki, "wiki");
                },
                sharePost: function(postId, share) {
                    this.controllerFor('wiki').send('sharePost', postId, share);
                },
                downloadAttachFile: function(fileName, postId) {
                    postService.downloadAttachFile(fileName, postId);
                }
            },
            getWikiDetails: function(wikiId) {
                return httpClient.get("/knowledgecenter/cclom/posts/" + wikiId);
            },
            getRelatedWikis: function(wikiId) {
                return httpClient.get("/knowledgecenter/cclom/posts/related/" + wikiId + "?type=WIKI");
            },
            buildModel: function(wikiId) {
                return postService.buildModel("wiki", this, wikiId);
            }
        });


        App.WikiIndexView = Ember.View.extend(App.ConfirmDeleteDialogViewMixin, {
            template: Ember.Handlebars.compile(wikiViewTemplate),
            confirmModelDialogController: postUtil.confirmModelDialogController('wiki'),
            didInsertElement: function() {
                postService.postIndexDidInsertElement("wiki", this);
                postUtil.autoHideMessageNotifications();
            },
            createActivityStreamObject: function(model){
                return postService.createActivityStreamObject("wiki", model);
            },
            fetchSelectedTags: function(entityId) {
                var self = this;
                taggingService.fetchSelectedTags(entityId, "wiki").then(function(tags) {
                    self.controller.set("selectedTags", tags);
                });
            }
        });


        /* Wikis New Block */
        App.WikisNewRoute = Ember.Route.extend({
            queryParams: postUtil.postsNewRouteQueryParams,
            enter: function() {
                this.controllerFor('wikis').set('newPath', true)
            },
            setupController: function(controller, model) {
                return postService_create.postsNewRouteSetupController("wiki", controller, model);
            },
            model: function(queryParameters) {
                return postService_create.postsModelForNewRoute("wiki", this, queryParameters);
            },
            getUsers: function() {
                return usersService.allUsers();
            },
            getGroups: function() {
                return groupService.allGroups();
            },
            renderTemplate: function() {
                this.render('wikisNew', {
                    outlet: 'wikisContainer',
                    into: 'wikis'
                });
            },
            tabTitle: "New Wiki"
        });
        App.WikisNewController = Ember.ObjectController.extend({
            queryParams: ['chatSession', "session", "chatRoom", "communityId"],
            chatSession: "",
            chatRoom: "",
            session: "",
            communityId: "",
            needs: ['wikis'],
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
                createWiki: function() {
                    postService_create.createPost("wiki", this);
                    postUtil.autoHideMessageNotifications();
                },
                clear: function() {
                    postService_create.postNewControllerClearAction("wikis", this);
                },
                deleteAttachment: function(name, id) {
                   postService_create.deleteAttachmentPostsNewController(this, name, id);
                }
            }
        });

        App.WikisNewView = Ember.View.extend(App.FileUploadDialogViewMixin, {
            template: Ember.Handlebars.compile(createWikiTemplate),
            didInsertElement: function() {
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

        App.WikiEditView = Ember.View.extend(App.FileUploadDialogViewMixin, {
            template: Ember.Handlebars.compile(createWikiTemplate),
            didInsertElement: function() {
                this._super();
                Ember.run.scheduleOnce('afterRender', this, this.afterRenderEvent);
            },
            afterRenderEvent: function() {
                 postService_update.afterRenderEventPostEditView(this);
            }
        });

        App.WikiEditRoute = Ember.Route.extend({
            needs: ['wiki'],
            setupController: function(controller, model) {
                return postService_update.postEditSetupController(controller, model);
            },
            model: function() {
                var wiki =  postService_update.postEditModel("wiki", this);
                return Q.all([
                    this.getUsers(),
                    this.getGroups()
                ]).spread(function(users, groups) {
                    var data = [];
                    _.each(groups, function(group, key) {
                        data.push({
                            "id": group._id + "|" + group.name,
                            "name": group.name
                        });
                        // data.push(group.name)
                    });
                    _.each(users, function(user, key) {
                        data.push({
                            "id": user.username + "|" + user.shortName,
                            "name": user.shortName
                        });
                        // data.push(group.name)
                    });
                    wiki.data = data;
                }).then(function() {
                    return wiki;
                }, function(error) {
                    return wiki;
                });
            },
            afterModel: function() {
                Ember.run.next(this, function() {
                    Ember.set(this.controllerFor('application'), "currentPath", "wikis.edit");
                });
            },
            getUsers: function() {
                return usersService.allUsers();
            },
            getGroups: function() {
                return groupService.allGroups();
            },
            renderTemplate: function() {
                this.render();
            }
        });


        App.WikiEditController = Ember.ObjectController.extend({
            needs: ['wikis'],
            scopes: postUtil.postScopes,
            statuses: postUtil.postStatuses,
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
            usersAndGroupsForAutoSuggest: function() {
                var exclusionList = [];
                var sharesValuesOnly=postUtil.formatIntoShares(this.get("existingShares"));
                var existingShares = _.map(sharesValuesOnly,function(share){
                    return share.entityId;
                });
                exclusionList = exclusionList.concat([this.get("model").author, App.getUserLoginId()]);
                exclusionList = exclusionList.concat(existingShares);
                return usersService.usersAndGroupsAutoSuggest(exclusionList);
            }.property('share'),
            selectedCategory: function() {
                postService_update.setSelectedCategory(this);
            }.property("category"),
            mode: 'Update',
            updateWiki: function() {
                return postService_update.updatePost("wiki", this);
            },
            actions: {
                createWiki: function() {
                    this.updateWiki();
                    postUtil.autoHideMessageNotifications();
                },
                clear: function() {
                    this.get('model').errors.clear();
                    this.controllerFor('wikis').target.transitionTo('wikis.index');
                },
                deleteAttachment: function(name, id) {
                    postService_update.postEditDeleteAttachment(this, name, id);
                }
            }
        });
    });
