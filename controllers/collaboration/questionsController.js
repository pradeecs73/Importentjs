define(['app', 'services/tagsService', 'services/usersService', 'services/groupService', 'applicationController', 'text!templates/questions.hbs', 'text!templates/question.hbs', 'text!templates/questionView.hbs',
        'text!templates/createQuestion.hbs', 'Q', 'httpClient', 'pages/wysiwyg+tags', 'emberValidator', 'text!templates/collaboration/questionsCatalog.hbs', 'pages/blog', 'services/kotg/taggingService', 'services/collaborationUtil', 'services/collaboration/postSearchService',
        'services/collaboration/postService', 'services/collaboration/postService_create', 'controllers/collaboration/utils/postUtil', 'services/collaboration/postService_update','services/entitlementService'
    ],
    function(app, tagsService, usersService, groupService, appController, questionsTemplate, questionsListTemplate, questionView, createQuestionTemplate, Q, httpClient, ui, emberValidator, questionsCatalogTemplate,
        questionsJs, taggingService, collaborationUtil, postSearchService, postService, postService_create, postUtil, postService_update,entitlementService) {

        App.QuestionsController = Ember.Controller.extend({});

        App.Question = Ember.Object.extend(Ember.Validations.Mixin, {
            validations: postUtil.validationCriteria,
            files: [],
            deletedfile: [],
            type: "FORUM",
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

        App.QuestionsView = Ember.View.extend({
            template: Ember.Handlebars.compile("{{outlet questionContainer}}")
        });
        App.QuestionsIndexRoute = Ember.Route.extend({
            queryParams: postUtil.queryParams,
            setupController: function(controller, model) {
                controller.setProperties({
                    content: model,
                    totalResults: model.totalResults,
                    status: this.controllerFor('questions').status
                });
            },
            model: function(queryParams) {
                return postService.getPostsModel('questions', this, queryParams).then(function(response){
                    return response;
                }, function(error){
                    return error;
                })
            },
            renderTemplate: function() {
                this.render('questionsIndex', {
                    outlet: 'questionContainer',
                    into: 'questions'
                });
            }
        });

        App.QuestionsIndexController = Ember.ObjectController.extend({
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
            searchBoxText: '',
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
            showMessage: false,
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
                postService.filterSelected("questions", this);
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
                delete: function(question) {
					postService.deletePosts("question", this, question);
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

        App.QuestionsIndexView = Ember.View.extend(App.ConfirmDeleteDialogViewMixin, {
            template: Ember.Handlebars.compile(questionsCatalogTemplate),
            confirmModelDialogController: postUtil.confirmModelDialogController('discussion'),
            toggleView: function(view) {
                this.controller.set('_currentView', view);
            },
            didInsertElement: function() {
                postService.postsIndexViewDidInsertElement('question', this);
            }
        });

        App.QuestionsNewRoute = Ember.Route.extend({
            queryParams: {
                communityId: {
                    refreshModel: true
                }
            },
            model: function(queryParameters) {
               return postService_create.postsModelForNewRoute("question", this, queryParameters);
            },
            getUsers: function() {
                return usersService.allUsers();
            },
            getGroups: function() {
                return groupService.allGroups();
            },
            setupController: function(controller, model) {
                return postService_create.postsNewRouteSetupController("question", controller, model);
            },
            renderTemplate: function() {
                this.render('questionsNew', {
                    outlet: 'questionContainer',
                    into: 'questions'
                });
            },
            tabTitle: "Ask a Discussion"
        });

        App.QuestionsNewController = Ember.ObjectController.extend({
            queryParams: ['communityId'],
            needs: ['questions'],
            selected: "public",
            allTagsLoaded: false,
            communityId: "",
            scopes: postUtil.postScopes,
            selectedName: "draft",
            statuses: postUtil.postStatuses,
            isPublic: function() {
                return this.get("scope") === "public";
            }.property("scope"),
            mode: "Create",
            allTags: null,
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
                createQuestion: function() {
                    postService_create.createPost("question", this);
                    postUtil.autoHideMessageNotifications();
                },
                clear: function() {
                   postService_create.postNewControllerClearAction("questions", this);
                },
                deleteAttachment: function(name, id) {
                   postService_create.deleteAttachmentPostsNewController(this, name, id);
                }
            }
        });

        App.QuestionsNewView = Ember.View.extend(App.FileUploadDialogViewMixin, {
            template: Ember.Handlebars.compile(createQuestionTemplate),
            didInsertElement: function() {
                jQuery(".allowreplies").find('input').prop("checked","checked");
                postService_create.didInsertElementPostsNewController(this);
            },
            observeModelChange: function() {
                this.rerender()
            }.observes("controller.model.shares.@each"),
            willClearRender: function() {
                this.controller.set("allTags", null)
                this.controller.set("allTagsLoaded", null)
            }
        });

        App.QuestionController = Ember.ObjectController.extend({
            currentUser: App.getUserLoginId(),
            showRelatedQuestions: false,
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
            isMyTabSeleted: function() {
                return (this.parentController.get("currentTab") === "my") ? true : false;
            }.property("currentTab"),
            isUserAuthored: function() {
                return (this.get("author") === App.getUserLoginId()) ? true : false;
            }.property("author"),
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
                delete: function(question) {
                    postService.deleteAPost("question", this, question);
                },
                postComment: function() {
					postService.postComment("question", this);
                },
                updatePost: function(updateMethodName, question) {
                    window.__questionControllerInstance__ = this;
                    var data = {
                        user: App.getUserLoginId(),
                        displayName: app.getShortname()
                    };
                    if (updateMethodName === "addRatings") {
                        data.score = $('.ratings').raty('score');
                    }
                    return this.postUtilService(updateMethodName, question._id, data).then(function(response) {
                        if (response.post) {
                            var oldModel = window.__questionControllerInstance__.get('model');
                            var model = response.post;
                            model["relatedQuestions"] = oldModel.relatedQuestions;
                            window.__questionControllerInstance__.set('model', model);
                        }

                    }, function(error) {
                        console.log(error);
                    });
                },
                sharePost: function(postId, share) {
					postService.sharePost("question", this, postId, share);
                }
            },
            postUtilService: function(serviceType, _blogId, data) {
                return httpClient.put("/knowledgecenter/cclom/posts/" + serviceType + "/" + _blogId, data);
            }
        });

        App.QuestionRoute = Ember.Route.extend({
            getUsers: function() {
                return usersService.allUsers();
            },
            getGroups: function() {
                return groupService.allGroups();
            },
			actions: {
                openShareModel: function(postId) {
                    postService.openShareModel("question", this, postId);
                },
                clearShare: function() {
                   postUtil.clearShare();
                }
            },
            beforeModel: function() {
                sessionStorage.setItem("replyParentId","");
                this.controllerFor('question.index').set('isActiveTransition', false);
            },
            model: function(params) {
                this.controllerFor('question.index').set('isActiveTransition', true);
                return this.controllerFor('question.index').buildModel(params.question_id);
            },
            afterModel: function(model) {
                if (this.controllerFor('question.index').get('isActiveTransition')) {
                    if (model._id) {
                        postService.updatePostView(model, "question");
                        postUtil.autoHideMessageNotifications();
                    }
                }
            },
            serialize: function(model) {
                return {
                    question_id: model._id
                };
            }
        });

        App.QuestionIndexView = Ember.View.extend(App.ConfirmDeleteDialogViewMixin, {
            confirmModelDialogController: postUtil.confirmModelDialogController('discussion'),
            template: Ember.Handlebars.compile(questionView),
            didInsertElement: function() {
                postService.postIndexDidInsertElement("question", this);
                postUtil.autoHideMessageNotifications();
            },
            createActivityStreamObject: function(model){
                return postService.createActivityStreamObject("question", model);
            },
            fetchSelectedTags: function(entityId) {
                var self = this;
                taggingService.fetchSelectedTags(entityId, "question").then(function(tags) {
                    self.controller.set("selectedTags", tags);
                });
            }
        });

        App.QuestionIndexController = Ember.ObjectController.extend({
            isActiveTransition: false,
            currentUser: App.getUserLoginId(),
            clearReplyIds:function(){
                var self=this;
                self.cancelReply();
            },
            checkLockStatus:function(){
                 if(this.get('model').recentLockActivity && this.get('model').recentLockActivity.status=='locked')
                    return  true 
                 return false;
            }.property('lockStatus'),
            isUserAuthored: function() {
                var isUserAuthored = false;
                var isOwner =  (this.get("author") === App.getUserLoginId()) ? true : false;
                var isAdmin = false ;
                entitlementService.isAdmin().then(function(decision){
                    isAdmin = decision;
                }).fail(function(error){
                    Ember.Logger.error("Admin role validation failed >>>"+error);
                    isAdmin = false;
                })
                return isOwner || isAdmin;
            }.property("author"),
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
            actions: {
                delete: function(question, tabKey) {
                    this.controllerFor('question').send('delete', question, "question");
                },
                sharePost: function(postId, share) {
                    this.controllerFor('question').send('sharePost', postId, share);
                },
                downloadAttachFile: function(fileName, postId) {
                    postService.downloadAttachFile(fileName, postId);
                },
                replyToDiscussion:function(getModel){
                    var self = this;
                    var parentId = getModel._id;
                    if(sessionStorage.getItem('replyParentId')){
                       parentId = sessionStorage.getItem('replyParentId');
                    }
                    var discussionPostText = CKEDITOR.instances["wysiwyg-editor"].getData().trim();
                    if(!discussionPostText){
                            jQuery.gritter.add({
                                title: '',
                                text: "Please enter valid reply",
                                class_name: 'gritter-error'
                            });
                        return false;
                    }
                    
                    var userEmail = app.getUserLoginId();
                    var displayName = app.getShortname();
                    postService_update.replyToSpecificDiscussion(discussionPostText,parentId,userEmail,displayName,this.get('model')).then(function(data){  
                        console.log(self.get('model'))
                        var existingReplies = self.get('model').discussionSpecifics.threadPosts;
                        var responseReplies = data.data.discussionSpecifics.threadPosts; 
                        if(existingReplies.length != responseReplies.length ){
                            var newResponseIds = _.pluck(responseReplies,'_id');
                            var existingRepliesIds = _.pluck(existingReplies,'_id');
                            var checkDiff = _.difference(newResponseIds,existingRepliesIds);
                            /* Below logic will help us to avoid concatenation of series of ids, in case of previous failure(s) */
                            if(checkDiff.length > 1){
                                checkDiff = checkDiff[checkDiff.length - 1];
                            }
                            var latestreplyId=checkDiff.toString();
                            var latestReply = _.findWhere(responseReplies,{'_id':latestreplyId});

                                latestReply.discussionPostText = discussionPostText;    

                            
                            existingReplies = existingReplies.addObject(latestReply);
                            try {
                                var postType = self.get('model').type;
                                if(postType == 'FORUM'){
                                    postType = 'question'
                                }
                                var model = self.get('model');
                                postService.activityStreamPostForDiscussion(model,postType);
                            } catch (err) {
                                Ember.Logger.error("Publishing activity to AS failed due to: " + err)
                            }
                            jQuery.gritter.add({
                                title: '',
                                text: "Reply has been saved successfully.",
                                class_name: 'gritter-success'
                            });
                            self.cancelReply();                    
                        }
                    }).fail(function(error){
                        Ember.Logger.error("Failed to save the reply "+error);
                           jQuery.gritter.add({
                                title: '',
                                text: "Failed to save the reply",
                                class_name: 'gritter-error'
                            });
                    });
                    
                }
            },
            markAsAnswer:function(replyID){ 
                var self = this;
                var userEmailId = app.getUserLoginId();  
                var displayName = app.getShortname();
                var postId = this.get('model')._id;
                var action = 0;
                var answeredOrNot = false;
                var availableThreads = this.get('model').get('discussionSpecifics.threadPosts');
                var markedReply= _.findWhere(availableThreads,{'_id':replyID});
                //Messages have to be externalised.
                var confirmationText = "";
                if(!markedReply.isAnswer || !markedReply.isAnswer[0] || !markedReply.isAnswer[0].status){
                    action = 1;
                    answeredOrNot = true;
                    markedReply.isAnswer=[{status:true}];
                    //TODO: To be Revised
                    jQuery('#answer'+replyID).find('i').css('color','green');
                    jQuery('#answer'+replyID).parent().attr("data-original-title","Unmark Answer"); 
                    confirmationText = "You have successfully marked the reply as correct";                   
                }else{
                    markedReply.isAnswer=[{status:false}];
                    var getModel = self.get('model')

                    var allReplies = getModel.discussionSpecifics.threadPosts                    
                    var repliesWithAnswer = _.pluck(allReplies,"isAnswer")
                    _.find(repliesWithAnswer,
                            function(__answer){
                                   answeredOrNot = answeredOrNot || __answer[0].status
                           });
                    
                    //TODO: To be Revised
                    jQuery('#answer'+replyID).find('i').css('color','grey');
                    jQuery('#answer'+replyID).parent().attr("data-original-title","Mark As Answer");
                    confirmationText = "You have successfully unmarked the reply as correct";                    
                }
                postService_update.markReplyAsAnswer(userEmailId,displayName,this.get('model'),replyID,action,answeredOrNot).then(function(response){
                        Ember.Logger.info("Reply has been marked successfully");
                        jQuery.gritter.add({
                            title: '',
                            text: confirmationText,
                            class_name: 'gritter-success'
                        });
                }).fail(function(){
                        Ember.Logger.error("Failed to mark the reply");
                        jQuery.gritter.add({
                            title: '',
                            text: "Failed to mark the reply",
                            class_name: 'gritter-error'
                        });
                });            
            },
            lockResource:function(getModel){
                var self = this;
                window.__questionControllerInstance__ = this;                
                var currentStatus;
                var status;
                try{
                    if((!getModel.recentLockActivity) || (getModel.recentLockActivity.status && getModel.recentLockActivity.status == 'unlocked') || (!getModel.recentLockActivity.status)) {
                       currentStatus = 'locked'; 
                       status="closed";                       
                       jQuery('span#openCloseThread').find('i').removeClass("icon-lock-open").addClass("icon-lock-closed");
                       jQuery('span#openCloseThread').attr('data-original-title', 'Open  Discussion');
                    }else {
                        currentStatus = 'unlocked'; 
                        status="opened";
                        jQuery('span#openCloseThread').find('i').removeClass("icon-lock-closed").addClass("icon-lock-open");                      
                        jQuery('span#openCloseThread').attr('data-original-title', 'Close  Discussion');
                    }
                }catch(err){
                    Ember.Logger.error("Skippable: [questionsController :: ][lockResource :]", err)
                }   
                var lockedByEmailId = app.getUserLoginId();
                var lockedByDisplayName = app.getShortname();
                postService_update.lockResource(lockedByEmailId,lockedByDisplayName,this.get('model'),currentStatus).then(function(response){

                        try{
                            /*if(currentStatus == "locked"){                        
                                jQuery("#cancelReply").attr("disabled",true)
                                jQuery(".send-comment").attr("disabled",true)
                                jQuery(".thread-comment").hide()
                                CKEDITOR.instances['wysiwyg-editor'].setData("This discussion thread has been Closed for replies.")
                                CKEDITOR.instances['wysiwyg-editor'].setReadOnly(true)                        
                            }else{
                                jQuery("#cancelReply").attr("disabled",false)
                                jQuery(".send-comment").attr("disabled",false)
                                jQuery(".thread-comment").show()
                                CKEDITOR.instances['wysiwyg-editor'].setData("")
                                CKEDITOR.instances['wysiwyg-editor'].setReadOnly(false)                                
                            }*/
                            //self.get('model').set('recentLockActivity.status', currentStatus);
                            window.__questionControllerInstance__.set('recentLockActivity.status',currentStatus)
                        }catch(err){
                            Ember.Logger.error("Unable to disable the editor controls and its context." + err)
                        }
                        jQuery.gritter.add({
                            title: '',
                            text: "Discussion has been "+status+" successfully",
                            class_name: 'gritter-success'
                        });
                        if(window.UYANCMT){
                           try{
								UYANCMT.register(getModel._id, "question", getModel.title)
                                //TODO: Below inclusion should be in callback - to be revised
                                UYANCMT.toggleLock(getModel._id,"question")                             
                           }catch(error){
                                Ember.Logger.error("[questionController :: ] [locakResource] >>> Unable to submit call to upstream.", error)
                           } 
                        }                        
                }).fail(function(){
                        Ember.Logger.error("Failed to mark the reply");
                        jQuery.gritter.add({
                            title: '',
                            text: "Failed to perform lock-unlock action",
                            class_name: 'gritter-error'
                        });
                });

            },
            setReplyId :function(replyParentId){
                try{
                    $('html body').animate({
                        scrollTop: $(".thread-comment").offset().top},
                    'slow');
                }catch(e){
                    Ember.Logger.error("Unable to scroll to reply editor.")
                }
                    
                sessionStorage.setItem('replyParentId',replyParentId);
                jQuery('#cancelReply').html("Cancel reply to reply")
            },
            initialLikeCall:function(replyID){
                var self = this;
                var model= self.get('model');
                var entityId = replyID;
                var value;
                var likeInReference = jQuery("[ref-entity-id='" + replyID + "']");
                if(likeInReference.find('i').attr("data-original-title") == 'Like'){
                    value={"data":"up"};
                    likeInReference.find('i').attr("data-original-title", "Un-Like")
                    likeInReference.find('i').css("color", "rgb(255, 137, 42)") 
                    likeInReference.find("[id='__thumbs_count']").html('1')
                }else{
                    value = {"data":"down"};
                    likeInReference.find('i').attr("data-original-title", "Like")
                    likeInReference.find('i').css("color", "")
                    likeInReference.find("[id='__thumbs_count']").html('0')            
                }
               return postService_create.initialLikeCall(model,entityId,value);
            },            
            cancelReply :function(){
                CKEDITOR.instances["wysiwyg-editor"].setData("");   
                sessionStorage.setItem("replyParentId",""); 
                jQuery('#cancelReply').html("Cancel")
            },
            getQuestionDetails: function(questionId) {
                return httpClient.get("/knowledgecenter/cclom/posts/" + questionId);
            },
            getRelatedQuestions: function(questionId) {
                return httpClient.get("/knowledgecenter/cclom/posts/related/" + questionId + "?type=FORUM");
            },
            buildModel: function(questionId) {
                return postService.buildModel("question", this, questionId);
            }
        });

        App.QuestionEditRoute = Ember.Route.extend({
            needs: ['question', 'questions'],
            setupController: function(controller, model) {
                 return postService_update.postEditSetupController(controller, model);
            },
            model: function() {
                return postService_update.postEditModel("question", this);
            },
            afterModel: function() {
                Ember.run.next(this, function() {
                    Ember.set(this.controllerFor('application'), "currentPath", "questions.edit");
                });
            },
            getUsers: function() {
                return usersService.allUsers();
            },
            getGroups: function() {
                return groupService.allGroups();
            }

        });

        App.QuestionEditController = Ember.ObjectController.extend({
            needs: ['question', 'questions'],
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
            selectedCategory: function() {
                postService_update.setSelectedCategory(this);
            }.property("category"),
            mode: 'Update',
            allTags: null,
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
            allTagsLoaded: function() {
                return (this.get('allTags') != null);
            }.property('allTags'),
            updateQuestion: function() {
                return postService_update.updatePost("question", this);
            },
            actions: {
                createQuestion: function() {
                    this.updateQuestion();
                    postUtil.autoHideMessageNotifications();
                },
                clear: function() {
                    this.get('model').errors.clear();
                    this.controllerFor('questions').target.transitionTo('questions.index');
                },
                deleteAttachment: function(name, id) {
                    postService_update.postEditDeleteAttachment(this, name, id);
                }
            }
        });

        App.QuestionEditView = Ember.View.extend(App.FileUploadDialogViewMixin, {
            template: Ember.Handlebars.compile(createQuestionTemplate),
            didInsertElement: function() {
                this._super();
                Ember.run.scheduleOnce('afterRender', this, this.afterRenderEvent);
            },
            afterRenderEvent: function() {
                 postService_update.afterRenderEventPostEditView(this);
                 postUtil.autoHideMessageNotifications();
            }
        });
    });
