'use strict';

define(['app', 'underscore', 'services/groupService',
        'services/usersService', 'services/webExService',
        'services/searchService', 'services/documentsService',
        'pages/flashMessage', 'emberPageble',
        'services/collaborationUtil', 'httpClient'
    ],
    function(app, _, groupService, userService,
        webExService, searchService, documentsService,
        flashMessage, emberPageble, collaborationUtil, httpClient) {
        /*This function will fetch list of all categories from groups Api and store in a session varibale*/
         app.CommunityDiscussionsController = Ember.ObjectController.extend(app.PeoplePopoverControllerMixin, {
            currentUser: app.getUserLoginId(),
            isMember: false,
            forumPageNumber: 1,
            pageNumber: 1,
            isPublic: function() {
                return this.get('model').type == "public";
            }.property('model.type'),
            displayAllViews: function() {
                return (this.get('model').type == "public" || this.get('model').type == "hidden" || (this.get('model').type == "private" && (this.controllerFor('community').isMember || this.isMember)));
            }.property('model.type'),
            userNameAttribute: "username",
            sortedFieldName: {

                'Forums': 'updateDate',
            },
            sortOrder: 'desc',
            paginatedDocuments: Ember.ArrayController.createWithMixins(VG.Mixins.Pageable, {
                perPage: app.PageSize
            }),
            getAllUsers: function() {
                return this.get('model').memberProfiles;
            },
            populatePostsData: function(type, pageNumber, sortBy, sortOrder) {
                app.communityUtils.populatePostsData(type, pageNumber, sortBy, sortOrder,this,groupService,app.PageSize);
            },
            sortCommunityDetailsData: function(fieldName, orderType, type) {
                app.communityUtils.sortCommunityDetailsData(fieldName, orderType, type,this);
            },
            getSortFieldName: function(type) {
                 app.communityUtils.getSortFieldName(type,this);
            },
            actions: {
              
                 createQuestion: function(communityId) {
                    this.transitionToRoute("questions.new", {
                        queryParams: {
                            communityId: communityId
                        }
                    });
                },
                getSortedDataByFiledType: function(fieldName, type, dropId) {
                    if (fieldName && fieldName != "") {
                        this.sortCommunityDetailsData(fieldName, this.get('sortOrder'), type);
                    }
                },
                changeSortedDataDirection: function(dropId, type) {
                    this.sortCommunityDetailsData(this.getSortFieldName(type), !this.get('sortOrder'), type);
                },
                gotoForumPage: function(pageValue) {
                    this.set('forumPageNumber', pageValue);
                    this.send('populatePostsData', 'FORUM', pageValue, this.get('sortedFieldName').Forums, this.sortOrder);

                },
                gotoPage: function(pageValue) {
                    this.set('pageNumber', pageValue);
                    this.send('populateSharedDocumentsByActionSearch', pageValue, this.get('sortedFieldName').Library, this.sortOrder);
                }
            }
        });

    });
