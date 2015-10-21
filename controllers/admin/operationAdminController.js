'use strict';

define(['app', 'text!templates/operationAdmin.hbs', 'services/entitlementService', 'httpClient'],
    function (app, operationAdminTemplate, entitlementService, httpClient) {

        App.OperationAdminView = Ember.View.extend({
            template: Ember.Handlebars.compile(operationAdminTemplate)
        });

        App.OperationAdminRoute = Ember.Route.extend({
            renderTemplate: function() {
                var self = this
                entitlementService.isOpsAdmin().then(function(status){
                    if(!status) self.render("notAllowed")
                    else self.render();
                })
            }
        });

        App.OperationAdminController = Ember.ObjectController.extend({
          fromDateTime: "",
          toDateTime: "",
          errors: {},
          success: false,
          isValid: function(dateTimeString) {
              return (dateTimeString ==="" || moment(dateTimeString,["YYYY-MM-DD HH:mm", "YYYY-MM-DD"], true).isValid());
          },
          actions: {
            migrate: function(component, resource){
              var self = this;
              self.set("errors",{});
              if(self.isValid(self.get('fromDateTime')) && self.isValid(self.get('toDateTime'))) {
                  var url = '/knowledgecenter/' + component + '/migration/trigger?from=' + self.get('fromDateTime') + '&to=' + self.get('toDateTime');
                  if (!_.isUndefined(resource)) url = '/knowledgecenter/' + component + '/migration/' + resource + '/trigger?from=' + self.get('fromDateTime') + '&to=' + self.get('toDateTime');
                  httpClient.put(url).then(function (response) {
                      self.set("errors", {"statusMessage": "Request to migrate " + component + " has been accepted"});
                      self.set("success", true);
                  }).fail(function (err) {
                      self.set("errors", {"statusMessage": "Request to migrate " + component + " failed with error " + err.responseText});
                      self.set("success", false);
                  })
              }
              else{
                  self.set("errors", {"statusMessage": "Invalid Input"});
                  self.set("success", false);
              }
            }
          }
        })
    });
