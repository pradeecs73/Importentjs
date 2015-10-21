define(['app', 'pages/documentItems'],
  function(app, documentsItems) {
    app.DocumentItemController = Ember.ObjectController.extend({
      views: {
        "list-view": { "descriptionLength": 400, "titleLength": 100},
        "large-grid-view": { "descriptionLength": 500, "titleLength": 50},
        "grid-view": { "descriptionLength": 150, "titleLength": 45}
      },

      actions: {
        toggleTile: function(documentId) {
          documentsItems.toggleTile(documentId);
        }
      },

      isPublic: function() {
        var scope = this.get('model.meta.scope');
        return scope === 'public';
      }.property(),

      appId: applicationIdConfig.contentstore,

      postType: function() {
        var type = this.get('model.resource.type')
        if (type === 'BLOG')
          return 'BLOG'
        else if (type === 'FORUM')
          return 'QUES'
        else
          return ''
      }.property(),

      toValidId: function() {
        var nonCompliantId = this.get('model.resource.id');
        return nonCompliantId.replace(/["@", "."]/gi, "-");
      }.property(),

      blogReadUrl: function() {
        var model = this.get('model');
        var postId = model.resource.id;

        if (model.resource.type === 'BLOG') {
          return '#/blog/' + postId;
            } else {
          return '#/question/' + postId;
        }
      }.property(),

      postSummary: function() {
        var content = this.get('model.resource.content');
        var currentView = this.get("parentController").get("_currentView");
        var descriptionLength = this.views[currentView].descriptionLength;
        return this.shorten(content, descriptionLength);
      }.property('parentController._currentView'),

      derivedDescription: function() {
        // Pramod: highlights functionality is not being used currently; have removed usages of highlights
        var highlight = this.get('model.highlights');
        var parentController = this.get("parentController");
        var currentView = parentController.get("_currentView");
        var descriptionLength = this.views[currentView].descriptionLength;
          var snippet = "";
          if (this.get('model.meta.content')) {
            snippet = $("<div>").html(this.get('model.meta.content')).text();
          }
          return this.shorten(snippet, descriptionLength);
      }.property('parentController._currentView'),

      highlightedContent: function() {
        var highlights = this.get('model.highlights');
        var priorityOrder = ["title", "description", "uri", "userTags", "createdBy"];
        var fieldToDisplayNames = {
          "title" : "title",
          "description" : "description",
          "uri" : "content",
          "userTags" : "tags",
          "createdBy" : "created by"
        }
        var highlightedContent = "";
        _.each(priorityOrder, function(field) {
          if(highlights[field]) {
            highlightedContent += fieldToDisplayNames[field] + ": "+ highlights[field].join("...") + "</br>";
          }
        });
        return highlightedContent;
      }.property(),

      documentTitle: function() {
        var title = this.get('model.resource.title');
        var parentController = this.get("parentController");
        var currentView = parentController.get("_currentView");
        var titleLength = this.views[currentView].titleLength;
        if (title && (title.length > titleLength)) {
          var shortenedTitle = this.shorten(title, titleLength);
          shortenedTitle = shortenedTitle + "...";
          return shortenedTitle;
        }
        return title;
      }.property('parentController._currentView'),

      shorten: function(string, descriptionLength) {
        if (string) {
            var contentLength = string.length;
            var length = contentLength < descriptionLength ? contentLength : descriptionLength;
            return string.substring(0, length);
        }
        return string;
      },

      isPublicGroup: function() {
        var type = this.get('model').resource.type;
        return type == "public";
      }.property('model.resource'),

      isGridView: function() {
        return this.get('parentController').get('_currentView') == 'grid-view';
      }.property('parentController._currentView'),

      kotgUrl: function(){
        var model = this.get('model');
        var assetId = model.resource.document.id;
        if(model.resource.asset.tags.indexOf('friend-share') > -1){
          return '#/sharedItems/' + assetId;
        }else if(model.resource.document.type === 'Note'){
          return '#/notes/' + assetId;
        }else{
          return '#/collections/' + assetId;
        }
      }.property()
    });
  });
