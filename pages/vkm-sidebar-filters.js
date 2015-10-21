define(["app", "services/vkmservices/landingDemoService", "services/vkmservices/landingDemoService", "services/vkmservices/topicDemoServices"],function(app, landing_demo, topic_demo){

  vkmui = app.vkmui;
/* --------------- RIGHT SIDEBAR
/* ----------------------------------------------------------------------------------------------- */
function initRightNavClickEvents(){


    var rightNav  = '#rightPanelTabs',
        appBody   = '.widget-body',
        slideCls  = 'nav-slide',
        activeCls = 'active',
        slideTmr  = 150;
    var topicClickOptions = {
        slidePanelEl:'#rightPanelTabs',
        appBody:'.widget-body', 
        slideAnimCls:'nav-slide',
        slideActiveCls:'active', 
        slideTimer: 150, 
        topicSearchField: '#searchTopicsInput',
        topicFormWrap: '#searchTopicsForm',
        topRightPanelTabs: '.vkm-top-panel-right',
        showTopicDetailCls: 'show-topic-contents'
    };

    $('body').on('click', function(e){

        isBodyOnclickEvent = true;


        var thisClickTarget = $(e.target),
            targetElClasses = thisClickTarget.attr('class'),
            kmapTopic       = null;

          if( thisClickTarget.is('.vkm-side-tabs li a span') ){
            var filterClicked = "#"+thisClickTarget.html();
                 App.vkmui.filterPopulate(filterClicked);
        
            if( $(rightNav).hasClass('show-topic-contents') ) {
              $(rightNav).removeClass('show-topic-contents');
            }

            if( $(rightNav).hasClass('topic-contents-hidden') ) {
              $(rightNav).removeClass('topic-contents-hidden');
            }

            //to clear the search text and show the items on icon click
            if(filterClicked === "#Organization"){
              $('#narrow-organizations').val('');
              $("#orgList li").show();
            }else if(filterClicked === "#Location"){
              $('#narrow-locations').val('');
              $("#locationList li").show();
            }else{
              $('#narrow-jobtitles').val('');
              $("#jobTitleList li").show();
            }

            if( !$(rightNav).hasClass('active') ) {

              if(thisClickTarget.parent().attr('disabled')){
                return false; 
              } else {
                App.vkmui.slidePanel(rightNav, appBody, slideCls, activeCls, 'in', slideTmr);
              }

            } else {
                var filterClicked = "#"+thisClickTarget.html();
                 App.vkmui.filterPopulate(filterClicked);

              }
            openRightSidebar('#rightPanelTabs', '.widget-body');
        }
        if( thisClickTarget.attr('data-icon-before') && thisClickTarget.parent('a').attr('data-toggle') ){
            openRightSidebar('#rightPanelTabs', '.widget-body');
        }

        if( ( thisClickTarget.is('span.filter-text') || thisClickTarget.is('i.icon-remove') ) && (thisClickTarget.parent().parent()).hasClass('remove-all-filters') ) {
            clearAllFilters();
            closeRightSidebar('#rightPanelTabs', '.widget-body');
        }

        if(thisClickTarget.is('.toggle-desktop-sidebar')){
          e.preventDefault();
          if($('.widget-body').hasClass('contracted')) {
            //closeRightSidebar('#rightPanelTabs', '.widget-body');
            app.vkmui.topicSlidePanel(topicClickOptions, 'out');
            $('.widget-body').removeClass("contracted");
          } else {
            //openRightSidebar('#rightPanelTabs', '.widget-body');
            app.vkmui.topicSlidePanel(topicClickOptions, 'in');
            $('.widget-body').addClass("contracted");
          }
        }

        if( thisClickTarget.is('a.filter-link') ||
            thisClickTarget.is('.widget-body-inner') ||
            thisClickTarget.is('#map-content') ||
            thisClickTarget.is('#map-menu') ||
            thisClickTarget.is('svg') ||
            thisClickTarget.is('g') || 
            thisClickTarget.is('.node') || 
            thisClickTarget.is('circle') ||  
            thisClickTarget.is('image') || 
            thisClickTarget.is('foreignobject') || 
            thisClickTarget.is('p.topic-bubble-title') ) {

            // check for topic active or not
            closeRightSidebar('#rightPanelTabs', '.widget-body');
            
        }

        if( thisClickTarget.is('.display-full-topic') ){

            kmapTopic = thisClickTarget.parent('.topic-overview-section');
            overviewSection = kmapTopic.attr("data-topic-connection");
            switch(overviewSection){
            case "communities":
              relatedCommunities = relatedCommunities.slice(0,10);
                communityarry.forEach(function(community){
                  community.communityURI = community.communityURI.substring(community.communityURI.lastIndexOf('/')+1);
                });
              renderFullTopic(userName, communityarry, relatedCommunities, overviewSection);
              break;

            case "courses":
              relatedCourses = relatedCourses.slice(0,10);
              courses = courses.slice(0,10);
              courses.forEach(function(course){
                course.url = course.url.substring(course.url.lastIndexOf('/')+1);
              });
              renderFullTopic(userName, courses, relatedCourses, overviewSection);
              break;

            case "files":
             landing_demo.getAssets("document", skillLabel).then(function(files){
                relatedDocuments = relatedDocuments.slice(0,10);
                files.forEach(function(doc){
                  doc.assetURL = doc.assetURL.substring(doc.assetURL.lastIndexOf('/')+1);
                });
                renderFullTopic(userName, files, relatedDocuments, overviewSection);
              });
              break;

            case "blogs":
              landing_demo.getAssets("blog", skillLabel).then(function(blog){
                relatedBlogs = relatedBlogs.slice(0,10);
                blog.forEach(function(blog){
                  blog.assetURL = blog.assetURL.substring(blog.assetURL.lastIndexOf('/')+1);
                });
                renderFullTopic(userName, blog, relatedBlogs, overviewSection);
              });
              break;

            case "forums":
              landing_demo.getAssets("forum", skillLabel).then(function(forum){
                relatedForums = relatedForums.slice(0,10);
                forum.forEach(function(forum){
                  forum.assetURL = forum.assetURL.substring(forum.assetURL.lastIndexOf('/')+1);
                });
                renderFullTopic(userName, forum, relatedForums, overviewSection);
              });
              break;

            case "wikis":
              landing_demo.getAssets("wiki", skillLabel).then(function(wiki){
                relatedWikis = relatedWikis.slice(0,10);
                wiki.forEach(function(wiki){
                  wiki.assetURL = wiki.assetURL.substring(wiki.assetURL.lastIndexOf('/')+1);
                });
                renderFullTopic(userName, wiki, relatedWikis, overviewSection);
              });
              break;

            default:
              renderFullTopic(userName, relatedCommunities, communityarry, overviewSection);
              break;   
            }
            //renderFullTopic(userName, { "topic_id": kmapTopic.attr('data-topic-id'), "topic_connection": kmapTopic.attr('data-topic-connection'), "topic_data_prefix": kmapTopic.attr('data-topic-prefix'), "topic_section_icon": thisClickTarget.attr('data-icon-before') })
            
        }

        if( thisClickTarget.is('.go-back') ) {
            e.preventDefault();
            displayTopicSlide('overview');
        }

    });

      //code for autocomplete
    $('.search-filters').keyup(function(){
      var elemId = this.id;
      var elemAutoComplete;
      if(this.id === "narrow-organizations"){
        elemAutoComplete = "orgList";
      }else if(this.id === "narrow-locations"){
        elemAutoComplete = "locationList";
      }else{
        elemAutoComplete = "jobTitleList";
      }
      showAutoComplete(elemId, elemAutoComplete);
    });
}

var showAutoComplete = function(elem, elemModify){
    var valThis = $('#'+elem).val().toLowerCase();
    if(valThis == ""){
        $('#'+elemModify+' > li').show();
    } else {
        $('#'+elemModify+' > li').each(function(){
            var text = $(this).text().toLowerCase();
            (text.indexOf(valThis) >= 0) ? $(this).show() : $(this).hide();
            //(text.indexOf(valThis) >= 0) ? showHighlight(this, valThis) : $(this).hide();
        });
   };
}

//will be used while implementing highlight functionality
var showHighlight = function(elemSearch, txt){
  var elem = elemSearch;
  var txtSelect = txt;
  $(elem).show();
  //var re = new RegExp("^" + txtSelect, "i");
  //$(elem).text().replace(re,'<span style="color:white;">' + txtSelect + '</span>');
}



function displayTopicSlide(panelView){

  $('#topic-wrap').attr('data-topic-view', panelView);

  // detect animation end and hide/show the corresponding panels as needed

}



function closeRightSidebar(rightNavEl, pageBodyEl){
  if($(rightNavEl).hasClass('active')){
      $(rightNavEl).addClass('nav-slide-out');
      $(pageBodyEl).removeClass('contracted');

    detectAnimationEnd(rightNavEl, function(){
      $(rightNavEl).removeClass('active').removeClass('nav-slide-out');
      $('.vkm-side-tabs li').removeClass('active');
      $(rightNavEl).off();
    }); 
  }  
}

function detectAnimationEnd(el, callback){
    $(el).on('animationend webkitAnimationEnd oAnimationEnd oanimationend MSAnimationEnd msAnimationEnd', function(evt) {
        //console.log(evt);
        if(typeof callback === 'function'){
            setTimeout(callback(), 150);
        }
        $(this).off();  
    });
}
            
function openRightSidebar(rightNavEl, pageBodyEl){
if(!$(rightNavEl).hasClass('active')){
      $(rightNavEl).addClass('nav-slide-in');
      $(pageBodyEl).addClass('contracted');
      
      detectAnimationEnd(rightNavEl, function(){   
        $(rightNavEl).addClass('active').removeClass('nav-slide-in');
        $(rightNavEl).off();
      }); 
  }
} 

function clearAllFilters(){

  if(allFilters.length > 0){

    resetFilters();

    if($('#vkm-alert').hasClass('active')){
      maxFiltersAlert['showHide'] = 'hide';
      vkmAlert(maxFiltersAlert);
    }
    
    var currentEntityId = $('#social-map').attr('data-entity'),
    currentAggregateMap = $('#map-content').attr('data-current-aggregate');

    clearSvg();

    window.compareInfo['hideComparison'] = false;

    createKnowledgeMap(currentEntityId, 'map-content', currentAggregateMap, window['compareInfo'], 1);    

  } else {

    console.log('Error: There are no filters to be cleared');
  }
}


/* --------------- FILTERS
/* ----------------------------------------------------------------------------------------------- */


/* -- Tab Filters
----------------------------------------
  Specify the tab element to intiate; 
  This function controls adding/removing of filters, and simulated reloading of data
*/

function tabFilters(filtersPanelWrap, filterLoadPause){

  var tabPane      = $(filtersPanelWrap),
  tabFilterList    = tabPane.find('.tab-summary-list'),
  tabFilterItem    = tabFilterList.find('li'),
  vkmPageContent   = $('.vkm-page-content');
  // wrapperWidth     = $('.tab-summary-list').width()+5; // max-width for establishing tooltip text
  
  filterLoader     = $('.filter-loader');
  currentFilters   = $('#current-filters');
  tabIds           = [];        
  allFilters       = [];
  allFiltersJson   = [];
  
  loadingFilters   = false; // simulate pause while new filter data loaded


  // CLIK
  tabFilterItem.on('click', function(e){

    e.preventDefault();

    var thisFilter = $(this);

    if(loadingFilters === false){

      // Toggle Filter Item (on Sidebar)
      if(!thisFilter.hasClass('active')){

        if(allFilters.length <= 4){ // Limit to 5 filters max

          allFilters.push({ 
            "term":thisFilter.data('title'), 
            "category":thisFilter.data('category'),
            "uri":thisFilter.attr('data-uri-info')
          });
          
          thisFilter.addClass('active');

          $('#kmap-legend').addClass('legend-above-filters');

        } else {

          maxFiltersAlert['showHide'] = 'show';
          vkmAlert(maxFiltersAlert);

          return false;
          
        }

      } else if(thisFilter.hasClass('active')){

        removeFilterItem(thisFilter.data('title'));
        thisFilter.removeClass('active');
      }

      // Reset Filters Panel
      regenerateFilterTags();

      updateBadges($(this));

      // console.log('allFilters.length = '+ allFilters.length);

      filterAggregateBubbles('#map-content', (allFilters.length+1));

    } // loadingFilters

  });
}




function filterAggregateBubbles(mapContainer, filterLevel){
  
  clearSvg();

  var currentAggregateMap = null,
      filterArg           = null;
  
  if( typeof($(mapContainer).attr('data-current-aggregate')) != "undefined" && $(mapContainer).attr('data-current-aggregate') != null ){
    currentAggregateMap = $(mapContainer).attr('data-current-aggregate');
    window.compareInfo['hideComparison'] = false;
  } else {
    currentAggregateMap = "endorsements";
    window.compareInfo = {};
  }

  if( typeof(filterLevel) != "undefined" && filterLevel != null ){
    filterArg = filterLevel;
  } else {
    filterArg = 1;
    filterLevel = 1;
  }  



  createKnowledgeMap(entityId, 'map-content', currentAggregateMap, window['compareInfo'], filterArg);
}





function resetFilters(){
  
  // Reset Arrays  
  allFilters       = [];
  allFiltersJson   = [];
  currentFilters   = $('#current-filters');
  // Hide Filter Container
  $('.filter-wrapper').removeClass('filters-active');
  currentFilters.html(''); // Remove Filters Tags

  // Uncheck all Sidebar Filters
  $('.tab-filter-pane li').removeClass('active');
  
  // Clear Badges
  $('.badge-filter-count').html('').removeClass('show-badge');  

  loadingFilters   = false;

}



// Reset Filters Tags Panel
function regenerateFilterTags(){

  currentFilters.html('');
  if(allFilters.length > 0){    
    $('.filter-wrapper').addClass('filters-active');

  } else {

    $('.filter-wrapper').removeClass('filters-active');
  }     

  $.map(allFilters, function(item) {
      // Generate new tag

      var tagTextWidth    = item.term.calculateTextWidth('15px arial');

      var newFilterTag    = $('<span class="filter-tag" style="width:'+tagTextWidth+'px;"><span class="inner-info"><span data-categ="'+item.category+'" data-info="'+item.term+'" class="filter-text eclipse-text">'+item.term+'</span> </span></span>'),
          removeFilterBtn = $('<a title="Remove Filter" class="icon-x-thin remove-filter"></a>'),
          clearAllTags    = $('<span class="filter-tag remove-all-filters clear-all-btn"><span class="inner-info"><i class="icon-remove"></i> <span class="filter-text">Clear All Filters</span> </span></span>'),
          clearAllBtn     = null;

          removeFilterBtn.data('title', item.term).attr('data-categ', item.category);

      // Add Removal Button to New Filter
      newFilterTag.find('.filter-text').after(removeFilterBtn);

      // Append Filter Tag to Filter Container
      // var currFilterHtml = currentFilters.html();
      // currentFilters.find('h5').remove();
      currentFilters.find('.clear-all-btn').remove();


      $('.filter-wrapper').find('h5').remove();
      $('.filter-wrapper').prepend('<h5>('+allFilters.length+'/5) Filters: </h5>');
      // currentFilters.prepend('<h5>('+allFilters.length+'/5) Filters: </h5>');
      currentFilters.append(newFilterTag);  
      currentFilters.append(clearAllTags);  

      if(allFilters.length <= 0){            
        currentFilters.append(clearAllTags); 
        $('.filter-wrapper').removeAttr('data-filter-total');
      } else {
        $('.filter-wrapper').attr('data-filter-total', allFilters.length);
      }
      
      // Bind click for removing the same tag
        // CLIK
      removeFilterBtn.on('click', function(e){
          e.preventDefault();

          if(allFilters.length == 5 && $('#vkm-alert').hasClass('active')){
            maxFiltersAlert['showHide'] = 'hide';
            vkmAlert(maxFiltersAlert);
          }
          
          if(loadingFilters === false){
            removeFilterItem(removeFilterBtn.data('title'));
            removeFilterfrmArray(removeFilterBtn.attr('data-categ'));
            closeRightSidebar('#rightPanelTabs', '.widget-body');       

            $('.tab-pane#'+removeFilterBtn.attr('data-categ')+' .tab-summary-list li').each(function(){
                if($(this).data('title') === removeFilterBtn.data('title')){
                  $(this).removeClass('active');
                }
            });
          
            regenerateFilterTags();
            updateBadges($(this));

            filterAggregateBubbles('#map-content', (allFilters.length+1));
            
          }
      });

  });
}



// Count and Update Badges
function updateBadges(clickedElement){

  var filterCatg = $(clickedElement).attr('data-categ'),
  filterTab  = $('.tab-pane#'+filterCatg),
  tabBadge   = $('.badge-filter-count.'+filterCatg+'-badge'),
  onFilters  = filterTab.find('.tab-summary-list li.active'),
  badgeCount = onFilters.length;

  if(badgeCount > 0){
    tabBadge.text(badgeCount);
    tabBadge.addClass('show-badge');
  } else {
    tabBadge.removeClass('show-badge');
  }
}



function removeFilterItem(matchValue) {
  allFilters = $.grep(allFilters, function(item) { 
    return item.term != matchValue; 
  });
}



function removeFilterfrmArray(filterTerm) {
   
  allFiltersJson = $.grep(allFiltersJson, function(item) { 
    return item.category != filterTerm; 
  });
   
}







function toggleOriginalFilters(el, arg){
  if(arg === "hide"){
    $(el).addClass('search-enabled');
  } else {
    $(el).removeClass('search-enabled');
  }
}






function initFilterAutocomplete(category, searchResultsObj){
  $('#narrow-' + category).autocomplete({
      appendTo: '#' + category + ' .tab-summary',

    open: function( event, ui ) {
      toggleOriginalFilters('.tab-pane.active .tab-summary', 'hide');
      $('.tab-pane.active .search-box .autocomplete-close').show();
      $(".ui-autocomplete:visible").css({top:"0", left:"0", overflow: "visible"});

        // apply 'tab filter' functionality to dynamic results + add ability to remove

        if(allFilters.length < 5){ 

          var thisFilter = $(this);

             if(loadingFilters === false){

            // Toggle Filter Item (on Sidebar)
              if(!thisFilter.hasClass('active')){
                  
                  allFilters.push({ 
                    "term":thisFilter.data('title'), 
                    "category":thisFilter.data('category'),
                    "uri":thisFilter.attr('data-uri-info')
                  });
                  
                  thisFilter.addClass('active');

              } else if(thisFilter.hasClass('active')){

                  removeFilterItem(thisFilter.data('title'));
                  thisFilter.removeClass('active');
              }

            // Reset Filters Panel
              regenerateFilterTags();

              updateBadges($(this));
              
              //execute the redraw function
              // redrawKmap();
          }

        } else {
          return false;
        }

    },

    close: function( event, ui ) {
      toggleOriginalFilters('#' + category +' .tab-summary', 'show');
      $('.tab-pane.active .search-box .autocomplete-close').hide();
      $(this).val('');
    },

    source: function(req, responseFn) {
        
        var re = $.ui.autocomplete.escapeRegex(req.term);
        var matcher = new RegExp( "^" + re, "i" );
        var a = $.grep( searchResultsObj, function(item,index){
            return matcher.test(item.filter);
        });
        responseFn(a);
    },

    select: function(value, data){ // when filters is clicked:
        if (typeof data == "undefined") {
        } else {  
            $('#' + category + ' .tab-summary-list').prepend('<li class="active" title="'+ data.item.filter +'" title="'+ data.item.category +'"><a class="filter-link" href="#">'+ data.item.filter +'</a></li>');
            $(this).val('');
        }
    }
  }).autocomplete("widget").addClass("searched-filter-list");

}

// Highlight Letters
function highlightMatchedLetter() {
  $.ui.autocomplete.prototype._renderItem = function( ul, item) {
      var re = new RegExp("^" + this.term, "i");
      var t = item.filter.replace(re,'<span style="color:white;">' + this.term + '</span>');
      return $( '<li title="' + item.filter + '" data-categ="' + item.category + '"></li>' )
          .data( 'item.autocomplete', item )
          .append( '<a class="filter-link" href="#">' + t + '</a>' )
          .appendTo(ul);
  };
} 





function applyTooltip(item, itemCatg, containerWidth, tooltipOptions){
    var thisItem  = item;
        thisLink  = thisItem.find('a'),
        textWidth = thisLink.text().calculateTextWidth('16px arial');

    if(textWidth > containerWidth){
      thisItem.addClass('long-text');
      thisItem.tooltip(tooltipOptions);
    }

    thisItem.data('category', itemCatg);

    if(thisItem.attr('title') !== "" && thisItem.attr('title') !== null && typeof thisItem.attr('title') !== "undefined"){
        thisItem.data('title', thisItem.attr('title'));
    } else {
        thisItem.data('title', thisItem.attr('data-original-title'));
    }             
}





function initializeTab(tabId, resultsObj, maxDisplay, tooltipOptions){

    var thisTab = $('#rightPanelTabs').find('.tab-filter-pane#'+tabId),
    thisList    = thisTab.find('.tab-summary-list');
    tabWidth    = thisList.width()+5,
    newFilter   = null;

    $.each(resultsObj, function(i){
      if(i < maxDisplay && resultsObj[i].filter !== ""){ // max to display
        newFilter = $('<li title="'+resultsObj[i].filter+'" data-categ="'+resultsObj[i].category+'"><a class="filter-link" href="#">'+resultsObj[i].filter+'</a></li>');
        thisList.append(newFilter); 
        applyTooltip(newFilter, resultsObj[i].category, tabWidth, tooltipOptions);
      }
    });

    tabFilters('#'+tabId);
    initFilterAutocomplete(tabId, resultsObj);

}


function initializeRightSidebar(tabTooltipOptions){

    /*---- LOAD ALL DATA INITIALLY
    ------------------------------------------------------------*/
    $.ajaxSetup({ cache: false });

    $.when(

        $.getJSON( 'assets/data/sample-filters/organizations.json' ),
        $.getJSON( 'assets/data/sample-filters/locations.json' ),
        $.getJSON( 'assets/data/sample-filters/jobtitles.json' )

    ).done(function(data1, data2, data3) {

        window['organizationFilters'] = data1[0];
        window['locationFilters']     = data2[0];
        window['jobtitleFilters']     = data3[0];

        // initializeTab('people', 'peopleObj');
        initializeTab('organizations', window['organizationFilters'], 20, tabTooltipOptions);
        initializeTab('locations', window['locationFilters'], 20, tabTooltipOptions);
        initializeTab('jobtitles', window['jobtitleFilters'], 20, tabTooltipOptions);

        highlightMatchedLetter();

        initRightNavClickEvents();

    });

}

 function renderFullTopic(ownerId, myEntityData, allEntityData, overviewSection) {

      // console.log('owner: '+ownerId);
      // console.log('topicConnectionObj: ');
      // console.log(topicConnectionObj)

      // RHS Main Elements
      var rhsTopic    = $('.vkm-right-sidebar #topic-wrap');

      // Topic Elements
      var entityTitle = rhsTopic.find('.topic-content-subheading h2'),
          fullSlide   = $('#topic-slide-full');
          topic_heading = rhsTopic.find('.topic-content-heading h2').text();

      // 2- add in new content 
      entityTitle.text(overviewSection.capitalizeFirstLetter()  + ' on ' +  topic_heading.capitalizeFirstLetter());
       // data-icon-before="'+topicConnection['topic_section_icon']+'" 
      fullSlide.html('');

      // 3- add in sections/data
      // My/Other Sections
      var sectionTemplate  = $('<div class="topic-section topic-complete-section"><h4 class="topic-heading">'+overviewSection+'</h4><ul class="topic-item-list topic-full-list"></ul><div class="missing-data-message"><p class="error-message">There are no communities to display</p></div></div>');
          
      mySectionHtml    = sectionTemplate.clone().addClass('my-section'),
      mySectionList    = mySectionHtml.find('.topic-item-list'),
      mySectionError   = mySectionHtml.find('.error-message'),
      myItemCount      = 0,

      otherSectionHtml = sectionTemplate.clone().addClass('other-section'),
      otherSectionError= otherSectionHtml.find('.error-message'),
      otherSectionList = otherSectionHtml.find('.topic-item-list'),
      otherItemCount   = 0;

      mySectionHtml.find('.topic-heading').prepend('My ');
      otherSectionHtml.find('.topic-heading').prepend('Other ');

      // Loop through and check IDs that match, and append data
      switch(overviewSection){
      
        case "communities":
              entityTitle.attr('data-icon-before', "community-dark");
              mySectionError.text("No Communities to display");
              otherSectionError.text("No Communities to display");;
              if(myEntityData.length !=0){
                $.each(myEntityData , function (i,item){
                 
                    mySectionList.append('<li><a title="'+item.communityName+'" href="#/community/'+item.communityURI+'">'+item.communityName+'</a></li>');
                 });
              }
              else{
                  mySectionError.show();
                  mySectionList.remove();
               }
                      
             if(allEntityData.length != 0){
              $.each(allEntityData, function (i,item){
                
                   otherSectionList.append('<li><a title="'+item.communityName+'" href="#/community/'+item.communityURI+'">'+item.communityName+'</a></li>');

               });
            }else{

                  otherSectionError.show();
                  otherSectionList.remove();
              }
             
              fullSlide.append('<a href="#" class="go-back" data-icon-before="caret-left">Back</a>');
              fullSlide.append(mySectionHtml);
              fullSlide.append(otherSectionHtml);
              displayTopicSlide('full');

              return false;
              break;
              
        case "courses":
                entityTitle.attr('data-icon-before', "book-open-user");
                mySectionError.text("No Courses to display");
                otherSectionError.text("No Courses to display");
                if(myEntityData.length != 0){
                  $.each(myEntityData , function (i,item){
                      
                        mySectionList.append('<li><a title="'+item.displayName+'" href="#/learningCourse/'+item.url+'">'+item.displayName+'</a></li>');
                    });
                 }
                 else{
                    mySectionError.show();
                    mySectionList.remove();
                 }
                        
                if(allEntityData.length != 0){  
                  $.each(allEntityData, function (i,item){
                    
                       otherSectionList.append('<li><a title="'+item.courseName+'" href="#/learningCourse/'+item.courseId+'">'+item.courseName+'</a></li>');

                    });
                }else{

                      otherSectionError.show();
                      otherSectionList.remove();
                    }
                
                
                fullSlide.append('<a href="#" class="go-back" data-icon-before="caret-left">Back</a>');
                fullSlide.append(mySectionHtml);
                fullSlide.append(otherSectionHtml);
                displayTopicSlide('full');

                return false;
                break;

        case "files" :
                entityTitle.attr('data-icon-before', "file-stack-filled");
                mySectionError.text("No Files to display");
                otherSectionError.text("No Files to display");
                if(myEntityData.length != 0){
                  $.each(myEntityData , function (i,item){
                      
                        mySectionList.append('<li><a title="'+item.assetTitle+'" href="#/document/'+item.assetURL+'">'+item.assetTitle+'</a></li>');
                     });
                }
               else{
                  mySectionError.show();
                  mySectionList.remove();
                 }
                      
                if(allEntityData.length != 0){  
                  $.each(allEntityData, function (i,item){
                    
                       otherSectionList.append('<li><a title="'+item.assetTitle+'" href="#/document/'+item.assetURL+'">'+item.assetTitle+'</a></li>');

                  });
                }else{

                      otherSectionError.show();
                      otherSectionList.remove();
                    }
                

                fullSlide.append('<a href="#" class="go-back" data-icon-before="caret-left">Back</a>');
                fullSlide.append(mySectionHtml);
                fullSlide.append(otherSectionHtml);
                displayTopicSlide('full');

                return false;
                break;
        case "blogs":
                entityTitle.attr('data-icon-before', "blog");
                mySectionError.text("No Blogs to display");
                otherSectionError.text("No Blogs to display");
                otherSectionError
                if(myEntityData.length != 0){
                  $.each(myEntityData , function (i,item){
                     
                        mySectionList.append('<li><a title="'+item.assetTitle+'" href="#/blog/'+item.assetURL+'">'+item.assetTitle+'</a></li>');
                   });
                }
                 else{
                    mySectionError.show();
                    mySectionList.remove();
                 }
                          
                if(allEntityData.length != 0){  
                  $.each(allEntityData, function (i,item){
                    
                       otherSectionList.append('<li><a title="'+item.assetTitle+'" href="#/blog/'+item.assetURL+'">'+item.assetTitle+'</a></li>');

                  });
                }else{
                    otherSectionError.show();
                    otherSectionList.remove();
                  }
                
                  fullSlide.append('<a href="#" class="go-back" data-icon-before="caret-left">Back</a>');
                  fullSlide.append(mySectionHtml);
                  fullSlide.append(otherSectionHtml);
                  displayTopicSlide('full');

                  return false;
                  break;

        case "forums"  :
                entityTitle.attr('data-icon-before', "chat-bubbles-o");
                mySectionError.text("No Forums to Display");
                otherSectionError.text("No Forums to Display");
               if(myEntityData.length != 0){
                   $.each(myEntityData , function (i,item){
                       
                          mySectionList.append('<li><a title="'+item.assetTitle+'" href="#/question/'+item.assetURL+'">'+item.assetTitle+'</a></li>');
                     });
                  }
                   else{
                      mySectionError.show();
                      mySectionList.remove();
                   }
                            
                 
                  if(allEntityData.length != 0){
                    $.each(allEntityData, function (i,item){
                      otherSectionList.append('<li><a title="'+item.assetTitle+'" href="#/question/'+item.assetURL+'">'+item.assetTitle+'</a></li>');
                    });

                  }else{

                        otherSectionError.show();
                        otherSectionList.remove();
                      }
                  
                  fullSlide.append('<a href="#" class="go-back" data-icon-before="caret-left">Back</a>');
                  fullSlide.append(mySectionHtml);
                  fullSlide.append(otherSectionHtml);
                  displayTopicSlide('full');

                  return false;
                  break;

        case "wikis":
                entityTitle.attr('data-icon-before', "file-globe");
                mySectionError.text("No Wikis to display")
                otherSectionError.text("No Wikis to display");
              if(myEntityData.length != 0){
                 $.each(myEntityData , function (i,item){
                    
                      mySectionList.append('<li><a title="'+item.assetTitle+'" href="#/wiki/'+item.assetURL+'">'+item.assetTitle+'</a></li>');
                  });
               }
                 else{
                    mySectionError.show();
                    mySectionList.remove();
                 }
                        
              if(allEntityData.length != 0){ 
                $.each(allEntityData, function (i,item){
                 
                     otherSectionList.append('<li><a title="'+item.assetTitle+'" href="#/wiki/'+item.assetURL+'">'+item.assetTitle+'</a></li>');

                  });
               }else{

                    otherSectionError.show();
                    otherSectionList.remove();
                  }
               
                fullSlide.append('<a href="#" class="go-back" data-icon-before="caret-left">Back</a>');
                fullSlide.append(mySectionHtml);
                fullSlide.append(otherSectionHtml);
                displayTopicSlide('full');

                return false;
                break;

        default:
                $.each(myEntityData , function (i,item){
                if(myEntityData.length!= 0){
                  mySectionList.append('<li><a href="'+item.communityURI+'">'+item.communityName+'</a></li>');
               }
               else{
                  mySectionError.show();
                  mySectionList.remove();
               }
                      
              });
              $.each(allEntityData, function (i,item){
                if(allEntityData.length != 0){
                   otherSectionList.append('<li><a href="'+item.communityURI+'">'+item.communityName+'</a></li>');

                }else{

                  otherSectionError.show();
                  otherSectionList.remove();
                }
                  fullSlide.append('<a href="#" class="go-back" data-icon-before="caret-left">Back</a>');
                  fullSlide.append(mySectionHtml);
                  fullSlide.append(otherSectionHtml);
                  displayTopicSlide('full');

                  return false;

              });
              break;
              
        }

      //renderBreadcrumbs(['home'], false);

    };
return{
    initializeRightSidebar: initializeRightSidebar,
    initializeTab: initializeTab,
    applyTooltip: applyTooltip,
    highlightMatchedLetter: highlightMatchedLetter,
    initFilterAutocomplete: initFilterAutocomplete,
    toggleOriginalFilters: toggleOriginalFilters,
    removeFilterfrmArray: removeFilterfrmArray,
    removeFilterItem: removeFilterItem,
    updateBadges: updateBadges,
    regenerateFilterTags: regenerateFilterTags,
    resetFilters: resetFilters,
    filterAggregateBubbles: filterAggregateBubbles,
    tabFilters : tabFilters,
    clearAllFilters: clearAllFilters,
    openRightSidebar: openRightSidebar,
    closeRightSidebar: closeRightSidebar,
    displayTopicSlide: displayTopicSlide,
    initRightNavClickEvents: initRightNavClickEvents,
    detectAnimationEnd : detectAnimationEnd,
    renderFullTopic : renderFullTopic
}
});