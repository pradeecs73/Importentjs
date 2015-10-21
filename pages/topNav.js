'use strict';

define([], function () {
    return {
        initialize: function () {

            $(document).on("searchOutEvent", function (event) {
                $("#top-nav-search-box").val("");
                $("#searchError").hide();
                event.stopImmediatePropagation();
            });

            function dropNav(dropButtonClass, dropClass){
                $(dropButtonClass).on('click', function(e){
                    e.preventDefault();
                    $(this).parents('.dropdown').toggleClass('open');
                });
            }
            
            dropNav('.cis-dropdown', '.dropdown-toggle');


            $('#mobileSearchToggle').on('click', function(){
                $('.mobile-nav-search').toggleClass('hidden');
                $(this).toggleClass('show-search');
                // thisIcon.toggleClass('icon-search bigger-150').toggleClass('icon-caret-up bigger-175');
            });

            /* Main menu not disappearing when we click on notifications item */
            $('.navbar-notifications').on('click', function(){
                                  
                if ($('div.slimScrollDiv').length > 0) {

                    $('#sidebar')
                        .addClass('ui-sub-panel-close')
                        .removeClass("ui-sub-panel-animate ui-sub-panel-open");
                }
            });
        }
       
    }
});