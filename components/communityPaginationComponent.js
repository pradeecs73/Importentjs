'use strict';

define(["app", "text!templates/components/communityPaginationComponent.hbs"], function(app, paginationComponentTemplate) {
    app.PaginationCommunityComponent = Ember.Component.extend({
        template: Ember.Handlebars.compile(paginationComponentTemplate),

        totalBlogPages: function() {
            return Math.ceil(this.get('totalBlogResults') / app.PageSize);
        }.property('totalBlogResults'),

        totalForumPages: function() {
            return Math.ceil(this.get('totalForumResults') / app.PageSize);
        }.property('totalForumResults'),

        totalWikiPages: function() {
            return Math.ceil(this.get('totalWikiResults') / app.PageSize);
        }.property('totalWikiResults'),

        hasBlogPages: function() {
            return this.get('totalBlogPages') > 1;
        }.property('totalBlogPages'),

        hasForumPages: function() {
            return this.get('totalForumPages') > 1;
        }.property('totalForumPages'),

        hasWikiPages: function() {
            return this.get('totalWikiPages') > 1;
        }.property('totalWikiPages'),

        invalidBlogPageNumber: function(pageNumber) {
            return pageNumber > this.get('totalBlogPages') || pageNumber < 1 || isNaN(pageNumber);
        },

        invalidForumPageNumber: function(pageNumber) {
            return pageNumber > this.get('totalForumPages') || pageNumber < 1 || isNaN(pageNumber);
        },

        invalidWikiPageNumber: function(pageNumber) {
            return pageNumber > this.get('totalWikiPages') || pageNumber < 1 || isNaN(pageNumber);
        },

        blogPageNumberValue: function() {
            if (this.invalidBlogPageNumber(this.get('blogPageNumber')))
                return 1;
            else
                return this.get('blogPageNumber');
        }.property('blogPageNumber'),

        forumPageNumberValue: function() {
            if (this.invalidForumPageNumber(this.get('forumPageNumber')))
                return 1;
            else
                return this.get('forumPageNumber');
        }.property('forumPageNumber'),

        wikiPageNumberValue: function() {
            if (this.invalidWikiPageNumber(this.get('wikiPageNumber')))
                return 1;
            else
                return this.get('wikiPageNumber');
        }.property('wikiPageNumber'),

        observeBlogPageNumber: function() {
            var pageNumber = this.get('blogPageNumber');
            if (this.invalidBlogPageNumber(pageNumber))
                this.sendAction('action', 1);
            else
                this.set('blogPageNumberValue', this.get('blogPageNumber'));
        }.observes('blogPageNumber'),

        observeForumPageNumber: function() {
            var pageNumber = this.get('forumPageNumber');
            if (this.invalidForumPageNumber(pageNumber))
                this.sendAction('action', 1);
            else
                this.set('forumPageNumberValue', this.get('forumPageNumber'));
        }.observes('forumPageNumber'),

        observeWikiPageNumber: function() {
            var pageNumber = this.get('wikiPageNumber');
            if (this.invalidWikiPageNumber(pageNumber))
                this.sendAction('action', 1);
            else
                this.set('wikiPageNumberValue', this.get('wikiPageNumber'));
        }.observes('wikiPageNumber'),

        disableBlogPrev: function() {
            return this.get('blogPageNumber') == 1;
        }.property('blogPageNumber'),

        disableForumPrev: function() {
            return this.get('forumPageNumber') == 1;
        }.property('forumPageNumber'),

        disableWikiPrev: function() {
            return this.get('wikiPageNumber') == 1;
        }.property('wikiPageNumber'),

        disableBlogNext: function() {
            return this.get('blogPageNumber') == this.get('totalBlogPages');
        }.property('blogPageNumber', 'totalBlogPages'),

        disableForumNext: function() {
            return this.get('forumPageNumber') == this.get('totalForumPages');
        }.property('forumPageNumber', 'totalForumPages'),

        disableWikiNext: function() {
            return this.get('wikiPageNumber') == this.get('totalWikiPages');
        }.property('wikiPageNumber', 'totalWikiPages'),



        actions: {
            prevPage: function() {

                if (this.get('blogPageNumber') && this.get('blogPageNumber') !== 1) {
                    this.sendAction('action', this.get('blogPageNumber') - 1)
                } else if (this.get('forumPageNumber') && this.get('forumPageNumber') !== 1) {
                    this.sendAction('action', this.get('forumPageNumber') - 1)
                } else if (this.get('wikiPageNumber') && this.get('wikiPageNumber') !== 1) {
                    this.sendAction('action', this.get('wikiPageNumber') - 1)
                }
                window.scrollTo(0, 0);
            },
            nextPage: function() {

                if (this.get('blogPageNumber') && this.get('blogPageNumber') !== this.get('totalBlogPages')) {
                    this.sendAction('action', this.get('blogPageNumber') + 1)
                } else if (this.get('forumPageNumber') && this.get('forumPageNumber') !== this.get('totalForumPages')) {
                    this.sendAction('action', this.get('forumPageNumber') + 1)
                } else if (this.get('wikiPageNumber') && this.get('wikiPageNumber') !== this.get('totalWikiPages')) {
                    this.sendAction('action', this.get('wikiPageNumber') + 1)
                }
                window.scrollTo(0, 0);
            },

            gotoBlogPage: function() {
                var pageValue = this.get('blogPageNumberValue')
                if (pageValue && pageValue <= this.get('totalBlogPages') && pageValue != this.get('blogPageNumber') && pageValue > 0)
                    this.sendAction('action', pageValue)
                else
                    this.set('blogPageNumberValue', this.get('blogPageNumber'))
                window.scrollTo(0, 0);
            },

            gotoForumPage: function() {
                var pageValue = this.get('forumPageNumberValue')
                if (pageValue && pageValue <= this.get('totalForumPages') && pageValue != this.get('forumPageNumber') && pageValue > 0)
                    this.sendAction('action', pageValue)
                else
                    this.set('forumPageNumberValue', this.get('forumPageNumber'))
                window.scrollTo(0, 0);
            },

            gotoWikiPage: function() {
                var pageValue = this.get('wikiPageNumberValue')
                if (pageValue && pageValue <= this.get('totalWikiPages') && pageValue != this.get('wikiPageNumber') && pageValue > 0)
                    this.sendAction('action', pageValue)
                else
                    this.set('wikiPageNumberValue', this.get('wikiPageNumber'))
                window.scrollTo(0, 0);
            }
        }
    });

});