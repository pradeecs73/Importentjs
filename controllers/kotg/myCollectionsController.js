'use strict';

define(['app', 'text!templates/kotg/myCollection.hbs','text!templates/kotg/fileUpload.hbs', 'services/kotg/kotgLoginService', "services/kotg/kotgCollectionsService",'services/encryptionService', "controllers/kotg/shareMixin", "services/kotg/kotgTagService",'underscore'],
    function(app, myCollectionsTemplate,fileUploadTemplate,kotgLoginService, kotgCollectionsService, encryptionService, KOTGShareMixin, taggingService,_) {

        app.KotgFileUploadView = Ember.View.extend({
            template:Ember.Handlebars.compile(fileUploadTemplate),
            didInsertElement:function(){
                var self = this;
                // $('#fileupload').change(function(){
                //     self.addFile(this.files[0]);
                // });
                $("#fileupload").fileupload({add: function(e, data) {
                    self.addFile(data.files[0]);
                }});
                $('#submitUpload').click(function(){
                    self.uploadFiles();
                });
                $(window).resize(function(){
                    self.elementH();
                });
            },
            elementH:function(){
                setTimeout(function(){
                    $('.the-progress-bar').css('width',$('#uploadfile-list').width() - 70);
                },100);
            },
            addFile:function(fileObj){

                var self = this;
                var fileList = this.controller.get('model').fileList||[];
                //fileList length in previous model
                if(fileList.length > 2){
                    alert('Maximum 3 files are allowed to upload at a single try.');
                    return;
                }
                var n = {
                    filename: fileObj.name,
                    icon: this.parseIcon(fileObj.name),
                    file:fileObj,
                    id: fileList.length,
                    size: fileObj.size,
                    status:'cancel',
                    filenameshort: fileObj.name.length>30?(fileObj.name.substring(0,30)+'...'):fileObj.name
                };
                // var reg = /\ /ig;
                // if(reg.test(n.filename)) {
                //     alert('Filename contains unsupported characters. Try removing whitespace before attempting this operation.');
                //     return;
                // }
                if(n.size > 10240000) {
                    alert('File size too big! Max size 10M allowed.');
                    return;
                }
                // for(var i = 0; i < fileList.length; ++i){
                //     console.log(fileList[i].filename);
                //     if(fileList[i].filename === n.filename){
                //         return;
                //     }
                // }
                var tmpl = _.template($('#uploadItem').html());
                if(fileList.length === 0) $('#uploadfile-list').html('');
                $('#uploadfile-list').append(tmpl(n));
                self.elementH();
                $('.upload-file-icon').unbind('click');
                $('.upload-file-icon').click(function(){
                    if($(this).hasClass('cancel')) {
                        $(this).closest('li').remove();
                        self.removeFile($(this).data('fileid'));
                    }
                });
                this.controller.addFile(n);
            },
            removeFile:function(fileid){
                var fileList = this.controller.get('model').fileList;
                if(fileList.length === 1) $('#uploadfile-list').html('<li>Please select a file to upload.</li>');
                this.controller.removeFile(fileid);
            },
            uploadFiles:function(){
                var fileList = this.controller.get('model').fileList||[];
                if(fileList.length === 0) return;
                $('.upload-file-icon').hide();
                this.controller.uploadFiles();
            },
            parseIcon:function(filename){
                var filetype = filename.substr(filename.lastIndexOf(".") + 1);
                var icon = "";
                switch (filetype) {
                    case 'pdf':
                        icon = "assets/img/upload-file-type/PDF.png";
                        break;
                    case 'doc':
                        icon = "assets/img/upload-file-type/DOC.png";
                        break;
                    case 'docx':
                        icon = "assets/img/upload-file-type/DOCX.png";
                        break;
                    case 'epub':
                        icon = "assets/img/upload-file-type/epub.png";
                        break;
                    case 'ppt':
                        icon = "assets/img/upload-file-type/PPT.png";
                        break;
                    case 'pptx':
                        icon = "assets/img/upload-file-type/PPTX.png";
                        break;
                    case 'txt':
                        icon = "assets/img/upload-file-type/TXT.png";
                        break;
                    case 'xls':
                        icon = "assets/img/upload-file-type/XLS.png";
                        break;
                    case 'xlsx':
                        icon = "assets/img/upload-file-type/XLSX.png";
                        break;
                    case 'zip':
                    case 'png':
                    case 'jpg':
                    case 'bmp':
                    case 'gif':
                        icon = "assets/img/upload-file-type/ZIP.png";
                        break;
                    default :
                        icon = "assets/img/upload-file-type/unknown.png";
                        break;
                }
                return icon;
            }
            
        });

        app.KotgFileUploadController = Ember.Controller.extend({
            model:{},
            actions:{
                abortUpload:function(){
                    try{
                        this.get('uploadingInstance').abort();
                        if(!$('#submitUpload').attr('disabled') && $('.icon-checkmark-rounded-circle').length > 0){
                            sessionStorage.setItem("selectedItem", "");
                            this.controllerFor('myCollections').loadNewlyAddCollection(this.get('model').fileList.length);
                        }
                    }catch(e){}
  
                }
            },
            addFile:function(fileObj){
                var fileList = this.get('model').fileList||[],flag = true;
                // for(var i = 0; i < fileList.length; ++i){
                //     if(fileList[i].filename === fileObj.filename){flag=false;break;}
                // }
                if(flag){
                    fileList.push(fileObj);
                    this.set('model',{fileList:fileList});
                }
            },
            removeFile:function(fileid){
                var fileList = this.get('model').fileList;
                var newFileList = [], j = 0;
                for(var i = 0; i < fileList.length; ++i){
                    if(fileList[i].id !== fileid){
                        newFileList[i-j] = fileList[i];
                        newFileList[i-j].id = parseInt(fileList[i].id)-j;
                    }else{
                        j = 1;
                    }
                }
                this.set('model',{fileList:newFileList});
            },
            uploadFiles:function(){
                var self = this;
                var file = this.getuploadFile();
                if(file === undefined) {
                    // if(this.get('model').fileList.length > 0){
                    //     this.controllerFor('myCollections').loadNewlyAddCollection();
                    // }
                    sessionStorage.setItem("selectedItem", "");
                    setTimeout(function() {
                        $('#submitUpload').removeAttr('disabled');
                        $("#addFileCollections-modal").modal("hide");
                        this.controllerFor("myCollections").loadNewlyAddCollection(this.get("model").fileList.length);
                    }.bind(self), 1000);
                    return;
                }
                $('#submitUpload').attr('disabled','disabled');
                this.set('uploadFileId',file.id);
                $('#fileupload').fileupload({
                    url:'/knowledgecenter/kotg/fileupload',
                    beforeSend:function(xhr,data){
                        xhr.setRequestHeader('XSS-Tag',encryptionService.assymEncrypt(App.getCookie('auth-token')));
                    },
                    autoUpload:false,
                    dataType:'text',
                    formAcceptCharset: 'UTF-8'
                });

                var id =  file.id;
                $('#fileupload').bind('fileuploadprogressall',function(e,data){
                    self.uploadProgressAll(e,data,id);
                });
                
                self.doUpload(file);
            },
            doUpload:function(file){
                var self = this;
                var jqXHR = $('#fileupload').fileupload('send',{files:[file.file]}).success(function(result,textStatus,jqXHR){
                    function createFileCollection() {
                        kotgCollectionsService.createFileCollection(result,[]).then(function(response){
                            var fileList = self.get('model').fileList;
                            var newFileList = [],newFile;
                            for(var i = 0; i < fileList.length; i++){
                                if(file.id === fileList[i].id){
                                    fileList[i].status = 'checkmark-rounded-circle';
                                    newFile = fileList[i];
                                }
                                newFileList.push(fileList[i]);
                            }
                            self.set('model',{fileList:newFileList});
                            var tmpl = _.template($('#uploadItem').html());
                            $("li[data-name='"+newFile.id+"']").replaceWith(tmpl(newFile));
                            self.elementH();
                            self.send("uploadFiles", true);
                        }).fail(function(){
                            self.continueUpload(file.id);
                        });
                    }
                    setTimeout(createFileCollection, 1000);
                }).fail(function(jqXHR,textStatus,errorThrown){
                    self.continueUpload(file.id);
                });
                this.set('uploadingInstance',jqXHR);
            },
            continueUpload:function(id){
                var self = this;
                var fileList = self.get('model').fileList;
                var newFileList = [],newFile;
                for(var i = 0; i < fileList.length; i++){
                    if(id === fileList[i].id){
                        fileList[i].status = 'exclamation-circle';
                        newFile = fileList[i];
                    }
                    newFileList.push(fileList[i]);
                }
                self.set('model',{fileList:newFileList});
                var tmpl = _.template($('#uploadItem').html());
                $("li[data-name='"+newFile.id+"']").replaceWith(tmpl(newFile));
                self.elementH();
                self.send("uploadFiles", true);
            },
            elementH:function(){
                $('.the-progress-bar').css('width',$('#uploadfile-list').width() - 70);
            },
            getuploadFile:function(){
                var list = this.get('model').fileList;
                for(var i = 0; i < list.length; i++){
                    if(list[i].status !== 'checkmark-rounded-circle' && list[i].status !== 'exclamation-circle'){
                        return list[i];
                    }
                }
                return undefined;
            },
            uploadProgressAll:function(evnent,data,fileId){
                if(fileId === this.get('uploadFileId')){
                    var progress = parseInt(data.loaded/data.total*100,10);
                    $("div[data-bar-name='"+fileId+"']").css('width',progress+'%');
                }
            }
        });

        app.MyCollectionsController = Ember.Controller.extend(App.KOTGShareMixin, {
            isFetchAsImage: false,
            init: function() {
                this._super();
            },
            actions:{
                loadMoreCollections:function(){
                    $('.loading-more-text').hide();
                    this.loadCollections();
                },
                favorite: function() {
                    var favoriteItem = $("#kotg-favorite");
                    var favorite = favoriteItem.hasClass("kotg-favorite");
                    var assetId = sessionStorage.getItem("selectedItem");
                    function addTagToAsset(dId, tId) {
                        var p = JSON.parse(sessionStorage.getItem(dId));
                        p.asset.tags.push(tId);
                        sessionStorage.setItem(dId, JSON.stringify(p));
                    }
                    function removeTagFromAsset(dId, tId) {
                        var p = JSON.parse(sessionStorage.getItem(dId));
                        p.asset.tags = _.without(p.asset.tags, tId);
                        sessionStorage.setItem(dId, JSON.stringify(p));
                    }
                    if(favorite) {
                        taggingService.unBindTag(assetId, "starred").done(function() {
                            favoriteItem.removeClass("kotg-favorite");
                            removeTagFromAsset(assetId, "starred");
                        }).fail();
                    } else {
                        taggingService.bindTag(assetId, "starred").done(function() {
                            favoriteItem.addClass("kotg-favorite");
                            addTagToAsset(assetId, "starred");
                        }).fail();
                    }
                },
                crawlWebContent:function(){
                    var self = this;
                    self.startCrawl();
                    kotgCollectionsService.crawlUrl(self.fetchURL, self.get("isFetchAsImage")).then(function() {
                        self.set("isFetchAsImage", false);
                        sessionStorage.setItem("selectedItem", "");
                        setTimeout(function(){this.loadNewlyAddCollection()}.bind(self),1500);
                        self.successCrawl();
                       
                    }, function() {
                        self.failCrawl();
                    });
                },
                showDialog: function() {
                    $('#kotg-fetch').show();
                    $("#kotg-fetch-start").hide();
                    $("#kotg-fetch-success").hide();
                    $("#kotg-fetch-fail").hide();
                    $('#fetchURLtext').val('');
                    setTimeout(function(){
                        $('#fetchURLtext').focus();
                    },800);
                },
                sort:function(sorttype){
                    var self = this;
                    $('.sortItem').removeClass('active');
                    $('.sortBy'+sorttype+'Item').addClass('active');
                    switch(sorttype) {
                        case "Name":
                            self.set('sortType', 'title');
                            break;
                        case "Type":
                            self.set('sortType', 'type');
                            break;
                        default:
                            self.set('sortType', null);
                    }
                    // self.sort();
                    self.search();
                },
                desc: function() {
                    var self = this;
                    var isDescending = self.get("isDescending");
                    var orderDesc = $(".k-icon-sorter");
                    if(isDescending) {
                        self.set("isDescending", false);
                        orderDesc.removeClass("icon-sort-descending");
                        orderDesc.addClass("icon-sort-ascending");
                    } else {
                        self.set("isDescending", true);
                        orderDesc.removeClass("icon-sort-ascending");
                        orderDesc.addClass("icon-sort-descending");
                    }
                    // self.sort();
                    self.search();
                },
                searchCollection:function(){
                    this.search();
                },
                clearSearchBar: function() {
                    if(this.get('keywords') != '') {
                        this.set("keywords", "");
                        this.search();
                    }
                },
                deleteCollection: function() {
                    var self = this;
                    // bootbox.confirm("Are you sure you want to delete the Collection?", function(result) {
                    //     if (result) {
                            $('#html-content').html("<img src='../../assets/images/kotg/loading.gif'></img>");
                            $('#html-content-head').html('');
                            kotgCollectionsService.deleteCollection(sessionStorage.getItem("selectedItem")).done(function() {
                                setTimeout(function() {self.search();}, 1000);
                            });
                    //     }
                    // });
                }
            },
            // sort in front-end
            sort: function() {
                var self = this;
                var model, newModel;
                var isDescending, sortType;
                isDescending = self.get("isDescending");
                sortType = self.get("sortType");
                model = this.get('model');
                newModel = {};
                for(var k in model) {
                    if(k != 'collections') newModel[k] = model[k];
                }
                newModel.collections = [];
                var p = [];
                switch(sortType){
                //simple bubble sort
                    case 'Time':
                        for(var i = 0; i < model.collections.length; ++i){
                            for(var j = i; j < model.collections.length; ++j){
                                if(model.collections[i].document.createdAt > model.collections[j].document.createdAt){
                                    var t = model.collections[i];
                                    model.collections[i] = model.collections[j];
                                    model.collections[j] = t;
                                }
                            }
                            p.push(model.collections[i]);
                        }
                        break;
                    case 'Name':
                        for(var i = 0; i < model.collections.length; ++i){
                            for(var j = i; j < model.collections.length; ++j){
                                if(model.collections[i].document.shortenedTitle.toLowerCase() > model.collections[j].document.shortenedTitle.toLowerCase()){
                                    var t = model.collections[i];
                                    model.collections[i] = model.collections[j];
                                    model.collections[j] = t;
                                }
                            }
                            p.push(model.collections[i]);
                        }
                        break;
                }
                if(isDescending) {
                    for(var i=p.length-1; i>=0; --i) {
                        newModel.collections.push(p[i]);
                    }
                } else {
                    newModel.collections = p;
                }
                this.set('model',newModel);
            },
            search: function() {
                var self = this;
                sessionStorage.setItem("selectedItem", "");
                self.set('offset',0);
                self.set('model',{});
                $('.loading-more-text').hide();
                self.loadCollections();
            },
            loadNewlyAddCollection:function(num){
                var self = this;
                    return kotgCollectionsService.fetchCollections('favorite',0,num?num:1,null,true,null).then(function(collections) {
                        $('#addCollectionCloseBtn').click();
                        if(self.controllerFor('application').get("currentPath").indexOf('myCollections') < 0) return;
                        self.set('offset',parseInt(self.get('offset'))+collections.result.length);
                                         
                        var myCollectionId = undefined;
                        _.each(collections.result, function(result) {
                            $("#frame-load-div").show();
                            if (result.document) {
                                if (!myCollectionId) {
                                    if (sessionStorage.getItem("selectedItem") != "") {
                                        sessionStorage.setItem("currentCacheItem", sessionStorage.getItem("selectedItem"));
                                        myCollectionId = sessionStorage.getItem("selectedItem");
                                    } else {
                                        myCollectionId = result.document.id;
                                        sessionStorage.setItem("currentCacheItem", myCollectionId);
                                    }
                                }
                                //console.log(result.document.attachments[0].url);
                                self.refineDocument(result.document);
                               

                                sessionStorage.setItem(result.document.id, JSON.stringify(result));
                            }
                        });
                        var model = self.get('model');
                        var newModel = {};
                        for(var k in model) newModel[k] = model[k];
                        newModel.collections = newModel.collections || []; 
                        newModel.collections = collections.result.concat(newModel.collections);
                        self.set('model',newModel);

                        sessionStorage.setItem("currentCacheItem", myCollectionId);
                        self.transitionTo("myCollection", myCollectionId);
                        $(".details-area").children().show();
                    });
                // });
            },
            parseIcon:function(filetype){
                var thumImage = "";
                switch (filetype) {
                    case 'application/pdf':
                        thumImage = "assets/img/upload-file-type/PDF.png";
                        break;
                    case 'application/msword':
                        thumImage = "assets/img/upload-file-type/DOC.png";
                        break;
                    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                        thumImage = "assets/img/upload-file-type/DOCX.png";
                        break;
                    case 'application/epub+zip':
                        thumImage = "assets/img/upload-file-type/epub.png";
                        break;
                    case 'application/vnd.ms-powerpoint':
                        thumImage = "assets/img/upload-file-type/PPT.png";
                        break;
                    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                        thumImage = "assets/img/upload-file-type/PPTX.png";
                        break;
                    case 'text/plain':
                        thumImage = "assets/img/upload-file-type/TXT.png";
                        break;
                    case 'application/vnd.ms-excel':
                        thumImage = "assets/img/upload-file-type/XLS.png";
                        break;
                    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                        thumImage = "assets/img/upload-file-type/XLSX.png";
                        break;
                    case 'application/zip':
                        thumImage = "assets/img/upload-file-type/ZIP.png";
                        break;
                    default :
                        thumImage = "assets/img/upload-file-type/unknown.png";
                        break;
                }
         
                return thumImage;
            },
            refineDocument:function(d){
                switch (d.type){
                    case "File":
                        d.img = this.parseIcon(d.contentType);
                        d.hasImg = true;
                        d.shortenedTitle = this.interceptionLen(d.title,30);
                        break;
                    case "Image":
                        if(d.href.indexOf('s3.amazonaws.com') >= 0){
                            d.href = d.href;
                        }else if(d.href.indexOf('/service/v2/') >= 0){
                            d.href = d.href.replace('/service/v2/', '/knowledgecenter/kotg/');
                            // d.href = '/knowledgecenter/kotg'+d.href.substring(d.href.indexOf('/v2/')-3,d.href.length);
                        }else if(d.href.indexOf('/kotg_service/v2/') >= 0) {
                            d.href = d.href.replace('/kotg_service/v2/', '/knowledgecenter/kotg/');
                        }
                        d.img = d.href;
                        d.hasImg = true;
                        d.shortenedTitle = this.interceptionLen(d.title,30);
                        break;
                    default :
                        if (d.attachments&&d.attachments.length>0){
                            d.img = d.attachments[0].href;
                            d.hasImg = true;
                            d.shortenedTitle = this.interceptionLen(d.title,30);
                        }else{
                            d.img = "";
                            d.hasImg = false;
                            d.shortenedTitle = this.interceptionLen(d.title, 60);
                        }
                }
            },
            interceptionLen:function(str, needLen){
                var s = '';
                if(str.length > needLen){
                    s = str.substring(0,needLen)+'...';
                }else{
                    s = str;
                }
                return s;
            },
            loadCollections: function(keywords) {
                var self = this;
                var query, sortType, order;
                if(keywords) {
                    query = keywords;
                } else {
                    query = self.get("keywords");
                }
                sortType = self.get('sortType');
                order = self.get('isDescending');
                var offset = self.get("offset");
                $('.loadingCollection').show();
                // self.destroySocialStrip();
                // kotgLoginService.moodleAuth(app.getUsername()).then(function() {
                    // fetchCollections arguments: tag, offset, limit, sortType, order, keywords
                    kotgCollectionsService.fetchCollections('favorite',offset,11, sortType, order, query).then(function(collections) {
                        if(query != self.get("keywords")) {
                            return;
                        } else {
                            if(offset != self.get("offset")) {return;}
                        }
                        if(self.controllerFor('application').get("currentPath").indexOf('myCollections') < 0) return;
                        var results = collections.result;
                        if(results.length === 11) {
                            $('.home-nav-list-content-li .loading-more').show();
                            $('.loading-more-text').show();
                            self.set('offset',parseInt(self.get('offset'))+10);
                            results.pop();
                        } else if(results.length < 11) {
                            $('.home-nav-list-content-li .loading-more').hide();
                            $('.loading-more-text').hide();
                            self.set('offset',parseInt(self.get('offset'))+results.length);
                        }
                        var myCollectionId = undefined;
                        _.each(results, function(result) {
                            $("#frame-load-div").show();
                            if (result.document) {
                                if (!myCollectionId) {
                                    if (sessionStorage.getItem("selectedItem") && sessionStorage.getItem("selectedItem") != "") {
                                        sessionStorage.setItem("currentCacheItem", sessionStorage.getItem("selectedItem"));
                                        myCollectionId = sessionStorage.getItem("selectedItem");
                                    } else {
                                        myCollectionId = result.document.id;
                                        sessionStorage.setItem("selectedItem", myCollectionId);
                                        sessionStorage.setItem("currentCacheItem", myCollectionId);
                                    }
                                }
                                //console.log(result.document.attachments[0].url);
                                self.refineDocument(result.document);
                               

                                sessionStorage.setItem(result.document.id, JSON.stringify(result));
                            }
                        });

                        var model = self.get('model');
                        var newModel = {};
                        for(var k in model) newModel[k] = model[k];
                        newModel.collections = newModel.collections || []; 
                        newModel.collections = newModel.collections.concat(results);
                        self.set('model',newModel);

                        $('.loadingCollection').hide();
                        // if(collections.result.length < 11){
                        //     $('.loading-more-text').hide();
                        // }else if(collections.result.length === 11){
                        //     $('.loading-more-text').show();
                        // }
                        // if (collections.result.length > 0) {
                        //     $(".share-icon").css("visibility", "visible");
                        //     $("#detail").css("visibility", "visible");
                        //     $("#nocontent").hide();
                        //     $(".messagebar-item-right").show();
                        //     //self.initSocialStrip();
                        // } else if (query && collections.result.length == 0) {
                        //     $("#detail").css("visibility", "hidden");
                        //     $("#nosearchcontent").show();
                        //     $(".messagebar-item-right").hide();
                        //     $(".share-icon").css("visibility", "hidden");
                        //     var iframeHtmlHeight = $(window).height() + $(".widget-header").height();
                        //     $("#item-list").css('max-height', iframeHtmlHeight);
                        //     $("#item-list").height(iframeHtmlHeight);
                        //     $("#details-iframe").css("max-height", iframeHtmlHeight);
                        //     $('#details-iframe').height(iframeHtmlHeight);
                        //     self.destroySocialStrip();
                        // } else {
                        //     $(".share-icon").css("visibility", "hidden");
                        //     $(".messagebar-item-right").hide();
                        //     $("#detail").css("visibility", "hidden");
                        //     $("#nocontent").show();
                        //     var iframeHtmlHeight = $(window).height() + $(".widget-header").height();
                        //     $("#item-list").css('max-height', iframeHtmlHeight);
                        //     $("#item-list").height(iframeHtmlHeight);
                        //     $("#details-iframe").css("max-height", iframeHtmlHeight);
                        //     $('#details-iframe').height(iframeHtmlHeight);
                        //     self.destroySocialStrip();
                        // }
                        // $("#nocontent_loading").hide();
                   
                
                        //self.set("url", "/kotg/kotg_details.html?" + Math.floor((Math.random() * 100) + 1));
                        if (myCollectionId) {
                            var myCollection = JSON.parse(sessionStorage.getItem(myCollectionId));
                            //Ember.set(self.controllerFor('myCollection'), "url", "/kotg/kotg_details.html?" + Math.floor((Math.random() * 100) + 1));
                            self.transitionTo("myCollection", myCollectionId);
                            var curLink = JSON.parse(sessionStorage.getItem(myCollectionId)).document.url;
                           
                        }
                        if(self.get('model').collections.length === 0){
                            $(".details-area").children().not('[class="details-nav"]').hide();
                            // self.set("shortenedCurrentLink", '');
                            // self.transitionTo("myCollections");
                        } else {
                            $(".details-area").children().show();
                        }
                        return myCollectionId;
                    });
                // });
            },
            isAddingTag:false,
            shortenedCurrentLink:'',
            destroySocialStrip: function() {
                $("#kotg_social_strip").empty();
                $("#kotg_social_strip").off("cloudlet:activity", "**");
                $("#tag_strip").off("cloudlet:activity", "**");
            },
            getCurrentContentLink: function(collectionId) {
                return $.parseJSON(sessionStorage.getItem(collectionId)).document.url
            },
            setContentLink: function(collectionId) {
                if (sessionStorage.getItem(collectionId))
                    this.set("contentLink", this.getCurrentContentLink(collectionId));
            },
            // offset:0,
            fetchURL:'',
            // sorttype:'Time',
            // fetchURL: function() {
            //     var self = this;
            //     var crawlUrl = this.get('crawlUrl');
            //     self.startStatus();
            //     kotgCollectionsService.crawlUrl(crawlUrl).then(function() {
            //         setTimeout(function() {
            //             sessionStorage.setItem("selectedItem", "");
            //             self.loadCollections();
            //             self.doneStatus();
            //         }, 1500);
            //     }, function() {
            //         self.errorStatus();
            //     });
            // },
            refreshPopupUI: function() {
                var self = this;
                this.set("crawlUrl", "");
                this.hideAllStatus();
                $(".notice-content.clear-fix").show();
                $("#upload-function-bar").show();
                setTimeout(function() {
                    $("#url-fetch-field").focus();
                }, 1500);
                $("#url-fetch-field").unbind().bind('keyup', function(event) {
                    event.stopImmediatePropagation();
                    event.stopPropagation();
                    if (event.keyCode == 13) {
                        self.fetchURL();
                    }
                });
            },

            startCrawl: function() {
                $('#kotg-fetch').hide();
                $("#kotg-fetch-start").show();
                $("#kotg-fetch-success").hide();
                $("#kotg-fetch-fail").hide();
            },

            successCrawl: function() {
                $('#kotg-fetch').hide();
                $("#kotg-fetch-start").hide();
                $("#kotg-fetch-success").show();
                $("#kotg-fetch-fail").hide();
            },

            failCrawl: function() {
                $('#kotg-fetch').hide();
                $("#kotg-fetch-start").hide();
                $("#kotg-fetch-success").hide();
                $("#kotg-fetch-fail").show();
            }
        });

        app.MyCollectionsRoute = Ember.Route.extend({
            setupController: function(controller) {
                this._super(controller);
                var self = this;
                controller.set('model',{});
                controller.set("keywords", "");
                // controller.loadCollections();
                sessionStorage.setItem("currentCacheItem", "");
                controller.set("crawlUrl", "");
                controller.set("contentLink", "");
                controller.set("selectedTags", "");
                // controller.set('offset',0);
            },
            model: function(params) {
                // sessionStorage.setItem("selectedItem", "");
                taggingService.fetchAllTags();
            },
            afterModel: function() {
                Ember.run.next(this, function() {
                  Ember.set(this.controllerFor('application'), "currentPath", "myCollection.index");
                });
            },
            actions: {
                _openShareModel: function() {
                    if ($('#shareCourse').length === 0) {
                        this.controller.openShareModel(this);
                    } else {
                        $('#shareCourse').modal('show');
                    }
                },
                openFileUploadModal:function(){
                    this.render('kotgFileUpload',{
                        into:'myCollections',
                        outlet:'fileUploadOutlet'
                    });
                    setTimeout(function(){
                        $('#uploadfile-list').html('<li>Please select a file to upload.</li>');
                    },100);
                    this.controllerFor('kotgFileUpload').set('model',{});
                },
                didTransition: function(){
                    // this.controller.set('keywords','');
                },
                willTransition: function(transition) {
                    // this.controller.set("keywords", '');
                    // sessionStorage.setItem("selectedItem", "");
                    // this.controller.set('model',{});
                    // this.controller.set('offset',0);
                }
            }
        });

        app.MyCollectionsView = Ember.View.extend({
            template: Ember.Handlebars.compile(myCollectionsTemplate),

            didInsertElement: function() {
                console.log("my collection view is inserted.");
                var self = this;
                // sessionStorage.setItem("selectedItem", "");
                self.controller.set('model', {});
                self.controller.set('offset', 0);
                self.controller.set("keywords", "");
                self.controller.set("isDescending", true);
                // self.controller.set("sortType", "Time");
                self.controller.loadCollections();
                // $('.loading-more-text').hide();
                this.elementH();
                // var searchBar = $("div.k-search-input input[type='text']");
                // searchBar.keyup(function(e) {
                //     if(searchBar.val() == '') {
                //         self.get("controller").send("searchCollection");
                //     }
                // });
                $(window).on('resize',this.elementH);
                $(".details-area").children().not('[class="details-nav"]').hide();
            },
            elementH:function(){
                $('.home-nav-list-content').removeAttr('style');
                function getSidebarHeight() {
                    var height = 0;
                    $("#sidebar ul.nav").each(function(index, ele) {
                        height += $(ele).height();
                    });
                    return height;
                }
                if(($(".details-area").height()+120) > getSidebarHeight() && $(".details-area").height()>($('.home-nav-list-content').height() + 92)) {
                    $('.home-nav-list-content').height($(".details-area").height()-92);
                } else if($('.home-nav-list-content').height() < (getSidebarHeight() - 212)) {
                    $('.home-nav-list-content').css('height', getSidebarHeight() - 212);
                }
                $('.loading-more').width($('.home-nav-list-content').width());
            },
            sizeIframe: function() {
                
                var datagridHeight = $(document).height() - $("#date-grid").offset().top;
                var columnHeight = $(document).height();
                $("#item-list").css('height', datagridHeight - 40);
                $(".dropzone").css('height', datagridHeight);

                var iframewidth = $(window).width() - $('#details-iframe').offset().left - 5;
                var iframeHeight = datagridHeight - 40;

                $('#details-iframe').width(iframewidth);
                $('#details-iframe').height(iframeHeight);
            },
            fixDiv: function() {
                var $cache = $('.fixed-container');
                $('.arwbreadcrumb').css({
                    'border-bottom': 0
                });
                if ($(window).scrollTop() > 40) {
                    $cache.css({
                        'position': 'fixed',
                        'top': '76px'
                    });
                } else {
                    $cache.css({
                        'position': 'static',
                        'top': 'auto'
                    });

                }
            }
        });


        //app.LeftNavController = Ember.Controller.extend({
        //    init: function() {
        //        this._super();
        //    }
        //});

        Ember.Handlebars.helper('checkOrder', function(attachment) {
            if (attachment.order === 0)
                return new Handlebars.SafeString('<i class = "img" ><img src=' + attachment.href + '></i><span><img src="../../../assets/images/kotg/back-pic.png" /></span>')
        });

    });