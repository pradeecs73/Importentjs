define(['app', 'jabberService'],
    function(app, jabberService) {
        app.ChatSessionView = Ember.View.extend({
            didInsertElement: function() {
                var messages = jabberService.getMessagesFor(this.controller.get('model').jabberUsername);
                this.controller.set("messages", messages);
                this.controller.updateLastAccessed(messages);
                Ember.run.scheduleOnce('afterRender', this, 'scrollToLastMessage');
            },
            scrollToLastMessage: function() {
                this.controller.scrollToLastMessage();
            },
            focusIn: function(evt) {
                this.controller.handleChatFocusedIn();
            },
            click: function(evt) {
                this.controller.focusChatInput();
            },
            focusOut: function(evt) {
                this.controller.handleChatFocusedOut();
            },
            keyUp: function(evt) {
                this.controller.sendTypingEvent();
            }
        });
    });
