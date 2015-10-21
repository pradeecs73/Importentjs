'use strict';

define(['app', 'text!templates/components/jabberComponent.hbs', 'underscore', 'services/tenantService', 'jabberService', 'httpClient'],
    function(app, jabberComponent, _, tenantService, jabberService, httpClient){
        app.JabberChatComponent = Ember.Component.extend({
            template: Ember.Handlebars.compile(jabberComponent),
            jabberData: jabberService.model,
            tagName: "",
            jabberPillModel: {},

            initialize: function() {
                var status = $.cookie("jabberStatus");
                var self = this;

                tenantService.getTenantInfo().then(function(tenantInfo){
                    if(!_.isUndefined(tenantInfo.JabberInfo.JabberEnabled) && tenantInfo.JabberInfo.JabberEnabled) {
                        self.set("isJabberEnabled", true);
                        self.getSession().then(function(){
                            self.logonToJabber();
                            status?jabberService.updateUserStatus(status):undefined;
                        });
                    }
                    else
                        self.set("isJabberEnabled", false);
                });

            }.on('init'),
            refreshTopNav: function() {
                this.initialize();
                this.set('refreshJabberLogin', false);
            }.observes('refreshJabberLogin'),

            logonToJabber: function() {
                this.set('jabberError', null);
                this.set('jabberUnavailableError',null);
                this.set('isAuthenticationError', null);

                var jabberUsername = this.get("jabberUsername");
                var jabberPassword = this.get("jabberPassword");
                var self = this;
                if(!jabberUsername || !jabberPassword) {
                    self.set('jabberUnavailableError', "You don't have a jabberID associated with your account");
                }
                else {
                    jabberService.login(jabberUsername, jabberPassword).then(function (err) {
                        self.set('jabberError', err.statusCode);
                        if (err.statusCode === 401)
                            self.set('isAuthenticationError', true)

                    });
                }
            },

            getSession: function () {
                var self = this;
                var fetchSessionRequest = self.constructFetchSessionRequest();
                return httpClient.get(fetchSessionRequest)
                    .then(function (response) {
                        Ember.set(self.jabberPillModel, "jabberUsername",response.jabberUsername);
                        self.set("jabberUsername", response.jabberUsername);
                        self.set("jabberPassword", aesUtil.decrypt(response.jabberPassword));
                    });
            },

            constructFetchSessionRequest: function () {
                return "/knowledgecenter/userpi/user/session";
            },

            jabberStatusName: function(){
                if(this.jabberData.me.statusName) {
                    switch(this.jabberData.me.statusName) {
                        case "offline":
                            return "status-offline"
                        case "available":
                            return "status-available"
                        case "dnd":
                            return "status-dont-disturb"
                        case "away":
                            return "status-away"
                        default:
                            return "status-offline"
                    }
                }
            }.property("jabberData.me.statusName"),

            isLoggingIntoJabber: function() {
                if(this.jabberData.me.statusName) {
                    return this.jabberData.me.statusName === "loggingIn";
                }
                return false;
            }.property("jabberData.me.statusName"),

            isOfflineInJabber: function(){
                if(this.jabberData.me.statusName) {
                    return this.jabberData.me.statusName === 'offline'
                }
                return false;
            }.property("jabberData.me.statusName"),

            isAvailableInJabber: function(){
                if(this.jabberData.me.statusName) {
                    return this.jabberData.me.statusName === 'available'
                }
                return false;
            }.property("jabberData.me.statusName"),

            isBusyInJabber: function(){
                if(this.jabberData.me.statusName) {
                    return this.jabberData.me.statusName === 'dnd'
                }
                return false;
            }.property("jabberData.me.statusName"),

            isAwayInJabber: function(){
                if(this.jabberData.me.statusName) {
                    return this.jabberData.me.statusName === 'away'
                }
                return false;
            }.property("jabberData.me.statusName"),

            actions: {
                updateJabberStatus: function(status) {
                    jabberService.updateUserStatus(status);
                }
            }

        })
})