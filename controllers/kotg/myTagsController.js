'use strict';

define(['app', 'text!templates/kotg/myTags.hbs', 'services/kotg/taggingService'], function(app, myTagsTemplate, taggingService) {

  App.FocusInputComponent = Ember.TextField.extend({
    becomeFocused: function() {
      this.$().focus();
    }.on('didInsertElement'),
    keyPress : function(e){
        if(e.which==13){ 
          window.App.__container__.lookup('controller:myTags').controllerFor("myTags").send("editTag" , this.get('param'));
        }
    }
  });

  app.MyTagsController = Ember.Controller.extend({
    init: function() {
      this._super();
    },
    actions: {
      editTag: function(tag) {
        var self = this;
        var model = this.get("model");
        _.each(model.tags, function(existingtag) {
          if (existingtag.isEditing) {
            if (existingtag.title.trim() === "" && existingtag._id === "") {
              self.send("removeTag", existingtag);
            }
            if (existingtag._id != tag._id) {
              Ember.set(existingtag, "isEditing", false);
            }
          }
        });

        if (tag.isEditing) {
          if (tag.title.trim() === "" && tag._id === "") {
            this.send("removeTag", tag);
          } else {
            taggingService.addUpdateTag(tag).then(function(res) {
              model.tags.removeObjects(_.clone(model.tags));
              _.each(res.value, function(tmptag) {
                tmptag.isEditing = false;
                model.tags.pushObject(tmptag);
              });
            });
          }
        } else {
          Ember.set(tag, "isEditing", true);
        }
      },
      removeTag: function(tag) {

        var self = this;
        if (tag._id === "") {
          self.get("model").tags.removeObject(tag);
          return;
        }
        bootbox.confirm("Are you sure you want to delete the Tag?", function(result) {
          if (result) {
            taggingService.removeTag(tag).then(function() {
              self.get("model").tags.removeObject(tag);
            }, function() {
              self.get("model").tags.removeObject(tag);
            });
          }
        });
      },
      addTag: function() {
        var self = this;
        var isNewPresent = _.findWhere(this.get("model").tags, {
          isEditing: true
        });
        if (!isNewPresent) {
          var tag = {
            "_id": "",
            "title": "",
            "isEditing": true
          };
          tag._id = "";
          this.get("model").tags.pushObject(tag);
        }
      }
    }
  });

  app.MyTagsRoute = Ember.Route.extend({
    model: function(params) {
      var self = this;
      var model = {
        tags: []
      };
      return new Ember.RSVP.Promise(function(resolve) {
        taggingService.fetchAllTags().then(function(res) {
          model.tags = res.value;
          _.each(model.tags, function(tag) {
            tag.isEditing = false;
          });
          resolve(model);
        }, function() {
          resolve(model);
        });
      });
    }
  });

  app.MyTagsView = Ember.View.extend({
    template: Ember.Handlebars.compile(myTagsTemplate)
  });

  //app.LeftNavController = Ember.Controller.extend({
  //  init: function() {
  //    this._super();
  //  }
  //})
});