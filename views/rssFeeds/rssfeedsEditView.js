'use strict'
define(
  [
    'app',
    'text!templates/createRssfeedModal.hbs'
  ],
  function(app, createRssfeedModalTemplate) {
    app.RssfeedsEditView = Ember.View.extend({
      layoutName: "modal_layout",
      template: Ember.Handlebars.compile(createRssfeedModalTemplate),
      focusIn: function(evt) {
        if (evt.target.name === "name") {
          this.controller.set('blankNameError', false)
          this.controller.set('feedExistsError', false)
          this.controller.set('nameTooLongError', false)
        } else {
          this.controller.set('blankUrlError', false)
          this.controller.set('rssUrlError', false)
          this.controller.set('feedExistsError', false)
        }
      }
    })
  })
