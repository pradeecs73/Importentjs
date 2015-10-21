"use strict";

define(["app", "httpClient", "Q", 'emberPageble', "landing_demo"],
    function (app, httpClient, Q, emberPageble,landingDemo) {
        App.MapRoute = Ember.Route.extend({
            setupControllers: function (controller, model) {
                debugger;
                console.log(model);
            },
            model: function () {
                var controller = this.get("controller");
                var dropdown = [
                {"name": "Endorsed Topics",
                  "value": "myendorseMap"
                },
                {"name": "Activity Topics",
                "value": "myMap"
                },
                {"name": "Job Role Topics",
                  "value": "jobRoleMap"
                },
                {"name": "Organization Topics",
                 "value": "orgMap"
                }
                ];
                return Q.all([
                   landing_demo.populateOrg(),
                landing_demo.populateLocation(),
                landing_demo.populateJobtitle(),
                ]).spread(function (organizations, locations, jobtitles) {
                    model = Ember.Object.create({
                        "organizations": organizations,
                        "locations": locations,
                        'jobtitles': jobtitles
                        
                    });
                    //controller.set('dropdown', dropdown);

                    
                }, function (error) {
                    return model;
                });
            }

        });

    });