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
        app.CommunityFilesController = Ember.ObjectController.extend({
            currentUser: app.getUserLoginId(),
            isMember: false,
            isPublic: function() {
                return this.get('model').type == "public";
            }.property('model.type'),
            userHasAccessToCreatePostInDetailsPage:function(){
                var self = this;
                var userHasAccessToCreatePostInDetailsPage = groupService.showCreateButtonBasedonPermissionsInDetailsPage(self.get('model'),"Files");
                self.get('model').userHasAccessToCreatePostInDetailsPage = userHasAccessToCreatePostInDetailsPage.permissionStatus;
                return self.get('model').userHasAccessToCreatePostInDetailsPage;
            }.property('model.type'),
            displayAllViews: function() {
                return (this.get('model').type == "public" || this.get('model').type == "hidden" || (this.get('model').type == "private" && (this.controllerFor('community').isMember || this.isMember)));
            }.property('model.type'),
            userNameAttribute: "username",
            actions: {
                uploadFile: function() {
                    var self = this;
                    var community = this.get('model');
                    var formData = new FormData();
                    var uploadFile = community.get('fileuploadData');
                    _.each(uploadFile, function(obj, index) {
                        formData.append('file', obj);
                    });
                    formData.append('commId', community.get('_id'));
					formData.append('tenantId', community.get('tenant_Id'));
                    $.ajax({
                        url: '/groups/file/upload',
                        type: 'POST',
                        data: formData,
                        cache: false,
                        dataType: 'json',
                        processData: false,
                        contentType: false,
                        beforeSend: function(xhr) {
                            httpClient.setRequestHeadersData(xhr);
                        },
                        success: function(response, textStatus, jqXHR) {
                            self.get('model').fileuploadData = [];
                            Ember.set(self.get('model').fileuploadMetaData, "files", []);
                            Ember.set(self.get('model').fileuploadlistData, "files", response.data);
                            jQuery('.uploadid').hide();

                        },
                        error: function() {
                            Ember.FlashQueue.pushFlash('error', 'Blog creation failed.');

                        }
                    });
                },
                deleteAttachment: function(name, id) {

                    var thisModel = this.get('model');
                    var uploadData = thisModel.get('fileuploadData');
                    uploadData = _.without(uploadData, _.findWhere(uploadData, {
                        "name": name
                    }));
                    thisModel.set('fileuploadData', uploadData);
                    var obj = thisModel.fileuploadMetaData.files.findProperty("fName", name);
                    thisModel.fileuploadMetaData.files.removeObject(obj);
                },
                downloadAttachment: function(name, id) {
                    $.fileDownload("/knowledgecenter/groups/download/" + id + "/" + name)
                        .done(function() {
                            console.log('File download a success!');
                        })
                        .fail(function() {
                            console.log('File download failed!');
                            httpClient.get("/knowledgecenter/groups/download/" + id + "/" + name).then(function() {

                                console.log("download done");
                            });
                        });
                }
            }
        });

    });
