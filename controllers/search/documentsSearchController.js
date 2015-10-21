define(['app', 'text!templates/search/documentsSearchTemplate.hbs', 'controllers/search/searchControllerMixin'],
  function (app, documentsSearchTemplate) {

    App.DocumentsSearchController = Ember.ObjectController.extend(App.SearchControllerMixin, {
      init: function () {
        if (!Ember.TEMPLATES["documentsSearch"]) {
          Ember.TEMPLATES["documentsSearch"] = Ember.Handlebars.template(Ember.Handlebars.precompile(documentsSearchTemplate));
        }
        this.setType("files");
        this.setSortByField("relevance");
        this.setSortOrder("asc");

      },
      sortableFields:[
        {text: 'Type', value: 'documentType'},
        {text:'Name', value:'title'},
        {text:'Size', value:'size'},
        {text:'Modified', value:'modifiedOn'},
        {text:'Uploaded', value:'uploadedOn'}
      ],
      defaultSecondarySortConfig: {
        sortBy : "uploadedOn",
        sortOrder: "desc"
      },
      appId: applicationIdConfig.contentstore
    });
  });