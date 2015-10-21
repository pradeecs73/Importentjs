define(["app", "raphael", "services/vkmservices/landingDemoService", "pages/vkm-sidebar-filters"], function(app, Raphael, landing_demo, vkm_sidebar){
  vkmui = app.vkmui;
  var defaultRelationStyles;
  
/* --------------- RENDER MAP DATA 
/* ---------------------------------------------------------------------------------------- */     
function adjustStartAngle(totalMapNodes){

  var irregularNodeTotals = {
    3: 180,
    5: 90,
    7: 180,
    9: 45,
    12: 180
  }; 

  $.each( irregularNodeTotals, function( key, val ) {
    if(totalMapNodes == key){
      angle = val;
    }
  });

  return angle;
}




/** 
  
  * Description: Takes an image source path and desired dimensions for fitting canvas-generated image into SVG node

  * Arguments: 

      {String} imagePath : source image path (.png, .jpg), can be any shape or dimensions
      {Number} newWidth  : the desired image width desired
      {Number} newHeight : the desired image height desired
      {Object} svgNode   : the SVG node into which the resized canvas-generated image will be added/filled

  * Return

      {SVG Object} the returned SVG object will have the 'fill' property added with the url to the newly canvas-generated image

*/
function svgNodeImageFit(imagePath, newWidth, newHeight, svgNode) {

  var newImgSrc = null,
      imageObj  = new Image();

  function resizeImageSrc(imageObj) {

    if(typeof(context) != "undefined"){
      context.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
      context = null;
    }

    var imgCanvas = document.createElement('canvas'),
        pageBody  = document.getElementsByTagName("body")[0];

        imgCanvas.id = "newImageCanvas";
        imgCanvas.width = newWidth;
        imgCanvas.height = newHeight;
        imgCanvas.style.display = "none";
        pageBody.appendChild(imgCanvas);

    var context = imgCanvas.getContext('2d');

    context.drawImage(imageObj, 0, 0, imgCanvas.width, imgCanvas.height);

    return imgCanvas.toDataURL();

  }

  imageObj.src = imagePath;

  imageObj.onload = function() {
    newImgSrc = resizeImageSrc(this);
    svgNode.attr('fill', 'url('+newImgSrc+')');
  };
}



function createOuterNodes(dataArr, svgMapContainer, mapLayoutObj, connectionType, dataPrefix, errorArgs){

    angle                 = 240;
    
    var fillColor         = "none",
    strokeColor           = "#000",
    strokeWidth           = 2,
    strokeCategory        = null,
    expertEmailiId        = "",
    expertID              = "",
    communityUrl          = "",
    coursesUrl            = "",
    assetsUrl             = "",
    urlId                 = "";



    // For Bubble Error 
    if(typeof(errorArgs) !== "undefined"){
      angle               = errorArgs['node_angle'];
      fillColor           = errorArgs['fill_color'];
      strokeColor         = errorArgs['stroke_color'];
      strokeWidth         = 3;
    }

    if(dataArr.length != 0){

    $.each(dataArr, function(n, outerNodeItem) {
      //console.log(connectionType + "||connectiontype--username||" + outerNodeItem.displayName);
      var checkEmptyData =  (connectionType === 'people' && outerNodeItem.userName === "") ||(connectionType === 'peoples' && outerNodeItem.userName == "") ||(connectionType === 'topics' && outerNodeItem == "") ||
      (connectionType === 'communities' && outerNodeItem.communityName === "") || 
      ((connectionType === 'files' || connectionType === 'courses' || connectionType === 'blogs' || connectionType === 'forums' || connectionType === 'wikis') && (outerNodeItem.displayName === ""));

      if(checkEmptyData && (dataArr.length <= 1)){
        svgMapContainer.circle((mapLayoutObj.radius), (mapLayoutObj.radius), 200).attr({
          fill: "none",
          "stroke-width": 2,
          "stroke": "#e8e9ea"
        });
      }

        // Item
        var circleNode = svgMapContainer.circle(mapLayoutObj.radius, mapLayoutObj.vertical, mapLayoutObj.nodeRadius)
        .attr({
          "fill": fillColor,
          "stroke": strokeColor, 
          "stroke-width": strokeWidth, 
          "transform": "r" + angle + " "+mapLayoutObj.radius+" "+mapLayoutObj.radius
        });

        if(typeof(outerNodeItem.connectionRel) != "undefined") {

          strokeCategory = defaultRelationStyles[connectionType];

          if( strokeCategory['indirect'].indexOf(outerNodeItem.connectionRel) > -1 ) {
            // draw dotted/dashed stroke
            //console.log('connectionRel is: '+outerNodeItem.connectionRel+', which is an indirect relation');
            circleNode.attr({
              "stroke-dasharray": "-",
              "stroke": "#333"
            });
          }
        } else if(checkEmptyData){
           circleNode.attr({
            //setting border color for empty data which has single node
              "stroke-dasharray": "-",
              "stroke": "#e8e9ea",
              "cursor": "auto"
            });
        }else if((connectionType === 'communities' && outerNodeItem.owner !== shortName) || (connectionType === 'courses' && outerNodeItem.status !== "Completed")){
          circleNode.attr({
              "stroke-dasharray": "-",
              "stroke": "#333"
            });
        }


        if(typeof(errorArgs) !== "undefined"){
            circleNode.glow({
              "width": "1",
              fill: false,
              "opacity": "0.2",
              "offsetx": "0",
              "offsety": "0",
              "color": "#333"
            });
        }
       
        // Selector
        if(typeof(errorArgs) == "undefined"){
            //circleNode.node.id  = dataPrefix + "_" + outerNodeItem.connectionId;
            if((connectionType === 'people' || connectionType === 'peoples') && outerNodeItem.email !== ""){
              expertEmailiId = outerNodeItem.email;
              expertID = expertEmailiId.substring(0, expertEmailiId.lastIndexOf("@"));
              circleNode.node.id  = dataPrefix + "_" + expertID;
            }else if(connectionType === 'communities' && outerNodeItem.communityURI !== ""){
              communityUrl = outerNodeItem.communityURI;
              urlId = communityUrl.split("/");
              circleNode.node.id  = dataPrefix + "_" + urlId[urlId.length - 1];
            }else if(connectionType === 'courses' && outerNodeItem.url !== ""){
              coursesUrl = outerNodeItem.url;
              urlId = coursesUrl.split("/");
              circleNode.node.id  = dataPrefix + "_" + urlId[urlId.length - 1];
            }else if((connectionType === 'blogs' || connectionType === 'forums' || connectionType === 'wikis' || connectionType === 'files') && outerNodeItem.id !== ""){
              assetsUrl = outerNodeItem.id;
              urlId = assetsUrl.split("/");
              circleNode.node.id  = dataPrefix + "_" + urlId[urlId.length - 1];
            }else{
              circleNode.node.id  = dataPrefix + "_noVcard";
            }
            $(circleNode.node).attr('class', 'outer-circle '+dataPrefix+'-circle');
        }

        var xOffset = (circleNode.getBBox().x+1);
        var yOffset = (circleNode.getBBox().y+1);

        // Image
        var imageNode       = null,
            imageSideLength = 66;

        if(typeof(errorArgs) !== "undefined"){

            imageSideLength = 40;
            xOffset = (circleNode.getBBox().x+1)+13;
            yOffset = (circleNode.getBBox().y+1)+13;
            console.log(outerNodeItem.connectionImage);
            // imageNode = svgMapContainer.image('assets/images/social-demo/errors/'+connectionType+'.svg', xOffset, yOffset, imageSideLength, imageSideLength);

            imageNode = svgMapContainer.circle(xOffset, yOffset, imageSideLength, imageSideLength)
                        .attr('stroke', 'none');
            svgNodeImageFit('assets/images/vkm/errors/'+connectionType+'.svg', 40, 40, imageNode);

        } else {            
             if(connectionType === 'people' || connectionType === 'peoples'){
              var userEmailiId = outerNodeItem.email;
              var baseUrl = window.location.protocol + "//" + window.document.domain;
              var faceUrl = baseUrl + App.profileImage(userEmailiId, "mini");
              imageNode = svgMapContainer.circle(xOffset+(imageSideLength/2), yOffset+(imageSideLength/2), imageSideLength/2, imageSideLength/2)
                          .attr('stroke', 'none');
              var newDummyImage = new Image();
              newDummyImage.src = faceUrl;
              newDummyImage.onload = function() {
                svgNodeImageFit(faceUrl, 66, 66, imageNode);
              }
              newDummyImage.onerror = function() {
                svgNodeImageFit('assets/images/vkm/defaults/default-node-user.png', 66, 66, imageNode);
              }

            }else{
              imageNodeSrc  = 'assets/images/vkm/defaults/default-node-'+dataPrefix+'.png';
              imageNode = svgMapContainer.circle(xOffset+(imageSideLength/2), yOffset+(imageSideLength/2), imageSideLength/2, imageSideLength/2)
                          .attr('stroke', 'none');
              svgNodeImageFit(imageNodeSrc, 66, 66, imageNode);
              //imageNode = svgMapContainer.image('assets/images/vkm/defaults/default-node-'+dataPrefix+'.png', xOffset, yOffset, imageSideLength, imageSideLength);
            }


            if(checkEmptyData){
              $(imageNode.node).attr('class', 'circle-image '+dataPrefix+'-image removePointer');
            } else {
              $(imageNode.node).attr('class', 'circle-image '+dataPrefix+'-image');
            }

        }

        

        // Get Positioning for Text
        nodeTextPositionX  = circleNode.getBBox().x + mapLayoutObj.nodeRadius;
        nodeTextPositionY  = circleNode.getBBox().y + (mapLayoutObj.nodeRadius*2);

        var nodeTextAttr   = {
              "font-size": 12, 
              "font-family": "Arial",
              "fill": "#000"
            },
        
        maxWidth           = circleNode.getBBox().width + 20,
        maxTextWidth       = maxWidth,
        connectionText;
        
        if(outerNodeItem.communityName || outerNodeItem.communityName === ""){
          if(outerNodeItem.communityName === ""){
            connectionText  = 'No community Connections';
          }else{
            connectionText  = outerNodeItem.communityName;
          }
        }else if(outerNodeItem.userName || outerNodeItem.userName === ""){
          if(outerNodeItem.userName === ""){
            connectionText  = 'No People Connections';
          }else{
            connectionText  = outerNodeItem.userName;
          }
        }else{
          if(outerNodeItem.displayName === ""){
            if(connectionType === "courses"){
              connectionText  = 'No Courses';
            }else if(connectionType === "blogs"){
              connectionText  = 'No Blogs';
            }else if(connectionType === "forums"){
              connectionText  = 'No Forums';
            }else if(connectionType === "wikis"){
              connectionText  = 'No Wikis';
            }else{
              connectionText  = 'No File Connections';
            }
          }else if(outerNodeItem.displayName){
            connectionText  = outerNodeItem.displayName;
          }else if( connectionType === "topics" && outerNodeItem === ""){
            connectionText  = 'No Related Topics';
          }else{
            connectionText = outerNodeItem;
          }
        }



        $(imageNode.node).attr('alt', connectionText);
        $(imageNode.node).attr('title', connectionText);
        //$(imageNode.node).attr('data-rel', 'tooltip');
        //$(imageNode.node).attr('data-original-title', connectionText);
        //$(imageNode.node).attr('data-placement', 'left');
        //$(imageNode.node).tooltip();

        // For Bubble Error 
        if(typeof(errorArgs) !== "undefined"){
          if(outerNodeItem.userName && outerNodeItem.userName !== ""){
            connectionText = (outerNodeItem.userName).replace("items", connectionType.toLowerCase());
          }else{
            connectionText = (outerNodeItem.displayName).replace("items", connectionType.toLowerCase());
          }

          maxTextWidth   = maxWidth + 100;
          var nodeTextAttr = {
            "font-size": 11,
            "font-family": "Arial, sans-serif",
            "font-style": "italic",
            "fill": "#424242"
          };
        }/*else{
            connectionText = (outerNodeItem.displayName);
            maxTextWidth   = maxWidth + 100;
            var nodeTextAttr = {
              "font-size": 11, 
              "font-family": "Arial, sans-serif",
              "font-style": "italic",
              "fill": "#424242"
            };          
        }*/

        //console.log(textWidthCalc(connectionText, '11px Arial, sans-serif'));

        var nodeLabelText  = connectionText,            
            textNodeLabel  = null,
            lineMultiplier = 13;

        if(typeof(errorArgs) !== "undefined"){
          console.log('error shown')
            lineMultiplier = 12;
        }

        var labelLines = nodeLabelText.createLines({
          numLines: ((nodeLabelText.split(" ").length > 1) ? 2 : 1),
          widthLimit: (maxWidth+5),
          fontProps: '11px Arial, sans-serif',
          elipsize: true
        });

        for( var j = 0; j < labelLines.length; j++ ) {
            textNodeLabel = svgMapContainer.text(nodeTextPositionX, nodeTextPositionY + lineMultiplier*j + 14, labelLines[j]).attr(nodeTextAttr);
        }

        $(textNodeLabel).attr('class', 'text-node '+dataPrefix+'-label');

      angle += 360/dataArr.length;

    });// end loop
  } //ending If loop
  else{
    //this will be executed when there is empty array as result
    svgMapContainer.circle((mapLayoutObj.radius), (mapLayoutObj.radius), 200).attr({
      "fill": "none",
      "stroke-width": 2,
      "stroke": "#e8e9ea"
    });

    var circleNode = svgMapContainer.circle(mapLayoutObj.radius, mapLayoutObj.vertical, mapLayoutObj.nodeRadius)
    .attr({
      "fill": "none",
      "stroke": "#e8e9ea",
      "stroke-width": 2,
      "stroke-dasharray": "-",
      "cursor": "auto",
      "transform": "r240" + " "+mapLayoutObj.radius+" "+mapLayoutObj.radius
    });

    circleNode.node.id  = dataPrefix + "_noVcard";
    $(circleNode.node).attr('class', 'outer-circle '+dataPrefix+'-circle');

    var xOffset = (circleNode.getBBox().x+1);
    var yOffset = (circleNode.getBBox().y+1);

    var imageNode       = null,
        imageSideLength = 66;

    imageNodeSrc  = 'assets/images/vkm/defaults/default-node-'+dataPrefix+'.png';
    imageNode = svgMapContainer.circle(xOffset+(imageSideLength/2), yOffset+(imageSideLength/2), imageSideLength/2, imageSideLength/2)
                .attr('stroke', 'none');
    svgNodeImageFit(imageNodeSrc, 66, 66, imageNode);

    // Get Positioning for Text
    nodeTextPositionX  = circleNode.getBBox().x + mapLayoutObj.nodeRadius;
    nodeTextPositionY  = circleNode.getBBox().y + (mapLayoutObj.nodeRadius*2);

    var nodeTextAttr   = {"font-size": 12,
                          "font-family": "Arial",
                          "fill": "#000"
                        };
    var connectionText  = "No Topics",
        textNodeLabel   = null;

    textNodeLabel = svgMapContainer.text(nodeTextPositionX, nodeTextPositionY+14, connectionText).attr(nodeTextAttr);
    $(textNodeLabel).attr('class', 'text-node '+dataPrefix+'-label');
  }

}






function createCircleLegend(legendEl, legendArr){

  $(legendEl).find('.kmap-legend-direct').text(legendArr['direct'].join(""));
  $(legendEl).find('.kmap-legend-indirect').text(legendArr['indirect'].join(""));

}

function getLinkedData(entityId, connectionType, directConnectionObj, indirectConnectionObj, thisItemType, dataPrefix, arry){

    connectionAttribute   = thisItemType+'_'+connectionType,
    connectionIdentifier  = dataPrefix+'_id',
    indirectDataArray     = window[dataPrefix+'Data'],
    entityConnectionsArr  = [],
    entityObj             = arry;

    if(entityObj!= "undefined" && entityObj!= null) {

        if(connectionType === "files" || connectionType === "courses" || connectionType === "wikis" || connectionType === "people" || connectionType === "communities" || connectionType === "blogs" || connectionType === "forums" || connectionType === "topics" || connectionType === "peoples"){
          entityConnectionsArr = arry;
        }
        else{  
          entityConnectionsArr = filterJsonItems([entityObj[connectionAttribute], null, indirectDataArray, connectionIdentifier, directConnectionObj, indirectConnectionObj]);
          console.log(entityConnectionsArr);
        }
    }

    if( typeof(entityConnectionsArr) != "undefined" && entityConnectionsArr != null ){
        return entityConnectionsArr;
    }
  
} 

function renderConnections(entityId, entityType, mapLayoutObj, connectionType, connectionCategory, dataPrefix, arry){
    var socialMapStates   = $(mapLayoutObj.inner);
     defaultRelationStyles = {
        "people": {
          "indirect": ["Recommended"],
          "direct"  : ["Connected"]
        },
        "communities":
        {
          "indirect": ["Member"],
          "direct"  : ["Owner"]
        },
        "files":
        {
          "indirect": ["Recommended"],
          "direct"  : ["Author/Subscriber"]
        },
        "courses":
        {
          "indirect": ["Enrolled"],
          "direct"  : ["Completed"]
        },
        "blogs":
        {
          "indirect": ["Recommended"],
          "direct"  : ["Author/Subscriber"]
        },
        "wikis":
        {
          "indirect": ["Recommended"],
          "direct"  : ["Author/Subscriber"]
        },
        "forums":
        {
          "indirect": ["Recommended"],
          "direct"  : ["Author/Subscriber"]
        },
        "topics":
        {
          "indirect":["Recommended"],
          "direct"  :["Connected"]
        },
        "peoples": {
          "indirect": ["Recommended"],
          "direct"  : ["Connected"]
        },  
      };

    clearSvg();

    socialMapStates.html('');

    $('#map-menu').html('');
    $('#social-map').attr('data-map-view', 'connections'); // hides knowledge topic bubble maps from view

    window['currentEntityType'] = entityType;

   centerSubmenu('#map-menu', connectionCategory, connectionType); 

    var directConnectionObj = { 
      'connectionId': dataPrefix+'_id' 
    },

    indirectConnectionObj = {
      'connectionName': dataPrefix+'_name', 
      'connectionImage': dataPrefix+'_image_path'
    };
   
    var connectionsArr = getLinkedData(entityId, connectionType, directConnectionObj, indirectConnectionObj, entityType, dataPrefix, arry );
  

    // Create Legend to Differentiate Nodes (Solid / Dotted, etc.)

      strokeCategory = defaultRelationStyles[connectionType];
      createCircleLegend('#smap-legend', strokeCategory)

        // Display Legend:
      if(connectionType === 'communities' || connectionType === 'courses'){
        $('#smap-legend').addClass('display-kmap-legend');
      }else{
        $('#smap-legend').removeClass('display-kmap-legend');
      }
      $('#kmap-legend').removeClass('display-kmap-legend');

    if( typeof(connectionsArr) != "undefined" && connectionsArr != null ){
        var totalNodes = null,
        totalNodes     = (connectionsArr).length,
        totalPages     = null,
        dotNavWrap     = null,
        arrowNavWrap   = null,
        maxNodesToShow = null,
        limitedOrigArr = [],
        slicedDataArr  = [],

        socialMapView  = mainCircle('.center-circle-rectangular-cover', '.center-circle-heading-texts', mapLayoutObj, entityObj, entityType, entityId);

        if(totalNodes != null && totalNodes > 25){
          totalNodes = 25;
        }

        if(totalNodes > 0){

            svgMapPage         = socialMapView;

            // Max Nodes to Display:
            maxNodesToShow     = (defaultMapLayout.maxNodesPerPage)*(defaultMapLayout.maxNodePages);

            if((connectionsArr).length > maxNodesToShow){
                limitedOrigArr = (connectionsArr).slice(0, maxNodesToShow);
            } else {
                limitedOrigArr = connectionsArr;
            }          

            // Check if All Nodes fit on 1 Page
            if(totalNodes > defaultMapLayout.maxNodesPerPage){

                if( Math.ceil(totalNodes/defaultMapLayout.maxNodesPerPage) > defaultMapLayout.maxNodePages ){
                    totalPages = defaultMapLayout.maxNodePages;
                } else {
                    totalPages = Math.ceil(totalNodes/defaultMapLayout.maxNodesPerPage);
                }

                // Setup Carousel Dots/Arrows for Multiple Pages
                $('#map-content').removeAttr('data-current-aggregate');
                $('#map-content').attr('data-active-content-state', 0);

                dotNavWrap     = $('<div class="carousel-dot-nav" />'),
                arrowNavWrap   = $('<div class="carousel-arrow-nav" />');

                $('#map-menu').append(dotNavWrap)
                              .append(arrowNavWrap);

                var carouselDot    = Raphael($('.carousel-dot-nav')[0], mapLayoutObj.radius, 210),
                carouselDotWrap    = carouselDot.set();
     
                var coverWrapX     = centerCircleCoverWrap.getBBox().x,
                coverWrapY         = centerCircleCoverWrap.getBBox().y,
                divStartX          = coverWrapX-50,
    
                dotRadius          = 4,
                firstDotMargin     = 26,
                dotSpacing         = 24;

                if(totalPages > 2){
                    firstDotMargin = 14;              
                }

                // Dot Nav Wrapper Box
                carouselDotWrap.push(carouselDot.rect( 82, coverWrapY, 88, 18) ).attr({
                  fill: "none", 
                  "stroke-width": "0" 
                }); 

                var carouselArrows  = Raphael($('.carousel-arrow-nav')[0], mapLayoutObj.radius, 140),
                carouselArrowsWrap  = carouselArrows.set();

                var scaleFactor     = 0.5;
                var startingXPos    = 0;
                var startingYPos    = 50;
                var xMovement       = 25;
                var yMovement       = 25;
                var xEndPosition    = 50;

                var rightArrow      = carouselArrowsWrap.push(carouselArrows.path( 'M'+(startingXPos+200)+', '+startingYPos+', L, '+(xMovement+200)+', '+yMovement+', '+(xEndPosition+200)+', 50z' ).attr({
                  fill: "#808284", 
                  "stroke-width": "0",
                  "cursor": "pointer",
                  "transform": "r90 s"+scaleFactor
                })); 

                var leftArrow       = carouselArrowsWrap.push(carouselArrows.path( 'M'+startingXPos+', '+startingYPos+', L, '+xMovement+', '+yMovement+', '+xEndPosition+', 50z' ).attr({
                  fill: "#808284", 
                  "stroke-width": "0",
                  "cursor": "pointer",
                  "transform": "r270 s"+scaleFactor
                }));   

                $('.carousel-arrow-nav path').each(function(i){
                  $(this).attr('class', 'carousel-arrow');
                  if(i == 0){
                    $(this).attr('id', 'carousel-arrow-right')
                  } else {
                    $(this).attr('id', 'carousel-arrow-left')
                  }                  
                });


                // For Each Page of Nodes
                for(currPage = 0; currPage < totalPages; currPage++){

                    // For each page, add a dot to the carousel nav                
                    carouselDotWrap.push(carouselDot.circle(0, 0, dotRadius)
                    .attr({
                      "cx": carouselDotWrap.getBBox().x+dotRadius+firstDotMargin,
                      "cy": 188,
                      "stroke": "#a7a9ab", 
                      "stroke-width": 2, 
                      "transform": "t"+(currPage*dotSpacing)+", 0",
                      "cursor":"pointer",
                      "fill":"#808284"
                    }));

                    var startPoint      = null,
                        endPoint        = null,

                    startPoint = defaultMapLayout.maxNodesPerPage*currPage;

                    if(startPoint + defaultMapLayout.maxNodesPerPage >= totalNodes) {
                        endPoint = totalNodes;
                    } else {
                        endPoint   = startPoint + defaultMapLayout.maxNodesPerPage;
                    }

                    slicedDataArr = (limitedOrigArr).slice(startPoint, endPoint);

                    createOuterNodes(slicedDataArr, svgMapPage, mapLayoutObj, connectionType, dataPrefix);

                    var newMapContentInner  = $('<div class="map-content-inner" />');
                    socialMapStates.append(newMapContentInner);

                    var svgMapPage       = Raphael($('#map-content .map-content-inner:last')[0], ((mapLayoutObj.radius*2)+15), ((mapLayoutObj.radius*2)+15));

                }

                $('.carousel-dot-nav circle').each(function(i){
                    $(this).attr('id', 'carousel-dot-'+i);
                    $(this).attr('class', 'carousel-dot');
                });

                carouselInit(0);

            } else {
                createOuterNodes(connectionsArr, svgMapPage, mapLayoutObj, connectionType, dataPrefix)

            }

        } else {
            createOuterNodes(arry, socialMapView, mapLayoutObj, connectionType, dataPrefix, 'error_bubble_options')
        }

        // Display Breadcrumbs
        if(entityId){
          if (connectionType == "peoples"){
            renderBreadcrumbs(['home', connectionCategory, connectionType], currentUserIsMe, peoples_entity);
          }else if(connectionType == "topics"){
            renderBreadcrumbs(['home', connectionCategory, connectionType], currentUserIsMe, peoples_entity, "before");
          }else{
            renderBreadcrumbs(['home', connectionCategory, connectionType], currentUserIsMe);
          }
        }else {
          console.log("there is some error");
        }
      

    } else {

        console.log(entityId+' doesnt exist or there was some other weird error ');

    }
}






function carouselUpdate(carouselDirection){

  var currentSlide = $('#map-content .map-content-inner.active').index()-1;
  var totalSlides  = $('#map-content .map-content-inner').length-1;

  if(carouselDirection == "left"){
      if((currentSlide - 1) >= 0){
        carouselGoTo( currentSlide, (currentSlide - 1) );
      }
  } else if(carouselDirection == "right"){
      if((currentSlide + 1) < totalSlides){
        carouselGoTo( currentSlide, (currentSlide + 1) );
      }
  }
}


function carouselInit(targetSlide){
  carouselGoTo(0, targetSlide)
}


function carouselGoTo(currentIndex, targetSlide){

  var totalSlides   = $('#map-content .map-content-inner').length-1,
      currentActive = $('#map-content .map-content-inner:eq('+currentIndex+')'),
      newPage       = $('#map-content .map-content-inner:eq('+targetSlide+')');

      // console.log(arguments.callee.caller.name)
      // console.log('currentIndex: '+currentIndex);
      // console.log('targetSlide: '+targetSlide);
       currentActive.removeClass('active fade-out-nodes-page');
      newPage.addClass('active');

  // Fade Out Current Page
  if( (currentIndex != targetSlide) && arguments.callee.caller.name != "carouselInit"){

    $('#map-content').attr('data-active-content-state', targetSlide)
    currentActive.addClass('fade-out-nodes-page');

    /*vkm_sidebar.detectAnimationEnd(currentActive, 150, function(){
      currentActive.removeClass('active fade-out-nodes-page');
      newPage.addClass('active');
    });*/    

  } 

  // Highlight Dots
  $('.carousel-dot').css({ "fill":"#808284", "opacity":"0.4", "cursor":"pointer" });
  $('#carousel-dot-'+targetSlide).css({ "fill":"#fff", "opacity":"1", "cursor":"auto" });
  

  // Update Arrow Enabled/Disabled
  $('.carousel-arrow').css({ "cursor":"pointer", "fill":"#B8B8B8", "opacity":"1" });
  if(targetSlide == 0){
   $('#carousel-arrow-left').css({ "cursor":"auto", "opacity":"0.4" });
  }
  if(targetSlide == totalSlides-1){    
     $('#carousel-arrow-right').css({ "cursor":"auto", "opacity":"0.4" });
  }

}
/* -- GENERATE MAIN CENTER CIRCLE
----------------------------------------------------------*/
function mainCircle(svgCircleCover, svgTextWrapper, layoutDefs, entityObj, entityType, entityId){
    var centerTitle      = null,
    centerSubtitle       = null,
    entityImage          = null;

    // Entity Image
    // Can also later check if image fits specific file restrictions (by checking indexOf file extension string) and/or if it's an actual image
    /*if( typeof(entityObj[entityType+'_image_path']) != "undefined"  && entityObj[entityType+'_image_path'] != null && entityObj[entityType+'_image_path'] != "" ){
        entityImage     = entityObj[entityType+'_image_path'];
    }*/
    if(profileImgUrl !== undefined && profileImgUrl !== ""){
        var baseUrl = window.location.protocol + "//" + window.document.domain;
        var faceUrl = baseUrl + App.profileImage(app.getUsername(), "profile");
        entityImage     =  faceUrl;
    }else {
        entityImage     =  'assets/images/vkm/defaults/default-node-'+entityType+'.png';
    }

    var mapContentInner = $('<div class="map-content-inner active" />');
    $(layoutDefs.inner).append(mapContentInner);

    var svgBase         = Raphael($(mapContentInner.last())[0], (layoutDefs.radius*2)+15, (layoutDefs.radius*2)+15),
        svgMenu         = Raphael($('#map-content:last')[0], (layoutDefs.radius*2)+15, (layoutDefs.radius*2)+15);
        
    generatedMapView    = svgMenu.set();

    var whiteCircleBg   = generatedMapView.push(svgMenu.circle(layoutDefs.radius, layoutDefs.radius, 126).attr({
      fill: "#fff",
      "stroke-width": 0
    }));

    shadowCircleBg      = generatedMapView.push(svgMenu.circle(layoutDefs.radius, layoutDefs.radius, 121).attr({
      fill: "none", 
      "stroke-width": 0
    })).glow({
      "width": "2",
      fill: false,
      "opacity": "0.3",
      "offsetx": "0",
      "offsety": "0",
      "color": "#aaa"
    });

    // Center User Image
    centerImage   = generatedMapView.push(svgMenu.image(entityImage, 0.7*(layoutDefs.radius), 0.7*(layoutDefs.radius), 150, 150));

    centerGrayCircle  = generatedMapView.push(svgMenu.circle(layoutDefs.radius, layoutDefs.radius, 100).attr({
      fill: "none", 
      "stroke-width": 50,
      "stroke": "#59595c"
    }));

    var rectangleCircleCover = $('<div class="center-circle-rectangular-cover" />');
    var circleHeadingText = $('<div class="center-circle-heading-texts" />');
    var centerHeadingDividers = $('<div class="center-circle-heading-lines" />');

    $('#map-menu').append(rectangleCircleCover)
                  .append(circleHeadingText)
                  .append(centerHeadingDividers);

    var centerCircleCover = Raphael($(svgCircleCover)[0], layoutDefs.radius, layoutDefs.radius);
    centerCircleCoverWrap = centerCircleCover.set();

    centerCircleCoverWrap.push(centerCircleCover.rect((layoutDefs.radius)/4, 180, (layoutDefs.radius)/2, 46).attr({
      fill: "#59595c", 
      "stroke-width": 0 
    })),

    centerCircleText     = Raphael($(svgTextWrapper)[0], layoutDefs.radius, layoutDefs.radius),
    centerCircleTextWrap = centerCircleText.set();


    if(entityObj.personName && entityObj.personName.userName !== ""){

        if(entityObj.jobTitle){

              centerTitle = entityObj.personName.userName.inlineTextTrim({
                  numLines: 2,
                  widthLimit: layoutDefs.radius*0.42, // 105
                  fontProps: "14px 'webRegularFont', sans-serif",
                  elipsize: true      
              });

              centerCircleTextWrap.push(centerCircleText.text((layoutDefs.radius)/2, 200, centerTitle).attr({
                  "font-size": 14, 
                  "font-family": "'webRegularFont', sans-serif",
                  "font-weight": "normal",
                  "text-anchor": "middle",
                  "fill": "#fff",
                  "stroke": "none"
              }));
              centerSubtitle  = jobTitle.inlineTextTrim({
              numLines: 2,
              widthLimit: layoutDefs.radius*0.34, // 85
              fontProps: "11px 'webExtraLightFont', sans-serif",
              elipsize: true  
          });      

          centerCircleTextWrap.push(centerCircleText.text((layoutDefs.radius)/2, 214, centerSubtitle).attr({
              "font-size": 11, 
              "font-family": "'webExtraLightFont', sans-serif",
              "text-anchor": "middle",
              "fill": "#fff",
              "stroke": "none"
          }));               

        } else {

            centerTitle = entityObj.personName.userName.createLines({
                numLines: 2,
                widthLimit: layoutDefs.radius*0.42, // 105
                fontProps: "14px 'webRegularFont', sans-serif",
                elipsize: true  
            });

            for( var j = 0; j < centerTitle.length; j++ ) {
                //textNodeLabel = svgMapContainer.text(nodeTextPositionX, nodeTextPositionY + lineMultiplier*j + 14, labelLines[j]).attr(nodeTextAttr);

                centerCircleText.text(layoutDefs.radius/2, 200 + j*14, centerTitle[j]).attr({
                    "font-size": 14, 
                    "font-family": "'webRegularFont', sans-serif",
                    "font-weight": "normal",
                    "text-anchor": "middle",
                    "fill": "#fff",
                    "stroke": "none"
                }); 
            }  
        }

    }else if(entityType == "topic"){
          centerTitle = peoples_entity.capitalizeFirstLetter().inlineTextTrim({
                  numLines: 2,
                  widthLimit: layoutDefs.radius*0.42, // 105
                  fontProps: "14px 'webRegularFont', sans-serif",
                  elipsize: true      
              });

              centerCircleTextWrap.push(centerCircleText.text((layoutDefs.radius)/2, 200, centerTitle).attr({
                  "font-size": 14, 
                  "font-family": "'webRegularFont', sans-serif",
                  "font-weight": "normal",
                  "text-anchor": "middle",
                  "fill": "#fff",
                  "stroke": "none"
              })); 

           centerSubtitle  = '';
      }
        
    else{

      centerTitle = shortName.inlineTextTrim({
                  numLines: 2,
                  widthLimit: layoutDefs.radius*0.42, // 105
                  fontProps: "14px 'webRegularFont', sans-serif",
                  elipsize: true      
              });

              centerCircleTextWrap.push(centerCircleText.text((layoutDefs.radius)/2, 200, centerTitle).attr({
                  "font-size": 14, 
                  "font-family": "'webRegularFont', sans-serif",
                  "font-weight": "normal",
                  "text-anchor": "middle",
                  "fill": "#fff",
                  "stroke": "none"
              })); 

              centerSubtitle  = jobTitle.inlineTextTrim({
              numLines: 2,
              widthLimit: layoutDefs.radius*0.34, // 85
              fontProps: "11px 'webExtraLightFont', sans-serif",
              elipsize: true  
          });      

          centerCircleTextWrap.push(centerCircleText.text((layoutDefs.radius)/2, 214, centerSubtitle).attr({
              "font-size": 11, 
              "font-family": "'webExtraLightFont', sans-serif",
              "text-anchor": "middle",
              "fill": "#fff",
              "stroke": "none"
          }));
      }

      
      

          
  
    userTextDividers   = Raphael($('.center-circle-heading-lines')[0], layoutDefs.radius, layoutDefs.radius),
    textDividersWrap   = userTextDividers.set();

    var coverWrapX     = centerCircleCoverWrap.getBBox().x;
    var coverWrapY     = centerCircleCoverWrap.getBBox().y;
    var divStartX      = coverWrapX-50;

    textDividersWrap.push(userTextDividers.rect((coverWrapX-50), coverWrapY, 225, 0.25))
    .push(userTextDividers.rect((coverWrapX-18), (coverWrapY+40), 162, 0.25)).attr({
      "fill": "#fff",
      "stroke": "none"
    });

    return svgBase;
}



function filterArray(arr, key){
  var filteredArr = [];
  for(var i = 0; i < arr.length; i++){
    if(arr[i][key] == true){
      filteredArr.push(arr[i]);
    }
  }
  return filteredArr;
}



function getCurrentEntity(allArr, entityIdKey, chosenEntityId){

  var entityObject = {};

  $.grep(allArr, function(entity, i){
      if( typeof(chosenEntityId) != "undefined" && chosenEntityId != null ) {
        if(entity[entityIdKey] == chosenEntityId){
          entityObject = entity;
          return entityObject;
        }
      } else {
        if(entity[entityIdKey] == $('#social-map').attr('data-entity')){
          entityObject = entity;
        }
      }
  });
  return entityObject;
}

function renderBreadcrumbs(crumbArr, isMine, topicName, topicNameBeforeAfter){

  var breadcrumbWrap  = $('#breadcrumb-wrapper'),
      newBreadcrumbs  = $('<ul class="breadcrumb"/>'),
      vkmPageHeader   = $('#vkm-page-header'),
      vkmNavTitle     = vkmPageHeader.find('.vkm-map-title h1'),
      vkmNavSubtitle  = vkmPageHeader.find('.vkm-map-title h2'),
      vkmNavIcon      = vkmPageHeader.find('.vkm-map-icon'),
      totalCrumbs     = crumbArr.length,
      myPrefix        = null;

  // Clear old breadcrumbs
  breadcrumbWrap.html('');

  /*if(isMine == true && !topicName){
    myPrefix = 'My ';
  } else {
    myPrefix = '';
  }*/

  var myPrefix = '';

  $.grep(window.navData, function(navItem, i){

    // First Level (Always the Same)
    newBreadcrumbs.append('<li id="'+navItem.crumb_id+'">'+myPrefix+navItem.crumb_label+'</li>');
    vkmNavTitle.text(myPrefix+navItem.crumb_label);
    vkmNavIcon.attr('data-icon-before', navItem.heading_icon);    

    // Second Level and On

    if(totalCrumbs > 1 && navItem.crumb_id != crumbArr[1]){



      $.grep(navItem.crumb_subsection, function(crumbLevel2, m){

          if(crumbLevel2.crumb_id == crumbArr[1]){

              newBreadcrumbs.append('<li id="'+crumbLevel2.crumb_id+'" data-map-default="'+crumbLevel2.default_map+'" data-map-prefix="'+crumbLevel2.default_map_prefix+'">'+crumbLevel2.crumb_label+'</li>');
              vkmNavTitle.text(crumbLevel2.crumb_label);
              vkmNavIcon.attr('data-icon-before', crumbLevel2.heading_icon);

              if(totalCrumbs > 2) {

                  $.grep(crumbLevel2.crumb_subsection, function(crumbLevel3, n){

                      if(crumbLevel3.crumb_id == crumbArr[2]){

                          newBreadcrumbs.append('<li class="'+crumbLevel3.crumb_id+'">'+myPrefix+crumbLevel3.crumb_label+'</li>');

                          if(topicName){
                            if(topicNameBeforeAfter == "before"){
                              vkmNavTitle.text(topicName + myPrefix+crumbLevel3.heading);  
                            } else {
                              vkmNavTitle.text(myPrefix+crumbLevel3.heading + topicName);   
                            }
                            
                          } else {
                            vkmNavTitle.text(myPrefix+crumbLevel3.heading);  
                          }
                          
                          vkmNavIcon.attr('data-icon-before', crumbLevel3.heading_icon);
                      }

                  });

              }

          }

      });

    }

    breadcrumbWrap.append(newBreadcrumbs);

  });
}
/* -- DISPLAY MAIN MENU
----------------------------------------------------------*/
function displayMainMenu(mapLayoutObj, userProfileData) {

  var socialMapStates       = $(mapLayoutObj.inner);

  clearSvg();

  /* CENTER CIRCLE ELEMENTS / CONTENT
  --------------------------------------------*/
  socialMapStates.html('');

  var entityObj     = userProfileData,
      menuSections  = filterArray(window.navData[0]['crumb_subsection'], 'show_on_main_menu');
      totalNodes    = menuSections.length;
  angle = 0;
  adjustStartAngle(totalNodes);   

  // Generate Main Menu Circle
  var mapView = mainCircle('.center-circle-rectangular-cover', '.center-circle-heading-texts', mapLayoutObj, entityObj, 'user');

  $.grep(menuSections, function(menuItem, m){

    var circleNode = mapView.circle(mapLayoutObj.radius, mapLayoutObj.vertical, mapLayoutObj.nodeRadius)
    .attr({
      "stroke": menuItem.menu_color, 
      "transform": "r" + angle + " "+mapLayoutObj.radius+" "+mapLayoutObj.radius,
      "fill": menuItem.menu_color
    });

    var imageNode = mapView.image(menuItem.menu_icon_path, (circleNode.getBBox().x+parseInt(menuItem.menu_icon_x_offset)), (circleNode.getBBox().y+parseInt(menuItem.menu_icon_y_offset)), menuItem.menu_icon_width, menuItem.menu_icon_height);

    imageNode.node.id = null;
    
    $(imageNode.node).attr('class', 'main-menu-link '+menuItem.map_type);

    imageNode.node.id = "main-menu_"+menuItem.default_map;

    $(imageNode.node).attr('data-map-default', menuItem.default_map)
                     .attr('data-map-category', menuItem.crumb_id)
                     .attr('data-array-prefix', menuItem.default_map_prefix);

    // Get Positioning for Text
    nodeTextPositionX = circleNode.getBBox().x + mapLayoutObj.nodeRadius;
    nodeTextPositionY = circleNode.getBBox().y + (mapLayoutObj.nodeRadius*2);

    mapView.text(nodeTextPositionX, nodeTextPositionY + 18, menuItem.crumb_label).attr({
      "font-size": 12, 
      "font-family": "Arial",
      "fill": "#000"
    })  

    angle += 360/totalNodes;

  });

  // Show Main Editing Menu if Data Entry is Enabled... or render regardless and show/hide via CSS
  //commenting below line will hide the menu in the main circle of landing page
  //centerSubmenu('#map-menu', 'editing-menu', null, 'crumb_subsection');
  
  // Display Home Breadcrumbs
  renderBreadcrumbs(['home'], currentUserIsMe);
} //renderEntity







function centerSubmenu(staticWrapper, mapCategory, currentMap){

  var menuLinks    = $('<div class="social-submenu" />');
      menuWrapper  = $('<div id="social-map-submenu" class="social-map-submenu" />');
      menuWrapper.html('');

      $.each(window.navData[0]['crumb_subsection'], function(m, submenuSection){
          if(submenuSection.crumb_id == mapCategory){
              subMenuObj = submenuSection;
              return false;
          }
      });

      centerSubmenuLinks(staticWrapper, menuLinks, mapCategory, currentMap, subMenuObj); // GENERIC FUNCTION FOR ALL 

      menuWrapper.append(menuLinks);
      $(staticWrapper).append(menuWrapper);

      if(subMenuObj['submenu_class']){
          menuLinks.addClass(subMenuObj['submenu_class']);
      }
}







/* -- GENERATE CIRCULAR SUBMENUS
----------------------------------------------------------*/
function centerSubmenuLinks(staticWrapper, menuWrap, mapCategory, currentMap, subLinksObj){

      menuWrap.html('');

      // generate sublink icons
      $.each(subLinksObj['crumb_subsection'], function(n, submenuLink){

            var newIconLink = null;

            if(mapCategory == "editing-menu"){
                newIconLink = $('<a data-icon-before="'+submenuLink.submenu_icon+'" data-updater-tab="'+submenuLink.updater_tab+'" class="btn '+submenuLink.updater_tab+'"></a>');
            } else if(mapCategory == "knowledge"){
                newIconLink = $('<li data-icon-before="'+submenuLink.heading_icon+'" data-map-topic="'+submenuLink.crumb_id+'">'+submenuLink.crumb_label+'</li>');
            // } else if(mapCategory == "other-entities"){
            //     newIconLink = $('<a data-icon-before="'+submenuLink.submenu_icon+'" data-show-map-state="'+submenuLink.crumb_id+'" data-show-map-category="'+subMenuObj.crumb_id+'" data-entity-type="'+subMenuObj.crumb_id+'" data-array-prefix="'+submenuLink.data_prefix+'" class="btn '+submenuLink.crumb_id+'"></a>');            
            
            } else {
                newIconLink = $('<a data-icon-before="'+submenuLink.submenu_icon+'" data-show-map-state="'+submenuLink.crumb_id+'" data-show-map-category="'+subMenuObj.crumb_id+'" data-array-prefix="'+submenuLink.data_prefix+'" class="btn '+submenuLink.crumb_id+'"></a>');
            }
            
            if(submenuLink.crumb_id == currentMap){
                newIconLink.addClass('active');
            }
            menuWrap.append(newIconLink);
      });
}







/* -- GENERATE KNOWLEDGE SUBMENU LINKS
----------------------------------------------------------*/
function knowledgeMapSubmenu(staticWrapper, mapCategory, currentMap){
    
    $('.knowledge-map-links').remove();

    var subMenuObj  = null,
        menuLinks   = $('<ul class="knowledge-map-links" />'),
        subKmap     = null;

    $.each(window.navData[0]['crumb_subsection'], function(m, submenuSection){
        if(submenuSection.crumb_id == "knowledge"){
            subMenuObj = submenuSection;
            return false;
        }  
    });

    // Update Legend Label for Active Topic Map
    $.each(subMenuObj.crumb_subsection, function(s, kmapSubSection){
        if( kmapSubSection.crumb_id == mapCategory && typeof(kmapSubSection.legend_label_others) != "undefined" ) {
            $('.kmap-legend-others').text(kmapSubSection.legend_label_others)
        }
    });

    //subMenuObj
    centerSubmenuLinks(staticWrapper, menuLinks, "knowledge", mapCategory, subMenuObj); // GENERIC FUNCTION FOR ALL 

    $(staticWrapper).prepend(menuLinks);
}




// Dynamically Generate Legend
function knowledgeMapLegend(){

}
function clearSvg(){
  if(typeof(svg) != "undefined"){
    svg.selectAll(".node, image, circle, text").remove(); 
  }
  $('#map-menu').html("");
  $('#map-content').html("");
};

return{
  carouselGoTo: carouselGoTo,
  carouselInit: carouselInit,
  carouselUpdate: carouselUpdate,
  renderConnections: renderConnections,
  createCircleLegend: createCircleLegend,
  getLinkedData: getLinkedData,
  createOuterNodes: createOuterNodes,
  adjustStartAngle: adjustStartAngle,
   knowledgeMapLegend: knowledgeMapLegend,
  knowledgeMapSubmenu: knowledgeMapSubmenu,
  centerSubmenuLinks: centerSubmenuLinks,
  centerSubmenu: centerSubmenu,
  getCurrentEntity: getCurrentEntity,
  renderBreadcrumbs: renderBreadcrumbs,
  displayMainMenu: displayMainMenu,
  filterArray: filterArray,
  mainCircle: mainCircle,
  clearSvg: clearSvg
}

});