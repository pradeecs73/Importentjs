define(["app", "text!templates/components/sortingComponent.hbs"], function (app, sortingComponentTemplate) {

  app.SortableFieldItemController = Ember.Controller.extend({

    sortedByCurrentField: function () {
      return (this.get('model.value') == this.get('parentController.sortBy'))
    }.property('parentController.sortBy'),
    idField: function(){
      return ("qa_automation_" + this.get('model.text'))
    }.property('model'),

    actions: {
      updateSortBy: function() {
        this.parentController.sendAction('updateSortByAction', this.get('model.value'))
      }
    }
  });

  app.SortingLinkComponent = Ember.Component.extend({
    layout: Ember.Handlebars.compile(sortingComponentTemplate),
    tagName: "",
    sortOrderIcon: function() {
      return "sort-" + this.sortOrder + "ending";
    }.property("sortOrder"),
    descendingSortOrder: function(){
      return this.sortOrder == "desc";
    }.property("sortOrder"),
    allowToggleSortOrder: function(){
      return this.sortBy != 'relevance';
    }.property("sortBy"),
    actions: {
      toggleSortOrder: function(){
        this.sendAction('toggleSortOrderAction');
      }
    }

  })
})
