define([], function () {
    var detectAnimationEnd =  function(el, callback){
        $(el).on('animationend webkitAnimationEnd oAnimationEnd oanimationend MSAnimationEnd msAnimationEnd', function() {
            if(typeof callback === 'function'){
                setTimeout(callback(), 150);
            }
            $(this).off();
        });
    };

    var hideLeftNav =  function(el, animationFx){
        var leftNav = $(el),
            hideCls = 'leftnav-'+animationFx+'-out';
        var browser = $(window);
        leftNav.addClass(hideCls);
        /* menu pushout code
         $(".main-content").animate({marginLeft:"0px"}, 350);*/
        detectAnimationEnd(el, function(){
            $(el).removeClass(hideCls+' active');
            // $('body').removeClass('sidebar-active');
            $('.mobile-menu-btn i').removeClass("icon-angle-left").addClass("icon-menu");
        });
    };

    var hideActiveLeftNav = function(link, navEl, animationFx){
        var leftNav = $(navEl);
        $(link).on('click', function(){
            if(leftNav.hasClass('active')) {
                hideLeftNav(navEl, animationFx);
                /* menu pushout code
                 if(browser.width() <= 766){
                 $('body').removeClass('sidebar-active');
                 }*/
                // $('body').removeClass('sidebar-active');
            }
        })
    };

    var showLeftNav = function(el, animationFx){
        var leftNav = $(el),
            showCls = 'leftnav-'+animationFx+'-in';
        var browser = $(window);
        leftNav.addClass(showCls);
        /* menu pushout code
         if(browser.width() <= 1023 && browser.width() > 767){
         $(".main-content").animate({marginLeft:"240px"}, 350);
         }*/
        detectAnimationEnd(el, function(){
            $(el).addClass('active').removeClass(showCls);
            /* menu pushout code
             if(browser.width() <= 766){
             $('body').removeClass('sidebar-active');
             }*/
            // $('body').removeClass('sidebar-active');
            $('.mobile-menu-btn i').removeClass("icon-menu").addClass("icon-angle-left");
        });
    };

    var toggleLeftNav = function(el, animationFx){
        var leftNav = $(el);
        if(!leftNav.hasClass('active') ) {
            showLeftNav(el, animationFx);
        } else if(leftNav.hasClass('active')) {
            hideLeftNav(el, animationFx);
        }
    };

    var toggle = function(e,element){
        e.preventDefault();
        var currentNavBtn  = element,
            currentNavList = currentNavBtn.parents('.nav-list');

        closeAllTabs();

        currentNavList.toggleClass('open');
        currentNavBtn.attr('data-icon-after', 'caret-down');
    };

    var initialize = function () {
        jQuery(function ($) {
            var leftNavSubLink = $('.leftNavSidebar .submenu > li > a'),
                topNavDropLink = $('.cis-dropdown .dropdown-menu > li > a'),
                browserWindow  = $(window);

            // Slide Left Nav In/Out
            $('.mobile-menu-btn').on('click', function(e){

                toggleLeftNav('#sidebar', 'slide');
            });

            // Toggle Left Nav Submenus
            $('#sidebar > .nav-list > li > .dropdown-toggle').on('click', function(e){
                toggle(e,$(this));
            });

            $('#sidebar > div > .nav-list > li > .dropdown-toggle').on('click', function(e){
                toggle(e,$(this));
            });

            // Hide Left Nav for these Link Clicks
            hideActiveLeftNav(leftNavSubLink, '#sidebar', 'slide');
            hideActiveLeftNav(topNavDropLink, '#sidebar', 'slide');

            // When Left Nav is Open, Viewport or Browser May Get Resized;
            // Since the Menu Toggle only Appears at Width < 1199, Auto-Close Menu Overlay in These Cases

            browserWindow.on('resize', function(){
                if((browserWindow.width() > 1199)) {
                    if($('#sidebar').hasClass('active')){
                        $('#sidebar').removeClass('active');
                        $('.mobile-menu-btn i').removeClass("icon-angle-left").addClass("icon-menu");
                    }
                }
            });
        });
    };

    var closeAllTabs = function() {
        $('#sidebar > .nav-list').removeClass('open');
        $('#sidebar > div >.nav-list').removeClass('open');
        $('#sidebar ul.nav-list button').attr('data-icon-after', 'caret-right');
    };

    return {
        initialize: initialize,
        closeAllTabs: closeAllTabs
    }
});