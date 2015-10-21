'use strict';

define(['app', 'text!templates/leftNav.hbs', 'pages/leftnav', 'services/usersService', 'services/entitlementService', 'services/formallearning/courseService','services/admin/adminHelper','Q'],
    function (app, leftNavTemplate, leftNav, usersService, entitlementService, courseService,adminHelper,Q) {
        app.LeftNavView = Ember.View.extend({
            template: Ember.Handlebars.compile(leftNavTemplate),
            initializeLeftNav: function () {
                var self = this;
                this.controller.resetTabs();
                leftNav.initialize(self);
            },
            currentPathChanged: function() {
                Ember.run.scheduleOnce('afterRender', this.controller, 'resetTabs');
            }.observes("App.currentPathValue"),

          didInsertElement: function () {
            var self = this;
            var myTeamWithFiltersPromise = usersService.myTeamWithFilters('*', [], false, 1, false, "shortName", "asc");
            var getListOfPendingApprovalsPromise = courseService.getListOfPendingApprovals();
            var getAllowedPermissions = adminHelper.filterPermissions(adminHelper.adminPermissionModel);
            var hasViewPendingApprovalPermissionPromise=usersService.hasPermission("viewPendingApprovals");

            var controller = self.controller;
            myTeamWithFiltersPromise.then(function (results) {
                Ember.set(controller,'hasReportees', results.totalResults);
            });

            getListOfPendingApprovalsPromise.then(function (response) {
                Ember.set(controller,"pendingApprovalsCount", response.entity.length);
            });

            hasViewPendingApprovalPermissionPromise.then(function (response) {
                    if (response.length) {
                        Ember.set(controller,'viewPendingApprovals', true);
                    }
                });

            getAllowedPermissions.then(function (allowedPermissions) {
              Ember.set(controller, "isAdmin", adminHelper.isAdmin(allowedPermissions));
              Ember.set(controller, "showUserTab", adminHelper.showUserActions(allowedPermissions));
              Ember.set(controller, "showSystemTab", adminHelper.showSystemActions(allowedPermissions));
              Ember.set(controller, "showReportsTab", adminHelper.showReportsActions(allowedPermissions));
            });

            Q.allSettled([myTeamWithFiltersPromise, getListOfPendingApprovalsPromise ,getAllowedPermissions]).spread(function (res1, res2, res3) {
              Ember.run.scheduleOnce('afterRender', self, 'initializeLeftNav');
            });

          }
        });

        App.LeftNavController = Ember.ObjectController.extend({
            isAdmin: false,
            showUserTab:"",
            showSystemTab:"",
            showReportsTab:"",
            hasReportees: "",
            pendingApprovalsCount:"",
            viewPendingApprovals: false,
            loginuserid: app.getUsername(),
            loginshortname:app.getShortname(),

            components:[],
            componentsViewMapping: {"Home":"homeLeftNav", "FormalLearning":"formalLearning", "KC":"knowledgeCenter", "Collaboration":"collaboration", "People":"peopleLeftNav", "KOTG":"mobileFolder", "Manager":"manager", "Admin":"adminLeftNav"},

            nonToggleComponents:["Home","People","Manager","Admin"],

            routeMappings: {
                "dashboard.mylearnings" : "Home",
                "workspace" : "Home",
                "map" : "Home",
                "activity" : "Home",
                "people.contacts" : "People",
                "people.expertUsers" : "People"
            },

            init: function(){
                var self = this;
                _.each(_.keys(this.componentsViewMapping), function(component){
                    if(self.preferences[component]){
                        self.set('components', self.components.concat(self.componentsViewMapping[component]));
                    }
                    else if(self.nonToggleComponents.indexOf(component) >= 0){
                        self.set('components', self.components.concat(self.componentsViewMapping[component]));
                    }
                })
                Ember.set(self, "isVkmEnabled", self.preferences["VKM"]);
            },

            resetTabs: function() {
                leftNav.closeAllTabs();
                $("ul.nav.nav-list:has(ul.submenu li a.active)").addClass("open");
                $("ul.nav.nav-list:has(ul.submenu li a.active) button").attr('data-icon-after', 'caret-down');
            }
        });
    });
