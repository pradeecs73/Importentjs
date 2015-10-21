define(['app', 'text!templates/search/usersSearchTemplate.hbs', 'pages/documentItems', 'emberPageble'],
  function (app, usersSearchTemplate, documentItems) {
    app.UsersSearchController = Ember.ObjectController.extend(App.SearchControllerMixin, app.PeoplePopoverControllerMixin, {
      init: function () {
        if (!Ember.TEMPLATES["usersSearch"]) {
          Ember.TEMPLATES["usersSearch"] = Ember.Handlebars.template(Ember.Handlebars.precompile(usersSearchTemplate));
        }
        this.setType("users");
        this.setSortByField("relevance");
        this.setSortOrder("asc");
      },

    getAllUsers: function() {
        var allUsers = [];
        _.each(this.get('model').results, function(aUser) {
            allUsers.pushObject(aUser.resource);
        })
        return allUsers;
    },

        userNameAttribute:"username",

      changeInUsers: function () {
        Ember.run.scheduleOnce('afterRender', this, '_changeInUsers');
      }.observes('model'),

      _changeInUsers: function() {
        documentItems.popoverContact()
      },
      sortableFieldsWithRelevance:[
        {text:'Name', value:'shortName'},
        {text:'Job Title', value:'jobTitle'},
        {text:'Location', value:'city'},
        {text:'Organization', value:'organization'},
        {text:'Relevance', value:'relevance'}
      ],
      defaultSecondarySortConfig: {
        sortBy : "shortName",
        sortOrder: "asc"
      }

    })
  });

