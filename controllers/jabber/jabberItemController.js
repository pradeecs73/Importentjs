define(['../../app', 'jabberService', 'text!templates/jabberItem.hbs', 'services/tenantService'],
    function (app, jabberService, jabberItemTemplate, tenantService) {

        App.JabberItemController = Ember.ObjectController.extend({
            init: function() {
                if(!Ember.TEMPLATES["jabberItem"]) {
                    Ember.TEMPLATES["jabberItem"] = Ember.Handlebars.template(Ember.Handlebars.precompile(jabberItemTemplate));
                }
                var self = this;

                tenantService.getTenantInfo().then(function(tenantInfo){
                    self.set("isJabberEnabled", tenantInfo.JabberInfo.JabberEnabled || false);
                });
            },

            needs: ['application'],
            jabberModel: jabberService.model,
            status: function() {
                var self = this;
                var me = _.find(this.jabberModel.contacts, function(contact) {
                    return  (contact.name.split('@')[0] == self.get('model').jabberUsername);
                });
                if(me) {
                    return this.getColorForStatus(me.statusName);
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
            actions: {
                openChat: function() {
                    var jabberData = this.get('model');
                    var jabberUsername = jabberData.jabberUsername;
                    var jabberChatters = this.controllerFor('application').get('jabberChatters');
                    if(!jabberService.userAvailable(jabberUsername)){
                        return
                    }
                    Ember.set(jabberData, 'lastAccessed', new Date());

                    var existingContact = _.find(jabberChatters, function(chatter){
                        return chatter.jabberUsername === jabberUsername;
                    });
                    if(!existingContact) {
                        jabberService.openChat(jabberUsername);
                        Ember.set(jabberData, 'isUserOpened', true);
                        Ember.set(jabberData, 'active', true);
                        jabberChatters.pushObject(jabberData);
                        this.controllerFor('application').set('jabberChatters', jabberChatters);
                    }
                }
            }
        })
    })