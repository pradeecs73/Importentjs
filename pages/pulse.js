'use strict';

define([],function(){
    return {
        initialize: function() {

        },
      pulseGraphRenderer : function(datasource, container) {
        var container = container;
        var padding = {top: 20, right: 20, bottom: 30, left: 50};
        var parseDate = d3.time.format("%d-%b-%y").parse;
        var sourceData, xScale, yScale, line;
        var prevChartWidth = 0, prevChartHeight = 0;
        var updateTransistionMS = 750; // milliseconds
        var xAxis, yAxis;
        var chartSvg = d3.select("#"+container).append("svg")
          .append("g")
          .attr("class", "chartContainer")
          .attr("transform", "translate(" + padding.left + "," + padding.top + ")");

        chartSvg.append("g").attr("class", "x axis");
        chartSvg.append("g").attr("class", "y axis");

        d3.tsv(datasource, function(error, data) {
          data.forEach(function(d) {
            d.date = parseDate(d.date);
            d.total = +d.total;
          });

          sourceData = data;

          xScale = d3.time.scale().domain(d3.extent(sourceData, function(d) { return d.date; }));
          yScale = d3.scale.linear().domain([0, d3.max(sourceData, function(d) { return d.total; })]);
          xAxis = d3.svg.axis().scale(xScale).orient("bottom");
          yAxis = d3.svg.axis().scale(yScale).orient("left");

          updateChart(true);
        });

        var renderLine = function(lineClass) {
          var line = d3.svg.line()
            .x(function(d) { return xScale(d.date); })
            .y(function(d) {
              return ydata(d, lineClass);
            })
            .interpolate("cardinal");

          var lines = chartSvg.selectAll(".line."+lineClass)
            .data([sourceData]); // needs to be an array (size of 1 for our data) of arrays

          lines.transition()
            .duration(updateTransistionMS)
            .attr("d", line);

          lines.enter().append("path")
            .attr("d", line)
            .attr("class", "line "+lineClass);
        }

        var renderCircles = function(circleClass) {
          var circle = chartSvg.selectAll("circle."+circleClass)
            .data(sourceData);

          var y;

          circle.transition()
            .duration(updateTransistionMS)
            .attr("cx", function(d) { return xScale(d.date); })
            .attr("cy", function(d) {
              return ydata(d, circleClass);
            });

          circle.enter().append("circle")
            .attr("cx", function(d) { return xScale(d.date); })
            .attr("cy", function(d) {
              return ydata(d, circleClass);
            })
            .attr("r", 3)
            .attr("class", "circle "+circleClass)
            .append("title")
            .text(function (d) {
              return circleClass + ": " + getColumnData(d, circleClass);
            });
        }

        var ydata = function(d, dataclass) {
          if (dataclass === "blogs")
            return yScale(d.blogs)
          else if (dataclass === "questions")
            return yScale(d.questions)
          else if (dataclass === "epubs")
            return yScale(d.epubs)
          else if (dataclass === "video")
            return yScale(d.video)
          else if (dataclass === "pdf")
            return yScale(d.pdf)
          else if (dataclass === "ppt")
            return yScale(d.ppt)
          else if (dataclass === "learning")
            return yScale(d.learning)
          else
            return yScale(d.total)
        }

        var getColumnData = function(d, dataclass) {
          if (dataclass === "blogs")
            return d.blogs
          else if (dataclass === "questions")
            return d.questions
          else if (dataclass === "epubs")
            return d.epubs
          else if (dataclass === "video")
            return d.video
          else if (dataclass === "pdf")
            return d.pdf
          else if (dataclass === "ppt")
            return d.ppt
          else if (dataclass === "learning")
            return d.learning
          else
            return d.total
        }


        var renderGraph = function(graphClass) {
          renderLine(graphClass);
          renderCircles(graphClass);
        }

        var updateChart = function (init) {
          var chartWidth = document.getElementById(container).getBoundingClientRect().width - padding.left - padding.right;
          var chartHeight = document.getElementById(container).getBoundingClientRect().height - padding.top - padding.bottom;

          if ((prevChartWidth != chartWidth) || (prevChartHeight != chartHeight)) {
            prevChartWidth = chartWidth;
            prevChartHeight = chartHeight;

            chartSvg
              .attr("width", chartWidth + padding.left + padding.right)
              .attr("height", chartHeight + padding.top + padding.bottom);

            d3.select("#"+container+" svg")
              .attr("width", chartWidth + 100)
              .attr("height", chartHeight + 100);

            xScale.range([0, chartWidth]);
            yScale.range([chartHeight, 0]);

            if (init) {
              chartSvg.select(".x")
                .attr("transform", "translate(0," + chartHeight + ")")
                .call(xAxis);

              chartSvg.select(".y")
                .call(yAxis);
            } else {
              var t = chartSvg.transition().duration(updateTransistionMS);

              t.select(".x")
                .attr("transform", "translate(0," + chartHeight + ")")
                .call(xAxis);

              t.select(".y")
                .call(yAxis);
            }

            renderGraph("blogs");
            renderGraph("questions");
            renderGraph("epubs");
            renderGraph("video");
            renderGraph("pdf");
            renderGraph("ppt");
            renderGraph("learning");
          }
        }

        var resizeTimer;
        window.onresize = function(event) {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(function()
          {
            updateChart(false);
          }, 100);
        };

        $('.nav-tabs li a').click(function(){
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(function()
          {
            updateChart(true);
          }, 100);
        })
      }
    };
});