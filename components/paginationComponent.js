'use strict';

define(["app", "text!templates/components/paginationComponent.hbs"], function (app, paginationComponentTemplate) {
    app.PaginationLinkComponent = Ember.Component.extend({
        template: Ember.Handlebars.compile(paginationComponentTemplate),

        totalPages: function () {
            return Math.ceil(this.get('totalResults')/app.PageSize);
        }.property('totalResults'),

        hasPages: function(){
            return this.get('totalPages') > 1;
        }.property('totalPages'),

        invalidPageNumber: function(pageNumber) {
          return pageNumber > this.get('totalPages') || pageNumber < 1 || isNaN(pageNumber);
        },

        pageNumberValue: function(){
          if(this.invalidPageNumber(this.get('pageNumber')))
            return 1;
          else
            return this.get('pageNumber');
        }.property('pageNumber'),

        observePageNumber: function(){
          var pageNumber = this.get('pageNumber');
          if(this.invalidPageNumber(pageNumber))
            this.sendAction('action', 1);
          else
            this.set('pageNumberValue', this.get('pageNumber'));
        }.observes('pageNumber'),

        disablePrev: function () {
            return this.get('pageNumber') == 1;
        }.property('pageNumber'),

        disableNext: function () {
            return this.get('pageNumber') == this.get('totalPages');
        }.property('pageNumber', 'totalPages'),

        actions: {
            prevPage: function () {
                if (this.get('pageNumber') !== 1){
                    this.sendAction('action', this.get('pageNumber') - 1)
                }
               window.scrollTo(0, 0);
            },
            nextPage: function () {
                if (this.get('pageNumber') !== this.get('totalPages')){
                    this.sendAction('action', this.get('pageNumber') + 1)
                }
               window.scrollTo(0, 0);
            },
            gotoPage: function () {
                var pageValue = this.get('pageNumberValue')
                if(pageValue && pageValue <= this.get('totalPages') &&  pageValue != this.get('pageNumber') && pageValue > 0)
                    this.sendAction('action', pageValue)
                else
                   this.set('pageNumberValue', this.get('pageNumber'))
                window.scrollTo(0, 0);
            }
        }
    });

});