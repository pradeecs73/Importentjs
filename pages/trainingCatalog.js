define([], function() {
    var visualSearch = function(categories, types, locations, cb, context) {

        var visualSearch = VS.init({
            container: $('#search_box_container2'),
            query: '',
            minLength: 0,
            showFacets: true,
            readOnly: false,
            unquotable: [],
            placeholder: "Filter By Categories / Location / Type",
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
                        case 'Category':
                            callback(categories);
                            break;
                        case 'Type':
                            callback(types);
                            break;
                        case 'Location':
                            callback(locations);
                            break;
                    }
                },
                facetMatches: function(callback) {
                    callback([
                        'Category', 'Type', 'Location'
                    ], {
                        preserveOrder: true
                    });
                }
            }
        });

    }

    var sortOver = function() {

        try {
            if ($().dataTable) {
                setTimeout(function() {
                    $('#sample-table-2').dataTable({
                        "bFilter": false,
                        "bInfo": false,
                        "bPaginate": false,
                        "aoColumnDefs": [{
                            'bSortable': false,
                            'aTargets': [0]
                        }, {
                            'bSortable': false,
                            'aTargets': [1]
                        }, {
                            'bSortable': false,
                            'aTargets': [2]
                        }, {
                            'bSortable': false,
                            'aTargets': [4]
                        }]
                    });
                }, 1000);
            }
        } catch (e) {
            console.log("Error in getting data table");
        }


    }

    var hideRegister = function(){
    
    $(function() {
                
        $('i.register-course-icon').bind("click", function(){
            
            if ($('.training-catalog-borderbottom span div.tooltip').length) {
                $('.training-catalog-borderbottom span div.tooltip').hide();
            }
                        
                        
        })
        
        $('i.drop-course-icon').bind("click", function(){
                        
            if ($('.training-catalog-borderbottom span div.tooltip').length) {
            
                $('.training-catalog-borderbottom span div.tooltip').hide();
            }
                        
        })
    });
    
    };
    
    var pendingApprovalStatus = function(course) {
        if (course.enrollStatus =="PENDING") {
            course.pendingApproval = true;
            course.isUserEnroled = true;
        }
    };
    
    var pendingEnrollmentList = function(entityList) {
        var courseList = _.filter(entityList, function(entity) {
            return entity.entityType == "COURSE";
        });
        var plpList = _.filter(entityList, function(entity) {
            return entity.entityType == "LEARNING_PLAN";
        });
        return { "courseList": courseList, "plpList": plpList }
    };
    
    return {
        hideRegister: hideRegister,
        sortOver: sortOver,
        visualSearch: visualSearch,
        pendingApprovalStatus: pendingApprovalStatus,
        pendingEnrollmentList: pendingEnrollmentList
    };
});


jQuery(function($) {
    $("#open-event").tooltip({
        show: null,
        position: {
            my: "left top",
            at: "left bottom"
        },
        open: function(event, ui) {
            ui.tooltip.animate({
                top: ui.tooltip.position().top + 10
            }, "fast");
        }
    });
});