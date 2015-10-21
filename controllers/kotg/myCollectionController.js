'use strict';

define(['app', 'text!templates/kotg/detailPane.hbs','text!templates/kotg/tags.hbs', 'services/kotg/kotgTagService','services/encryptionService','underscore'], function(app, myCollection,kotgTags, taggingService,encryptionService,_) {
    app.KotgTagsView = Ember.View.extend({
        template: Ember.Handlebars.compile(kotgTags),
        didInsertElement: function() {
            $('#showTagInputAreaBtn').click(function() {
                $(this).hide();
                $('#TagInputArea').show();
                $('#newTagValue').focus();
            });
            $('#TagInputArea').mouseleave(function() {
                $('#TagInputArea').hide();
                $('#showTagInputAreaBtn').show();
            });
        },
        mouseEnter:function(){
            $('#newTagValue').focus();
        },
        keyUp:function(e){
            switch(e.keyCode){
                case 8: this.autoSuggest();break;
                // enter key
                case 13:
                    this.get('controller').send('addTag',$(e.target).val().trim());
                    $(e.target).val("");
                    break;
                // esc key
                case 27:
                    $('#newTagValue').val('');
                    $('#newTagValue').blur();
                    $('#kotg-tag-suggestion').css('display','none');
                    break; 
                case 38:
                    if($('#kotg-tag-suggestion').css('display') === 'block'){
                        var sel = $('.tt-is-under-cursor');
                        var pre = sel.prev('.tt-suggestion');
                        if(pre.length === 1){
                            sel.removeClass('tt-is-under-cursor');
                            pre.addClass('tt-is-under-cursor');
                            $('#newTagValue').val(pre.data('val'));
                        }
                    }
                    break;
                case 40:
                    if($('#kotg-tag-suggestion').css('display') === 'block'){
                        var sel = $('.tt-is-under-cursor');
                        var nex;
                        if(sel.length === 0){
                            nex = $($('.tt-suggestion')[0]);
                        }else{
                            nex = sel.next('.tt-suggestion');
                        }

                        if(nex.length === 1){
                            sel.removeClass('tt-is-under-cursor');
                            nex.addClass('tt-is-under-cursor');
                            $('#newTagValue').val(nex.data('val'));
                        }
                    }
                    break;
            }
            if((e.keyCode >= 65 && e.keyCode <= 90) || (e.keyCode <= 57 && e.keyCode >= 48)){
                this.autoSuggest();
            }
        },
        keyDown:function(e){
            // delete key
            if(e.keyCode === 8 && $(e.target).val() === ''){
                    this.get("controller").send("removeTag", $(".ui-add-tag ul:first li:last span").text());
                }
        },
        autoSuggest:function(){
            var self = this;
            var selectedTags = this.get('controller').get('selectedTags');
            if($('#newTagValue').val() === '') {  $('#kotg-tag-suggestion').css('display','none');return; }
            var tags = JSON.parse(sessionStorage.getItem('alltags'));
            var suggest = [];
            for(var i = 0; i < tags.length; i++){
                var flag = true;
                if(tags[i].name.indexOf($('#newTagValue').val()) === 0){
                    for(var j = 0; j < selectedTags.length; ++j){
                        if(selectedTags[j].name === tags[i].name){
                            flag = false;break;
                        }
                    }
                    if(flag) suggest.push(tags[i]);
                }
            }
    

            if(suggest.length === 0){
                $('#kotg-tag-suggestion').css('display','none');return;
            }

            $('#kotg-suggestBlock').html('');
            for(var j = 0; j < suggest.length; j++){
                $('#kotg-suggestBlock').append("<div style='white-space: nowrap; cursor: pointer;' class='tt-suggestion' data-id='"+suggest[j].id+"' data-val='"+suggest[j].name+"'><p style='white-space: normal;'>"+suggest[j].name+"</p></div>");
            }
            $('#kotg-tag-suggestion').css('display','block');
            $('.tt-suggestion').unbind('hover');
            $('.tt-suggestion').hover(function(){
                $('.tt-suggestion').removeClass('tt-is-under-cursor');
                $(this).addClass('tt-is-under-cursor');
            });
            $('.tt-suggestion').unbind('click');
            $('.tt-suggestion').click(function(){
                self.get('controller').send('addTag',$(this).data('val'));
            });

            // $('#newTagValue').blur(function(){
            //     $('#kotg-tag-suggestion').css('display','none');
            // });
        },
        addTag: function() {
            var self = this;
            var val = this.controller.get("newTag");
            if(val) {
                // show tags with remove button
                var p = $("<li><span class='text'></span><i class='icon icon-x-thick removeTagBtn'></i></li>");
                $("span", p).text(val);
                $(".removeTagBtn", p).click(function(e) {
                    self.get("controller").send("removeTag", $("span", p).text());
                });
                $(".ui-add-tag ul:first").append(p);
                $("#newTagValue").val("");
            }
            self.controller.set("newTag", null);
            $('#kotg-tag-suggestion').css('display','none');
        }.observes("controller.newTag"),
        removeTag: function() {
            var val = this.controller.get("dumpedTag");
            if(val) {
                var p = $(".ui-add-tag ul:first li").filter(function(){return $("span", this).text() == val});
                p.remove();
            }
            this.controller.set("dumpedTag", null);
        }.observes("controller.dumpedTag"),
        clear: function() {
            var isLoading = this.controller.get("isLoading");
            if(isLoading) {
                $(".ui-add-tag ul:first").empty();
                this.controller.set("isLoading", false);
            }
        }.observes("controller.isLoading")
    });

    app.KotgTagsController = Ember.Controller.extend({
        immutableTagIds: ["friend-share", "favorite", "starred", "web", "webclip", "file", "image", "note", "notemessage", "deleted"],
        isLoading: false,
        newTag: null,
        dumpedTag: null,
        selectedTags: [],
        entityId: null,
        actions:{
            loadTags: function(documentId) {
                $('#newTagValue').val('');
                var self = this;
                self.set("entityId", documentId);
                this.set("isLoading", true);
                var tagIds = JSON.parse(sessionStorage.getItem(documentId)).asset.tags;
                var availableTagIds = _.difference(tagIds, self.get("immutableTagIds"));
                var favorite = null;
                for(var i=0, len=tagIds.length; i<len; i++) {
                    if("starred" == tagIds[i]) {
                        favorite = true;
                        break;
                    }
                }
                setTimeout(function() {
                    favorite? $("#kotg-favorite").addClass("kotg-favorite"):$("#kotg-favorite").removeClass("kotg-favorite");
                    var selectedTags = [];
                    $.each(availableTagIds, function(index, id) {
                        var p = sessionStorage.getItem(id);
                        selectedTags.push({id: id, name: p});
                        self.set("newTag", p);
                    });
                    self.set("selectedTags", selectedTags);
                }, 200);
            },
            addTag:function(val) {
                if(!val) return;
                var self = this;
                var selectedTags = self.get("selectedTags");
                for(var i=0, len=selectedTags.length; i<len; i++) {
                    if(selectedTags[i].name == val) {
                        return;
                    }
                }
                var allTags = JSON.parse(sessionStorage.getItem("alltags"));
                var entityId = self.get("entityId");
                var selectedTags = self.get("selectedTags");
                var tagId = null; 
                for(var i=0, len=allTags.length; i<len; i++) {
                    if(allTags[i].name == val) {
                        tagId = allTags[i].id; // val is not a new one
                        break;
                    }
                }
                function pushAssetTag(dId, tId) {
                    var p = JSON.parse(sessionStorage.getItem(dId));
                    p.asset.tags.push(tId);
                    sessionStorage.setItem(dId, JSON.stringify(p));
                }
                if(tagId) {
                    taggingService.bindTag(entityId, tagId).done(function() {
                        selectedTags.push({id: tagId, name: val});
                        self.set("selectedTags", selectedTags);
                        self.set("newTag", val);
                        pushAssetTag(entityId,tagId);
                        $('#kotg-tag-suggestion').css('display','none');
                    }).fail();
                } else {
                    taggingService.createTag(val).done(function(result) {
                        tagId = result.response.id;
                        taggingService.bindTag(entityId, tagId).done(function() {
                            selectedTags.push({id: tagId, name: val});
                            self.set("selectedTags", selectedTags);
                            self.set("newTag", val);
                            pushAssetTag(entityId,tagId);
                            $('#kotg-tag-suggestion').css('display','none');
                        }).fail();
                    }).fail();
                }
            },
            removeTag: function(val) {
                var self = this;
                var selectedTags = this.get("selectedTags");
                var entityId = self.get("entityId");
                var tagId = null;
                for(var i=0, len=selectedTags.length; i<len; i++) {
                    if(selectedTags[i].name == val) {
                        tagId = selectedTags[i].id;
                    }
                }
                selectedTags = _.filter(selectedTags, function(p) {return p.name != val;});
                taggingService.unBindTag(entityId, tagId).done(function() {
                    self.set("selectedTags", selectedTags);
                    self.set("dumpedTag", val);
                    var p = JSON.parse(sessionStorage.getItem(entityId));
                    var assetTags = p.asset.tags;
                    p.asset.tags = _.without(assetTags, tagId);
                    sessionStorage.setItem(entityId, JSON.stringify(p));
                }).fail();
            }
        }
    });

    app.MyCollectionRoute = Ember.Route.extend({
        model: function(params) {
            sessionStorage.setItem("selectedItem", params['id']);
            this.controllerFor('myCollection').loadSelectedCollection();
        },
        renderTemplate: function() {
            this.render('myCollection', {
                into: 'myCollections',
                outlet: 'detail'
            });
            this.render('kotgTags',{
                into: 'myCollections',
                outlet:'tagArea'
            });
        }
    });

    app.MyCollectionView = Ember.View.extend({
        template: Ember.Handlebars.compile(myCollection),
        didInsertElement: function() {
            $('#html-content').html("<img src='../../assets/images/kotg/loading.gif'></img>");
            $('#html-content-head').html('');
            function getSidebarHeight() {
                var height = 0;
                $("#sidebar ul.nav").each(function(index, ele) {
                    height += $(ele).height();
                });
                return height;
            }
            $('.detail-pane').on('resize',function(){
                $('.home-nav-list-content').removeAttr('style');
                if(($(".details-area").height()+120) > getSidebarHeight() && $(".details-area").height()>($('.home-nav-list-content').height() + 92)) {
                    $('.home-nav-list-content').height($(".details-area").height()-92);
                } else if($('.home-nav-list-content').height() < (getSidebarHeight() - 212)) {
                    $('.home-nav-list-content').css('height', getSidebarHeight() - 212);
                }
            });  
        },
        willDestroy: function() {
            var myCollections = this.controller.controllerFor('myCollections');
            myCollections.set("selectedTags", "");
            sessionStorage.setItem("selectedItem", "");
        }
    });

    app.MyCollectionController = Ember.ObjectController.extend({
        url: "",
        itemsCount:1,
        loadSelectedCollection: function() {
            var selectedItemId  = sessionStorage.getItem("selectedItem");


            console.log("Loading the selected item: ", selectedItemId);
            $('#html-content').html("<img src='../../assets/images/kotg/loading.gif'></img>");
            $('#html-content-head').html('');
            $('.div-pane').trigger('resize');
            var p = sessionStorage.getItem(selectedItemId);
            if(!p) {
                sessionStorage.setItem("selectedItem", '');
                this.transitionToRoute("myCollections");
                return;
            }
            var x = JSON.parse(sessionStorage.getItem(selectedItemId));
            var d = x.document;
            d.accountId = x.asset.userId? x.asset.userId: '';
            this.controllerFor("kotgTags").send("loadTags", selectedItemId);
            var curLink;
            //this.controllerFor('myCollections').set('currentLink',curLink);
            if(d.type === "File" || d.type === 'Image') {
                curLink = d.href;
                if(d.href.indexOf('s3.amazonaws.com') >= 0){
                    curLink = d.href;
                }else if(d.href.indexOf('/service/v2/') >= 0){
                    curLink = d.href.replace('/service/v2/', '/knowledgecenter/kotg/');
                    // curLink = '/knowledgecenter/kotg'+d.href.substring(d.href.indexOf('/v2/')-3,d.href.length);
                } else if(d.href.indexOf('/kotg_service/v2/') >= 0) {
                    curLink = d.href.replace('/kotg_service/v2/', '/knowledgecenter/kotg/');
                }
                if(d.title.length > 50) {
                    this.controllerFor('myCollections').set('shortenedCurrentLink',d.title.substring(0,50)+'...');
                } else {
                    this.controllerFor('myCollections').set('shortenedCurrentLink',d.title);
                }
            } else {
                curLink = d.url;
                if(curLink.length > 50) {
                    this.controllerFor('myCollections').set('shortenedCurrentLink',curLink.substring(0,50)+'...');
                }else{
                    this.controllerFor('myCollections').set('shortenedCurrentLink',curLink);
                }
            }
            this.controllerFor('myCollections').set('currentLink',curLink);

            if(d.type === 'File'){
                this.showFileContent(d);
                return;
            }

            
            this.prepareCollectionData(d);
            // var self = this;
            // var controller = this.controllerFor("myCollections");
            // var myCollectionId = sessionStorage.getItem("selectedItem");
            // sessionStorage.setItem("currentCacheItem", myCollectionId);
            // $("#details-iframe").css("visibility", "hidden");
            // $("#frame-load-div").show();
            // Ember.set(self, "url", "/kotg/kotg_details.html?" + Math.floor((Math.random() * 100) + 1));
            // //controller.destroySocialStrip();
            // return {
            //     url: self.url
            // };
        },
        showFileContent:function(d){
           // if (window.social) {
           //      this.destroySocialStrip();
           //      this.initSocialStrip();
           //  }
           $('.uyan-comment').replaceWith("<div class='uyan-comment' load='no' style='margin-top: 20px; border-top:1px solid #EDEDED;'></div>");
           setTimeout(function(){
                if(d.href.indexOf('s3.amazonaws.com') >= 0){
                    d.href = d.href;
                }else if(d.href.indexOf('/service/v2/') >= 0){
                    d.href = d.href.replace('/service/v2/', '/knowledgecenter/kotg/');
                    // d.href = '/knowledgecenter/kotg'+d.href.substring(d.href.indexOf('/v2/')-3,d.href.length);
                }else if(d.href.indexOf('/kotg_service/v2/') >= 0) {
                    d.href = d.href.replace('/kotg_service/v2/', '/knowledgecenter/kotg/');
                }
                var htmlTemplate = "<div class='file-download'>"+
                    "<div class='file-center'>"+
                        "<div class='file-name-img'>"+
                            "<img src='" + this.parseIcon(d.contentType)+ "'/>"+
                        "</div>"+
                        "<div class='file-download-detail'>"+
                            "<h3 class='block-text'>"+(d.title.length>43?d.title.substring(0,43):d.title)+"</h3>"+
                            "<span><em class='color-8'>"+this.convertSize(d.contentLength)+"</em></span>"+
                            "<a href='"+d.href+"' class='download btn-overflow'>Download</a>"+
                        "</div>"+
                    "</div>"+
                "</div>";
                $('#html-content').html(htmlTemplate);
                $('#html-content-head').html(d.title);
            }.bind(this),500);
       
        },
        convertSize:function(size) {
            if (!size) {
                return '0 Bytes';
            }
            var sizeNames = [' Bytes', ' KB', ' MB', ' GB', ' TB', ' PB', ' EB', ' ZB', ' YB'];
            var i = Math.floor(Math.log(size) / Math.log(1024));
            var p = (i > 1) ? 2 : 0;
            return (size / Math.pow(1024, Math.floor(i))).toFixed(p) + sizeNames[i];
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
        prepareCollectionData:function(d){
            var self = this;
            // if (window.social) {
            //     this.destroySocialStrip();
            //     this.initSocialStrip();
            // }
            $('.uyan-comment').html('');
            if(d.href.indexOf('s3.amazonaws.com') >= 0){
                d.href = d.href;
            }else if(d.href.indexOf('/service/v2/') >= 0){
                d.href = d.href.replace('/service/v2/', '/knowledgecenter/kotg/');
                // d.href = '/knowledgecenter/kotg'+d.href.substring(d.href.indexOf('/v2/')-3,d.href.length);
            }else if(d.href.indexOf('/kotg_service/v2/') >= 0){
                d.href = d.href.replace('/kotg_service/v2/', '/knowledgecenter/kotg/');
            }
            $('#html-content').css('text-align', 'left');
            if(d.type === 'Image'){
                var newImage = new Image();
                newImage.onload = function() {
                    var selectedItem = sessionStorage.getItem("selectedItem");
                    if(d.id != selectedItem) return;
                    if($("#html-content").width() <= newImage.width) {
                        $(this).css('width', '100%');
                    } else {
                        $("#html-content").css('text-align', 'center');
                    }
                    $("#html-content").html(this);
                    $('#html-content-head').html(d.title);
                    var detailsNavWidth = $('.details-nav').width();
                    var uyanCommentWidth = detailsNavWidth - 300;
                    $('.uyan-comment').width(uyanCommentWidth);
                    $(window).resize(function() {$(".uyan-comment").width($(".details-nav").width()-300)});
                    self.initCommentArea(d);
                }
                newImage.src = d.href;
                return;
            }
            $.ajax(
                {
                    url: d.href,
                    dataType: "text",
                    type: "GET",
                    cache: false,
                    beforeSend:function(xhr){
                        var tagValue = App.getCookie('auth-token');
                        if(typeof(headers) ==='undefined') var headers = {}
                        headers["XSS-Tag"] = encryptionService.assymEncrypt(tagValue)
                        _.each(_.keys(headers || {}), function (key) {
                            xhr.setRequestHeader(key, headers[key]);
                        });
                    },
                    success: function (response) {
                        var selectedItem = sessionStorage.getItem("selectedItem");
                        if(d.id != selectedItem) return;
                        console.log("The selected item is loaded.");
                        var htmlTemplate = null;
                        if ("Note" == d.type) {
                            htmlTemplate = $('<div><pre id="note-body">' + response + "</pre></div>");

                        } 
                        else {
                            htmlTemplate = $("<div>" + response + "</div>");
                        }

                        htmlTemplate.find("a").attr("target", "_blank");
                    
                        //replace the img attachment
                        if (d.attachments) {
                            for (var i = 0; i < d.attachments.length; i++) {
                                var imgList = htmlTemplate.find('img[data-id="' + d.attachments[i].order + '"]');
                                for (var j = 0; j < imgList.length; j++) {
                                    if(d.attachments[i].href.indexOf("/service/v2") >= 0) {
                                        d.attachments[i].href = d.attachments[i].href.replace('/service/v2/', '/knowledgecenter/kotg/');
                                        // d.attachments[i].href = '/knowledgecenter/kotg'+d.attachments[i].href.substring(d.attachments[i].href.indexOf('/v2/')-3,d.attachments[i].href.length);
                                    }else if(d.attachments[i].href.indexOf('/kotg_service/v2/') >= 0){
                                        d.attachments[i].href = d.attachments[i].href.replace('/kotg_service/v2/', '/knowledgecenter/kotg/');
                                    }
                                    imgList[j].setAttribute('src', d.attachments[i].href);
                                }
                            }
                        }

                        var title = "";
                        if (d.type == "Web") {
                            title = d.title;
                        } else if (d.type == "WebClip") {
                            title = d.digest;
                        } else if (d.type == "Note") {
                            title = d.title;
                        }
                        $('#html-content').html(htmlTemplate.html());
                        $('#html-content-head').html(title);
                        var detailsNavWidth = $('.details-nav').width();
                        var htmlContentWidth = detailsNavWidth - 340;
                        var uyanCommentWidth = detailsNavWidth - 300;
                        $('#html-content img').each(function(index, ele) {
                            $(ele).load(function() {
                                $(ele).width()>htmlContentWidth ? $(ele).width("100%"):null;
                            });
                        });
                        $('.uyan-comment').width(uyanCommentWidth);
                        $(window).resize(function() {$(".uyan-comment").width($(".details-nav").width()-300)});

                        $('.uyan-comment').html('');
                        self.initCommentArea(d);
                        self.removeConflictClass();
                    },
                    error: function (xhr, errorInfo, exception) {
                        if($('.address-text').html().indexOf(d.href) >= 0){
                             $('#html-content-head').html('Service Unreachable.');
                        }
                    }
                });
        },
        initCommentArea:function(d){
            try {
                //window.jiaThisAppId = 'eaasChinaTest';
                if (window.UYANCMT && window.jiaThisAppId) {
                    if (jiaThisAppId == "%JIA_THIS_APP_ID%") {
                         console.log("Please configure JIA_THIS_APP_ID");
                         return;
                    }
                    var baseUrl = window.location.protocol + "//" + window.document.domain;
                    var nickName = app.getShortname();
                    var faceUrl = app.profileImage(app.getUsername(), "mini");
                    var profileUrl = baseUrl + "/#/user/" + app.getUsername();
                    
                    
                    $('.uyan-comment').attr("appid", jiaThisAppId);
                    $('.uyan-comment').attr("entityid", d.id);
                    $('.uyan-comment').attr("articletitle", d.title);
                    $('.uyan-comment').attr("nickName", nickName);
                    $('.uyan-comment').attr("faceUrl", faceUrl);
                    $('.uyan-comment').attr("profileUrl", profileUrl);
                    $('.uyan-comment').attr("accountId", d.accountId);;
                    
                    window.UYANCMT.load(window.jiaThisAppId, d.id, null, d.title, nickName, faceUrl, profileUrl, d.accountId);
                }
            } catch (err) {
                console.log("Failure in rendering Comments." + err);
            }
        },
        removeConflictClass:function(){
            $('.infobox').removeClass('infobox');
        },
        destroySocialStrip:function(){
            $("#kotg_social_strip").empty();
            $("#kotg_social_strip").off("cloudlet:activity", "**");
            $("#tag_strip").off("cloudlet:activity", "**");
        },
        initSocialStrip:function(){
            $("#kotg_social_strip").attr("ref-entity-id", sessionStorage.getItem("selectedItem"));
            $("#kotg_social_strip").on("cloudlet:activity", this.publishActivityStream);
            if (window.social) window.social.render();
        },
        publishActivityStream: function(e, activityType) {
            console.log("kotg publish ActivityStream", e, activityType);
            //push to activity stream
            var streamDataContract = new activityStream.StreamDataContract(activityType.entityId, activityType.entityType);
            var currentCollection = JSON.parse(sessionStorage.getItem(sessionStorage.getItem("selectedItem")));
            streamDataContract.title = currentCollection.document.title;
            streamDataContract.authorUserName = app.getUsername();
            streamDataContract.resourceUrl = "/#/myCollections/" + activityType.entityId;
            switch (activityType.activity) {
                    case comments.getConfig().pluginType:
                        streamDataContract.verb = 'comment';
                        break;
					case rating.getConfig().pluginStateOn:
						streamDataContract.verb = 'rate';
						break;
					case rating.getConfig().pluginStateOff:
						streamDataContract.verb = 'un-rate';
						break;
                    case follow.getConfig().pluginStateOn:
                        streamDataContract.verb = 'follow';
                        break;
                    case favorite.getConfig().pluginStateOn:
                        streamDataContract.verb = 'favorite';
                        break;
                    case like.getConfig().pluginStateOn:
                        streamDataContract.verb = 'like';
                        break;
                    case follow.getConfig().pluginStateOff:
                        streamDataContract.verb = 'un-follow';
                        break;
                    case favorite.getConfig().pluginStateOff:
                        streamDataContract.verb = 'un-favorite';
                        break;
                    case like.getConfig().pluginStateOff:
                        streamDataContract.verb = 'un-like';
                        break;
            }
            activityStream.pushToStream(streamDataContract);
        }
    });
});
