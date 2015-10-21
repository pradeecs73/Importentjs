
'use strict'

define(['app', 'text!templates/organization/myTeam.hbs', 'pages/peoplePage', 'httpClient', 'services/usersService', 'services/formallearning/learningPlanService', 'underscore', 'services/searchService', 'services/webExService', 'services/configurationsService'],
    function (app, myTeamTemplate, peoplePageJs, httpClient, usersService, learningPlanService, _, searchService, webExService, configurationsService) {

        app.MyTeamView = Ember.View.extend({
            template: Ember.Handlebars.compile(myTeamTemplate),
            didInsertElement: function () {
                var controller = this.controller,
					serachFilter = {
						"jobrole": '',
						"skill": '',
						"searchtext": ''
					};
                if(controller.get("preferences")["FormalLearning"]) {
                    learningPlanService.fetchPrescribedLearningPlan(serachFilter).then(function (availablePLP) {
                        controller.set("isAPICalled", true);
                        if (availablePLP && availablePLP.length > 0) {
                            controller.set("numPLP", availablePLP.length);
                            availablePLP.forEach(function (plp) {
                                plp.isSelected = false;
                            });
                        }
                        controller.set("plpList", availablePLP);
                        localStorage.setItem("plpList", JSON.stringify(availablePLP));
                        Ember.run.scheduleOnce('afterRender', this, 'renderFavoritePlugin');
                    });
                }
            },

           willClearRender: function() {
             this.controller.set('searchText','');
             this.controller.set('managersearchBoxText','');
           },

            renderFavoritePlugin: function () {
                var self = this;
                if (window.favorite) favorite.render();
                if (window.activityStream) {
                    //Subscribing to Cloudlet Activity event published by cloudlet plugin
                    self.$().on("cloudlet:activity", function (e, activity) {
                        self.onCloudletActivity(activity);
                    });
                }
            },

            onCloudletActivity: function (activityType) {
                var model = this.controller.get('model');
                var usersList = model.allUsers;
                var user = _.findWhere(usersList, {email: activityType.entityId });
                if (user) {
                    var streamDataContract = null;
                    streamDataContract = new activityStream.StreamDataContract(activityType.entityId, 'USER');
                    streamDataContract.title = user.shortName;
                    streamDataContract.resourceUrl = "/#/user/" + activityType.entityId;
                    streamDataContract.authorUserName = activityType.entityId;
                    streamDataContract.verb = 'follow';
                    activityStream.pushToStream(streamDataContract);
                }
            },
            
            toggleView: function (view) {
                this.controller.set('_currentView', view);
            }
        })

        return app
    })
