'use strict'

define(['app', 'services/newkotg/newkotgService'],
    function (app, newkotgService) {

        App.NEWKOTGsRouteMixin = Ember.Mixin.create({
            beforeModel: function() {
                return newkotgService.fetchAllTags();
            },
            actions:{
                didTransition: function() {
                    this.renderTemplate();
                },
                openNewkotgShareModal: function (id) {
                    var controller = this.controllerFor('newkotgShare');
                    controller.init(this, id);
                    this.render("newkotgShare", {
                        into: 'application',
                        outlet: 'modal',
                        controller: controller
                    });
                },
                closeNewkotgShareModal: function() {
                    this.disconnectOutlet({
                        outlet: 'modal',
                        parentView: 'application'
                    });
                },
                refreshModel: function() {
                    var that = this;
                    setTimeout(function() {
                        that.refresh();
                    }, 1000);
                }
            }
        });
    });
