'use strict';

define(['app', 'text!templates/kotg/detailPane.hbs','text!templates/kotg/tags.hbs', 'services/kotg/kotgTagService','services/encryptionService'], function(app, sharedItem,kotgTags, taggingService,encryptionService) {
    
    app.SharedItemRoute = Ember.Route.extend({
        model: function(params) {
            sessionStorage.setItem("selectedItem", params['id']);
            this.controllerFor('sharedItem').loadSelectedCollection();
        },
        renderTemplate: function() {
            this.render('sharedItem', {
                into: 'sharedItems',
                outlet: 'detail'
            });
            this.render('kotgTags',{
                into: 'sharedItems',
                outlet:'tagArea'
            });
        }
    });

    app.SharedItemView = Ember.View.extend({
        template: Ember.Handlebars.compile(sharedItem),
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
            var sharedItems = this.controller.controllerFor('sharedItems');
            sharedItems.set("selectedTags", "");
            sessionStorage.setItem("selectedItem", "");
        }
    });

    app.SharedItemController = Ember.ObjectController.extend({
        url: "",
        itemsCount:1,
        loadSelectedCollection: function() {
            var selectedItemId  = sessionStorage.getItem("selectedItem");


            $('#html-content').html("<img src='../../assets/images/kotg/loading.gif'></img>");
            $('#html-content-head').html('');
            $('.div-pane').trigger('resize');
            var p = sessionStorage.getItem(selectedItemId);
            if(!p) {
                sessionStorage.setItem("selectedItem", '');
                this.transitionToRoute("sharedItems");
                return;
            }
            var x = JSON.parse(sessionStorage.getItem(selectedItemId));
            var d = x.document;
            d.accountId = x.asset.userId? x.asset.userId: '';
            this.controllerFor("kotgTags").send("loadTags", selectedItemId);
            var curLink;
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
                    this.controllerFor('sharedItems').set('shortenedCurrentLink',d.title.substring(0,50)+'...');
                } else {
                    this.controllerFor('sharedItems').set('shortenedCurrentLink',d.title);
                }
            } else {
                curLink = d.url;
                if(curLink.length > 50) {
                    this.controllerFor('sharedItems').set('shortenedCurrentLink',curLink.substring(0,50)+'...');
                }else{
                    this.controllerFor('sharedItems').set('shortenedCurrentLink',curLink);
                }
            }
            this.controllerFor('sharedItems').set('currentLink',curLink);

            if(d.type === 'File'){
                this.showFileContent(d);
                return;
            }

            
            this.prepareCollectionData(d);
            // var self = this;
            // var controller = this.controllerFor("sharedItems");
            // var sharedItemId = sessionStorage.getItem("selectedItem");
            // sessionStorage.setItem("currentCacheItem", sharedItemId);
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
                    url: (d.type=="Note" && d.rhref)? d.rhref: d.href,
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
            //push to activity stream
            var streamDataContract = new activityStream.StreamDataContract(activityType.entityId, activityType.entityType);
            var currentCollection = JSON.parse(sessionStorage.getItem(sessionStorage.getItem("selectedItem")));
            streamDataContract.title = currentCollection.document.title;
            streamDataContract.authorUserName = app.getUsername();
            streamDataContract.resourceUrl = "/#/sharedItems/" + activityType.entityId;
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
