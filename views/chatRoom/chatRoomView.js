define(['app'],
  function(app) {
    app.ChatRoomView = Ember.View.extend({
      willInsertElement: function() {
        this.controller.initiateChatRoom();
      },
      didInsertElement: function() {
        this.controller.handleChatFocusedIn();
      },
      focusIn: function(evt) {
        this.controller.handleChatFocusedIn();
      },
      click: function(evt) {
        if (evt.target.getAttribute("placeholder") != "Invite here ...")
          this.controller.focusChatInput();
      },
      focusOut: function(evt) {
        this.controller.handleChatFocusedOut();
      }
    });
  })
