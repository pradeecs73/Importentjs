Ember.flashController = Ember.Object.extend({
    /**
     * currently selected message from the FlashQueue
     */
    content: null,

    /**
     * callback for when the selected content has changed
     */
    contentChanged: function() {
        if (this.get('content')) {
            this.get('view').show();
            setTimeout(this.clearContent, 3000, this.get('content'), this.get('view'));
        } else {
            Ember.FlashQueue.contentChanged();
        }
    }.observes('content'),

    /**
     * handles clearing out the content from the view
     *
     * @param content the content to be removed from the queue.
     * @param view the flash view to remove the content from
     */
    clearContent: function(content, view) {
        view.hide(function() {
            Ember.FlashQueue.removeObject(content);
        });
    }
}).create();


Ember.FlashMessage = Em.Object.extend({
    type: "notice",
    message: null,

    isNotice: function() {
        return this.get("type") == "notice";
    }.property("type").cacheable(),

    isWarning: function() {
        return this.get("type") == "warning";
    }.property("type").cacheable(),

    isError: function() {
        return this.get("type") == "error";
    }.property("type").cacheable()
});

Ember.FlashQueue = Ember.ArrayProxy.extend({
    /**
     * all of the FlashMessages waiting to be displayed
     */
    content: [],

    /**
     * callback for when the queue's content has changed
     */
    contentChanged: function() {
        var current = Ember.flashController.get('content');

        if (current != this.objectAt(0)) {
            Ember.flashController.set('content', this.objectAt(0));
        }
    }.observes("content.@each"),

    /**
     * instantiates a FlashMessage and pushes onto the queue
     *
     * @param type the type of message
     * @param message the message body
     */
    pushFlash: function(type, message) {
        this.pushObject(Ember.FlashMessage.create({
            message: message,
            type: type
        }));
    }
}).create();

Ember.FlashView = Ember.View.extend({
    contentBinding: 'Ember.flashController.content',
    classNameBindings: ['isNotice', 'isWarning', 'isError'],
    isNoticeBinding: 'content.isNotice',
    isWarningBinding: 'content.isWarning',
    isErrorBinding: 'content.isError',

    /**
     * callback after view has been inserted into the dom
     */
    didInsertElement: function() {
        this.$('#message').hide();
        Ember.flashController.set('view', this);
    },

    /**
     * show the view
     * @param callback function to be called after animation
     */
    show: function(callback) {
        this.$('#message').
        css({
            top: '-9px'
        }).
        animate({
            top: '40px',
            opacity: 'toggle'
        }, 700, callback);
    },

    /**
     * hide the view
     * @param callback function to be called after animation
     */
    hide: function(callback) {
        this.$('#message').
        css({
            top: '40px'
        }).
        animate({
            top: '-9px',
            opacity: 'toggle'
        }, 700, callback);
    }
});