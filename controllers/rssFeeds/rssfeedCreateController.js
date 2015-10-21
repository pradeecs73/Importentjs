'use strict'

define(
  [
    'app',
    'httpClient',
    'underscore'
  ],
  function(app, httpClient, _) {
    app.RssfeedCreateController = Ember.ObjectController.extend({
      content: {"name": "", "url": ""},
      blankNameError: false,
      blankUrlError: false,
      feedExistsError: false,
      rssUrlError: false,
      nameTooLongError: false,

      resetModel: function() {
        this.set("content", {"name": "", "url": ""});
        this.set('blankNameError', false);
        this.set('nameTooLongError', false);
        this.set('blankUrlError', false);
        this.set('feedExistsError', false);
        this.set('rssUrlError', false);
      },

      nameEmpty: function() {
        var name = $.trim(this.content.name);
        return (name === "");
      },
      nameTooLong: function() {
        var name = $.trim(this.content.name);
        return (name.length > 35);
      },
      urlEmpty: function() {
        var url = $.trim(this.content.url);
        return (url === "");
      },
      addFeedIfUrlisValid: function() {
        var googleUrl = document.location.protocol
          + '//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=10&callback=?&q='
          + encodeURIComponent(this.content.url);

        var self = this
        httpClient.getJson(googleUrl).then(function(response) {
          if (response.responseStatus === 200) {
            self.set('rssUrlError', false)
            self.controllerFor("rssfeeds").addFeed({
              name: self.content.name,
              url: self.content.url
            });
            self.resetModel();
            self.controllerFor("rssfeeds").send('close')
          } else {
            self.set('rssUrlError', true)
          }
        })
      },
      feedExist: function() {
        var feedsController = this.controllerFor("rssfeeds");
        var existingFeeds = feedsController.get('content');
        var feed = this.content;
        var existingFeed = _.find(existingFeeds, function(existingFeed) {
          return (existingFeed.name == feed.name || existingFeed.url == feed.url)
        })
        return existingFeed != null
      },

      nameError: function() {
        return (this.blankNameError || this.nameTooLongError || this.feedExistsError)
      }.property("blankNameError", "nameTooLongError", "feedExistsError"),

      urlError: function() {
        return (this.blankUrlError || this.rssUrlError || this.feedExistsError)
      }.property("blankUrlError", "rssUrlError", "feedExistsError"),

      actions: {
        save: function() {
          if (this.nameEmpty()) {
            this.set('blankNameError', true);
            return;
          }

          if (this.nameTooLong()) {
            this.set('nameTooLongError', true);
            return;
          }

          if (this.urlEmpty()) {
            this.set('blankUrlError', true);
            return;
          }

          if (this.feedExist()) {
            this.set('feedExistsError', true)
            return
          }

          this.addFeedIfUrlisValid()
        }
      }
    });
  })
