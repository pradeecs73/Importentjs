
define(['app','httpClient', 'Q', 'services/vkmservices/landingDemoService', "pages/vkmui-modals"],
    function(app, httpClient, Q , landing_Demo, vkmui_modals) {
      App.vkmui = Ember.Object.create({

      


        animationComplete: function(el, timeout, callback){
            $(el).on('animationend webkitAnimationEnd oAnimationEnd oanimationend MSAnimationEnd msAnimationEnd', function() {
                if(typeof callback === 'function'){
                    setTimeout(callback(), timeout);
                }
                $(this).off();
            });
        },


    /* -- Animate Elements In/Out
    ----------------------------------------
    */
    animateElement: function (animatedElem, timer, direction, callbackFunc){

      if(direction === "in"){
        $(animatedElem).addClass('animating-in');
      } else {
        $(animatedElem).addClass('animating-out');      
      }
      
      $(animatedElem).on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {

        setTimeout(function(){

              if(direction === "in"){
                $(animatedElem).addClass('active').removeClass('animating-in');
              } else {
                $(animatedElem).addClass('hide-element').removeClass('animating-out show-element hide-element');        
              }
              
            }, timer);
            
            $(animatedElem).off();

        if(typeof callbackFunc !== "undefined") {
          //callbackFunc();
        }
      });  
    },




    /* -- Inner Tab Slider
    ----------------------------------------
      Finds active tab, and applies CSS3 transition class for slide effect to reveal detailed Tab info 
      Use callback to open specific panels within detailed Tab after it slides into view.

      Apply this affect within a click or other event
    */
    tabDetailSlider :function (tabWrapperId, slideDirection, callbackFunc){
        var tabWrapper = $(tabWrapperId);
        if(!tabWrapper.hasClass('animating-in') && !tabWrapper.hasClass('show-element') && slideDirection === "slideIn"){
            this.animateElement(tabWrapper, 750, 'in', callbackFunc);
        } else if(!tabWrapper.hasClass('animating-in') && tabWrapper.hasClass('show-element')  && slideDirection === "slideOut"){
            this.animateElement(tabWrapper, 750, 'out', callbackFunc);
        } 
    },














    /* -- Slide Right Panel In/Out
    -------------------------------------------------------------------------------------------*/
    slidePanel: function(panelEl, otherEl, slideClass, activeClass, inOut, slideTime){

        var slidePanel  = $(panelEl),
            appBody   = $(otherEl);

            slidePanel.addClass(slideClass+'-'+inOut);

        if(inOut === "in") {
            
            appBody.addClass('contracted');

            App.vkmui.animationComplete(slidePanel, 150, function(){
              slidePanel.addClass(activeClass).removeClass(slideClass+'-'+inOut);
            });         

        } else if(inOut === "out"){

            appBody.removeClass('contracted');

            App.vkmui.animationComplete(slidePanel, 150, function(){
              $('.vkm-side-tabs li').removeClass('active');
              slidePanel.removeClass(activeClass).removeClass(slideClass+'-'+inOut);
            });            

        } else {

          }

    },


/*  populate filters
----------------------------------------------------------------------------*/
    filterPopulate: function(idClicked){
     $(".tab-filter-pane").removeClass("active");
      if( idClicked == "#Location" )
        {$("#locations").addClass("active");}
      else if( idClicked == "#Job Title"){
         $("#jobtitles").addClass("active");
      }
      else if( idClicked == "#Organization"){
         $("#organizations").addClass("active");
      } else if( idClicked == "#topic-overview"){
          $("#topic-overview").addClass("active");
      }
      

    },


    /* -- Slide Right Panel + Show Topic Content
    -------------------------------------------------------------------------------------------*/
    topicSlidePanel: function(uxOptions, inOut, callbackFunc){

      var rightNav  = uxOptions.slidePanelEl,
          appBody   = uxOptions.outerPanel,
          slideCls  = uxOptions.slideAnimCls,
          activeCls = uxOptions.slideActiveCls,
          slideTmr  = uxOptions.slideTimer,
          topicFind = uxOptions.topicSearchField,
          topicForm = uxOptions.topicFormWrap,
          topRtTabs = uxOptions.topRightPanelTabs,
          topicDetailCls = uxOptions.showTopicDetailCls;      

          if(inOut === "in"){

            // check if already showing and topic-hidden class applied that needs removal
            if($(rightNav).hasClass('topic-contents-hidden')){
              $(rightNav).removeClass('topic-contents-hidden');
            }

            $(rightNav).addClass(uxOptions.showTopicDetailCls);

            if( !$(rightNav).hasClass('active') ){
              App.vkmui.slidePanel(rightNav, appBody, slideCls, activeCls, 'in', slideTmr);
            }

          } else {

            App.vkmui.slidePanel(rightNav, appBody, slideCls, activeCls, 'out', slideTmr);

            App.vkmui.animationComplete(rightNav, 150, function(){
              if( typeof(callbackFunc) !== "undefined" ){
                callbackFunc();
              }
            });              
          }

    },

    



    /* -- VKM UI Interactions
    ----------------------------------------*/    
    initUx: function(outerContainer, uxOptions){

      var rightNav  = uxOptions.slidePanelEl,
          appBody   = uxOptions.outerPanel,
          slideCls  = uxOptions.slideAnimCls,
          activeCls = uxOptions.slideActiveCls,
          slideTmr  = uxOptions.slideTimer,
          topicFind = uxOptions.topicSearchField,
          topicForm = uxOptions.topicFormWrap,
          topRtTabs = uxOptions.topRightPanelTabs,
          topicDetailCls = uxOptions.showTopicDetailCls;

      $(outerContainer).on('click', function(e){

        var clickTarget = $(e.target);

        if( clickTarget.is('.vkm-side-tabs li a span') ){
            var filterClicked = "#"+clickTarget.html();
                 App.vkmui.filterPopulate(filterClicked);
        
            if( $(rightNav).hasClass('show-topic-contents') ) {
              $(rightNav).removeClass('show-topic-contents');
            }

            if( $(rightNav).hasClass('topic-contents-hidden') ) {
              $(rightNav).removeClass('topic-contents-hidden');
            }

            if( !$(rightNav).hasClass('active') ) {

              if(clickTarget.parent().attr('disabled')){
                return false; 
              } else {
                App.vkmui.slidePanel(rightNav, appBody, slideCls, activeCls, 'in', slideTmr);
              }

            } else {
                var filterClicked = "#"+clickTarget.html();
                 App.vkmui.filterPopulate(filterClicked);

              }
        
        } else if( clickTarget.is('.widget-body, .widget-body-inner, .filter-link, #sample-bubble-chart > svg') && $(rightNav).hasClass('active') ){
            
            if( $(rightNav).hasClass('show-topic-contents') ) {

              $(rightNav).addClass('topic-contents-fadeout');
              $(rightNav).find('.panel.active').removeClass('active');
                        
              App.vkmui.animationComplete(rightNav, 150, function(){
                $(rightNav).removeClass('topic-contents-fadeout').addClass('topic-contents-hidden');

                // vkmui.createAccordion('#detailAccordion');

              }); 

              if( !$(rightNav).hasClass('topic-contents-hidden') ) {
                App.vkmui.topicSlidePanel(uxOptions, 'out');

              }

              // App.vkmui.topicSlidePanel(uxOptions, 'out', function(){
              //   $(rightNav).addClass('topic-contents-hidden');
              // });

            } else { // otherwise, slide out normally
              App.vkmui.slidePanel(rightNav, appBody, slideCls, activeCls, 'out', slideTmr);

            }

        } else if( clickTarget.is('.return-overview-tab') ){

            e.preventDefault();
            $(rightNav).removeClass('show-topic-contents topic-contents-hidden');

        } else if( clickTarget.is('#searchTopicsInput') ){
            
            if(!$(topicForm).hasClass('active')){
              $(topicForm).addClass('active')
              $(topRtTabs).addClass('faded-out');
            }
            if($(rightNav).hasClass('active')){
              App.vkmui.slidePanel(rightNav, appBody, slideCls, activeCls, 'out', slideTmr);
            }

        } else if ( clickTarget.is('[class^="icon-"]') ){

            if( $(rightNav).hasClass('topic-contents-hidden') ) {
              $(rightNav).removeClass('topic-contents-hidden');

              if( clickTarget.parent('span').attr('data-toggle') === "collapse" ) {                
                $(clickTarget.parent('span').attr('data-panel')).addClass('active');
              }    
              
              App.vkmui.slidePanel(rightNav, appBody, slideCls, activeCls, 'in', slideTmr);

              App.vkmui.animationComplete(rightNav, 150, function(){
                
              }); 

            }          

        } else if( clickTarget.is('[data-toggle="collapse"]') ) {

          e.preventDefault();

          var allPanels      = $('.panel'),
              thisPanel      = $('.panel'+clickTarget.attr('data-panel')),
              thisPanelInner = thisPanel.find('.panel-collapse');
          
          allPanels.removeClass('active');
          $(thisPanel).addClass('active');

        } else {

            if($(topicForm).hasClass('active') || $(topRtTabs).hasClass('faded-out')){
              $(topicForm).removeClass('active')
              $(topRtTabs).removeClass('faded-out');
            }

        }

      }); // body onClick

    },









    // expandSearchField('#searchTopicsInput');


    /* -- Inner Tab Slider (Binder)
    ----------------------------------------
      Same as Inner Tab Slider, except binds to a specified element
    */

    tabDetailSliderBind :function(tabSlideBtn, tabsWrapper, slideDirection, callbackFunc){
      var self = this;
      $(tabSlideBtn).click('click touchend', function(e){
        e.preventDefault();
        self.tabDetailSlider(tabsWrapper, slideDirection, callbackFunc);
      });
    },
    /*Funtions to resize the right sidebar*/
   
    waitForFinalEvent : function () {
      var timers = {};
      return function (callback, ms, uniqueId) {
        if (!uniqueId) {
          uniqueId = "";
        }
        if (timers[uniqueId]) {
          clearTimeout (timers[uniqueId]);
        }
        timers[uniqueId] = setTimeout(callback, ms);
      };
    },

    /* -- Open a Tab Panel (Landing Page)
    ----------------------------------------
      Pseudo click to open a specific panel;
      Provide the anchor link for the panel as argument;
    */
    openTabPanel :function (panelAnchor){
      $('[data-toggle="collapse"] [data-panel="'+panelAnchor+'"]').click();
    },


    /* -- Style Bootstrap Accordion Panels
    ----------------------------------------
      Adds 'active' class to open panel
    */
    createAccordion :function (accordionElem, independentPanels){

        var thisAccordion  = $(accordionElem),
            allPanels      = $('.panel');

        thisAccordion.on('click', function(e){

            var clickTarget = $(e.target),
                targetPanel   = null;

            if(clickTarget.attr('data-panel')){
                targetPanel = clickTarget.attr('data-panel');

                if(independentPanels == true) {
                  $(targetPanel).toggleClass('active');
                  $(targetPanel).find('.panel-heading h4 > span').toggleClass('collapsed');
                } else {
                  allPanels.removeClass('active');
                  $(targetPanel).addClass('active');                   
                }
            }
        });
    }, 



    /* -- Apply Tooltips
    ----------------------------------------
      Specify Container and Class of Elements to Apply Tooltip To
      Pass Tooltip options via object (see Bootstrap docs for format)
    */       
        
      /* -- Helper Functions
      ----------------------------------------
        Measure text widths for adding of tooltips
      */
      

      // Redraw knowledge map using the filters selected


    /* -- Tab Filters
    ----------------------------------------
      Specify the tab element to intiate; 
      This function controls adding/removing of filters, and simulated reloading of data
    */

    removeFilterItem :function (matchValue) {
      allFilters = $.grep(allFilters, function(item) { 
        return item.term != matchValue; 
      });
      
    },

    removeFilterfrmArray:function (filterTerm) {
     allFiltersJson = $.grep(allFiltersJson, function(item) { 
        return item.category != filterTerm; 
      });
    },




    /* -- Search Autocomplete
    ----------------------------------------
      el: id/class of search input
      minSearchLength: minimum number of characters user can type before instant search results show up
      requestUrl: ajax to request from
      format: data format for ajax request
      maxList: maximum number of results to show in dropdown
    */
    searchExec :function (topicSearched){
      
        if(myTopicsArray.indexOf(topicSearched) > -1){
           displayRhs(topicSearched);
        }else{
           
           //document.location.href = '#/knowledge-topic';
        };
        
    },

    displayRhs :function (topicSelect){
      var nodeTitle      = topicSelect,
          skillLabel     = topicSelect,
          titleText      = 'My Knowledge on '+nodeTitle,
          detailTitle    = $('#rightPanelTabs .detail-title h3'),
          availableWidth = detailTitle.width(),
          titleWidth     = $.fn.textWidth(titleText, '16px arial');
          radius = parseInt($(this).attr('r'));

          detailTitle.text(titleText)
                     .attr('title', titleText);
          if(titleWidth >= availableWidth){
            detailTitle.tooltip({container: '#pageContent'});
          }
          landing_Demo.showRelatedTopics(skillUri, skillLabel);
          landing_Demo.getCommunities(skillLabel);
          this.tabDetailSlider('#rightPanelTabs', 'slideIn', null);
    },

  /*  searchTopicSel :function(path) {

    },


*/
    /* -- Get Dropdown Value
    ----------------------------------------
      Retrieve dropdown value from specified Bootstrap dropdown,
      and input value to callback function
    */
    getDropValue :function (dropdownElem, callbackFunc){
      $(dropdownElem+'.dropdown .dropdown-menu li a').on('click', function(e){
        e.preventDefault();
        var thisOption = $(this),
            thisValue  = thisOption.attr('data-val');
            if(typeof callbackFunc !== "undefined") {
              callbackFunc(thisValue);  
            }
      });
    },




    initSlider :function (wrapper){

      var browser        = $(window),
          sliderWrap     = $(wrapper),
          sliderControls = sliderWrap.find('.slider-controls'),
          sliderLeft     = sliderControls.find('.slider-nav-left'),
          sliderRight    = sliderControls.find('.slider-nav-right'),
          sliderOuter    = sliderWrap.find('.slider-contents'),
          sliderInner    = sliderWrap.find('.slider-inner-contents'),
          slideItem      = sliderInner.find('.knowledge-asset-item'),
          interval       = browser.width()-65,
          slideCount     = 0;

          var slideWidth = (interval-45)/3;

          slideItem.width(slideWidth);
          totalSlideLength = (slideItem.length * slideWidth)*2;
          sliderInner.width(totalSlideLength);

        sliderRight.off();

        if(slideItem.length > 3){
          sliderRight.removeClass('disabled');
        }else{
          sliderRight.addClass('disabled');
        }

        sliderRight.on('click', function(e){
           e.preventDefault();
            if((slideCount < slideItem.length-3) && (slideItem.length > 3) && !$(this).hasClass('disabled')){
              sliderLeft.removeClass('disabled');
                slideCount += 3;
                sliderInner.animate({
                    marginLeft: "-="+interval,
                }, 300, function(){
                    if(slideCount >= slideItem.length-3){
                        sliderRight.addClass('disabled');
                    }
                });
            }
        });

        sliderLeft.off();

        sliderLeft.on('click', function(e){
            e.preventDefault();
            if((slideCount >= 3) && !$(this).hasClass('disabled')){
                sliderRight.removeClass('disabled');
                slideCount -= 3;
                sliderInner.animate({
                    marginLeft: "+="+interval,
                }, 300, function(){
                    if(slideCount <= 3){
                        sliderLeft.addClass('disabled');
                    }
                });
            }
        });

    },


  });


  var getObjects = function(obj, key, val) {
      var objects = [];
      $.each(obj, function(i, objVal){
         if (objVal[key] === val) {
            objects.push(objVal);
            return false;
          }
      });
      return objects;
  };
  var getObjectsAssets = function(obj, key, val) {
      var objects = [];
      $.each(obj, function(i, objVal){
         if (objVal["object"][key] === val) {
            objects.push(objVal);
            return false;
          }
      });
      return objects;
  };
  var callVcard = function(dataValues){
    vkmui_modals.renderModal('vcard', '#pageContent', vkmModalTemplateHtml, {
      "modal_title"       : window['vcardLayout_'+window['vcardType']].modal_title,
      "modal_draggable"   : ".widget-body",
      "vcard_entity_obj"  : dataValues,
      "vcard_entity_id"   : window['vcardEntityId'],
      "vcard_entity_type" : window['vcardType'],
      "vcard_default_img" : window['vcardLayout_'+window['vcardType']].default_photo,
      "vcard_related_max" : 5,
      "modal_id"          : "vcard",
      "modal_control_buttons": window['vcardLayout_'+window['vcardType']].control_buttons 
    }, vkmui_modals.vcardModalCallback);

  };
  var toggleLegendCaret = function(toggle, collapsePane){
    $(toggle).on('click', function(){
      if($(collapsePane).hasClass('in')){
        $(toggle).attr('data-icon-before', 'caret-up');
      } else {
        $(toggle).attr('data-icon-before', 'caret-down');
      }
    });
  };
  var getServiceError = function(service, error){
    jQuery.gritter.add({
      title: '',
      text: 'No Knowledge Topic Map to display for the selected User or Filter Values.',
      class_name: 'gritter-error',
      before_open: function(){
        if($('.gritter-item-wrapper').length == 1){
          // Returning false prevents a new gritter from opening
          return false;
        }
      }
    });
    Ember.Logger.error("Issue in fetching "+service+" values ::" + error);
  };     
  var getFilterBadgeCounter= function(category){
    counterName ={
      organizations : "organizationFilterCount",
      locations : "locationFilterCount",
      jobRoles : "jobTitleFilterCount"
    }
    return counterName[category];
  };  

  var showDeviceAlert = function(width, height, displayText){
    $('#successMessageDiv p').text(displayText);
    $('#successMessageDiv').removeClass('hide');
  }

  var removeDeviceAlert = function(){
    $('#successMessageDiv').addClass('hide');
  }
  
  return {
    getObjects : getObjects,
    getObjectsAssets : getObjectsAssets,
    callVcard : callVcard,
    toggleLegendCaret : toggleLegendCaret,
    getServiceError : getServiceError,
    showDeviceAlert : showDeviceAlert,
    removeDeviceAlert : removeDeviceAlert
  }

});



