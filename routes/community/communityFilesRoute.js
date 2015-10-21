'use strict';

define(["app", "services/groupService"],
  function(app, groupService) {
    app.CommunityFilesRoute = Ember.Route.extend({
      renderTemplate: function() {
        this.render();
      },
      model:function(){

       	return this.modelFor('community');
      },
       actions: {
                beforeUpload: function() {
                    jQuery("#selected-file").text("No file has been selected");
                    jQuery('#files').val('');
                    jQuery('#fileuploadCommunity').modal('show');
                },

                attachFile: function() {
                    var fileuploadData = jQuery('#files').get(0).files;
                    var backup = [];
                    var controller = this.controller;
                    var existSelectedfile = controller.get('model').fileuploadData;
                    _.each(existSelectedfile, function(file) {
                        backup.push(file);
                    });
                    _.each(fileuploadData, function(data) {
                        backup.push(data);
                    });
                    controller.get('model').set('fileuploadData', backup);
                    var files = [];
                    var existFile = controller.get('model').fileuploadMetaData.files;
                    _.each(existFile, function(res) {
                        files.push(res);
                    });
                    _.each(fileuploadData, function(file) {
                        var deletFile = controller.get('model').get('deletedfile');
                        var delfileArr = _.without(deletFile, _.findWhere(deletFile, {
                            "name": file.name
                        }));
                        controller.get('model').set('deletedfile', delfileArr);
                        var existObj = _.findWhere(files, {
                            "fName": file.name,
                        });
                        if (!existObj) {
                            var type = file.name.split(".")[1];
                            var rawSize = file.size;
                            var sizeNum = rawSize.toString().length;
                            var filesize = "";
                            var sizeDenom = "";
                            if (sizeNum < 7) {
                                filesize = Math.ceil(rawSize / 1000);
                                sizeDenom = "KB";
                            } else { // mb
                                filesize = Math.ceil(rawSize / 1000000);
                                sizeDenom = "MB";
                            }
                            var sizeText = filesize + " " + sizeDenom;
                            files.push({
                                "fName": file.name,
                                "id": "",
                                "type": type,
                                "size": sizeText
                            });
                        }
                    });

                    Ember.set(controller.get('model').fileuploadMetaData, "files", files);
                    jQuery('#fileuploadCommunity').modal('hide');
                    if (files.length != 0) {
                        jQuery('.checkid').hide();
                        jQuery('.uploadid').show();
                        jQuery('.uploadid').removeAttr('disabled')
                    }
                },
                cancelAttachFile: function() {
                    jQuery('#fileuploadCommunity').modal('hide');
                    jQuery('.checkid').text('Attach Files')
                }
            },
            setupController: function(controller, model) {
                if (model.isMember || this.controllerFor('community').isMember) {
                      controller.set('isMember', true);
                } else {
                      controller.set('isMember', false);
                }
                controller.set('model', model);
                groupService.showCreateButtonBasedonPermissionsInDetailsPage(model,"Files").then(function(access){  
                      controller.set('userHasAccessToCreatePostInDetailsPage',access.permissionStatus);
                }).fail(function(err){
                      Ember.Logger.error('[CommunityWikisRoute :: setupController :: ]',error);
                      controller.set('userHasAccessToCreatePostInDetailsPage',false)
                });                  
                     
            }
           
    });
  });