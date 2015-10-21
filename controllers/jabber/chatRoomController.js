define(['../../app', 'Q', 'httpClient', 'jabberService', 'services/usersService', 'text!templates/chatRoom.hbs','pages/errorUtils', 'services/webExService', 'services/chatRoom/invitationService', 'services/chatRoom/occupantsService', 'services/jabberUsersService', 'services/tenantService'],
  function(app, Q, httpClient, jabberService, usersService, chatRoomTemplate, errorUtils, webExService, invitationService, occupantsService, jabberUsersService, tenantService) {
    app.ChatRoomController = Ember.ObjectController.extend({
      needs: "application",
      init: function() {
        this.set("occupantsStateMap", {});
        this.set("temporaryContactInvitees", []);
        if (!Ember.TEMPLATES["chatRoom"]) {
          Ember.TEMPLATES["chatRoom"] = Ember.Handlebars.template(Ember.Handlebars.precompile(chatRoomTemplate));
        }
        var self = this;

        tenantService.getTenantInfo().then(function(tenantInfo){
          Ember.set(self, "isWebexEnabled", tenantInfo.WebexInfo.WebexEnabled ||false);
        });
      },
      messageToSend: "",
      roomName: null,
      myRoom: null,
      jabberModel: jabberService.model,
      isCurrentlyFocused: false,
      unreadMessageAvailable: false,
      participants: app.getShortname(),
      participantsCount: 0,
      conflictErrorSapnIdentifier: ".js-conflict-error",
      displayConflictErrorMessage: "Oops! Looks like you have already joined this room elsewhere.",

      temporaryContactInvitees: [],
      occupantsStateMap: {},
      participantInfoList: [],
      showParticipantsList: true,
      chatRoomVisible: true,
      startingWebex: false,

      allUsersConfig: function() {
        return usersService.usersAutoSuggestForJabber(app.getUsername());
      }.property(),

      showErrorMessage: function (errors) {
          var self = this;
          _.forEach(errors, function (error) {
              errorUtils.showErrorMessage(error.errorMessage, self.getUniqueIdentifierFor(error.errorSpanId))
          });
      },

      observeContacts: function() {
        var errors = invitationService.refreshTemporaryContactInvitees(this.myRoom, this.temporaryContactInvitees);
        this.showErrorMessage(errors);
      }.observes('jabberModel.contacts.@each'),

      observeRooms: function() {
        if (this.myRoom != null) return;
        var myRoom = jabberService.roomDetailsFor(this.roomName);
        if (myRoom) {//will be undefined when room is left
          Ember.set(this, "myRoom", myRoom);
        }
      }.observes('jabberModel.rooms.@each'),

      observeRoomError: function() {
        if(this.myRoom.error === "conflict"){
          var errSpanId = this.getUniqueIdentifierFor(this.conflictErrorSapnIdentifier)
          errorUtils.showErrorMessage(this.displayConflictErrorMessage, errSpanId)
        }
      }.observes('myRoom.error'),

      getUniqueIdentifierFor: function(elementIdentifier){
        return "#" + this.get('sanitizedRoomName') + " " +elementIdentifier;
      },

      observeRoomOccupants: function() {
          var self = this;
          occupantsService.handleOccupantsChange(this.myRoom, this.occupantsStateMap).then(function(participantsInfo) {
              Ember.set(self, "participantInfoList", participantsInfo);
              var participants = _.map(participantsInfo, function(info) {return info.shortName});
              Ember.set(self, "participants", participants.join(" ,"))
              Ember.set(self, "participantsCount", participants.length)
          });
      }.observes('myRoom.occupantsJabberIds.@each'),

      sanitizedRoomName: function() {
        if (this.roomName)
          return this.roomName.split('@')[0];
        return ""
      }.property("roomName"),

      inviteBoxName: function() {
        if (this.roomName)
          return this.roomName.split('@')[0] + "InviteBox";
        return null;
      }.property("roomName"),

      handleChatFocusedIn: function() {
        this.set('isCurrentlyFocused', true);
        this.set('unreadMessageAvailable', false);
      },

      handleChatFocusedOut: function() {
        this.set('isCurrentlyFocused', false);
      },

      focusChatInput: function() {
        var roomId = this.get("sanitizedRoomName");
        var chatRoomInputBox = $("input[name=" + roomId + "]");
        chatRoomInputBox.focus();
      },

      scrollToLastMessage: function() {
        var roomId = this.get("sanitizedRoomName")
        var chatDialogsContainer = $("#" + roomId + ".js-chat-session");
        var messagesContainer = $("#" + roomId + " #jabber-content");

        chatDialogsContainer.scrollTop(messagesContainer.height());
      },

      updateMessageSenderDetails: function() {
        var messages = this.myRoom.messages;
        if (messages.length > 0) {
          this.updateLastAccessed();
          this.checkUnreadMessageAvailable();
          var recentMessage = messages[messages.length - 1];
          jabberUsersService.fetchUserInfo(recentMessage.from).then(function(userDetails) {
              Ember.set(recentMessage, "user", userDetails);
          });
          Ember.run.scheduleOnce('afterRender', this, 'scrollToLastMessage');
        }
      }.observes('myRoom.messages.@each'),

      checkUnreadMessageAvailable: function() {
        if (!this.isCurrentlyFocused) {
          this.set("unreadMessageAvailable", true);
        } else {
          this.set("unreadMessageAvailable", false);
        }
      },

      instantMeeting: function() {
          this.set("startingWebex", true);
          var model = this.get('model');
          var attendees = [];
          var participantToInvitePromises = [];
          var self = this;
          var participantsToInvite = _.filter(this.participantInfoList, function(participant) {
              return participant.contact.jabberUsername !== jabberService.getLoggedInUser().jabberId;
          });
          _.each(participantsToInvite, function(participant) {
              var participantToInvitePromise = jabberUsersService.fetchUserInfo(participant.contact.jabberUsername);
              participantToInvitePromises.push(participantToInvitePromise);
          });

          Q.allSettled(participantToInvitePromises).then(function(allParticipantsToInviteInfo) {
              _.each(allParticipantsToInviteInfo, function(participantInfo) {
                  attendees.push({
                      expertId: participantInfo.value.shortName,
                      expertEmail: participantInfo.value.email
                  });
              });

              webExService.instantMeeting(attendees, function(meetingStartedResponse){
                  self.broadcastMessage("Webex Meeting URL: " + App.WebexUtils.meetingLink(meetingStartedResponse) + "<br/>" + "Password: " + App.WebexUtils.meetingPassword());
              }, function(){
                  self.set("startingWebex", false);
              });
          });
      },

      updateLastAccessed: function() {
        var messages = this.myRoom.messages;
        if (messages && messages.length != 0) {
          Ember.set(this.get('model'), 'lastAccessed', messages[messages.length - 1].time);
        }
      },

      initiateChatRoom: function() {
        var model = this.get('model');
        if (model.inviteMode) {
          Ember.set(this, "roomName", model.roomName);
          var invitorJabberId = model.invitor.split('@')[0];
          jabberUsersService.fetchUserInfo(invitorJabberId).then(function(userDetails) {
              Ember.set(model, "invitor", userDetails["shortName"]);
          });
        } else {
          var self = this;
          jabberService.createRoom(model.invitees).then(function(roomName){
            Ember.set(self, "roomName", roomName);
            Ember.set(model, "roomName", this.roomName);
          });
        }
      },

      broadcastMessage: function(message) {
          jabberService.broadcastRoomMessage(this.roomName, message);
      },

      actions: {
        invite: function() {
          var self = this;
          var inviteBoxIdentifier = "#" + this.get("inviteBoxName");
          var inviteBox = $(inviteBoxIdentifier);
          var inviteesObjects = (inviteBox.length == 0 || inviteBox.val().length == 0) ? [] : inviteBox.val().split(",");
          var errors = invitationService.invite(this.myRoom, inviteesObjects, this.temporaryContactInvitees);
          this.showErrorMessage(errors);
          inviteBox.tagsinput('removeAll');
        },
        sendMessage: function() {
          var htmlEscapedMessage = App.StringUtils.escapeHtml(this.messageToSend);
          var urlDetectedMessage = Autolinker.link(htmlEscapedMessage);

          this.broadcastMessage(urlDetectedMessage);
          Ember.set(this, "messageToSend", "");
        },
        closeRoom: function() {
          jabberService.leaveRoom(this.roomName);
          Ember.set(this, "model.active", false);
          this.destroy();
        },
        accept: function() {
          invitationService.accept(this.roomName);
          var model = this.get('model');
          Ember.set(model, "inviteMode", false);
          this.focusChatInput();
        },
        reject: function() {
          Ember.set(this, "model.active", false);
          invitationService.reject(this.roomName);
        },
        shareChat: function() {
          this.transitionToRoute("blogs.new", {
            queryParams: {
              chatSession: "",
              chatRoom: this.roomName,
              session: new Date().getTime(),
              communityId: ""
            }
          });
        },
        toggleParticipantsList: function() {
          this.set("showParticipantsList", !this.showParticipantsList)
        },
        transitionChatRoom: function() {
          var roomName = this.get("sanitizedRoomName");
          var chatRoomWidgetId = "#" + roomName + ".js-widget-body";
          var chatRoomWidget = $(chatRoomWidgetId);
          if (this.chatRoomVisible) {
            chatRoomWidget.slideUp("fast")
            this.set("chatRoomVisible", false);
          } else {
            chatRoomWidget.slideDown("fast")
            this.set("chatRoomVisible", true);
          }
          Ember.run.scheduleOnce('afterRender', this, 'scrollToLastMessage');
        }
      }
    })
  })
