'use strict';

define(["app", "text!templates/components/videoPlayerComponent.hbs", "services/statesService", "services/pipelineResourceService", "services/tenantService", "Q"],
    function (app, videoPlayerTemplate, statesService, pipelineService, tenantService, Q) {
    app.VideoPlayerComponent = Ember.Component.extend({
        tagName: '',
        template: Ember.Handlebars.compile(videoPlayerTemplate),
        isReaderDelivered: false,
        videoId: "",
        playerId: "",
        playerKey: "",
        videoAvailable: true,
        checkingAvailability: false,
        videoAuthorName: "",
        videoName:"",
        documentId:"",


        didInsertElement: function() {
            var self = this;
            var tenantInfoPromise = tenantService.getTenantInfo();
            var videoStatusPromise = statesService.statusForVideo("TRANSCODING", applicationIdConfig.contentstore, "files", self.get('document').id);
            return Q.spread([tenantInfoPromise, videoStatusPromise], function(tenantInfo, videoAvailable){
                self.set('playerId', tenantInfo.BrightcoveInfo.PlayerId);
                self.set('playerKey', tenantInfo.BrightcoveInfo.PlayerKey);
                self.set('videoAvailable', videoAvailable);
                self.setVideoId();
                self.setDocumentIdVideoNameAndAuthorName();
            });
        },

        renderPlayer: function() {
            brightcove.createExperiences();
        }.observes('videoId'),

        setVideoId: function() {
            var self = this;
            return pipelineService.getResourceByRawResourceId("files", self.get('document').id, self.get("appId"))
                .then(function(resource) {
                    self.set('videoId', resource.videoId);
                })
        },

        setDocumentIdVideoNameAndAuthorName: function() {
            var self = this;
            self.set('videoAuthorName', self.get('document').createdBy);
            self.set('videoName', self.get('document').title);
            self.set('documentId', self.get('document').id);
        },

        playerElementId: function() {
            return "myExperience" + this.get('document').id;
        }.property(),

        hiddenFieldId: function() {
            return this.get('playerElementId') + "_video_id";
        }.property('playerElementId'),

        videoAvailableHiddenFieldId: function() {
            return this.get('playerElementId') + "_video_available";
        }.property('playerElementId'),

        videoAutherNameHiddenField: function() {
            return this.get('playerElementId') + "_video_author";
        }.property('playerElementId'),

        videoNameHiddenField: function() {
            return this.get('playerElementId') + "_video_name";
        }.property('playerElementId'),

        videoDocumentIdHiddenField: function() {
            return this.get('playerElementId') + "_document_id";
        }.property('playerElementId'),

        actions: {
            checkVideoAvailability: function() {
                this.set('checkingAvailability', true);
                var self = this;
                statesService.statusForVideo("TRANSCODING", applicationIdConfig.contentstore, "files", self.get('document').id)
                    .then(function(videoAvailable) {
                        self.set('videoAvailable', videoAvailable);
                        self.set('checkingAvailability', false);
                        if (videoAvailable) videoPlayer.cueVideoByID(self.get('videoId'));
                    });
            }
        }
    });

});