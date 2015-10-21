define(['../../app', 'httpClient', 'jabberService', 'text!templates/chatSession.hbs', 'services/webExService', 'services/tenantService'],
    function (app, httpClient, jabberService, chatSessionTemplate, webExService, tenantService) {
        app.ChatSessionController = Ember.ObjectController.extend({
            init: function() {
                if(!Ember.TEMPLATES["chatSession"]) {
                    Ember.TEMPLATES["chatSession"] = Ember.Handlebars.template(Ember.Handlebars.precompile(chatSessionTemplate));
                }
                var self = this;

                tenantService.getTenantInfo().then(function(tenantInfo){
                    Ember.set(self, "isWebexEnabled", tenantInfo.WebexInfo.WebexEnabled ||false);
                });
            },

            messageLengthUnbound: 0,
            messageToSend: "",
            messages: [],
            myMessagesCount: 0,
            jabberModel: jabberService.model,
            isUserAway: false,
            isLoggedInUserAway: false,
            unreadMessageAvailable: false,
            isCurrentlyFocused: false,
            isComposing: false,
            startingWebex: false,
            loggedInUsername: function() {
                return app.getUsername();
            }.property(),
            chatSessionMaximized: true,

            loggedInShortName: function() {
                return app.getShortname()
            }.property(),

            isSessionActive: function() {
                return !(this.isLoggedInUserAway || this.isUserAway);
            }.property("isLoggedInUserAway","isUserAway"),

            jabberMessages: function() {
                this.updateLastAccessed(this.messages);
                this.checkUnreadMessageAvailable();
                this.myMessagesCount = this.messages.length;
                Ember.run.scheduleOnce('afterRender', this, 'scrollToLastMessage');
            }.observes('messages.@each'),

            sendTypingEvent: function() {
              var jabberUsername = this.get('model').jabberUsername;
              var chatInputBox = $("input[name=" + jabberUsername + "]");
              var data = chatInputBox.val();
              var count = data.length;
              if (this.messageLengthUnbound == 0 && count != 0) {
                jabberService.startedTyping(jabberUsername);
              }
              this.messageLengthUnbound = count;
            },

            isTyping: function() {
                var self = this;
                var me = _.find(this.jabberModel.contacts, function(contact) {
                    return  (contact.name.split('@')[0] == self.get('model').jabberUsername);
                });
                if(me && me.state == "composing") {
                    this.set("isComposing", true)
                } else {
                    this.set("isComposing", false)
                }
            }.observes('jabberModel.contacts.@each.state'),

            focusChatInput:function () {
                var jabberUsername = this.get('model').jabberUsername;
                var chatInputBox = $("input[name=" + jabberUsername + "]");
                chatInputBox.focus();
            },

            scrollToLastMessage: function() {
                var jabberUsername = this.get('model').jabberUsername;
                var chatDialogsContainer = $("#" + jabberUsername + ".js-chat-session");
                var messagesContainer = $("#" + jabberUsername + " #jabber-content");
                chatDialogsContainer.scrollTop(messagesContainer.height());
                if(this.get('model').isUserOpened) {
                    this.focusChatInput();
                    this.get('model').isUserOpened = false;
                }
            },
            checkUnreadMessageAvailable: function() {
                if(this.get('model').isUserOpened) {
                    return;
                }
                if(this.messages && this.messages.length > this.myMessagesCount && !this.isCurrentlyFocused) {
                    this.set("unreadMessageAvailable", true);
                } else {
                    this.set("unreadMessageAvailable", false);
                }
            },

            updateLastAccessed: function(messages) {
                if(messages && messages.length != 0) {
                    Ember.set(this.get('model'), 'lastAccessed',messages[messages.length - 1].time);
                }
            },
            handleChatFocusedIn: function() {
                this.set('isCurrentlyFocused', true);
                this.set('unreadMessageAvailable', false);
            },
            handleChatFocusedOut: function() {
                this.set('isCurrentlyFocused', false);
                jabberService.stoppedTyping(this.get('model').jabberUsername);
            },
            observeLoggedInUser: function() {
                (this.jabberModel.me.statusName === "offline") ? this.set("isLoggedInUserAway", true): this.set("isLoggedInUserAway", false);
            }.observes('jabberModel.me.statusName'),

            rebindMessagesWhenUserLogsIn: function() {
                var self = this;
                var me = _.find(this.jabberModel.contacts, function(contact) {
                    return  (contact.name.split('@')[0] == self.get('model').jabberUsername);
                });

                if(me) {
                    var messages = jabberService.getMessagesFor(this.get('model').jabberUsername);
                    this.set("messages", messages);
                }
            }.observes('jabberModel.contacts.@each'),

            status: function() {
                var self = this;
                var me = _.find(this.jabberModel.contacts, function(contact) {
                    return  (contact.name.split('@')[0] == self.get('model').jabberUsername);
                });
                if(me) {
                    var colorForStatus = this.getColorForStatus(me.statusName);
                    (colorForStatus === "grey") ? this.set("isUserAway", true): this.set("isUserAway", false);
                    return  colorForStatus;
                }
            }.property('jabberModel.contacts.@each.statusName'),
            getColorForStatus: function(status) {
                switch(status) {
                    case "available":
                        return "green";
                    case "dnd":
                        return "red";
                    case "away":
                        return "orange";
                    default:
                        return "grey";
                }
            },
            sendJabberMessage: function(message, callbackOnSend) {
                if(!this.isLoggedInUserAway) {
                    var self = this;
                    var contactLoaded = _.find(this.jabberModel.contacts, function(contact) {
                        return  (contact.name.split('@')[0] == self.get('model').jabberUsername);
                    });
                    if(contactLoaded) {
                        var to = this.get('model').jabberUsername;
                        jabberService.sendMessage(to, message);
                        if(typeof callbackOnSend == "function") {
                            callbackOnSend();
                        }
                    }
                }
            },
            actions: {
                closeChat: function() {
                    var chatObjectToRemove = this.get('model').jabberUsername;
                    jabberService.closeChat(chatObjectToRemove);
                    jabberService.stoppedTyping(chatObjectToRemove);
                    Ember.set(this, "model.active", false);
                },
                sendMessage: function(){
                    var self = this;
                    var htmlEscapedMessage = App.StringUtils.escapeHtml(this.messageToSend);
                    var urlDetectedMessage = Autolinker.link(htmlEscapedMessage);

                    this.sendJabberMessage(urlDetectedMessage, function(){
                        self.set('messageToSend', "");
                        self.set('messageLengthUnbound', 0);
                        jabberService.stoppedTyping(self.get('model').jabberUsername);
                    });
                },
                initiateGroupChat: function(){
                    var chatRooms = this.controllerFor('application').get('chatRooms');
                    var roomInfo = {
                        invitees: [this.get('model').jabberUsername],
                        active: true
                    };
                    chatRooms.pushObject(roomInfo);
                },
                shareChat: function() {
                    this.transitionToRoute("blogs.new", {
                        queryParams: {
                            chatRoom: "",
                            chatSession : this.get('model').jabberUsername,
                            session: new Date().getTime(),
                            communityId: ""
                        }
                    });
                },
                instantMeeting: function() {
                    this.set("startingWebex", true);
                    var model = this.get('model');
                    var attendees = [
                        {
                            expertId: model.shortName,
                            expertEmail: model.email
                        }
                    ];
                    var self = this;
                    webExService.instantMeeting(attendees, function(meetingStartedResponse){
                        self.sendJabberMessage("Webex Meeting URL: " + App.WebexUtils.meetingLink(meetingStartedResponse) + "<br/>" + "Password: " + App.WebexUtils.meetingPassword());
                    }, function(){
                        self.set("startingWebex", false);
                    });
                },

                transitionChatSession: function() {
                    var chatSessionWidgetId = "#" + this.get('model').jabberUsername + ".js-widget-body";
                    var chatSessionWidget = $(chatSessionWidgetId);
                    if(this.chatSessionMaximized){
                        chatSessionWidget.slideUp("fast")
                        this.set("chatSessionMaximized", false);
                    } else{
                        chatSessionWidget.slideDown("fast")
                        this.set("chatSessionMaximized", true);
                    }
                    Ember.run.scheduleOnce('afterRender', this, 'scrollToLastMessage');
                }
            }
        });
        return app;
    });
