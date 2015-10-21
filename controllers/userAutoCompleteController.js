'use strict';

define(['app', 'underscore', 'services/groupService', 'services/usersService'],
    function(app, _, groupService, usersService) {
        app.UserAutoCompleteView = Ember.View.extend({
            didInsertElement: function() {
                var element = $('#field')
                element.tagsinput({
                    itemText: 'text',
                    itemValue: 'value',
                    itemClass: function(item) {
                        return 'position-relative pull-left label label-info'
                    }
                })
                var existingMembers = this.get('existingMembers')
                element.tagsinput('input').typeahead({
                    minLength: 3,
                    valueKey: 'text',
                    remote: {
                        url: '/knowledgecenter/_search?%QUERY&excludes=existingMembers&fields=user:shortName,group:name',
                        filter: function(parsedResponse) {
                            var users = _.pluck(parsedResponse.users.results, 'resource')
                            var userSuggestions = _.map(users, function(user) {
                                return { value: user.username, text: user.shortName + " (" + user.username + ")" }
                            })
                            var groups = _.pluck(parsedResponse.groups.results, 'resource')
                            var groupSuggestions = _.map(groups, function(group) {
                                return { value: group._id, text: group.name }
                            })

                            return _.zip(userSuggestions, groupSuggestions)
                        }
                    }
                })
            },

            willDestroyElement: function() {

            }
        })

        app.UserAutoCompleteController = Ember.ObjectController.extend({
            existingMembers: [],
            search: function(query) {

            }
        })
    })
