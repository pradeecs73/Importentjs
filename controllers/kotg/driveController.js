'use strict'

define(['app', 'text!templates/kotg/drive.hbs', 'text!templates/kotg/driveList.hbs', 'text!templates/kotg/driveGrid.hbs', 'services/kotg/kotgBoxService', "controllers/kotg/boxShareMixin", 'httpClient', 'underscore'],
    function (app, driveTemplate, driveListTemplate, driveGridTemplate, boxServices, KOTGBoxShareMixin, httpClient, _) {

		app.DriveController = Ember.Controller.extend(App.KOTGBoxShareMixin, {
		    // -------- //
            pageTitle: "All Files",
            _currentView: 'list-view',
            // queryParams: ['searchText', 'pageNumber', 'sortBy', 'sortOrder'],
            searchText: '',
            sortBy: 'name',
            sortOrder: 'asc',
            sortableFields:[
                {text:'Name', value:'name'},
                {text:'Date', value:'date'},
                {text:'Size', value:'size'}
            ],
            isGridView: function() {
                return this.get('_currentView') === 'grid-view';
            }.property("_currentView"),

            searchBoxText: function() {
                return this.get('searchText');
            }.property('searchText'),

		    // -------- //
		    actions:{
		        selectItem:function(id){
		            //跳转过去
		            console.log("select item", id);
		            this.set("currId", '');
		            this.set("sortBy", "name");
		            this.set("searchBoxText", '');
		            this.set("sortOrder", "asc");
		            this.transitionToRoute("drive", id);
		        },
		        loadList:function(id, type){
		        	this.loadList(id, type);
		        },
		        search:function(){
		        	this.search();
		        },
                updateSortBy: function(sortByField) {
                	console.log("set sortBy", sortByField);
                    this.set('sortBy', sortByField);
                    this.sort();
                },
		        toggleSortOrder: function(){
		        	if(this.sortOrder == 'asc') this.set('sortOrder', 'desc');
		        	else this.set('sortOrder', 'asc');
		        }
		    },
		    sortByOrder: function() {
		    	var self = this;
	    		var model = self.get("model");
	    		var tmpModel = [];
	        	for(var len=model.length, i=len-1; i>=0; i--) {tmpModel.push(model[i]);}
	    		self.set("model", tmpModel);
		    }.observes("sortOrder"),
	        loadList:function(id, type){
	            console.log("load list "+id+" "+type);

	            //判断是不是文件，如果是，就直接下载好了
	            if (type == "file"){
	                boxServices.downloadFileItem(id).done(function(result){
	                    if (result.status==200){
	                        $("#download-frame").attr("src",(result.link));
	                    } else if (result.status == 404){

	                    } else if (result.status == 401){
	                    	that.transitionToRoute('drives');
	                    }
	                }).fail(function(){
	                    //
	                });
	                return ;
	            }

	            //如果执行到这里说明不是搜索也不是下载，是有人点了文件夹，所以
	            var that = this;
	            that.set("sortOrder", "asc");

	            boxServices.listFolders(id,this.get("sortBy")).done(function(result){

	                that.set("pageTitle", result.name);
	                //是否是共享文件夹
	                that.set("model", result.entries);

	            }).fail(function(result){
	            	that.transitionToRoute('drives');
	            });
	        },
		    search: function() {
	            var that = this;
	            var keywords = this.get('searchBoxText');

	            console.log("search text", keywords);
	            that.set("sortOrder", "asc");
	            boxServices.search(keywords,this.get("sortBy")).done(function(result){

	                console.log("search done set model now",result.entries);
	                that.set("model", result.entries);
	            }).fail(function(result){
	                console.log("fail at drive controller", result);
	                if (result.statusCode==401){
	                	that.transitionToRoute('drives');
	                }
	            });
		    },
		    sort: function() {
	        	console.log("in sort", this);

	            var keywords = this.get("searchBoxText");
	            if (keywords && keywords.length>0){
	                this.search();
	            } else {
	                this.loadList(this.get("currId"),this.get("sortBy"));
	            }
		    }
		});

		app.DriveRoute = Ember.Route.extend({
		    beforeModel: function() {
		    },
		    model: function(params){
		        this.folderid = params.id;
		    },
            setupController: function(controller) {
                this._super(controller);
            },
		    actions:{
		        didTransition: function(){
		            //需要改为使用EmberLoading，这里是临时方法
		            //TODO NEED REMOVE
		            // if (sessionStorage.getItem("dviewload")){

	                var controller = this.get('controller');
	                controller.set("currId", this.folderid);
                    controller.loadList(this.folderid, "folder");
		        },
                _openShareModel: function(id, type, name) {
                	var self = this;
                    if ($('#shareCourse').length === 0) {
                    	boxServices.share(id, type, name).done(function(result) {
                    		self.controller.set("shared_link", result.shared_link);
	                        self.controller.openShareModel(self);
                    	}).fail(function() {
                    		console.log("share failed...");
                    	});
                    } else {
                    	boxServices.share(id, type, name).done(function(result) {
                    		self.controller.set("shared_link", result.shared_link);
	                        $('#shareCourse').modal('show');
                    	}).fail(function() {
                    		console.log("share failed...");
                    	});
                    }
		        }

		    },
		    renderTemplate:function(){
		        this.render('drive',{into: 'application'});
		    }
		});

		app.DriveView = Ember.View.extend({
	        template: Ember.Handlebars.compile(driveTemplate),
		    didInsertElement: function() {
		    },
            toggleView: function (viewType) {
                this.controller.set('_currentView', viewType);
            }
		});

        app.DriveListView = Ember.View.extend({
            template: Ember.Handlebars.compile(driveListTemplate),
            tagName: ''
        });

        app.DriveGridView = Ember.View.extend({
            template: Ember.Handlebars.compile(driveGridTemplate),
            tagName: ''
        });
	});
