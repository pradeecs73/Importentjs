'use strict';

define(['app', 'text!templates/myTeam.hbs'],
    function (app, myTeamTemplate) {
        app.MyTeamView = Ember.View.extend({
            template: Ember.Handlebars.compile(myTeamTemplate)
        });

        //app.LeftNavController = Ember.Controller.extend({
        //    init: function () {
        //        this._super();
        //    }
        //})
    });
