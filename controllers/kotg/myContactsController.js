'use strict';
define(['app', 'text!templates/kotg/myContacts.hbs', 'text!templates/kotg/myContactItem.hbs', 'services/kotg/kotgLoginService', 'services/usersService', 'Q', 'underscore', 'httpClient'],
  function(app, myContactsTemplate, myContactItem, kotgLoginService, usersService, Q, _, httpClient) {
    app.ContactItemComponent = Ember.Component.extend({
      template: Ember.Handlebars.compile(myContactItem),
      tagName: 'div',
      didRendered: function() { 
        this.assignDragDrop();
      }.on('didInsertElement'),
      assignDragDrop: function() {
        /******* Draggable code ********/
        $("#product .memberdiv").draggable({
          revert: true,
          drag: function() {
            $(this).addClass("active");
            $(this).closest("#product").addClass("active");
          },
          stop: function() {
            $(this).removeClass("active").closest("#product").removeClass("active");
          }
        });
        /******* Draggable code ********/
      },
      removeContact: function(id) {
        this.sendAction('action', id); 
      }
    }); 

    app.MyContactsController = Ember.Controller.extend({
      init: function() {
        this._super();
      },
      getAllUsers: function() {
        var deferred = Q.defer();
        var userAndGroupdata = [];
        usersService.allUsers().then(function(users) {
          _.each(users, function(user) {
            userAndGroupdata.push({
              "id": user.username,
              "name": user.shortName
            });
          });
          deferred.resolve(userAndGroupdata);
        });
        return deferred.promise;
      },
      actions: {
        removeContact: function(id) {
          this.get("model").selectedUsers.removeObject(id);
        }
      }
    });

    app.MyContactsRoute = Ember.Route.extend({
      model: function(params) {
        var self = this;
        var model = {
          users: [],
          selectedUsers: []
        };
        return this.controllerFor("myContacts").getAllUsers().then(function(users) {
          model.selectedUsers = [];
          model.users = users;
          return model;
        });
      }
    });

    app.MyContactsView = Ember.View.extend({
      template: Ember.Handlebars.compile(myContactsTemplate),
      didInsertElement: function() {
        Ember.run.scheduleOnce('afterRender', this, this.didRenderElement);
      },
      didRenderElement: function() {
        var self = this;
        $("#nav-search-input").typeahead({
          valueKey: 'name',
          local: self.controller.get("model").users
        }).bind('typeahead:selected', function(obj, datum) {
          if (_.findWhere(self.controller.get("model").selectedUsers, datum) == null) {
            self.controller.get("model").selectedUsers.pushObject(datum);
          }
          $("#nav-search-input").typeahead('setQuery', '');
        });


        var count = 0;
        $(".basket").droppable({
          activeClass: "active",
          hoverClass: "hover",
          tolerance: "touch",
          drop: function(event, ui) {
            var basket = $(this),
              move = ui.draggable,
              itemId = basket.find("ul li[data-id='" + move.attr("data-id") + "']");

            if (itemId.html() != null) {
              itemId.find("input").val(parseInt(itemId.find("input").val()) + 1);
            } else {
              addBasket(basket, move);
              count = parseInt(count) + 1;
              $('.count').html(count);
            }
          }
        });

        function addBasket(basket, move) {
          basket.find("ul").append('<li data-id="' + move.attr("data-id") + '">' + '<span>' + move.find("span").html() + '</span>' + '<button class="delete">&#10005;</button>');
        }
      },
      willDestroy: function() {
        $("#nav-search-input").typeahead('destroy');
      }
    });

    //app.LeftNavController = Ember.Controller.extend({
    //  init: function() {
    //    this._super();
    //  }
    //})
  });