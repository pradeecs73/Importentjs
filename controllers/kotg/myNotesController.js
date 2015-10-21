'use strict';

define(['app','ueditor', 'text!templates/kotg/myNotes.hbs','text!templates/kotg/addNote.hbs', 'services/kotg/kotgLoginService', 'services/kotg/kotgNotesService', "underscore", "services/kotg/kotgCollectionsService", "controllers/kotg/shareMixin", "services/kotg/kotgTagService"],
    function(app,ue, myTeamTemplate, addNoteTmpl, kotgLoginService, kotgNotesService, _, kotgCollectionsService, KOTGShareMixin, taggingService) {
        

        app.MyNotesController = Ember.Controller.extend(App.KOTGShareMixin, {

            init: function() {
                this._super();
            },
            actions:{
                loadMoreNotes:function(){
                    $('.loading-more-text').hide();
                    this.loadNotes();
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
                searchNote: function() {
                    this.search();
                },
                clearSearchBar: function() {
                    if(this.get('keywords') != '') {
                        this.set("keywords", "");
                        this.search();
                    }
                },
                addNote:function(){
                    this.transitionToRoute('myNotes.add');
                },
                editNote:function(){
                    var self = this;
                    self.set('isEditingNote', true);
                    sessionStorage.setItem('editNoteTitle',$('#html-content-head').text());
                    sessionStorage.setItem('editNoteText',$('#note-body').html());
                    $('#note-editor-title').val(sessionStorage.getItem('editNoteTitle'));
                    $('#note-editor-area').html(sessionStorage.getItem("editNoteText"));
                    $('#editingNoteArea').show();
                    $('#detail-content-text').hide();
                    $('#note-notice').hide();
                },
                deleteNote: function() {
                    var self = this;
                    // bootbox.confirm("Are you sure you want to delete the Note?", function(result) {
                    //     if (result) {
                            $('#html-content').html("<img src='../../assets/images/kotg/loading.gif'></img>");
                            $('#html-content-head').html('');
                            kotgNotesService.deleteNote(sessionStorage.getItem("selectedItem")).done(function() {
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
            search: function(){
                var self = this;
                sessionStorage.setItem('selectedItem','');
                self.set('offset',0);
                self.set('model', {});
                $('.loading-more-text').hide();
                self.loadNotes();
            },
            loadNewlyAddNote:function(){
                var self = this;
                    return kotgCollectionsService.fetchCollections('note',0,1,null,true,null).then(function(notes) {
                        self.set('offset',parseInt(self.get('offset'))+1);

                        var model = self.get('model');
                        var newModel = {};
                        for(var k in model) newModel[k] = model[k];
                        newModel.collections = newModel.collections || []; 
                        notes.result[0].document.shortenedTitle = self.interceptionLen(notes.result[0].document.title, 30);
                        newModel.collections = notes.result.concat(newModel.collections);
                        self.set('model',newModel);

                        var myNoteId = notes.result[0].document.id;
                        sessionStorage.setItem("currentCacheItem", myNoteId);
                        sessionStorage.setItem(notes.result[0].document.id, JSON.stringify(notes.result[0]));
                        self.transitionTo("myNote", myNoteId);
                        $(".details-area").children().show();
                    });
                // });
            }, 
            loadNotes: function(keywords) {
                var self = this;
                var query, sortType, order;
                var offset = self.get("offset");
                if (keywords) {
                    query = keywords;
                } else {
                    query = self.get("keywords");

                }
                sortType = self.get('sortType');
                order = self.get('isDescending');
                $('.loadingCollection').show();
                // self.destroySocialStrip();
                // kotgLoginService.moodleAuth(app.getUsername()).then(function() {
                    // fetchCollections arguments: tag, offset, limit, sortType, order, keywords
                    kotgCollectionsService.fetchCollections('note',offset,11,sortType,order,query).then(function(notes) {
                        if(query != self.get("keywords")) {
                            return;
                        } else {
                            if(offset != self.get("offset")) {return;}
                        }
                        if(self.controllerFor('application').get("currentPath").indexOf('myNotes') < 0) return;
                        var results = notes.result;
                        if(results.length === 11) {
                            $('.home-nav-list-content-li .loading-more').show();
                            $('.loading-more-text').show();
                            self.set("offset", parseInt(self.get("offset")) + 10);
                            results.pop();
                        }else if(notes.result.length < 11){
                            $('.home-nav-list-content-li .loading-more').hide();
                            $('.loading-more-text').hide();
                            self.set("offset", parseInt(self.get("offset")) + results.length);
                        }
                        
                        var myNoteId = undefined;
                        _.each(results, function(result) {
                            
                            if (result.document) {
                                result.document.shortenedTitle = self.interceptionLen(result.document.title, 30);
                        
                                if (!myNoteId) {
                                    if (sessionStorage.getItem("selectedItem") && sessionStorage.getItem("selectedItem") != "") {
                                        sessionStorage.setItem("currentCacheItem", sessionStorage.getItem("selectedItem"));
                                        myNoteId = sessionStorage.getItem("selectedItem");
                                    } else {
                                        myNoteId = result.document.id;
                                        sessionStorage.setItem("selectedItem", myNoteId);
                                        sessionStorage.setItem("currentCacheItem", myNoteId);
                                    }
                                }
                                sessionStorage.setItem(result.document.id, JSON.stringify(result));
                            }
                        });
                        // if (notes.result.length > 0) {
                        //     $(".share-icon").css("visibility", "visible");
                        //     $("#detail").css("visibility", "visible");
                        //     $("#nocontent").hide();
                        //     $(".messagebar-item-right").show();
                        //     //self.initSocialStrip();
                        // } else if (query && notes.result.length == 0) {
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
                        //     $("#detail").css("visibility", "hidden");
                        //     $("#nocontent").show();
                        //     $(".messagebar-item-right").hide();
                        //     var iframeHtmlHeight = $(window).height() + $(".widget-header").height();
                        //     $("#item-list").css('max-height', iframeHtmlHeight);
                        //     $("#item-list").height(iframeHtmlHeight);
                        //     $("#details-iframe").css("max-height", iframeHtmlHeight);
                        //     $('#details-iframe').height(iframeHtmlHeight);
                        //     self.destroySocialStrip();
                        // }
                        //self.set("noteListItems", notes.result);
                        var model = self.get('model');
                        var newModel = {};
                        for(var k in model) newModel[k] = model[k];
                        newModel.collections = newModel.collections || [];
                        newModel.collections = newModel.collections.concat(results);
                        self.set('model',newModel);
                        $('.loadingCollection').hide();
                        // self.set("url", "/kotg/kotg_details.html?" + Math.floor((Math.random() * 100) + 1));
                        if(self.get('model').collections.length === 0){
                            $(".details-area .details-nav-2").hide();
                            // self.transitionTo("myNotes");
                        } else {
                            $(".details-area").children().show();
                        }
                        // transit from workspace
                        if("myNotes.add" == self.controllerFor("application").get("currentPath")) {return;}
                        if (myNoteId) {
                            self.transitionTo("myNote", myNoteId);
                        }
                        return myNoteId;
                    });
                // });
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
            destroySocialStrip: function() {
                $("#kotg_social_strip").empty();
                $("#kotg_social_strip").off("cloudlet:activity", "**");
                $("#tag_strip").off("cloudlet:activity", "**");
            },
            // searchNotes: function(e) {
            //     sessionStorage.setItem("selectedItem", "");
            //     var searchText = this.get("searchText");
            //     if (searchText === "") {
            //         this.loadNotes();
            //     } else {
            //         this.loadNotes(searchText);
            //     }
            // },
            // saveNote: function() {
            //     var id = null;
            //     if (this.get("currentNoteAction") === "edit") {
            //         id = sessionStorage.getItem("currentCacheItem");
            //     }
            //     var body = this.get("noteText");
            //     var title = this.get("noteTitle");
            //     body = body.trim();
            //     title = title.trim();
            //     var self = this;
            //     if (!body && !title) {
            //         alert("Please fill title and content");
            //         self.set("noteText","");
            //         self.set("noteTitle","");
            //         $("#noteTitle").focus();
            //     } else if (!title) {
            //         alert("Please fill title");
            //         self.set("noteTitle","");
            //         $("#noteTitle").focus();
            //     } else {
            //         jQuery('#modal-table').modal('hide');
            //         self.set("currentNoteAction", "");
            //         kotgNotesService.saveNote(title, body, id).then(function() {
            //             sessionStorage.setItem("selectedItem", "");
            //             $('.create-notes').hide();
            //             self.set("noteText", "");
            //             self.set("noteTitle", "");
            //             setTimeout(function() {
            //                 self.transitionToRoute('myNotes');
            //                 //self.loadNotes();
            //             }, 1500);
            //         });
            //     }
            // },
            closeNote: function() {
                this.set("currentNoteAction", "");
            },
            // editNote: function() {
            //     var self = this;
            //     self.set("currentNoteAction", "edit");
            //     var currentNote = sessionStorage.getItem(sessionStorage.getItem("currentCacheItem"));
            //     if (currentNote) {
            //         currentNote = $.parseJSON(currentNote);
            //         if (currentNote.document.type == "Note") {
            //             self.callNoteWindow(sessionStorage.getItem("currentCacheItem"));
            //             self.set("noteTitle", currentNote.document.title);
            //             kotgNotesService.fetchURL(currentNote.document.href).then(function(response) {
            //                 self.set("noteText", response);
            //             });
            //         }
            //     }
            // },
            
            callNoteWindow: function(did) {
                this.set("noteText", "");
                this.set("noteTitle", "");
                var self = this;

                $('#note-window').show('fast', function() {
                    var maxHeigth = $(window).height() - 200;

                    $("#noteFieldParent").css({
                        "maxHeight": maxHeigth,
                        "height": maxHeigth
                    });

                    $("#noteField").css({
                        "maxHeight": maxHeigth,
                        "height": maxHeigth
                    });

                    var remainder = maxHeigth % 28;
                    var textareaHeight = $("#noteFieldParent").height(maxHeigth - remainder);
                    //console.log(textareaHeight + 28);
                    if (textareaHeight % 28 != 0) {
                        $("#noteFieldParent").css({
                            "height": maxHeigth - remainder,
                            "minHeight": maxHeigth - remainder
                        });
                        $("#noteField").css({
                            "height": maxHeigth - remainder,
                            "minHeight": maxHeigth - remainder
                        });
                    }
                    setTimeout(function() {
                        $("#noteTitle").focus();
                    }, 500);

                    $("body").bind("keyup", function(event) {
                        if (event.keyCode == 9) {
                            $("#noteField").focus();
                        }
                    })
                    $("#noteTitle").bind('keyup', function(event) {
                        if (event.keyCode == 13) {
                            $("#noteField").focus();
                        }
                    });
                    $("#modal-table").bind('keyup', function(event) {
                        if (event.keyCode == 27) {
                            self.set("currentNoteAction", "");
                            $('#modal-table').unbind('keyup');
                        }
                    });

                });
            }
        });

        app.MyNotesView = Ember.View.extend({
            template: Ember.Handlebars.compile(myTeamTemplate),
            didInsertElement: function() {
                var self = this;
                // sessionStorage.setItem("selectedItem", "");
                self.controller.set('model', {});
                self.controller.set('offset', 0);
                self.controller.set("keywords", "");
                self.controller.set("noteText", "");
                self.controller.set("noteTitle", "");
                self.controller.set("isDescending", true);
                // self.controller.set("sortType", "Time");
                self.controller.loadNotes();
                this.elementH();
                $(window).on('resize',this.elementH);
                // var searchBar = $("div.k-search-input input[type='text']");
                // searchBar.keyup(function(e) {
                //     if(searchBar.val() == '') {
                //         self.get("controller").send("searchNote");
                //     }
                // });
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
            }
        });

        app.MyNotesRoute = Ember.Route.extend({
            setupController: function(controller) {
                this._super(controller);
                controller.set("keywords", "");
                controller.set('model',{});
                // console.log("loadNotes");
                // controller.loadNotes();
                sessionStorage.setItem("currentCacheItem", "");
                // controller.set('offset',0);
                //controller.set("noteListItems", []);
                controller.set('isEditingNote',false);
            },
            model: function(params) {
                // sessionStorage.setItem("selectedItem", "");
                taggingService.fetchAllTags();
            },
            afterModel: function() {
//                 Ember.run.next(this, function() {
//                   Ember.set(this.controllerFor('application'), "currentPath", "myNote.index");
//                 });
            },
            actions: {
                _openShareModel: function() {
                    if ($('#shareCourse').length === 0) {
                        this.controller.openShareModel(this);
                    } else {
                        $('#shareCourse').modal('show');
                    }
                },
                didTransition:function(){
                    // this.controller.set('keywords','');
                },
                willTransition: function(transition) {
                    // this.controller.set("keywords", "");
                    // sessionStorage.setItem("selectedItem", "");
                    // this.controller.set('model',{});
                    // this.controller.set('offset',0);
                }
            }
        });

        app.MyNotesAddRoute = Ember.Route.extend({
            model:function(params, transition){
                sessionStorage.setItem("selectedItem", '');
                var model = {};
                model.title = transition.queryParams.title? transition.queryParams.title: "";
                return model;
            },
            setupController: function(controller, model) {
                controller.set("noteTitle", model.title);
            },
            renderTemplate:function(){
                this.render('myNotesAdd',{
                    into:'myNotes',
                    outlet:'detail'
                });
            }
        });

        app.MyNotesAddView = Ember.View.extend({
            template:Ember.Handlebars.compile(addNoteTmpl),
            didInsertElement:function(){
                var self = this;
                self.controller.controllerFor('myNotes').set('isEditingNote', true);
                $('.detail-pane').css('padding-left',$('.home-nav-list-content').width()+20);
                $(".detail-pane").show();
                $('#btn-note-save').removeAttr('disabled');
                $('#note-notice').hide();
                $('#note-editor-area').wysiwyg({activeToolbarClass: "active"});
                $('#note-title-field').focus();
            }
        });

        app.MyNotesAddController = Ember.Controller.extend({
            actions:{
                createNote:function(){
                    var self = this;
                    var title = $('#note-editor-title').val().trim();
                    if(title === '') { 
                        $('#note-notice').show();
                        return;
                    }
                    $('#btn-note-save').attr('disabled','disabled');
                    var body = $("#note-editor-area").cleanHtml(),
                        textBody = body;
                    
                    kotgNotesService.saveNote(title,body,textBody).then(function(response){
                        $('#note-notice').hide();
                        setTimeout(function(){
                            self.controllerFor('myNotes').loadNewlyAddNote();
                        }.bind(self),1500);
                        self.controllerFor('myNotes').set('isEditingNote', false);
                    }).fail(function(response){
                        console.log(response);
                    });
                },
                cancelAdd:function(){
                    $('#note-notice').hide();
                    this.transitionTo('myNote',sessionStorage.getItem('currentCacheItem'));
                    this.controllerFor('myNotes').set('isEditingNote', false);
                }
            },
            html_encode:function(str){  
              var s = "";  
              if (str.length == 0) return "";  
              s = str.replace(/&/g, "&ggt;");
              s = s.replace(/</g, "&lt;");
              s = s.replace(/>/g, "&gt;"); 
              s = s.replace(/ /g, "&nbsp;");
              s = s.replace(/\'/g, "&#39;");
              s = s.replace(/\"/g, "&quot;");
              s = s.replace(/\n/g, "<br>");
              return s;
            }
        });

        //app.LeftNavController = Ember.Controller.extend({
        //    init: function() {
        //        this._super();
        //    }
        //});

        Ember.Handlebars.helper('noteEllipsis', function(str, limit) {
            var domObj = $("<div>").html(str)

            domObj.find('style').empty().remove()
            var text = domObj.text(str).html();
            var result = text;
            if (text.length > limit)
                result = text.substring(0, limit) + '...'

            return new Handlebars.SafeString(result)
        });
    });