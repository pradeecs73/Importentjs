'use strict';

define(["app", "Q", "text!templates/components/reportComponent.hbs"],
    function (app, Q, reportComponentTemplate) {
        app.ReportGeneratorComponent = Ember.Component.extend(App.ViewFileComponentMixin, {
            template: Ember.Handlebars.compile(reportComponentTemplate),
            reportData: [],
            getReportData: function () {
                var searchFilters = this.get('searchFilters');
                var reportPageSize = app.ReportPageSize
                searchFilters["limitTo"] = reportPageSize;
                var dataKey = this.get('dataKey');
				var countKey = this.get('countKey');
                var serviceFunction = this.get("serviceFunction");
                var self = this;
                serviceFunction(searchFilters).then(function (response) {
                    var reportDataChunk = response[dataKey];
                    var totalReportData = response[countKey];
                    var reportData = reportDataChunk;
                    var numberOfRequests = totalReportData / reportDataChunk.length;
                    numberOfRequests = numberOfRequests++;
                    var fetchCourseFunctionSet = [];
                    for (var i = 1; i < numberOfRequests; i++) {
                        searchFilters.limitFrom = i * reportPageSize;
                        searchFilters.limitTo = (i + 1) * reportPageSize;
                        fetchCourseFunctionSet.push((function () {
                            return serviceFunction(searchFilters)
                        })());
                    }
                    Q.all(fetchCourseFunctionSet).done(function (responses) {
                        responses.forEach(function (response) {
                            response[dataKey].forEach(function (data) {
                                reportData.push(data);
                            })
                        })
                        self.set("reportData", reportData);
                    })
                })
            },
            generateReport: function () {
                var reportType = this.get("reportType");
                var reportData = this.get("reportData");
                reportData = this.get("JSONFormatfunction")(reportData);
                var reportFileName = this.get("reportFileName");
				if(reportData.length == 0){
					 $.gritter.add({title: '', text: 'No data found to generate the report', class_name: 'gritter-error'});
				}else{
					if (reportType == "csv") {
						var reporter = new this.JSONToCSVConvertor(reportData, reportFileName);
						reporter.download(true);
					}
				}
				var searchFilters = this.get('searchFilters');
				searchFilters["limitTo"] = app.ReportPageSize;
				searchFilters["limitFrom"] = 0;
            }.observes("reportData"),
            JSONToCSVConvertor: function (dataArray, reportFileName){
                this.dataArray = dataArray;
                this.fileName = reportFileName ? reportFileName + ".csv" : "report.csv";

                this.getDownloadLink = function(){
                    var keys = Object.keys(this.dataArray[0]);
                    return this.downloadLink = this.downloadLink || 'data:text/csv;charset=utf-8,' +
                        escape((keys.join(',')) +('\n')) +
                        escape(this.dataArray.map(function(row){
                            var rowArray = [];
                            keys.forEach(function(key){
                                rowArray.push(row[key]);
                            })
                            return rowArray.join(',')
                        }).join('\n'));
                };

                this.getLinkElement = function(linkText){
                    var downloadLink = this.getDownloadLink();
                    return this.linkElement = this.linkElement || $('<a>' + (linkText || '') + '</a>', {
                        href: downloadLink,
                        download: this.fileName
                    });
                };

                // call with removeAfterDownload = true if you want the link to be removed after downloading
                this.download = function(removeAfterDownload){
                    this.getLinkElement().css('display', 'none').appendTo('body');
                    this.getLinkElement()[0].click();
                    if(removeAfterDownload){
                        this.getLinkElement().remove();
                    }
                };
            },
            actions: {
                generateReport: function () {
                    this.getReportData();
                }
            }
        });
    });