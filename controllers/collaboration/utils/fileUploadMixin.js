define(["app", "text!templates/collaboration/fileuploadDialog.hbs", "httpClient"],
    function(App, fileuploadDialogTemplate, httpClient) {

        App.FileUploadDialogViewMixin = Ember.Mixin.create({
            fileuploaDialogView: Ember.View.extend({
                template: Ember.Handlebars.compile(fileuploadDialogTemplate),
                controller: Ember.Object.create({}),
                setupControllers: function(controller, fileuploadData) {

                },
                actions: {
                    uploadFile: function() {
                        var currentRouteKey = (this._parentView._debugTemplateName) ? this._parentView._debugTemplateName : this._parentView._parentView._debugTemplateName;
                        var fileuploadData = $('#files').get(0).files;
                        var controller = this.container.lookup("controller:" + currentRouteKey);
                        var Backup = [];
                        var existSelectedfile = controller.get('model').fileuploadData;
                        _.each(existSelectedfile, function(file) {
                            Backup.push(file);
                        });
                        _.each(fileuploadData, function(data) {
                            Backup.push(data);
                        });
                        controller.get('model').set('fileuploadData', Backup);
                        
                        //controller.get('model').set('fileuploadData', fileuploadData);
                        var files = [];
                        var existFile = controller.get('model').fileuploadMetaData.files;
                        _.each(existFile, function(res) {
                            files.push(res);
                        })
                        _.each(fileuploadData, function(file) {
                               var deletFile=controller.get('model').get('deletedfile');
                                var delfileArr=_.without(deletFile, _.findWhere(deletFile, {
                                    "name":file.name
                                }));
                                controller.get('model').set('deletedfile',delfileArr);
                                var existObj = _.findWhere(files, {
                                "fName": file.name,

                            });
                            if (!existObj) {
                                var type=file.name.split(".")[1];
                                var rawSize=file.size;
                                var sizeNum    = rawSize.toString().length;
                                var filesize="";
                                var sizeDenom="";
                                if(sizeNum < 7){
                                    filesize = Math.ceil(rawSize/1000);
                                    sizeDenom = "KB";
                                } else { // mb
                                    filesize = Math.ceil(rawSize/1000000);
                                    sizeDenom = "MB";
                                }
                                var sizeText = filesize+" "+sizeDenom;
                                files.push({
                                    "fName": file.name,
                                    "id": "",
                                    "type":type,
                                    "size":sizeText
                                });
                            }

                        });

                        Ember.set(controller.get('model').fileuploadMetaData, "files", files);
                        this.$().find('#fileuploadPost').modal('hide');
                      
                       // $('.updateId').css('margin-right:-180px');
                       if(files.length!=0 && (currentRouteKey="community.index"))
                       {
                           $('.checkid').hide();
                           $('.uploadid').show();
                           $('.uploadid').removeAttr('disabled')
                       }


                    },
                    cancelfilUpload: function() {
                        this.$().find('#fileuploadPost').modal('hide');
                        $('.checkid').text('Attach Files')
                    }
                },
                init: function() {
                    this._super();
                    var parentView = this._parentView;
                    //Index View Fix
                    this.controller = (parentView.fileuploadDialogController) ? parentView.confirmModelDialogController : parentView._parentView.confirmModelDialogController;

                }
            }),
            actions: {
                beforeUpload: function(post) {
                    //$('.checkid').val('update')
                    $('#files').val('');
                    $("#selected-file").text("No file has been selected");
                    $().find('#fileuploadPost').modal('show ');
                    //this.$().find('#fileuploadPost').modal('show ');
                   // alert($('.checkid').text('update'))
                   //$('.checkid').text('Update')
                  // $('.checkid').attr("disabled","disabled")
                  // $('.updateId').removeAttr('disabled')
                    /*$('.checkid').click(function(){
                        $(this).text('Update')
                    })*/
                },
                afterupload:function(){

                    
                }
            },
            init: function() {
                this._super();
            }
        });

    });