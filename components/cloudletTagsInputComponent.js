'use strict';

define(['app', 'text!templates/components/bootstrapTagsInput.hbs'],
    function(app, tagsInputTemplate) {
        app.CloudletTagsInputComponent = Ember.Component.extend({
            layout: Ember.Handlebars.compile(tagsInputTemplate),
            didInsertElement: function() {
                var elementId = this.get('componentId');
                var source = this.get('source');
                var freeInputAllowed = this.get('freeInput');
                var preselectedValueBinding = this.get('value');
                if (freeInputAllowed == null)
                    freeInputAllowed = true;

                this.initialize(elementId, source, this, preselectedValueBinding, freeInputAllowed);
                this.bindAddRemoveEvents(elementId, this, freeInputAllowed);
            },

            isSuccessAlert: false,
            isFailureAlert: false,

            resetControl: function() {
                var element = $("#" + this.get('componentId'));
                element.tagsinput('removeAll')
                element.val("");
            }.observes("reset"),

            bindAddRemoveEvents: function(elementId, component, freeInputAllowed) {
                var element = $("#" + elementId);
                var disabled = false;
                //Item Added
                element.on('itemAdded', function(evt) {
                    if (disabled || evt.item == null)
                        return;
                    var item = evt.item;
                    var failure = function() {
                        component.set('isFailureAlert', true);
                        disabled = true;
                        element.tagsinput('remove', item);
                        disabled = false;
                    }
                    var success = function() {
                        component.set('isSuccessAlert', true);
                    }
                    element.tagsinput('input').typeahead('setQuery', '');
                    if (freeInputAllowed) {
                        component.sendAction('addItemAction', item, failure, success);
                    } else {
                        component.sendAction('addItemAction', item, failure, success);
                    }

                });
                //Item Removed
                element.on('itemRemoved', function(evt) {
                    if (disabled || evt.item == null)
                        return;

                    var item = evt.item;
                    var failure = function() {
                        component.set('isFailureAlert', true);
                        disabled = true;
                        element.tagsinput('add', item);
                        disabled = false;
                    }
                    var success = function() {
                        component.set('isSuccessAlert', true);
                    }
                    if (freeInputAllowed) {
                        component.sendAction('removeItemAction', item, failure, success);
                    } else {
                        component.sendAction('removeItemAction', item, failure, success);
                    }
                });

            },
            initialize: function(elementId, source, component, preSelectedValue) {
                var elt = $("#" + elementId);

                elt.tagsinput({
                    itemValue: '_id',
                    itemText: 'title'
                });

                var input = elt.tagsinput('input');

                input.typeahead({
                    valueKey: 'title',
                    local: source
                }).bind('typeahead:selected', $.proxy(function(obj, datum) {
                    this.tagsinput('add', datum);
                    this.tagsinput('input').typeahead('setQuery', '');
                }, elt));


                if (preSelectedValue) {
                    $.each(preSelectedValue, function(index, item) {
                        elt.tagsinput('add', item);
                    });
                }

                input.focus(function() {
                    component.set('isSuccessAlert', false);
                    component.set('isFailureAlert', false);
                });

                input.keydown(function() {
                    component.set('isSuccessAlert', false);
                    component.set('isFailureAlert', false);
                });
            }
        });
    });