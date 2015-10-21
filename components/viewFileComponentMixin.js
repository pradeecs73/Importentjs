define(["app", "services/statesService", "services/pipelineResourceService", "services/tenantService", "Q"],
    function (app, statesService, pipelineService, tenantService, Q) {
    app.ViewFileComponentMixin = Ember.Mixin.create({
        allowedVideoFileTypes: app.allowedVideoFileTypes,
        documentReadUrl: function () {
            var document = this.get('document');
            var id = document.id;
            return this.iPadBaseUrl().replace("{documentId}", id).replace("{token}", App.getAuthToken()).replace("{userId}",App.getUsername()).replace("{appId}",this.get("appId"));
        }.property(),

        createGuid: function() {
            return '4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },

        viewableFileTypes: function() {
            return _.union(this.allowedVideoFileTypes, ['epub']);
        },

        isFileViewable: function() {
            var self = this;
            var fileExtensionRegex =  /(?:\.([^.]+))?$/;
            var document = this.get('document');
            return _.contains(self.viewableFileTypes(), fileExtensionRegex.exec(document.uri).pop().toLowerCase())
        }.property(),

        isReaderDelivered: function() {
            var fileExtensionRegex =  /(?:\.([^.]+))?$/;
            var document = this.get('document');
            return _.contains(['epub'], fileExtensionRegex.exec(document.uri).pop().toLowerCase())
        }.property(),

        isFileStateSuccessful: function(state) {
            var document = this.get('document');
            var appId = this.get('appId');
            return statesService.statusFor(state, appId, "files", document.id);
        },

        isVideoStateSuccessful: function(state) {
            var document = this.get('document');
            var appId = this.get('appId');
            return statesService.statusForVideo(state, appId, "files", document.id);
        },

        isMobile: function () {
            return (navigator.userAgent.match(/iPhone|iPad|iPod|Android/i) !== null);
        },

        iPadBaseUrl: function () {
            return "ciscob2breader://?appId={appId}&documentId={documentId}&token={token}&userId={userId}&tenant=" + document.location.protocol + "//" + document.location.host;
        },

        openOnlineReader: function() {
            var document = this.get('document');
            var appId = this.get('appId');
            var id = document.id;
            var url="/knowledgecenter/reader/content/show?x="+id+"&y="+this.createGuid()+"&z="+appId;
            window.open(url);
        },

        openOfflineReader: function() {
            document.location = this.get('documentReadUrl');
        },

        getResourcePromise: function() {
            var self = this;
            return pipelineService.getResourceByRawResourceId("files", self.get('document').id, self.get("appId"));
        },

        getTenantInfoPromise: function() {
            return tenantService.getTenantInfo();
        },

        openVideoPlayerWindow: function() {
            var self = this;
            Q.spread([self.getResourcePromise(), self.getTenantInfoPromise()], function (resource, tenantInfo) {
                var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
                var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;
                var w = 640;
                var h = 480;
                var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
                var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

                var left = ((width / 2) - (w / 2)) + dualScreenLeft;
                var top = ((height / 2) - (h / 2)) + dualScreenTop;

                var playerId = tenantInfo.BrightcoveInfo.PlayerId;
                var playerKey = tenantInfo.BrightcoveInfo.PlayerKey;
                var document = self.get('document');
                var windowName = document.title;

                var windowTitle = "Video Player - " + document.title;
                var playerUrl = "/player.html?documentId=" + self.get('document').id + "&appId=" + self.get("appId") + "&playerID=" + playerId + "&playerKey=" + playerKey + "&title=" + windowTitle;
                var params  = 'width='+w;
                params += ', height='+h;
                params += ', top='+top+', left='+left;
                params += ', resizable=1';
                params += ', toolbar=0';
                params += ', scrollbars=0';
                params += ', location=0';

                var popUp = window.open(playerUrl, windowName, params);
                self.checkPopUpBlocker(popUp);
                popUp.focus();
            })
        },

        checkPopUpBlocker: function(popup_window) {
            var self = this;
            if (popup_window) {
                if (/chrome/.test(navigator.userAgent.toLowerCase())) {
                    setTimeout(function() {
                        self._is_popup_blocked(popup_window);
                    }, 1000);
                } else {
                    popup_window.onload = function() {
                        self._is_popup_blocked(popup_window);
                    };
                }
            }
            else {
                alert("Please disable Popup Blocker and try again");
            }
        },

        _is_popup_blocked: function(popup_window) {
            if (!(popup_window.innerHeight > 0)) {
                alert("Please disable Popup Blocker and Refresh page");
            }
        },

        showError: function(id, document) {
            var elementId = id + "_" + document.id;
            $(elementId).removeClass("hide");
            var delay = 4000;
            setTimeout(function () {
                $(elementId).addClass("hide");
            }, delay);
        },

        actions: {
            openReaderIfFileAvailable: function() {
                var self = this;
                this.isFileStateSuccessful("READER_DELIVER").then(function(status) {
                    if (status) {
                        self.isMobile() ? self.openOfflineReader() : self.openOnlineReader();
                        app.DocumentUtils.pushToActivityStreamForDocument(self.get('document'), "view");
                    }
                    else {
                        self.sendAction('fileUnavailable', 'Epub');
                    }
                }, function(err) {
                    var document = self.get('document');
                    if(err.status === 403) {
                        self.showError("#forbiddenOrNotFoundErrorMessage", document);
                    }
                });
            },

            openVideoPlayerIfFileAvailable: function() {
                var self = this;
                this.isVideoStateSuccessful("TRANSCODING").then(function(status) {
                    if (status) {
                        self.openVideoPlayerWindow();
                        app.DocumentUtils.pushToActivityStreamForDocument(self.get('document'), "view");
                    }
                    else self.sendAction('fileUnavailable', 'Video');
                }).fail(function(err) {
                    var document = self.get('document');
                    if(err.status === 404) {
                        self.showError("#forbiddenOrNotFoundErrorMessage", document);
                    }
                });
            }
        }
    });
});
