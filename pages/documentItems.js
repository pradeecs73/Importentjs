'use strict';

define([], function () {
    return {
        initialize: function () {
            $(document).delegate(".tag-swap-icon-static", "click", function () {
                if ($(this).hasClass('icon-tag')) {
                    $(this).removeClass('icon-tag');
                    $(this).closest(".kc-tile").addClass('tag-view');
                    $(this).closest(".contact-tile").addClass('tag-view');
                    $(this).addClass('icon-align-justified');
                    return;
                }
                if ($(this).hasClass('icon-align-justified')) {
                    $(this).removeClass('icon-align-justified');
                    $(this).addClass('icon-tag');
                    $(this).closest(".kc-tile").removeClass('tag-view');
                    $(this).closest(".contact-tile").removeClass('tag-view');
                    return;
                }
            })
            $('body').tooltip({
                selector: '[data-rel=tooltip]'
            });
        },
        toggleTile: function (id) {
            id = "#" + id;
            var $id = $(id);

            if ($id.hasClass('icon-tag')) {
                $id.removeClass('icon-tag');
                $id.closest(".kc-tile").addClass('tag-view');
                $id.closest(".contact-tile").addClass('tag-view');
                $id.addClass('icon-align-justified');
                return;
            }
            if ($id.hasClass('icon-align-justified')) {
                $id.removeClass('icon-align-justified');
                $id.addClass('icon-tag');
                $id.closest(".kc-tile").removeClass('tag-view');
                $id.closest(".contact" +
                    "" +
                    "" +
                    "-tile").removeClass('tag-view');
                return;
            }
        },
        toggleView: function (viewName, resource) {
            $("#"+ resource +"_toggle_view a").removeClass("active");
            $("#"+ resource +"_toggle_view #catalog-" + viewName).addClass("active");
            var searchResultsContainer = $("#"+ resource +"_search_results");
            if (searchResultsContainer.length > 0) {
              searchResultsContainer.removeClass("list-view");
              searchResultsContainer.removeClass("grid-view");
              searchResultsContainer.addClass(viewName);
            }

        },
        togglePostsView: function (element) {
            $("#posts_toggle_view a").removeClass("active");
            $("#posts_toggle_view #" + element).addClass("active");
            $("#posts_search_results").removeClass();
            $("#posts_search_results").addClass(element);
        },
        toggleGroupsView: function (element) {
            $("#groups_toggle_view a").removeClass("active");
            $("#groups_toggle_view #" + element).addClass("active");
            $("#groups_search_results").removeClass();
            $("#groups_search_results").addClass(element);
        },
        toggleUsersView: function (element) {
            $("#users_toggle_view a").removeClass("active");
            $("#users_toggle_view #" + element).addClass("active");
            $("#users_search_results").removeClass();
            $("#users_search_results").addClass(element);
        },
        popoverContact: function() {
            $('.contact-withPopOver').popover(
                {
                    html:true,
                    trigger:'focus',
                    content : function(){
                      $('.popover').hide();
                        return $(this).find('.contactHover').html();
                    }
                }
            );
            $(".contact-withPopOver a,.contact-withPopOver input").click(function( event ) {
                event.stopPropagation();
            });
        }
    };
});
