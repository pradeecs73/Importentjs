define([], function() {
    var visualSearch = function(status, scope, cb, context) {

        var visualSearch = VS.init({
            container: $('#search_box_container2'),
            query: '',
            minLength: 0,
            showFacets: true,
            readOnly: false,
            unquotable: [],
            placeholder: "Filter By Categories / Type",
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
                        case 'Status':
                            callback(status);
                            break;
                        case 'Scope':
                            callback(scope);
                            break;
                    }
                },
                facetMatches: function(callback) {
                    callback([
                        'Status', 'Scope'
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

    return {
        sortOver: sortOver,
        visualSearch: visualSearch
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

jQuery(document).ready(function(){
    try{
        jQuery(document).on('answered', function(e, entityId, entityType, isSet){    
            var markDiscussionThreadAsAnswerOrNot={
                userEmailId: App.getUserLoginId(),
                displayName: App.getShortname()
            };
            var replyId = 'na';
            var url = "/knowledgecenter/cclom/posts/"+ entityId +"/reply/"+replyId+"/answer?action="+isSet+"&answeredOrNot="+ isSet;
            jQuery.ajax({
                    url: url,
                    type:'PUT',
                    contentType:"application/json",
                    data:JSON.stringify(markDiscussionThreadAsAnswerOrNot),
                    beforeSend: function(xhr) {
                        App.encryptionService(xhr);
                    },
                    success: function(response) {
                        return response;
                    },
                    error: function(error) {
                        Ember.Logger.error("[pages/blog.js] [ Set answer updates >>>] ", error);
                        return {}
                    }
            });

        })
    }catch(err){
        Ember.Logger.error("Skippable: [pages/blog.js] [ Answer status >>>] ", err);
    }

    try{
        jQuery(document).on('commented uncommented', function(e, entityId, entityType, isSet){

            var currentCount = jQuery(".commentsCountDisplay").text()
            try{
                currentCount = parseInt(currentCount)
            }catch(err){
                currentCount = 0
            }
            var data = {}
            if(e.type == 'uncommented'){
                data = {update: currentCount-1}
                if(entityId == -1){
                    var __entityId = window.location.href.split("/")
                    entityId = __entityId[__entityId.length - 1]
                }
                jQuery(".commentsCountDisplay").text(currentCount-1)
            }else{
                data = {update: currentCount+1}
                jQuery(".commentsCountDisplay").text(currentCount+1)
            }            

            var url = "/knowledgecenter/cclom/posts/"+ entityId +"/comments";
            jQuery.ajax({
                    url: url,
                    type:'PUT',
                    contentType:"application/json",
                    data:JSON.stringify(data),
                    beforeSend: function(xhr) {
                        App.encryptionService(xhr);
                    },
                    success: function(response) {
                        return response;
                    },
                    error: function(error) {
                        Ember.Logger.error("[pages/blog.js] [ Set comment count >>>] ", error);
                        return {}
                    }
            });
        })
    }catch(err){
        Ember.Logger.error("Skippable: [pages/blog.js] [ >>>] ", err);
    }    
})

/* For auto close on messages in posts */
jQuery(document).ready(function(){
    jQuery("#successMessageDiv").fadeTo(2000, 500).slideUp(500, function(){
        jQuery("#successMessageDiv").alert('close');
    });
})
