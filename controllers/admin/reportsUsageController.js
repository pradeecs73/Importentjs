"use strict";

define(["app", "text!templates/reportsUsage.hbs", "services/admin/reportService"],
    function (app, adminDashboard, reportService) {

        App.ReportsUsageController = Ember.ObjectController.extend({

            actions: {
                generateReports: function (reportType, applicationId) {
                    var self = this;
                    self.reportType = reportType;
                    function flashMessage(messageDiv) {
                        messageDiv.fadeIn('slow');
                        setTimeout(function() {
                            messageDiv.fadeOut('slow');
                        }, 3000);
                    };
                    reportService.generateReports(reportType, applicationId).then(function (response) {
                        var reportType = self.reportType;
                        var messageDiv = $("#messageDiv");
                        messageDiv.removeClass("alert-danger");
                        messageDiv.addClass("alert-success");
                        messageDiv.children("p").html("This action has been completed. You will get the mail soon with " + reportType + " reports.")
                        flashMessage(messageDiv);
                    }).fail(function (err) {
                        var reportType = self.reportType;
                        var messageDiv = $("#messageDiv");
                        messageDiv.removeClass("alert-success");
                        messageDiv.addClass("alert-danger");

                        if (err.status == 403)
                            messageDiv.children("p").html(reportType + " report already in progress");
                        else
                            messageDiv.children("p").html(reportType + " report generation failed");

                        flashMessage(messageDiv);
                    });
                },
                downloadReport: function (reportType) {
                    var self = this;
                    self.reportType = reportType;

                    reportService.downloadReport(reportType).then(function (response) {
                        window.open(response.reportUrl, '_self');
                    }).fail(function (err) {
                        var reportType = self.reportType;
                        var messageDiv = $("#messageDiv");
                        messageDiv.removeClass("alert-success");
                        messageDiv.addClass("alert-danger");
                        messageDiv.children("p").html(reportType + " report download failed");
                        flashMessage(messageDiv);

                    })
                }

            }

        });

        App.ReportsUsageRoute = Ember.Route.extend({
            actions: {
                refreshModel: function () {
                    this.refresh();
                }
            },
            typeMapping: {
                "users": "Users",
                "usersActivity": "UsersActivity",
                "StorageUtilization": "StorageUtilization"
            },
            transformResponse: function(response){
                var self = this;
                _.forEach(response.report, function (report) {
                    var name = self.typeMapping[report["type"]] ? self.typeMapping[report["type"]] : report["type"];
                    report.name = name;
                });

            },
            model: function (queryParams) {
                var self = this;
                return reportService.getReports().then(function (response) {
                    if (response != null) {
                        self.transformResponse(response);

                        response.allowed = true;
                        return response;
                    }
                    response['lastGeneratedReport'] = true;

                }).fail(function (err) {
                    return err.allowed = false;
                })

            },
            setupController: function (controller, model) {
                controller.set('model', model);
            }
        });

        App.ReportsUsageView = Ember.View.extend({
            template: Ember.Handlebars.compile(adminDashboard)
        });

    });