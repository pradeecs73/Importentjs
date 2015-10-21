define(['app', 'text!templates/people/people.hbs'], function (app, peopleTemplate) {

  app.PeopleView = Ember.View.extend({
    template: Ember.Handlebars.compile(peopleTemplate)
  })
  app.PeopleIndexRoute = Ember.Route.extend({

    redirect: function () {
      this.transitionTo('contacts')

    }
  })

})