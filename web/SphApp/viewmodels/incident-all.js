/// <reference path="Scripts/jquery-2.1.1.intellisense.js" />
/// <reference path="Scripts/knockout-3.2.0.debug.js" />
/// <reference path="Scripts/knockout.mapping-latest.debug.js" />
/// <reference path="Scripts/require.js" />
/// <reference path="Scripts/underscore.js" />
/// <reference path="Scripts/moment.js" />
/// <reference path="../services/datacontext.js" />
/// <reference path="../schemas/trigger.workflow.g.js" />
/// <reference path="../../Scripts/bootstrap.js" />


define(["services/datacontext", "services/logger", "plugins/router", "services/chart", objectbuilders.config],

function(context, logger, router, chart, config) {

    var isBusy = ko.observable(false),
        chartFiltered = ko.observable(false),
        view = ko.observable(),
        list = ko.observableArray([]),
        map = function(v) {
            if (typeof partial !== "undefined" && typeof partial.map === "function") {
                return partial.map(v);
            }
            return v;
        },
        entity = ko.observable(new bespoke.sph.domain.EntityDefinition()),
        query = ko.observable(),
        activate = function() {
            query({
                "query": {
                    "filtered": {
                        "filter": {
                            "bool": {
                                "must": [

                                ],
                                "must_not": [

                                ]
                            }
                        }
                    }
                },
                "sort": []
            });
            var edQuery = String.format("Name eq '{0}'", 'Incident'),
                tcs = new $.Deferred(),
                formsQuery = String.format("EntityDefinitionId eq 'incident' and IsPublished eq 1 and IsAllowedNewItem eq 1"),
                viewQuery = String.format("EntityDefinitionId eq 'incident'"),
                edTask = context.loadOneAsync("EntityDefinition", edQuery),
                formsTask = context.loadAsync("EntityForm", formsQuery),
                viewTask = context.loadOneAsync("EntityView", viewQuery);


            $.when(edTask, viewTask, formsTask)
                .done(function(b, vw, formsLo) {
                entity(b);
                view(vw);
                var formsCommands = _(formsLo.itemCollection).map(function(v) {
                    return {
                        caption: v.Name(),
                        command: function() {
                            window.location = '#' + v.Route() + '/0';
                            return Task.fromResult(0);
                        },
                        icon: v.IconClass()
                    };
                });
                vm.toolbar.commands(formsCommands);

                tcs.resolve(true);

            });



            return tcs.promise();
        },
        chartSeriesClick = function(e) {

            isBusy(true);
            var q = ko.mapping.toJS(query),
                cat = {
                    "term": {}
                },
                histogram = {
                    "range": {}
                },
                date_histogram = {
                    "range": {}
                };

            if (e.aggregate === "histogram") {
                histogram.range[e.field] = {
                    "gte": parseFloat(e.category),
                    "lt": (parseFloat(e.category) + e.query.aggs.category.histogram.interval)
                };

                q.query.filtered.filter.bool.must.push(histogram);
            }
            if (e.aggregate === "date_histogram") {
                logger.error('Filtering by date range is not supported just yet');
                isBusy(false);
                return;
                date_histogram.range[e.field] = {
                    "gte": parseFloat(e.category),
                    "lt": (parseFloat(e.category) + e.query.aggs.category.date_histogram.interval)
                };

                q.query.filtered.filter.bool.must.push(date_histogram);
            }
            if (e.aggregate === "term") {
                if (e.category === "<Empty>") {
                    var missing = {
                        "missing": {
                            "field": e.field
                        }
                    };
                    q.query.filtered.filter.bool.must.push(missing);
                } else {
                    cat.term[e.field] = e.category;
                    q.query.filtered.filter.bool.must.push(cat);
                }
            }



            context.searchAsync("Incident", q)
                .done(function(lo) {
                list(lo.itemCollection);
                chartFiltered(true);
                setTimeout(function() {
                    isBusy(false);
                }, 500);
            });
        },
        attached = function(view) {
            chart.init("Incident", query, chartSeriesClick, "incident-incident-all");
        },
        clearChartFilter = function() {
            chartFiltered(false);
            var link = $('div.k-pager-wrap a.k-link').not('a.k-state-disabled').first();
            link.trigger('click');
            if (link.text() === "2") {
                setTimeout(function() {
                    $('div.k-pager-wrap a.k-link').not('a.k-state-disabled').first().trigger('click');
                }, 500);
            }
        };

    var vm = {
        config: config,
        view: view,
        chart: chart,
        isBusy: isBusy,
        map: map,
        entity: entity,
        activate: activate,
        attached: attached,
        list: list,
        clearChartFilter: clearChartFilter,
        chartFiltered: chartFiltered,
        query: query,
        toolbar: {
            commands: ko.observableArray([])
        }
    };

    return vm;

});