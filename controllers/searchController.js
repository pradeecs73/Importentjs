define(['app', 'underscore', 'text!templates/search.hbs', 'httpClient', 'services/searchService', 'services/kotg/kotgSearchService'],
  function(app, _, searchTemplate, httpClient, searchService, kotgSearchService) {
    app.SearchView = Ember.View.extend({
      template: Ember.Handlebars.compile(searchTemplate),
      allUsersAttribute: "users"
    });

    app.SearchRoute = Ember.Route.extend(App.DocumentsRouteMixin, {
      queryParams: {
        searchText: {
          refreshModel: true
        }
      },
      model: function(queryParameters) {
        var fieldsToExclude = {
              user: ["managerName","managerId"]
          }
        var self = this;
        return searchService.searchWithExcludedFields(queryParameters.searchText, [], [], [], app.PageSize, 1,fieldsToExclude).then(function(results) {
          if(self.preferences.KC)
            results.files.pageNumber = 1;
          if(self.preferences.Collaboration) {
            results.posts.pageNumber = 1;
            results.groups.pageNumber = 1;
          }
          results.users.pageNumber = 1;
          if(self.preferences.FormalLearning)
            results.courses.pageNumber = 1;
          return kotgSearchService(queryParameters.searchText).then(function(d){
            var len = d.result.length, m = [];
            for(var i = 0; i < len; i++){
              m[i] = {resource: d.result[i]};
            }
            results.otg = {"facets":{},"results":m,"totalResults":len, pageNumber: 1};
            return results;
          }).fail(function(){
            results.otg = {"facets":{},"results":[],"totalResults":0, pageNumber: 1};
            return results;
          });
        });
      }
    });

    app.SearchController = Ember.ObjectController.extend(app.PeoplePopoverControllerMixin, {
      queryParams: ['searchText'],
      searchText: "",
      userNameAttribute: "username",
        getAllUsers: function() {
            var allUsers = [];
            _.each(this.get('model').users.results, function(aUser) {
                allUsers.pushObject(aUser.resource);
            })
            return allUsers;
        }
    });
    return app;
  });
