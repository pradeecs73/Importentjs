define(['../../app', 'text!templates/people/peoplePopOver.hbs'],
    function (app, popOver) {

        App.PeoplePopOverView = Ember.View.extend({
            template: Ember.Handlebars.compile(popOver),
            tagName: ''
        });

    });

