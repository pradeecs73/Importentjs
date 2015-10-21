"use strict";

define(["app", "services/registrationsService", 'underscore'],
    function(app, registrationsService, _) {

        app.UserManagementRegistrationsController = Ember.ObjectController.extend({
            queryParams: ['searchTextValue', 'filters', 'pageNumber','sortBy', 'sortOrder'],
            searchTextValue:'',
            pageNumber:1,
            errorMessage: "",
            successMessage: "",
            sortBy: 'createdOn',
            sortOrder: 'desc',
            sortableFields:[
                {text:'First Name', value:'firstName'},
                {text:'Last Name', value:'lastName'},
                {text:'Created On', value:'createdOn'}
            ],

            registrationSearchValue: function() {
                return this.get('searchTextValue')
            }.property('searchTextValue'),
            sortedExpertise : function(){
                return _.sortBy(this.get('model').allRegistrations, function(registration){ return registration.username.toLowerCase()});
            }.property('model.allRegistrations.@each', 'model.allRegistrations.@each.username'),
            actions: {
                searchByUsername: function() {
                    var self=this;
                    self.set("searchTextValue",self.get('registrationSearchValue'));
                },
                gotoPage: function(pageValue){
                    this.set('pageNumber', pageValue)
                },
                updateSortBy: function(sortByField) {
                    this.set('sortBy', sortByField);
                },
                toggleSortOrder: function(){
                    if(this.sortOrder == 'asc') {
                        this.set('sortOrder', 'desc');
                    }
                    else {
                        this.set('sortOrder', 'asc');
                    }
                }

            }
        });

        return app;
    });
