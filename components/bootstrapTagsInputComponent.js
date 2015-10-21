'use strict';

define(['app', 'text!templates/components/bootstrapTagsInput.hbs', 'underscore','httpClient'],
    function(app, tagsInputTemplate, _,httpClient) {
        app.BootstrapTagsInputComponent = Ember.Component.extend({
            layout: Ember.Handlebars.compile(tagsInputTemplate),
            didInsertElement: function() {
                this.initialize();
                this.bindAddRemoveEvents();
            },

            defaultResultSize: 20,
            isSuccessAlert: false,
            isFailureAlert: false,

            resetControl: function() {
                var element = $("#" + this.get('componentId'));
                element.tagsinput('removeAll');
                element.val("");
            }.observes("reset"),

            tagsElement: function() {
                return $("#" + this.get('componentId'));
            }.property(),

            localSource: function() {
                return this.get('source') || [];
            }.property(),

            freeInputAllowed: function() {
                var self = this;
                if (self.get('freeInput') == null)
                    return true;
                return self.get('freeInput');
            }.property(),

            formatSource: function(source) {
                return _.map(source, function(element) {
                    if (element.value && element.text) {
                        return element;
                    }
                    return {
                        "value": element,
                        "text": element
                    }
                });
            },


            remoteSourceConfigChanged: function() {
                var self = this;

                self.get('tagsElement').tagsinput('destroy');
                self.initialize();
                self.sendAction('initialized');
            }.observes('remoteSourceConfig'),

            bindAddRemoveEvents: function() {
                var self = this;
                var disabled = false;
                //Item Added
                self.get('tagsElement').on('itemAdded', function(evt) {
                    if (disabled || evt.item == null)
                        return;
                    var item = evt.item;
                    var membersWithShortname = sessionStorage.getItem('membersDetailWithShortname');
                    if (membersWithShortname) {
                        var membersArray = JSON.parse(membersWithShortname);
                        if (membersArray.length != 0) {
                            if (item.text && item.value) {
                                try {
                                    var shortName = item.text.split('(')[0].trim();
                                    var idAndnameObject = {'id': item.value, 'shortName': shortName};
                                    membersArray.push(idAndnameObject);
                                    var stringifiedContainer = JSON.stringify(membersArray);
                                    sessionStorage.setItem('membersDetailWithShortname', stringifiedContainer);
                                } catch (err) {
                                    console.log("Error in segregating short name. " + err)
                                }
                            }

                        }

                    } else {
                        if (item.text && item.value) {
                            try {
                                var shortName = item.text.split('(')[0].trim();
                                var idAndnameContainer = [{'id': item.value, 'shortName': shortName}];
                                var stringifiedContainer = JSON.stringify(idAndnameContainer);
                                sessionStorage.setItem('membersDetailWithShortname', stringifiedContainer);
                            } catch (err) {
                                console.log("Error in segregating short name. " + err)
                            }
                        }
                    }
                    var isForceLowerCase = self.get('forceLowerCase') ? true : false;

                    if (isForceLowerCase) {
                        if (item != item.toLowerCase()) {
                            disabled = true;
                            self.get('tagsElement').tagsinput('remove', item);
                            item = item.toLowerCase();
                            self.get('tagsElement').tagsinput('add', item);
                            disabled = false;
                        }
                    }

                    var failure = function() {
                        self.set('isFailureAlert', true);
                        disabled = true;
                        self.get('tagsElement').tagsinput('remove', item);
                        disabled = false;
                    }
                    var success = function() {
                        self.set('isSuccessAlert', true);
                    }
                    self.get('tagsElement').tagsinput('input').typeahead('setQuery', '');
                    if (self.get('freeInputAllowed')) {
                        self.sendAction('addItemAction', item, failure, success);
                    }else if((self.controller.addItemAction)=="addProxy"){
                        self.sendAction('addItemAction', item, failure, success);
                    }
                     else {
                        self.sendAction('addItemAction', item.value, failure, success);
                    }

                });
                //Item Removed
                self.get('tagsElement').on('itemRemoved', function(evt) {
                    if (disabled || evt.item == null)
                        return;

                    var item = evt.item;
                    var failure = function() {
                        self.set('isFailureAlert', true);
                        disabled = true;
                        self.get('tagsElement').tagsinput('add', item);
                        disabled = false;
                    }
                    var success = function() {
                        self.set('isSuccessAlert', true);
                    }
                    if (self.get('freeInputAllowed')) {
                        self.sendAction('removeItemAction', item, failure, success);
                    } else {
                        self.sendAction('removeItemAction', item.value, failure, success);
                    }
                });

            },

            customizedRemoteConfig: function () {
                var remoteSourceConfig = this.get('remoteSourceConfig');
                remoteSourceConfig.beforeSend = httpClient.setRequestHeadersData

                remoteSourceConfig.replace = function (requestBody, encodedQuery) {
                    return _.map(requestBody, function (request) {
                        request['query'] = encodedQuery
                        return request;
                    })
                }

                return remoteSourceConfig;
            },

            initialize: function() {
                var self = this;
                var preSelectedValue = self.get('value');
                var minCharsForSearch = self.get('minCharsForSearch') || 3;
                if (!self.get('freeInputAllowed')) {
                    var mappedSource = self.formatSource(self.get('localSource'));
                    preSelectedValue = self.formatSource(self.get('value'));
                    self.get('tagsElement').tagsinput({
                        itemValue: 'value',
                        itemText: 'text',
                        tagClass: function(item) {
                            return 'position-relative pull-left label label-info'
                        }
                    });

                    var input = self.get('tagsElement').tagsinput('input');

                    // If the source of auto complete is locally fetched
                    if (_.isUndefined(self.get('remoteSourceConfig'))) {
                        var sortedSource = _.sortBy(mappedSource, function(obj) {
                            return obj.text.toLowerCase();
                        });
                        input.typeahead({
                            valueKey: 'text',
                            local: sortedSource,
                            limit: sortedSource.length
                        }).bind('typeahead:selected', $.proxy(function(obj, datum) {
                            this.tagsinput('add', datum);
                            this.tagsinput('input').typeahead('setQuery', '');
                        }, self.get('tagsElement')))
                    } else {
                        var limit = this.defaultResultSize;
                        if (!_.isUndefined(self.get('remoteSourceConfig').limit))
                            limit = self.get('remoteSourceConfig').limit;
                        // Option to configure the remote attribute inside the controller (or) simply pass a pre-configured object
                        // Required to handle scenarios like edit community where the suggestion box should not show any entries
                        // that are already members
                        input.typeahead({
                            minLength: minCharsForSearch,
                            valueKey: 'text',
                            remote: self.customizedRemoteConfig(),
                            limit: limit
                        }).bind('typeahead:selected', $.proxy(function(obj, datum) {
                            this.tagsinput('add', datum);
                            this.tagsinput('input').typeahead('setQuery', '');
                        }, self.get('tagsElement')))
                    }
                } else {
                    self.get('tagsElement').tagsinput({
                        freeInput: self.get('freeInputAllowed'),
                        tagClass: function(item) {
                            return 'position-relative pull-left label label-info'
                        }
                    });

                    var input = self.get('tagsElement').tagsinput('input');
                    var sortedSource = _.sortBy(self.get('localSource'), function(obj) {
                        return obj.toLowerCase();
                    });
                    input.typeahead({
                        valueKey: 'text',
                        local: sortedSource,
                        limit: sortedSource.length
                    }).bind('typeahead:selected', $.proxy(function(obj, datum) {
                        this.tagsinput('add', datum.text);
                        this.tagsinput('input').typeahead('setQuery', '');
                    }, self.get('tagsElement')));
                }


                if (preSelectedValue) {
                    $.each(preSelectedValue, function(index, item) {
                        self.get('tagsElement').tagsinput('add', item);
                    });
                }

                input.focus(function() {
                    self.set('isSuccessAlert', false);
                    self.set('isFailureAlert', false);
                });

                input.keydown(function() {
                    self.set('isSuccessAlert', false);
                    self.set('isFailureAlert', false);
                });
                // TODO: Need to move the below jquery statement to the controller
                $('#selfTaggedExpertise .twitter-typeahead input[type="text"].tt-query').attr('readonly', 'readonly');
                $('#selfTaggedExpertise .twitter-typeahead input[type="text"].tt-query').attr('disabled', 'disabled');
            }
        });
    });
