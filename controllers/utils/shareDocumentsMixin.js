define(['app', 'httpClient', "services/kotg/kotgCollectionsService", "text!templates/shareTemplete.hbs", "Q", "services/usersService", "services/groupService"],
    function(App, httpClient, kotgCollectionsService, shareTemplete, Q, usersService, groupService) {

        App.ShareDocumentsMixin = Ember.Mixin.create({
            getUsers: function() {
                return usersService.allUsers();
            },
            getGroups: function() {
                return groupService.getAllGroups();
            },
            getKOTGDocumentSharedDetails: function(documentId, entityType) {
                var self = this;
                var alreadySharedData = [];
                var documentShareEndPoint = "/knowledgecenter/cclom/shared/" + entityType + "/" + documentId + "/" + App.getUsername();
                return httpClient.get(documentShareEndPoint).then(function(documentSharedInfo) {
                    if (documentSharedInfo && documentSharedInfo.entityShares.length > 0) {
                        alreadySharedData = _.map(documentSharedInfo.entityShares, function(sharedObj) {
                            return {
                                'share': sharedObj.share,
                                'display': sharedObj.display
                            };
                        });
                    }
                    return alreadySharedData;

                }, function(err) {
                    return alreadySharedData;
                });
            },
            openShareModel: function(routerContext) {
                var self = this;
                var shareModelData = Ember.Object.create({
                    documentId: sessionStorage.getItem("currentCacheItem"),
                    userAndGroupdata: []
                });

                Q.all([
                    self.getUsers(),
                    self.getGroups()
                ]).spread(function(users, groups) {

                    var userAndGroupdata = [];
                    _.each(groups, function(group, key) {
                        userAndGroupdata.push({
                            "id": group._id + "|" + group.name,
                            "name": group.name
                        });
                    });
                    _.each(users, function(user, key) {
                        userAndGroupdata.push({
                            "id": user.username + "|" + user.shortName,
                            "name": user.shortName
                        });
                    });
                    shareModelData.set("userAndGroupdata", userAndGroupdata);
                }).
                catch (function(error) {
                    console.log("error", error);
                }).done(function() {
                    self.getKOTGDocumentSharedDetails(shareModelData.documentId, ($.parseJSON(sessionStorage.getItem(shareModelData.documentId)).document.type === "Web") ? "document" : "notes")
                        .then(function(alreadySharedData) {
                            kotgCollectionsService.shareAutotag(shareModelData.userAndGroupdata, alreadySharedData);
                        });


                    jQuery('#shareCourse').modal('show');
                    $('#shareCourse').find('.modal-dialog').attr('class', "");
                });
                Ember.TEMPLATES['shareDocumentModalOutletView'] = Ember.Handlebars.compile(shareTemplete);
                routerContext.render('shareDocumentModalOutletView', {
                    into: routerContext.routeName,
                    outlet: 'shareDocumentModalOutlet'
                });

            },
            shareCourse: function(ignore, share) {
                var sharedJson = [];
                var sharedWith = (share) ? share.split(",") : [];
                if (sharedWith.length === 0) {
                    $('input[type=text]').val('');
                    this.set("comment", "");
                    alert("Please enter valid user name");
                } else {

                    var sharedBy = App.getUsername();
                    _.each(sharedWith, function(emailNamePair) {
                        var sharedObject = {};
                        var emailNamePairArr = emailNamePair.split('|')
                        sharedObject.share = emailNamePairArr[0].trim();
                        sharedObject.display = emailNamePairArr[1].trim();
                        if (emailNamePairArr[0].indexOf("@") == -1) {
                            sharedObject.type = "group";
                        } else
                            sharedObject.type = "email";
                        sharedObject.permission = ["read"];
                        sharedJson.push(sharedObject)
                    });

                    var currentPath = this.controllerFor('application').get('currentPath').split(".")[0];
                    var entityType = (currentPath === "collections") ? "document" : "notes";
                    var postData = {
                        "id": sessionStorage.getItem("currentCacheItem"),
                        "type": entityType,
                        "entityShares": sharedJson,
                        "sharedBy": sharedBy,
                        "sharedByDisplayName": App.getShortname()
                    };

                    httpClient.post("/knowledgecenter/cclom/share/" + entityType, postData).then(function(documentSharedDetails) {
                        self.set("documentSharedDetails", documentSharedDetails.entityShares);
                        console.log("success:", courseSharedDetails);
                    }, function(err) {
                        console.log("Error", err);
                    });
                    jQuery("#shareCourse").modal('hide');
                }
            },
            clearShare: function() {
                $('input[type=text]').val('');
                $('textarea').val('');
                $('input[type=select]').val('');
                $('input[type=radio]').val('');
                $('input[type=checkbox]').val('');
                this.set("comment", "");
            }
        });
    });