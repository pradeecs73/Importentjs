"use strict";

define(["app", "services/topicModellingService"],
  function(app, topicModellingService) {

    App.AdminTopicItemController = Ember.ObjectController.extend({
      maxProbability: 0,
      oldCategory: '',
      init: function() {
        var topic = this.get('model');
        this.maxProbability = 0;
        for (var index = 0; topic.tokens !== null && index < topic.tokens.length; index++) {
          if (this.maxProbability < topic.tokens[index].probability * 1000)
            this.maxProbability = topic.tokens[index].probability * 1000;
        }

        for (var index = 0; topic.tokens !== null && index < topic.tokens.length; index++) {
          var token = topic.tokens[index];
          token.fontSize = "font-size:" + (((token.probability * 1000) / this.maxProbability) * 2) + "em";
        }
      },

      prefixedTopicId: function() {
        var model = this.get("model");
        return "topic" + model.topicId;
      }.property("model"),

      isSuccessAlert: function() {
        var alert = this.get("alert");
        return alert && alert.status === "SUCCESS";
      }.property("alert"),

      isFailureAlert: function() {
        var alert = this.get("alert");
        return alert && alert.status === "FAILED";
      }.property("alert"),

      actions: {
        updateCategory: function(topic) {
          var self = this;
          if (topic.category.length == 0) {
            self.set("alert", {status: "FAILED", message: "Please enter a non-empty category"});
            return;
          }

          var category = topic.category.trim();

          topicModellingService.updateCategory(topic.topicId, category)
            .then(function() {
              self.set("oldCategory", category);
              self.set("alert", {status: "SUCCESS", message: "Saved"})
            })
            .fail(function(err) {
              if (err.responseJSON)
                self.set('alert', {status: "FAILED", message: err.responseJSON.errors});
            })
        },

        setEditMode: function(category) {
          this.set('oldCategory', category);
        },

        exitEditMode: function() {
          this.set('model.category', this.get('oldCategory'));
          this.set('alert', {status: "", message: ''});
        }
      }
    });
  });
