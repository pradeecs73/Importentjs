'use strict'
define(['app', 'text!templates/playBooks.hbs'],
    function (app, playBooksTemplate) {

        app.PlayBooksRoute = Ember.Route.extend({

            renderTemplate: function () {
                this.render()                
            },

            model: function (queryParams) {
                return "";
            },
        });
        return app
    })
