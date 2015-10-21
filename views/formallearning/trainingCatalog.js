"use strict";
define(["app", "httpClient", "Q", "pages/messageModelHide", "text!templates/formallearning/catalog.hbs", "pages/trainingCatalog", "emberPageble",
        "text!templates/formallearning/addToLearningPlanModel.hbs", "services/formallearning/learningPlanService"],
    function (app, httpClient, Q, messageModelHide, catalogTemplate, trainingCatalog, emberPageble, addToLearningPlanModelTemplate, learningPlanService) {

        App.CatalogView = Ember.View.extend({

            template: Ember.Handlebars.compile(catalogTemplate),
            toggleView: function (view) {
                Ember.set(this.controller, "showMessage", false);
                this.controller.set('_currentView', view);
            },
            didInsertElement: function () {
                trainingCatalog.visualSearch(this.controller.content.categoriesArray, this.controller.content.types, this.controller.content.locationsArray, this.controller.visualSearch, this);
                trainingCatalog.hideRegister();
                $(".chosen-select").chosen();
                messageModelHide.addHideMessageModelEvent("status-message-div");
                $("select.tc-dates-dis").prop('disabled', true);
                $(".chosen-select").chosen();
                Ember.run.scheduleOnce('afterRender', this.controller, 'fetchLearningPlan');
				Ember.run.scheduleOnce('afterRender', this.controller, 'fetchPerscribedPlansData');
                Ember.run.scheduleOnce('afterRender', this.controller, 'fetchUsers');
				Ember.run.scheduleOnce('afterRender', this.controller, 'fetchMyRole');
                Ember.run.scheduleOnce('afterRender', this.controller, 'hasAssignPLP');
                Ember.run.scheduleOnce('afterRender', this.controller, 'hasSelfAssignPLP');
            }

        });
        App.SubCategoryView = Ember.View.extend({
            click: function(evt) {
                if(evt.target.name) {
                    var liTag = evt.target.parentElement.parentElement;
                    var jqueryClass = '.' + evt.target.name + ' li';
                    $(jqueryClass).removeClass("active");
                    $("ul.collapsed-" + evt.target.name).find("li").each(function () {
                        $(this).removeClass("active");
                    });
                    liTag.setAttribute("class", "active")
                }
            }
        });
    });