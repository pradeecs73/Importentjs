'use strict';

define(['app',
  'text!templates/allCommunities.hbs', 'emberPageble'],
  function(app, allCommunitiesTemplate, emberPageble) {
    App.PaginatedAllGroupsView = VG.Views.Pagination.extend({
      numberOfPages: 1
    });
    app.CommunitiesAllView = Ember.View.extend({
      template: Ember.Handlebars.compile(allCommunitiesTemplate),
      toggleView: function(view) {
        this.controller.set('_currentView', view);
      },
      willClearRender: function() {
        this.controller.set('searchText', '')
        this.controller.set('searchBoxText', '')
      }
    });

  });

