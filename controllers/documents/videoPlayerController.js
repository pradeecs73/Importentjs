define(["app", "text!templates/videoPlayerModal.hbs"],
    function(app, videoPlayerModal) {
        app.VideoPlayerView = Ember.View.extend({
            layoutName: "modal_layout",
            template: Ember.Handlebars.compile(videoPlayerModal)
        });

        app.VideoPlayerController = Ember.ObjectController.extend({
        });
    });