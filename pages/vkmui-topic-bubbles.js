define(["app", "pages/vkmui-circular-maps", "pages/vkm-sidebar-filters", "services/vkmservices/landingDemoService", "services/vkmservices/topicDemoServices", "raphael"], function(app, vkmui_maps, vkm_sidebar, landing_demo, topic_demo, Raphael){
  vkmui = app.vkmui;
  var  topicConnectionsArr = [{  
      "topic_connection": "communities",
      "topic_data_prefix": "community",
      "topic_section_icon": "community-dark"
    },
    {  
      "topic_connection": "courses",
      "topic_data_prefix": "course",
      "topic_section_icon": "book-open-user"
    },
    {  
      "topic_connection": "files",
      "topic_data_prefix": "file",
      "topic_section_icon": "file-stack-filled"
    },
    {  
      "topic_connection": "blogs",
      "topic_data_prefix": "blog",
      "topic_section_icon": "blog"
    },
    {  
      "topic_connection": "wikis",
      "topic_data_prefix": "wiki",
      "topic_section_icon": "file-globe"
    },
    {  
      "topic_connection": "forums",
      "topic_data_prefix": "forum",
      "topic_section_icon": "chat-bubbles-o"
    }]; 
     var entityObject = {};


     function topicBubbleFontSize(d){
        var innerCircleWidth = (d.r)*1.5,
            fullText      = d.className.substring(0, d.r / 3).split('#')[0],
            fullTextArr   = fullText.split(" "),
            originalSize  = 14,
            maxFontSize   = 19,
            origFontSet   = originalSize+'px arial',
            sizeFactor    = null,
            longestWord   = null;

        if(fullTextArr.length > 1) {

          longestWidth = (fullTextArr.longestString()).calculateTextWidth(origFontSet);
          sizeFactor   = innerCircleWidth / longestWidth;

        } else {

          sizeFactor = innerCircleWidth / fullText.calculateTextWidth(origFontSet); 
        }        

        updatedFontSize = Math.floor(originalSize * sizeFactor);
        if(Math.floor(originalSize * sizeFactor) > maxFontSize){
          updatedFontSize = maxFontSize;
        }

        return updatedFontSize;
    }


    function topicBubbleText(d, lineLimit){
        var topicN = d.className.substring(0, d.r / 3).split('#')[0];
        var topicLinesArr = topicN.createLines({
            numLines: lineLimit,
            widthLimit: (d.r)*1.5,
            fontProps: topicBubbleFontSize(d)+'px Arial, sans-serif',
            elipsize: true            
        });

        var topicLabel = topicLinesArr.join(" "),
        trimmedLabel   = topicLabel.trim(); 

        return trimmedLabel;

    }


   function resetCompareBtn(btn){
      var compareBtn = $(btn);
      compareBtn.removeClass('active')
                .removeAttr('data-map-entity')
                .removeAttr('data-map-view')
                .removeAttr('data-map-filters')
                .attr('disabled', 'disabled');

      // Reset Legend Display
      $('#kmap-legend').removeClass('display-kmap-legend');
      $('#smap-legend').removeClass('display-kmap-legend');

      // Check if Filters Exist, and Reset Legend Positioning
      if(!$('.filter-wrapper').hasClass('filters-active')){
        $('#kmap-legend').removeClass('legend-above-filters');
      }

    }



   function toggleLegendCaret(toggle, collapsePane){
      $(toggle).on('click', function(){
        if($(collapsePane).hasClass('in')){
          $(toggle).attr('data-icon-before', 'caret-up');
        } else {
          $(toggle).attr('data-icon-before', 'caret-down');
        }
      });  
    }

    //entityid= Unique UserId
    //mapContainer = svg size/id
    //mapCategory = Map type: Endorsement or activity etc..
    //compareInfo = To maintain the filter level
    // filterNum = For de
   

// really don't need this function... it's not much different from others... could just add an argument elsewhere and use something else
   
    
    function renderTopic(topicId, experts, thisTopicId) {

      // CIRCLE MAP CONTENT (left side)

      // Clear/Reset (is this necessary since it's handled in the renderConnections also?)
      // Also, what about resetting the right sidebar content?
     
      clearSvg();
      vkm_sidebar.resetFilters();
   
      //$('#map-menu').html('');

      $('#social-map').attr('data-entity', thisTopicId);
      window['currentEntityType'] = 'topic';

      // Default Circle Map View
      vkmui_maps.renderConnections(thisTopicId, 'topic', window['defaultMapLayout'] , 'peoples', 'topics', 'user', expertsArr  ); 
      // SIDEBAR DETAIL (right side)
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
     app.vkmui.topicSlidePanel(topicClickOptions, 'in');
      // RHS Main Elements
      var rhsTabs  = $('.vkm-right-sidebar #tabs-wrap'),
          rhsTopic = $('.vkm-right-sidebar #topic-wrap');

      // Topic Elements
      var topicHeading  = rhsTopic.find('.topic-content-heading h2'),
          topicEntity   = rhsTopic.find('.topic-content-subheading h2'),
          overviewSlide = $('#topic-slide-overview'),
          fullSlide     = $('#topic-slide-full');

      // Current Topic Info
      var lastIndex = topicConnectionsArr.length-1;
      var currentTopicInfo = thisTopicId.capitalizeFirstLetter();

      rhsTabs.hide();
      

      // 1- clear previous content
      //overviewSlide.html('');

      // 2- add in new content 
      topicHeading.html(currentTopicInfo);
      rhsTopic.show();
      $('.vkm-side-tabs').addClass("hide");
       $('.widget-body').addClass('topic-view contracted');
      //openRightSidebar('#rightPanelTabs', '.widget-body');

     
      
      //renderBreadcrumbs(['home', 'topics', 'people'], false, 'Analytics');
       //vkmui_maps.renderBreadcrumbs(['home'], currentUserIsMe , thisTopicId);

    }

   

    function renderComparisonModal(ownerId, topicConnectionObj) {

      var comparisonModal         = $('#vkm-modal-comparison .vkm-modal-content-comparison');
      var comparisonTopicTitle    = comparisonModal.find('.comparison-topic-title h3');
       
      var comparisonBarGraphs     = $('.comparison-topic-levels');
      var comparisonBarItem       = comparisonBarGraphs.find('.comparison-bar-item');
      var comparisonBarLabel      = comparisonBarItem.find('label');
      var comparisonBarRectangle  = comparisonBarItem.find('.comparison-bar-rectangle');
      var comparisonBarCount      = comparisonBarItem.find('.comparison-bar-number');

      // Current Topic Info
      var currentTopicInfo = getCurrentEntity(window['topicData'], 'topic_id', topicConnectionObj['topic_id']),
      
      // Get all my communities/courses/files/blogs/wikis/forums, etc.
      myEntityData     = vkmui_maps.getLinkedData(ownerId, topicConnectionObj['topic_connection'], { 'connectionId': topicConnectionObj['topic_data_prefix']+'_id' }, { 'connectionName': topicConnectionObj['topic_data_prefix']+'_name', 'connectionLink': topicConnectionObj['topic_data_prefix']+'_url' }, 'user', topicConnectionObj['topic_data_prefix']),

      // Get all the communities/courses/files/blogs/wikis/forums, etc. associated with this topic
      allEntityData    = vkmui_maps.getLinkedData(topicConnectionObj['topic_id'], topicConnectionObj['topic_connection'], { 'connectionId': topicConnectionObj['topic_data_prefix']+'_id' }, { 'connectionName': topicConnectionObj['topic_data_prefix']+'_name', 'connectionLink': topicConnectionObj['topic_data_prefix']+'_url' }, 'topic', topicConnectionObj['topic_data_prefix']),
      lastEntityIndex  = allEntityData.length - 1;

      // 1- clear previous content
      fullSlide.html('');

      // 2- add in new content 
      entityTitle.text(topicConnectionObj['topic_connection'].capitalizeFirstLetter()+' on '+currentTopicInfo['topic_name']);
      entityTitle.attr('data-icon-before', topicConnectionObj['topic_section_icon']); // data-icon-before="'+topicConnection['topic_section_icon']+'" 

      // 3- add in sections/data
      // My/Other Sections
      var sectionTemplate  = $('<div class="topic-section topic-complete-section"><h4 class="topic-heading">'+topicConnectionObj['topic_connection'].capitalizeFirstLetter()+'</h4><ul class="topic-item-list topic-full-list"></ul><div class="error-message"><span>There are no '+topicConnectionObj['topic_connection']+' to display</span></div></div>'),
          
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
      $.each(allEntityData, function(t, item){

          if( t < myEntityData.length ) {

              if( item['connectionId'] == myEntityData[t]['connectionId'] ) {

                  mySectionList.append('<li><a href="'+item.connectionLink+'">'+item.connectionName+'</a></li>');
                  myItemCount++;
              
              } else {

                  otherSectionList.append('<li><a href="'+item.connectionLink+'">'+item.connectionName+'</a></li>');
              }

          } else {

              // otherItemsArr.push(item);
              otherSectionList.append('<li><a href="'+item.connectionLink+'">'+item.connectionName+'</a></li>');

          }

          if( t == lastEntityIndex ) {

              if( myItemCount == 0 ) {
                  mySectionError.show();
                  mySectionList.remove();
              }

              if( t == 0 ) {
                  otherSectionError.show();
                  otherSectionList.remove();
              }          

              // // render MY items
              fullSlide.append('<a href="#" class="go-back" data-icon-before="caret-left">Back</a>');
              fullSlide.append(mySectionHtml);
              fullSlide.append(otherSectionHtml);

              displayTopicSlide('full');

              return false;
          }

      });
          


      renderBreadcrumbs(['home'], currentUserIsMe);

    }

    function getCurrentEntity(allArr, entityIdKey, chosenEntityId){

       
        $.grep(allArr, function(entity, i){
            if( typeof(chosenEntityId) != "undefined" && chosenEntityId != null ) {
              if(entity[entityIdKey] == chosenEntityId){
                entityObject = entity;
              }
            } else {
              if(entity[entityIdKey] == $('#social-map').attr('data-entity')){
                entityObject = entity;
              }
            }
        });
        return entityObject;
      };

      

    return{
      renderComparisonModal: renderComparisonModal,
      //renderFullTopic: renderFullTopic,
      renderTopic: renderTopic,
      toggleLegendCaret: toggleLegendCaret,
      resetCompareBtn: resetCompareBtn,
      topicBubbleText: topicBubbleText,
      topicBubbleFontSize: topicBubbleFontSize,
      getCurrentEntity: getCurrentEntity,
     }
  });

