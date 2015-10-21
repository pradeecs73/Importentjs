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

        app.CommunityDocumentsController = Ember.ObjectController.extend(app.PeoplePopoverControllerMixin, {
            needs:['community','documentsMy'],
            currentUser: app.getUserLoginId(),
            isMember: false,
            pageNumber: 1,
            isPublic: function() {
                return this.get('model').type == "public";
            }.property('model.type'),
            displayAllViews: function() {
                return (this.get('model').type == "public" || this.get('model').type == "hidden" || (this.get('model').type == "private" && (this.controllerFor('community').isMember || this.isMember)));
            }.property('model.type'),
            userNameAttribute: "username",
            sortedFieldName: {
                'Library': 'uploadedOn'
            },
            sortOrder: 'desc',
            paginatedDocuments: Ember.ArrayController.createWithMixins(VG.Mixins.Pageable, {
                perPage: app.PageSize
            }),
            getAllUsers: function() {
                return this.get('model').memberProfiles;
            },
            populateSharedDocuments: function() {
                var self = this;

                var queryParams = {
                    searchText: "",
                    filters: "shares:" + this.get('model')._id,
                    pageSize: 99999
                };

                return documentsService.allDocumentsWithFilters(queryParams).then(function(results) {
                    self.set("paginatedDocuments.data", results.allDocuments);
                });
            },
            populateSharedDocumentsByActionSearch: function(pageNumber, sortBy, sortOrder) {
                var self = this;
                var pageSize = parseInt(app.PageSize),
                    searchText = '*',
                    filters = [],
                    filterType = 'all';
                var sortConfig = {};
                sortConfig[sortBy] = sortOrder
                groupService.groupsPostsData(searchText, filters, "file", pageSize, parseInt(pageNumber), {
                    "type": "SHARE",
                    "recipients": [this.get('model')._id]
                }, sortConfig).then(function(results) {
                    self.set('totalResults', results.totalResults);
                    self.set('allDocuments', results.allDocuments);
                });
            },
            sortCommunityDetailsData: function(fieldName, orderType, type) {
                app.communityUtils.sortCommunityDetailsData(fieldName, orderType, type,this);
            },
            getSortFieldName: function(type) {

                app.communityUtils.getSortFieldName(type,this);
            },
            actions: {
                  uploadDocument:function(id){
                   
                    var comController= this.get('controllers.community');

                    if(id !=null && comController.get('name') !=null){
                        var docController= this.get('controllers.documentsMy');
                        docController.set('isUpload',true);
                         docController.set('community_id',id);
                        docController.set('community_name',comController.get('name'));
                
                        this.transitionToRoute('documents.my');
                    }
                },
                getSortedDataByFiledType: function(fieldName, type, dropId) {
                    if (fieldName && fieldName != "") {
                        this.sortCommunityDetailsData(fieldName, this.get('sortOrder'), type);
                    }
                },
                changeSortedDataDirection: function(dropId, type) {
                    this.sortCommunityDetailsData(this.getSortFieldName(type), !this.get('sortOrder'), type);
                },
                gotoPage: function(pageValue) {
                    this.set('pageNumber', pageValue);
                    this.send('populateSharedDocumentsByActionSearch',  pageValue, this.get('sortedFieldName').Library, this.sortOrder);

                }
            }
        });

    });