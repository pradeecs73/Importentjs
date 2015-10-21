'use strict';

define(['app', 'ueditor','text!templates/kotg/detailPane.hbs','services/kotg/kotgNotesService', 'text!templates/kotg/tags.hbs', 'services/kotg/kotgTagService','services/encryptionService'], function(app, ue,myNote,kotgNotesService, kotgTags, taggingService,encryptionService) {


    app.MyNoteRoute = Ember.Route.extend({

        model: function(params) {
            sessionStorage.setItem("selectedItem", params['id']);
            this.controllerFor('myNote').loadSelectedNote();
            this.controllerFor('myNotes').set('isEditingNote', false);
        },
        renderTemplate: function() {
            this.render('kotgTags',{
                into: 'myNotes',
                outlet:'tagArea'
            });
            this.render('myNote', {
                into: 'myNotes',
                outlet: 'detail'
            });
        }
    });
    app.MyNoteView = Ember.View.extend({
        template: Ember.Handlebars.compile(myNote),
        didInsertElement: function() {
            $('#note-editor-area').wysiwyg({activeToolbarClass: "active"});
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
                if($(".details-area").height() < ($(".home-nav-list-content").height() + 92)) {
                    $(".details-area").css('height', $(".home-nav-list-content").height() + 92);
                }
            });
        },
        willDestroy: function() {
            var myNotes = this.controller.controllerFor('myNotes');
            $(window).off('resize', this.sizeIframe);
            myNotes.set("selectedTags", "");
            sessionStorage.setItem("selectedItem", "");
        }
    });

    app.MyNoteController = Ember.ObjectController.extend({
        url: "",
        actions:{
            saveNote:function(){
                var self = this;
                var title = $('#note-editor-title').val().trim();
                if(title === '') { 
                    $('#note-notice').show();
                    return;
                }
                $('#btn-note-save').attr('disabled','disabled');
                var body = $("#note-editor-area").cleanHtml(),
                    textBody = body;
                kotgNotesService.saveNote(title,body,textBody,sessionStorage.getItem('selectedItem')).then(function(response){
                    $('#btn-note-save').removeAttr('disabled');
                    $('#note-notice').hide();
                    $('#editingNoteArea').hide();
                    $('#detail-content-text').show();
                    
                    var selectedItemId = sessionStorage.getItem('selectedItem');

                  
                    var model = self.controllerFor('myNotes').get('model');
                    var newModel = {};
                    for(var i in model) {
                        if(i !== 'collections') newModel[i] = model[i];
                    }
                    var collections = [];
                    var selectedNoteData = JSON.parse(sessionStorage.getItem(selectedItemId));
                    for(var j = 0; j < model.collections.length; j++)
                    {   
                        if(model.collections[j].document.id == selectedItemId){
                            model.collections[j].document.title = title;
                            model.collections[j].document.shortenedTitle = self.interceptionLen(title);
                            model.collections[j].asset.tags = selectedNoteData.asset.tags;
                            sessionStorage.setItem(selectedItemId,JSON.stringify(model.collections[j]));
                        }
                        collections.push(model.collections[j]);
                    }
                    newModel.collections = collections;
                    self.controllerFor('myNotes').set('model',newModel);
                    self.controllerFor('myNotes').set('isEditingNote', false);
                    self.loadSelectedNote();
                }).fail(function(response){
                    $('#btn-note-save').removeAttr('disabled');
                });
            },
            cancelEdit:function(){
                var self = this;
                $('#note-notice').hide();
                $('#editingNoteArea').hide();
                $('#detail-content-text').show();
                self.controllerFor('myNotes').set('isEditingNote', false);
            }
        },
        html_decode:function(str){  
          var s = ""; 
          if (str.length == 0) return "";
          s = str.replace(/&ggt;/g, "&");  
          s = s.replace(/&lt;/g, "<");  
          s = s.replace(/&gt;/g, ">");  
          s = s.replace(/&nbsp;/g, " ");  
          s = s.replace(/&#39;/g, "\'");  
          s = s.replace(/&quot;/g, "\"");  
          s = s.replace(/<br>/g, "\n");  
          return s;  
        },
        interceptionLen:function(str, needLen){
            var s = this.html_decode(str);
            if(s.length > needLen){
                s = s.substring(0,needLen)+'...';
            }
            return s;
        },
        loadSelectedNote: function() {
            var selectedItemId  = sessionStorage.getItem("selectedItem");
            $('#editingNoteArea').hide();
            $('#detail-content-text').show();
            $('#html-content').html("<img src='../../assets/images/kotg/loading.gif'></img>");
            $('#html-content-head').html('');
            $('.div-pane').trigger('resize');
            var p = sessionStorage.getItem(selectedItemId);
            if(!p) {
                sessionStorage.setItem("selectedItem", '');
                this.transitionToRoute("myNotes");
                return;
            }
            var x = JSON.parse(sessionStorage.getItem(selectedItemId));
            var d = x.document;
            d.accountId = x.asset.userId? x.asset.userId: '';
            this.controllerFor("kotgTags").send("loadTags", selectedItemId);
            this.prepareNoteData(d);


            // var controller = this.controllerFor("myNotes");
            // var self = this;
            // var myNoteId = sessionStorage.getItem("selectedItem");
            // sessionStorage.setItem("currentCacheItem", myNoteId);

            // $("#details-iframe").css("visibility", "hidden");
            // $("#frame-load-div").show();
            // Ember.set(self, "url", "/kotg/kotg_details.html?" + Math.floor((Math.random() * 100) + 1));
            // //controller.destroySocialStrip();
            // return {
            //     url: self.url
            // };
        },
        prepareNoteData:function(d){
            var self = this;
            // if (window.social) {
            //     this.destroySocialStrip();
            //     this.initSocialStrip();
            // }

            $('.uyan-comment').html('');
            var url = d.href;
            if(d.rhref && d.rhref.length > 9) url = d.rhref;
            if(url.indexOf('/service/v2') >= 0){
                url = url.replace('/service/v2/', '/knowledgecenter/kotg/');
                // url = '/knowledgecenter/kotg'+url.substring(url.indexOf('/v2/')-3,url.length);
            }else if(url.indexOf('/kotg_service/v2/') >= 0) {
                url = url.replace('/kotg_service/v2/', '/knowledgecenter/kotg/');
            }
            $.ajax(
                {
                    url: url,
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

                        } else if ("Image" == d.type) {
                            //图片类型，到这里就完成了直接返回
                            var htmlTemplate = $("<div><img src='" + d.href + "' /></div>");

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
                        $('#html-content-head').text(title);
                        var detailsNavWidth = $('.details-nav').width();
                        var uyanCommentWidth = detailsNavWidth - 300;
                        $('.uyan-comment').width(uyanCommentWidth);
                        $(window).resize(function() {$(".uyan-comment").width($(".details-nav").width()-300)});
                        $('.uyan-comment').html('');
                        self.initCommentArea(d);
                        //self.removeConflictClass();
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
            var currentNote = JSON.parse(sessionStorage.getItem(sessionStorage.getItem("selectedItem")));
            streamDataContract.title = currentNote.document.title;
            streamDataContract.authorUserName = app.getUsername();
            streamDataContract.resourceUrl = "/#/myNotes/" + activityType.entityId;
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