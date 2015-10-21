'use strict'

define(['app', 'services/newkotg/newkotgService'],
    function (app, newkotgService) {

        App.NEWKOTGsControllerMixin = Ember.Mixin.create({
		    // -------- //
            _currentView: "list-view",
            limit: App.PageSize,
            pageNumber: 1,
            // queryParams: ["searchText", "pageNumber", "sortBy", "sortOrder"],
            searchText: '',
            sortBy: "id",
            sortOrder: "desc",
            sortableFields:[
                {text: "Date", value: "id"},
                {text: "Name", value: "title"},
                {text: "Type", value: "type"}
            ],
            isGridView: function() {
                return this.get("_currentView") === "grid-view";
            }.property("_currentView"),

		    actions:{
		        loadMore:function(){
		        	this.search();
		        },
		        search:function(){
		            this.reset();
		        	this.search(true);
		        },
                updateSortBy: function(sortByField) {
                	console.log("set sortBy", sortByField);
                    this.set("sortBy", sortByField);
                    this.sort();
                },
		        toggleSortOrder: function(){
		        	if(this.sortOrder == "asc") this.set("sortOrder", "desc");
		        	else this.set("sortOrder", "asc");
		        	this.sort();
		        },
                // Common Actions
		        star: function(documentId) {
                    var that = this,
                        model = that.get("model"),
                        copy = model.copy(true),
                        p;
                    $.each(copy, function(index, item) {
                        if(item.document.id === documentId) {
                            return p = item;
                        }
                    });
                    if(p.isStared) {
                        newkotgService.unBindTag(documentId, "starred").done(function() {
                            p.isStared = false;
                            that.set("model", copy);
                        }).fail(function() {
                        });
                    } else {
                        newkotgService.bindTag(documentId, "starred").done(function() {
                            p.isStared = true;
                            that.set("model", copy);
                        }).fail(function() {
                        });
                    }
		        },
                setDeleteId: function(id) {
                    this.set("__deleteId", id);
                },
                delete: function() {
                    var that = this,
                        documentId = that.get("__deleteId");
                    newkotgService.deleteOne(documentId).done(function() {
                        that.send("refreshModel");
                        // var model = that.get("model");
                        // var p = [];
                        // $.each(model, function(index, item) {
                        //     if(item.document.id !== documentId) {
                        //         p.push(item);
                        //     }
                        // });
                        // that.set("model", p);
                    }).fail(function(result) {
                        console.log("Delete document " + documentId + " failed.");
                    }).always(function() {
                        that.set("__deleteId", null);
                    });
                },
                batchDelete: function() {
                    var that = this,
                        selectedItems = that.get("model").filterBy("isChecked", true),
                        documentIdArray = selectedItems.getEach("document.id");
                    newkotgService.deleteBatch(documentIdArray).done(function() {
                        // Todo test
                        that.send("refreshModel");
                        // var model = that.get("model");
                        // var p = [];
                        // $.each(model, function(index, item) {
                        //     if(!documentIdArray.contains(item.document.id)) {
                        //         p.push(item);
                        //     }
                        // });
                        // that.set("model", p);
                    }).fail(function() {
                        // Todo show error message
                    });
                }
		    },
            /* toggles and allChecked function are worked for checkbox of items */
            isEmptyChecked: true,
            validateIsEmptyChecked: function() {
                var model = this.get("model");
                this.set("isEmptyChecked", !model.isAny("isChecked"));
            }.observes("model.@each.isChecked"),
            allChecked: function(key, value) {
                if (arguments.length === 1) {
                    var model = this.get('model');
                    return model && model.isEvery('isChecked');
                } else {
                    this.get('model').setEach('isChecked', value);
                    return value;
                }
            }.property('model.@each.isChecked'),
	        reset:function(){
	            this.set("sortBy", "id");
	            this.set("sortOrder", "desc");
	            this.set("pageNumber", 1);
	        },
	        sort: function() {
	        	this.set("pageNumber", 1);
	        	this.search(true);
	        },
	        search: function(resetModel) {
	        	var that = this;
	        	var	type = "favorite";
	        	if(that.get("isCollections")) {
	        		type = "favorite";
	        	} else if(that.get("isNotes")) {
	        		type = "note";
	        	} else if(that.get("isShareds")){
	        		type = "friend-share";
	        	}
                var limit = that.get("limit"),
                    offset = (that.get("pageNumber") - 1) * limit,
	        		isDescending = that.get("sortOrder") === "desc"?true:false,
	        		sortType = that.get("sortBy"),
	        		keywords = that.get("searchText");
	        	that.set("isLoading", true);
	        	newkotgService.search(type, offset, limit, sortType, isDescending, keywords).done(function(data) {
                    if(resetModel) that.set("model", []);
                    var result = data.result,
                        totalResults = data.totalCount;
	        		var model = that.get("model") || [], newModel = [];
                    for(var i=0,len=model.length; i<len; i++) {
                        newModel.push(model[i]);
                    }
	        		that.preprocessSearchResult(result);
	        		for(var i=0,len=result.length; i<len; i++) {
	        			newModel.push(result[i]);
	        		}
                    that.set("model", newModel);
                    that.set("totalResults", totalResults);
                    that.set("isLoading", false);
	        	}).fail(function(result) {
	        		console.log("Search document failed.");
                });
	        },
            gotoPage: function(pageValue) {
                this.set('pageNumber', pageValue);
                this.search(true);
            },
	        preprocessSearchResult: function(result) {
	        	/* 1. show star if it is stared
	        	 * 2. show preview image if its document has image
	        	 */
	        	var that = this;
	        	for(var i=0, len=result.length; i<len; i++) {
                    that.preprocessType(result[i]);
	        		that.preprocessStar(result[i]);
	        		that.preprocessPreviewImg(result[i]);
	        	}
	        },
            preprocessType: function(item) {
                var p = item.document;
                if(p.type === "Note") {
                    p.isNote = true;
                }
            },
	        preprocessStar: function(item) {
	        	var p = item.asset.tags;
	        	for(var i=0, len=p.length; i<len; i++) {
	        		if("starred" === p[i]) {
	        			item.isStared = true;
	        			break;
	        		}
	        	}
	        },
	        preprocessPreviewImg: function(item) {
                var that = this;
	        	var d = item.document;
                switch (d.type){
                    case "File":
                    	// Notice: use external tools "utils"
                        d.img = that.parseIcon(d.contentType);
                        d.hasImg = true;
                        break;
                    case "Image":
                        d.img = d.href;
                        d.hasImg = true;
                        break;
                    default :
                        if (d.attachments&&d.attachments.length>0){
                            d.img = d.attachments[0].href? d.attachments[0].href: d.attachments[0].url;
                            d.hasImg = true;
                        }else{
                            d.img = "";
                            d.hasImg = false;
                        }
                }
	        },
            parseIcon: function(filetype) {
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
            }
        });
	});
