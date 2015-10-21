'use strict';

define([], function () {
    return {
        initialize: function () {
            if ($('#js-multi-action-toolbar-box').length > 0) {
                var toolBarOffset = $('.multi-contact-action').offset().top;
                var elementOffsetTop = parseInt(toolBarOffset) - 95;
                $(window).scroll(function () {
                    var windowScrollTop = $(window).scrollTop();
                    if (windowScrollTop > elementOffsetTop) {
                        $('#js-multi-action-toolbar-box').css({
                            position: 'fixed',
                            top: '75px'
                        });
                    } else {
                        $('#js-multi-action-toolbar-box').css({
                            position: 'absolute',
                            top: '0px'
                        });
                    }
                });
            }
        }
    };
});
