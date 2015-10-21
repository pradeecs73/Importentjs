define(['app', 'jabberService', 'services/usersService', 'services/jabberUsersService'],
    function (app, jabberService, usersService, jabberUsersService) {
        app.JabberMixin = Ember.Mixin.create({
            jabberChatters: [],
            chatRooms: [],
            jabberModel: jabberService.model,

            observeJabberLogin: function() {
                if(this.jabberModel.me.statusName === 'loggingIn'){
                    Ember.set(this, "jabberChatters", []);
                    Ember.set(this, "chatRooms", []);
                }
            }.observes('jabberModel.me.statusName'),

            observeContacts: function() {
                window.jabberService = jabberService;
                jabberUsersService.updateUserDetails();
            }.observes('jabberModel.contacts.@each'),

            handleChatOpen: function() {
                var systemOpenedContacts = _.filter(this.jabberModel.contacts, function(contact) {
                    return contact.handleChatOpen;
                });
                if (systemOpenedContacts.length !== 0) {
                    var jabberChatters = this.get('jabberChatters');
                    _.each(systemOpenedContacts, function(systemOpenedContact) {
                        systemOpenedContact.handleChatOpen = false;
                        var alreadyExisting = _.find(jabberChatters, function(jabberChatter) {
                            return systemOpenedContact.name.split("@")[0] === jabberChatter.jabberUsername
                        });
                        if (!alreadyExisting) {
                            usersService.userForJabberId(systemOpenedContact.name.split("@")[0]).then(function(user) {
                                jabberChatters.pushObject(user);
                            })
                        }
                    });
                    this.set('jabberChatters', jabberChatters);
                }
            }.observes('jabberModel.contacts.@each.handleChatOpen'),

            handleArrangeWindows: function() {
                var now = new Date(Date()).getTime();
                var combinedChatters = [];
                combinedChatters.pushObjects(this.jabberChatters);
                combinedChatters.pushObjects(this.chatRooms);

                var sortedChatters = _.sortBy(combinedChatters, function(chatter) {
                    return (now - new Date(chatter.lastAccessed).getTime());
                });
                _.each(sortedChatters, function(sortedChatter, index) {
                    Ember.set(sortedChatter, 'rank', index + 1);
                });
            }.observes('jabberChatters.@each.lastAccessed', 'jabberChatters.@each', 'chatRooms.@each.lastAccessed', 'chatRooms.@each'),

            observeChatRoomState: function() {
                var roomsToBeRemoved = _.filter(this.chatRooms, function(chatRoom) {
                    return chatRoom.active === false
                });
                this.chatRooms.removeObjects(roomsToBeRemoved);
            }.observes('chatRooms.@each.active'),

            observeJabberChattersState: function() {
                var chatsToBeRemoved = _.filter(this.jabberChatters, function(chat) {
                    return chat.active === false
                });
                this.jabberChatters.removeObjects(chatsToBeRemoved);
            }.observes('jabberChatters.@each.active'),

            inviteToChatRoom: function() {
                var invites = this.jabberModel.roomInvites;
                var self = this;
                _.each(invites, function(invite) {
                    if (!self.alreadyInvited(invite)) {
                        var roomDetails = {
                            roomName: invite.roomName,
                            invitor: invite.invitor,
                            active: true,
                            inviteMode: true
                        };
                        self.chatRooms.pushObject(roomDetails);
                    }
                })
            }.observes("jabberModel.roomInvites.@each"),

            alreadyInvited: function(invite) {
                var allRooms = this.chatRooms;
                var existingRoom = _.find(allRooms, function(room) {
                    return (room.roomName === invite.roomName);
                });
                return existingRoom;
            }

        })
    });