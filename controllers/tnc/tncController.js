

'use strict';

    define(['app', 'text!templates/tnc/tnc.hbs', 'text!templates/tnc/tncUpdate.hbs', 'httpClient'],
        function(app, TnCTemplate, tnCUpdateTemplate, httpClient) {
          app.TncView = Ember.View.extend({
            didInsertElement : function() {
                var self = this;
                httpClient.get('/knowledgecenter/termsAndConditions').then(function(response) {
                    if(response)
                        self.controller.set("tncText",  JSON.parse(response).text);

                }, function (error) {
                            console.log(error);
                        });
            },
            template: Ember.Handlebars.compile(TnCTemplate)
          });

          app.TncUpdateView = Ember.View.extend({
              template: Ember.Handlebars.compile(tnCUpdateTemplate)
          });

          App.TncUpdateController = Ember.ObjectController.extend({
              isMinorUpdate : false,
              successMessage : "",
              errorMessage : "",
                actions: {
                    updateTermsAndConditions : function() {
                        var self = this;
                        if($("#tncFile").val() == "") {
                            self.set("successMessage","");
                            self.set("errorMessage", "Please choose terms and conditions file");
                            return;
                        }
                        var fd = new FormData(document.getElementById("tncUpdate"));
                        fd.append("minorUpdate", this.isMinorUpdate)
                        jQuery.ajax({
                            type: "PUT",
                            url: '/knowledgecenter/termsAndConditions',
                            data: fd,
                            processData: false,
                            contentType: false,
                            beforeSend: function(xhr){
                                httpClient.setRequestHeadersData(xhr);
                            },
                            success: function(result) {
                                self.set("errorMessage","");
                                self.set("successMessage", "Terms and Conditions successfully updated");
                            },
                            error: function(error) {
                                console.log(error);
                                self.set("successMessage","");
                                self.set("errorMessage",error);
                            }
                        });
                    }
                }
          });
    });

