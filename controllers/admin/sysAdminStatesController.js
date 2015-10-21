"use strict";

define(["app", "text!templates/admin/sysAdminStates.hbs", "services/sysAdminService", "objects/staticStateGraph"],
    function (app, statesTemplate, sysAdminService, g) {
        var COLORS = {
            NONE: "#C0C0C0",
            SUCCESS: "#006633",
            FAILURE: "#FF0000",
            IN_PROGRESS: "#FF9933"
        };

        app.SysAdminStatesView = Ember.View.extend({
            template: Ember.Handlebars.compile(statesTemplate)
        });

        var StateModel = function() {
            return {
                rawResourceId: "",
                resourceId: "",
                resourceVersion: "",
                resourceTypes: ["FILES", "POSTS", "GROUPS", "USERS"],
                resourceType: "FILES",
                sourceApplicationId: applicationIdConfig.contentstore
            }
        }

        app.SysAdminStatesRoute = Ember.Route.extend({
            model: function () {
                return new StateModel()
            }
        });


        app.SysAdminStatesController = Ember.ObjectController.extend({

            renderStateGraph: function (stateGraph) {
                try {
                    for (var index = 0; index < g.nodes.length; index++) {
                        var currentNode = g.nodes[index];
                        var stateNode = _.find(stateGraph.nodes, function (node) {
                            return node.name === currentNode.id.toUpperCase();
                        });
                        currentNode.color = COLORS[stateNode.data.status];
                        currentNode.data = stateNode.data;
                    }
                } catch (e) {
                    this.set("error", e.message)
                }

                document.getElementById('state-graph').innerHTML = "";
                var sigmaGraph = new sigma({ graph: g,
                    renderer: {
                        container: document.getElementById('state-graph'),
                        type: 'canvas'
                    },
                    settings: {
                        zoomMin: 1,
                        zoomMax: 1,
                        sideMargin: 1,
                        minNodeSize: 8,
                        maxNodeSize: 16
                    }
                });

                sigmaGraph.bind('clickNode', function(e) {
                    alert(e.data.node.label +"->"+ JSON.stringify(e.data.node.data));
                });
            },

            actions: {
                getStates: function () {
                    var self = this;
                    var model = this.get('model');
                    self.set("error", "")
                    sysAdminService.getStates(model)
                      .then(function (stateGraph) {
                        self.renderStateGraph(stateGraph);
                    }).fail(function(err){
                        self.set("error", err.message)
                    });
                },

                reset: function () {
                    this.set("model", new StateModel());
                    document.getElementById('state-graph').innerHTML = "";
                }
            }
        })
    });