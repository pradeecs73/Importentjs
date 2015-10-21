define([], function() {
    var sortOver = function() {
        try {

            if ($().dataTable) {
                setTimeout(function() {
                    $('#lms-table-offering').dataTable({
                        "bFilter": false,
                        "bInfo": false,
                        "bPaginate": false,
                        "aoColumnDefs": [{
                            'bSortable': false,
                            'aTargets': [4]
                        }, {
                            'bSortable': false,
                            'aTargets': [5]
                        }]
                    });
                }, 1000);
            }
        } catch (e) {
            console.log("Error in getting data table");
        }

    }


    var popOver = function() {

        jQuery(function($) {
            $('[data-rel=popover]').popover({
                html: true
            });

            $("#sidebar-collapse").click(function(e) {
                $('#side-bottom-nav').toggleClass('navbar-fixed-bottom-mini');
                $('.menu-icon').toggleClass('hide');
                $('#side-bottom-nav').find('.menu-text').toggleClass('hide');
            });

        });
        $('body').on('click', function(e) {
            $('[data-rel=popover]').each(function() {
                // hide any open popovers when the anywhere else in the body is clicked
                if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                    $(this).popover('hide');
                }
            });

            $('.modal').on('focus', function() {
                $('[data-rel=popover]').popover('hide');
            });

        });

        $('th input:checkbox').click(function() {
            var checked_status = this.checked;
            $(this).closest('table').find('input:checkbox').each(function() {
                this.checked = checked_status;
            });
        });



    }

    var sharedPopOver = function() {
        //we could just set the data-provide="tag" of the element inside HTML, but IE8 fails!
        $('.user-suggest').autocomplete({
            messages: {
                noResults: '',
                results: function() {}
            },
            source: function(req, res) {
                var groupList = [];

                try {
                    $.when(
                        $.ajax('/userrepository/UserLDAPAuthentication/users/findUsers?term=' + req.term, {
                            type: "POST",
                            accepts: 'json',
                            contentType: 'application/json',
                            data: JSON.stringify({
                                "keyword": req.term
                            }),
                            dataType: 'json'

                        }),
                        $.ajax('/groups', {
                            type: "GET",
                            //accepts: 'json',
                            contentType: 'application/json',
                            dataType: 'json'

                        })).then(function(res1, res2) {
                        var userList = res1[0].UserList;
                        _.each(userList, function(user) {
                            var userDetails = {
                                label: "",
                                value: user.email
                            };
                            groupList.push(userDetails);
                        });

                        _.each(res2[0], function(group) {
                            var groupDetails = {
                                value: group.name,
                                label: ""
                            };
                            groupList.push(groupDetails);
                        });
                        //console.log(groupList);
                        res(groupList);
                    });

                } catch (e) {
                    res([]);
                }
            }
        }).data('ui-autocomplete')._renderItem = function(ul, item) {
            return $("<li>")
                .append("<a>" + item.value + "<br><small>" + item.label + "</small></a>")
                .appendTo(ul);
        };
    };

    var shareAutotag = function(data, shares) {
        var elt = $('#form-field-mask-2');
        var alreadyLoaded = false;
        try {
            elt.tagsinput({
                itemValue: "id",
                itemText: "name"
            });
        } catch (error) {
            elt.tagsinput('destroy');
            elt.tagsinput({
                itemValue: "id",
                itemText: "name"
            });
            //alreadyLoaded = true;
        }
        if (shares != null && shares.length > 0) {
            _.each(shares, function(share, key) {
                elt.tagsinput('add', {
                    id: share.share + '|' + share.display,
                    name: share.display
                })
            })
        }
        if (!alreadyLoaded) {
            elt.tagsinput('input').typeahead({
                valueKey: 'name',
                local: data
            }).bind('typeahead:selected', $.proxy(function(obj, datum) {
                this.tagsinput('add', datum);
                this.tagsinput('input').typeahead('setQuery', '');
            }, elt));
        }
    };


    return {
        popOver: popOver,
        sortOver: sortOver,
        sharedPopOver: sharedPopOver,
        shareAutotag: shareAutotag
    };
});