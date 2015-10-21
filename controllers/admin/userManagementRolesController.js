"use strict";

define(["app", "services/roleService"],
  function (app, roleService) {
    App.UserManagementRolesController = Ember.ArrayController.extend({

      filters: '',
      queryParams: ['pageNumber', 'sortOrder', 'sortField', 'filters'],

      sortableFields: [
        {text: 'Name', value: 'name'},
        {text: 'Date Created', value: 'createdOn'},
        {text: 'Date Modified', value: 'modifiedOn'},
        {text: 'Last Activated / Deactivated', value: 'statusChangedOn'}
      ],

      pageNumber: 1,
      sortOrder: "asc",
      sortField: "createdOn",

      model: {
        roles: []
      },

      actions: {
        filter: function (filters) {
          this.set('filters', filters.join(';'));
          this.set('pageNumber', 1)
        },
        gotoPage: function (pageValue) {
          this.set('pageNumber', pageValue)
        },

        updateSortBy: function (sortByField) {
          this.set('sortField', sortByField);
        },

        toggleSortOrder: function () {
          if (this.sortOrder == 'asc') this.set('sortOrder', 'desc');
          else this.set('sortOrder', 'asc');
        }
      }

    });
    return app;

  });