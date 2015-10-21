'use strict';

define(['app', 'text!templates/kotg/sharedItems.hbs', 'services/kotg/kotgLoginService', "services/kotg/kotgShareService", "controllers/kotg/shareMixin", "services/kotg/kotgTagService", "underscore"],
    function(app, sharedItemsTemplate, kotgLoginService, kotgShareService, KOTGShareMixin, taggingService, _) {
        app.SharedItemsController = Ember.Controller.extend(App.KOTGShareMixin, {
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
                            kotgShareService.deleteShared(sessionStorage.getItem("selectedItem")).done(function() {
                                setTimeout(function() {self.search();}, 1000);
                            });
                    //     }
                    // });
                }
            },
            search: function() {
                var self = this;
                sessionStorage.setItem("selectedItem", "");
                self.set('offset',0);
                self.set('model',{});
                $('.loading-more-text').hide();
                self.loadCollections();
            },
            addOwner: function(item) {
                if(item.asset.sources.length<1) return item;
                var users = sessionStorage.getItem("sharedOwners");
                if(!users) return item;
                users = JSON.parse(users);
                for(var i=0, len=users.length; i<len; i++) {
                    if(users[i].account.id == item.asset.sources[0].accountId) {
                        item.owner = users[i].account;
                        break;
                    }
                }
                return item;
            },
            loadNewlyAddCollection:function(num){
                var self = this;
                var query = self.get("keywords");
                var sortType, order;
                sortType = self.get('sortType');
                order = self.get('isDescending');
                // return kotgLoginService.moodleAuth(app.getUsername()).then(function() {
                    // fetchCollections arguments: tag, offset, limit, sortType, order, keywords
                    return kotgShareService.fetchShares('friend-share',0,num?num:1,sortType,order,query).then(function(collections) {
                        $('#addCollectionCloseBtn').click();
                        if(self.controllerFor('application').get("currentPath").indexOf('sharedItems') < 0) return;
                        self.set('offset',parseInt(self.get('offset'))+collections.result.length);
                                         
                        var sharedItemId = undefined;
                        _.each(collections.result, function(result) {
                            $("#frame-load-div").show();
                            if (result.document) {
                                if (!sharedItemId) {
                                    if (sessionStorage.getItem("selectedItem") != "") {
                                        sessionStorage.setItem("currentCacheItem", sessionStorage.getItem("selectedItem"));
                                        sharedItemId = sessionStorage.getItem("selectedItem");
                                    } else {
                                        sharedItemId = result.document.id;
                                        sessionStorage.setItem("currentCacheItem", sharedItemId);
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
                        var p = collections.result;
                        var x = [];
                        for(var i=0, len=p.length; i<len; i++) {
                            x.push(self.addOwner(p[i]));
                        }
                        newModel.collections = collections.result.concat(x);
                        self.set('model',newModel);

                        sessionStorage.setItem("currentCacheItem", sharedItemId);
                        self.transitionTo("sharedItem", sharedItemId);
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
                    kotgShareService.fetchShareds('friend-share',offset,11, sortType, order, query).then(function(collections) {
                        if(query != self.get("keywords")) {
                            return;
                        } else {
                            if(offset != self.get("offset")) {return;}
                        }
                        //if(self.controllerFor('application').get("currentPath").indexOf('sharedItems') < 0) return;
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
                        var sharedItemId = undefined;
                        _.each(results, function(result) {
                            $("#frame-load-div").show();
                            if (result.document) {
                                if (!sharedItemId) {
                                    if (sessionStorage.getItem("selectedItem") && sessionStorage.getItem("selectedItem") != "") {
                                        sessionStorage.setItem("currentCacheItem", sessionStorage.getItem("selectedItem"));
                                        sharedItemId = sessionStorage.getItem("selectedItem");
                                    } else {
                                        sharedItemId = result.document.id;
                                        sessionStorage.setItem("selectedItem", sharedItemId);
                                        sessionStorage.setItem("currentCacheItem", sharedItemId);
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
                        var p = collections.result;
                        var x = [];
                        for(var i=0, len=p.length; i<len; i++) {
                            x.push(self.addOwner(p[i]));
                        }
                        newModel.collections = newModel.collections.concat(x);
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
                        if (sharedItemId) {
                            var sharedItem = JSON.parse(sessionStorage.getItem(sharedItemId));
                            //Ember.set(self.controllerFor('sharedItem'), "url", "/kotg/kotg_details.html?" + Math.floor((Math.random() * 100) + 1));
                            self.transitionTo("sharedItem", sharedItemId);
                           
                        }
                        if(self.get('model').collections.length === 0){
                            $(".details-area").children().not('[class="details-nav"]').hide();
                            // self.set("shortenedCurrentLink", '');
                            // self.transitionTo("sharedItems");
                        } else {
                            $(".details-area").children().show();
                        }


                        return sharedItemId;
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

        app.SharedItemsView = Ember.View.extend({
            template: Ember.Handlebars.compile(sharedItemsTemplate),

            didInsertElement: function() {
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

        app.SharedItemsRoute = Ember.Route.extend({
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
            },
            model: function(params) {
                // sessionStorage.setItem("selectedItem", "");
                taggingService.fetchAllTags();
                return kotgShareService.getAllContact();
            },
            afterModel: function(users) {
                sessionStorage.setItem("sharedOwners", JSON.stringify(users.response));
                Ember.run.next(this, function() {
                  Ember.set(this.controllerFor('application'), "currentPath", "sharedItems.index");
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
                willTransition: function(transition) {
                    // if (transition.targetName === 'sharedItems.index') {
                    //     this.controller.set("searchText", "");
                    //     sessionStorage.setItem("selectedItem", "");
                    // }
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