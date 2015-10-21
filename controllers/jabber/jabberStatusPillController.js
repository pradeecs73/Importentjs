define(['../../app', 'jabberService', 'text!templates/jabberStatusPill.hbs', 'services/tenantService'],
  function (app, jabberService, jabberStatusPill, tenantService) {

    App.JabberStatusPillController = Ember.ObjectController.extend({
        init: function () {
        if (!Ember.TEMPLATES["jabberStatusPill"]) {
          Ember.TEMPLATES["jabberStatusPill"] = Ember.Handlebars.template(Ember.Handlebars.precompile(jabberStatusPill));
            var self = this;
            tenantService.getTenantInfo().then(function(tenantInfo){
                self.set("isJabberEnabled", tenantInfo.JabberInfo.JabberEnabled || false);
            });
        }
      },
      needs: ['application'],
      jabberModel: jabberService.model,
      status: function () {
          var self = this;
          var status = "";
          var jabberUsername = self.get('model').jabberUsername;
          var loggedInUser = this.jabberModel.me;
          if(loggedInUser.jabberId && jabberUsername) {
              if (jabberUsername === loggedInUser.jabberId) {
                  status = loggedInUser.statusName;
              } else {
                  var existingContact = _.find(this.jabberModel.contacts, function (contact) {
                      return (contact.name.split('@')[0] == jabberUsername);
                  });
                  if (existingContact) {
                      status = existingContact.statusName;
                  } else {
                      jabberService.addTemporaryContact(jabberUsername);
                  }
              }
              return this.getColorForStatus(status);
          }
          return this.getColorForStatus("offline");
      }.property('jabberModel.contacts.@each.statusName', 'jabberModel.me.statusName'),

      getColorForStatus: function (status) {
        switch (status) {
          case "available":
            return "status-available";
          case "dnd":
            return "status-dont-disturb";
          case "away":
            return "status-away";
          default:
            return "status-offline";
        }
      }
    })
  })