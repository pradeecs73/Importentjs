define([], function() {

    var initialize = function(jQueryContext) {
        jQueryContext.find('[data-rel=popover]').on('click', function(e) {
            jQueryContext.find('[data-rel=popover]').each(function() {
                if (!$(this).is(e.currentTarget)) {
                    $(this).popover('hide');
                }
            });
        });

        jQueryContext.find('table th input:checkbox').on('click', function() {
            var that = this;
            $(this).closest('table').find('tr > td:first-child input:checkbox')
                .each(function() {
                    this.checked = that.checked;
                    $(this).closest('tr').toggleClass('selected');
                });

        });

        jQueryContext.find('[data-rel="tooltip"]').tooltip({
            placement: tooltip_placement
        });

        jQueryContext.find('[data-rel=popover]').popover({
            html: true
        });
    };
    var visualSearch = function(types, cb, context) {
        var visualSearch = VS.init({
            container: $('#search_box_container_notification'),
            query: '',
            minLength: 0,
            showFacets: true,
            readOnly: false,
            unquotable: [],
            placeholder: "Filter by Types",
            callbacks: {
                search: function(query, searchCollection) {
                    var $query = $('#search_query2');
                    $query.stop().animate({
                        opacity: 1
                    }, {
                        duration: 300,
                        queue: false
                    });
                    clearTimeout(window.queryHideDelay2);
                    window.queryHideDelay2 = setTimeout(function() {
                        $query.animate({
                            opacity: 0
                        }, {
                            duration: 1000,
                            queue: false
                        });
                    }, 2000);

                    cb(context, searchCollection);
                },
                valueMatches: function(category, searchTerm, callback) {
                    switch (category) {
                        case 'Type':
                            callback(types);
                            break;
                    }
                },
                facetMatches: function(callback) {
                    callback([
                        'Type'
                    ], {
                        preserveOrder: true
                    });
                }
            }
        });

    }

    var sortOver = function() {
        try {
            setTimeout(function() {
                if ($().dataTable) {
                    $('#sample-table-2_info').dataTable({
                        "aoColumns": [{
                                "bSortable": false
                            },
                            null, null, null, {
                                "bSortable": false
                            }
                        ]
                    });
                }
            }, 1000);
        } catch (e) {
            console.log("Error in getting data table");
        }
    }

    var tooltip_placement = function(context, source) {
        var $source = $(source);
        var $parent = $source.closest('table')
        var off1 = $parent.offset();
        var w1 = $parent.width();

        var off2 = $source.offset();
        var w2 = $source.width();

        if (parseInt(off2.left) < parseInt(off1.left) + parseInt(w1 / 2)) return 'right';
        return 'left';
    }
    return {
        sortOver: sortOver,
        visualSearch: visualSearch,
        initialize: initialize
    };
});