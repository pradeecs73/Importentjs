'use strict'

define(['app', 'text!templates/newkotg/newkotgs.hbs', 'text!templates/newkotg/newkotgsList.hbs', 'text!templates/newkotg/newkotgsGrid.hbs', 'text!templates/newkotg/shareDialog.hbs', 'services/newkotg/newkotgService', "services/searchService", 'controllers/newkotg/newkotgsControllerMixin', "controllers/newkotg/newkotgsRouteMixin"],
    function (app, newkotgsTemplate, newkotgsListTemplate, newkotgsGridTemplate, shareTemplete, newkotgService, searchService) {

        app.NewkotgShareController = Ember.Controller.extend({
            shareId: null,
            isSharing: false,
            shareMessage: null,
            shareComment: null,
            actions: {
                share: function() {
                    var that = this,
                        shareId = that.get("shareId"),
                        shareComment = that.get("shareComment"),
                        users = $("#kotgSharesField").val();
                    that.set("shareMessage", null);
                    var sharedWith = (users) ? users.split(",") : [];
                    if (sharedWith.length === 0) {
                        that.set("shareMessage", "Please enter valid user name");
                    } else {
                        that.set("isSharing", true);
                        newkotgService.shareDocument(shareId, sharedWith, shareComment).done(function(obj) {
                            that.set("shareMessage", null);
                            that.get("_route").send("closeNewkotgShareModal");
                        }).fail(function(obj) {
                            that.set("shareMessage", "Share failed");
                        });
                    }
                }
            },
            init: function(route, id) {
                this.set("_route", route);
                this.set("shareId", id);
                this.set("isSharing", false);
                this.set("shareMessage", null);
                this.set("shareComment", null);
            },
            usersForAutoSuggest: function() {
                var exclusionList = [app.getUsername()];
                return this.usersAutoSuggest(exclusionList) ;
            }.property("shareId"),
            usersAutoSuggest: function (members) {
              if (_.isUndefined(members)) {
                members = [];
              }
              return {
                url: searchService.getSuggestUrl(),
                requestBody: [
                  {type: "user", fieldName: "shortName", excludes: {username: members}, resultSize: 50},
                ],
                filter: function (response) {
                  var users = _.pluck(response.users.results, "resource")
                  return _.map(users, function (user) {
                    return {value: user._id, text: user.shortName + " (" + user.username + ")"}
                  })
                },
                limit: 50
              }
            }
        });

        app.NewkotgShareView = Ember.View.extend({
            template: Ember.Handlebars.compile(shareTemplete),
            layoutName: "modal_layout",
            didInsertElement: function() {
            }
        });

		app.CollectionsController = Ember.Controller.extend(app.NEWKOTGsControllerMixin, {
            urlText: null,
            addCollectionError: null,
            isAddingCollection: false,
		    actions:{
                addCollection: function() {
                    var that = this,
                        urlText = that.get("urlText"),
                        isAsImage = that.get("isAsImage");
                    that.set("addCollectionError", null);
                    if(!that.validateURL(urlText)) {
                        that.set("addCollectionError", "Invalid input");
                        return;
                    }
                    that.set("isAddingCollection", true);
                    newkotgService.addWebDocument(urlText, isAsImage).done(function(response) {
                        that.set("urlText", null);
                        that.set("isAsImage", false);
                        that.set("addCollectionError", null);
                        that.set("isAddingCollection", false);
                        $("#kotgAddWebModal").modal("hide");
                        that.send("refreshModel");
                    }).fail(function() {
                        that.set("addCollectionError", "Add failed");
                        that.set("isAddingCollection", false);
                    });
		        }
		    },
            validateURL: function(url) {
                var regex = /(^(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$)|(^(https?:\/\/)(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$)/i;
                if(regex.test(url))
                    return true;
                else
                    return false;
            }
		});

		app.CollectionsRoute = Ember.Route.extend(app.NEWKOTGsRouteMixin, {
		    model: function(params){
                return {type: 'refresh'};
		    	// return newkotgService.search("favorite",0,10);
		    },
            setupController: function(controller, model) {
                this._super(controller);
                newkotgService.getUploadLimit().done(function(data) {
                    controller.set("fileSizeLimit", parseInt(data));
                }).fail(function() {
                    controller.set("fileSizeLimit", 10485760);
                });
                // controller.set("model", model);
                controller.set("pageTitle", "My Collections");
                controller.set("isCollections", true);
                controller.set("searchText", "");
                controller.reset();
                controller.search(true);
            },
		    renderTemplate:function(){
		        this.render('collections',{into: 'application'});
		    }
		});

		app.CollectionsView = Ember.View.extend({
	        template: Ember.Handlebars.compile(newkotgsTemplate),
		    didInsertElement: function() {
		    },
            toggleView: function (viewType) {
                this.controller.set('_currentView', viewType);
            },
            openAddWebModal: function() {
                var controller = this.controller;
                controller.set("urlText", null);
                controller.set("isAsImage", false);
                controller.set("addCollectionError", null);
            }
		});

        app.CollectionsListView = Ember.View.extend({
            template: Ember.Handlebars.compile(newkotgsListTemplate),
            tagName: ''
        });

        app.CollectionsGridView = Ember.View.extend({
            template: Ember.Handlebars.compile(newkotgsGridTemplate),
            tagName: ''
        });
	});
