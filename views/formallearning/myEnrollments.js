"use strict";
define(["app", "httpClient", "Q", "text!templates/formallearning/enrollments.hbs", "pages/trainingCatalog", 'emberPageble', "pages/messageModelHide"],
    function (app, httpClient, Q, enrollmentsTemplate, trainingCatalog, emberPageble, messageModelHide) {
        App.PaginationView = VG.Views.Pagination.extend({
            numberOfPages: 1
        });

        App.TableHeaderView = VG.Views.TableHeader.extend({
            template: Ember.Handlebars.compile('{{#if view.isCurrent}}<i {{bindAttr class="view.isAscending:icon-sort-up view.isDescending:icon-sort-down"}}></i>{{/if}}{{view.text}}')
        });

        Ember.RadioButton = Ember.View.extend({
            tagName: "input",
            type: "radio",
            attributeBindings: ["name", "type", "value", "checked:checked:"],
            click: function () {
                this.set("selection", this.$().val())
            },
            checked: function () {
                return this.get("value") == this.get("selection");
            }.property(),
            updateValue: function () {
                if (this.get('selection') == this.$().val()) {
                    return this.set('checked', true);
                }
                return this.set('checked', false);
            }.observes('selection')
        });

        App.MyEnrollmentView = Ember.View.extend({

            template: Ember.Handlebars.compile(enrollmentsTemplate),
            toggleView: function (view) {
                this.controller.set('_currentView', view);
                this.controller.get("courses").propertyWillChange("data");
                var courses = this.controller.get('courses.data');
                _.each(courses, function (course, key) {
                    if (view == 'list-view')
                        course.isGridView = false;
                    else
                        course.isGridView = true;
                });
                this.controller.set('courses.data', courses);
                this.controller.get("courses").propertyDidChange("data");
            },
            didInsertElement: function () {
                var self = this;
                //Search combo invoke
                $(".chosen-select").chosen();
                var model = self.controller.get('model')
                if (model.successStatus) {
                    jQuery("#successMessageDiv").removeClass('hide');
                    model.successStatus = false;
                }
                messageModelHide.addHideMessageModelEvent("status-message-div");
            }
        });
    });