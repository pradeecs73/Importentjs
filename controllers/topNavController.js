'use strict';

define(['app', 'text!templates/topNav.hbs', 'text!templates/termsAndConditionModal.hbs', "pages/topNav", 'httpClient', 'jabberService', 'services/entitlementService', "services/usersService", "services/tenantService"],
    function (app, topNavTemplate, termsAndConditionModalTemplate, topNav, httpClient, jabberService, entitlementService, usersService, tenantService) {

        App.TopNavView = Ember.View.extend({
            template: Ember.Handlebars.compile(topNavTemplate),
            willInsertElement: function(){
               var self = this;
                entitlementService.isAdmin().then(function(decision){
                    self.controller.set('isAdmin',decision);
                })
            },

            didInsertElement: function () {
                topNav.initialize();
				Ember.run.scheduleOnce('afterRender', this.controller, 'fetchMyRole');
            }
        });

        app.TermsAndConditionView = Ember.View.extend({
            template: Ember.Handlebars.compile(termsAndConditionModalTemplate)
        });

        App.TopNavController = Ember.Controller.extend({
            needs: ["search"],
            isAdmin: false,
            jabberData: jabberService.model,
            shortName:  app.getShortname(),
            username:  app.getUsername(),
            refreshJabberLogin: false,
            init: function () {
                var self = this;

                tenantService.getTenantInfo().then(function(tenantInfo){
                    self.set("isMyAccountEnabled", (tenantInfo.JabberInfo.JabberEnabled || tenantInfo.WebexInfo.WebexEnabled) || false);
                });
            },

            validQuery: function (query) {
                var wildCardRegex = /\*+/g;
                var spaceRegex = /\s+/g;

                return query && query.replace(wildCardRegex,"").replace(spaceRegex,"").replace(/^\"/g,"").replace(/\"$/g,"").length > 1;
            },

            sanitize: function (query) {
                query = query.trim()
                var precedingWildcardRegex = /^\*+/;
                var wildcardRegex = /\*+/g;
                query = query.replace(precedingWildcardRegex,'')
                return query.replace(wildcardRegex,'*')
            },

            updateSearchQuery: function (query) {
                $("#top-nav-search-box").val(query);
            },
			fetchMyRole: function(){
				var self = this;
				 return usersService.myProfile().then(function(response){
					var roles = response.roles;
					for(var i=0; i < roles.length;i++){
						if (["SystemAdmin", "CatalogAdmin"].indexOf(roles[i]) > -1) {
							self.set("isProxyManager", true);
							break;
						}
					}
					return true;
				},function(error){
					console.log("Error while retrieving user details");
				})
			},
            actions: {
                search: function () {
                    var searchText = $("#top-nav-search-box").val();
                    var sanitizedSearchText = this.sanitize(searchText);
                    var isValidQuery = this.validQuery(sanitizedSearchText);
                    if (isValidQuery) {
                        this.updateSearchQuery(sanitizedSearchText)
                        var params = {queryParams: {searchText: sanitizedSearchText}}
                        this.transitionToRoute("search", params);
                        $("#searchError").hide()
                    } else {
                        $("#searchError").show().css({top: '30px'});
                        $("#searchError").fadeOut(10000);
                    }
                },
                clearErrors: function() {
                    var searchText = $("#top-nav-search-box").val();
                    var sanitizedSearchText = this.sanitize(searchText);
                    var isValidQuery = this.validQuery(sanitizedSearchText);
                    if (isValidQuery) {
                        $("#searchError").fadeOut(50);
                    }
                },
                logout: function () {
                    //Log an activity for logout
                    var loginshortname=app.getShortname();
                    var userId=app.getUserLoginId();
                    var resourceUrl = "/#/user/" + userId;

                    if (window.activityStream) {
                        var streamDataContract = new activityStream.StreamDataContract(userId,'USER', 'logout');
                        streamDataContract.title = loginshortname;
                        streamDataContract.resourceUrl = resourceUrl;
                        streamDataContract.authorUserName = userId;

                        streamDataContract.displayMessage = loginshortname+" has logged out";
                        try {
                        activityStream.pushToStream(streamDataContract);
                        }
                        catch (err) {
                        console.log(err);
                        }
                     }

                    //clear kotg account token
                    localStorage.removeItem("account_token");
                    localStorage.removeItem("box_token");
                    localStorage.removeItem("box_reftoken");
                    sessionStorage.clear();
                    window.location = "/knowledgecenter/logout";
                    $.removeCookie("jabberStatus");
                    // Remove all the cookies.. all of 'em.
                    $.removeCookie(app.getShortname() + "-loggedInAtleastOnceCookieName");
                }
            }
        });
    });
