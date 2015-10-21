/* 
returns distinct array results (no repeats)
----------------------------------------------------------------------------------*/
function filterUniques(arr, key){
    var distinctValArr = [],
      uniqueArr      = [];
    $.each(arr, function(i, obj){
      if ($.inArray(obj[key], distinctValArr) === -1) {
        distinctValArr.push(obj[key]);
        uniqueArr.push(obj);
      }
    }); 
    return uniqueArr;
}


/*
clearSvg() - Remove all SVG and HTML elements
----------------------------------------------------------------------------------*/
function clearSvg(){
  if(typeof(svg) != "undefined"){
    svg.selectAll(".node, image, circle, text").remove(); 
  }
  $('#map-menu').html("");
  $('#map-content').html("");
}


/*
filterJsonItems() - Filter data from multiple JSON arrays
Useful for connecting data between JSON arrays
Example: filterJsonItems([map.map_topics, filterNum, topicData, 'topic_id', directTopicObj, indirectTopicObj])
----------------------------------------------------------------------------------*/
function filterJsonItems(args) {

  var directData   = args[0];
  var filterVal    = args[1];  
  var results      = [];
  var indirectData = args[2];
  var identifier   = args[3];
  var directObj    = args[4];
  var indirectObj  = args[5];

  // Small data set
  $.each(directData, function(i, directNode){

      var filteredResultObj = {};

      // Directly Accessible Attributes
      $.each(directObj, function(key, val){
        filteredResultObj[key] = directNode[val]
      });

      // This filtering is for demo only, but since we are 
      // filtering, do this before further loops to optimize / save time
      if(typeof(filterVal) != "undefined" && filterVal != null){

          if(directNode.level.indexOf(filterVal) > -1){
              connectIndirectData();
          }

      } else {
          connectIndirectData();
      }

      function connectIndirectData(){

        $.each(indirectData , function(t, indirectItem){

          if(directNode[identifier] == indirectItem[identifier]){
            
            // Indirectly Accessible Attributes
            $.each(indirectObj, function(key, val){
              filteredResultObj[key] = indirectItem[val]
            });
          }

        });

        results.push(filteredResultObj)

      }

  });

  return { children: results };
}





/*
longestString()
Example Usage: array.longestString();
----------------------------------------------------------------------------------*/
Array.prototype.longestString = function(){
  return this.sort(function (a, b) { return b.length - a.length; })[0];;
}


/*
calculateTextWidth()
Useful for wrapping SVG text
Example Usage: string.calculateTextWidth('12px Arial, sans-serif'); 
----------------------------------------------------------------------------------*/
String.prototype.calculateTextWidth = function(fontStyle){

  var widthCalc = null,
  fakeTextSpan  = document.createElement('span');

  fakeTextSpan.style.font = fontStyle;
  fakeTextSpan.innerHTML = this.toString();
  document.body.appendChild(fakeTextSpan);
  widthCalc = fakeTextSpan.offsetWidth;

  fakeTextSpan.parentNode.removeChild(fakeTextSpan);
  
  return widthCalc;
}

/*
createLines()
Useful for wrapping text into multiple lines (mostly for use in SVG)
Example Usage: 

fulltext.createLines({
  numLines: 2,
  widthLimit: maxWidth,
  fontProps: '11px Arial, sans-serif',
  elipsize: true  
})
----------------------------------------------------------------------------------*/
String.prototype.createLines = function(options){

  var thisString   = this.toString(),
      newText      = thisString,
      textArr      = [],
      joinedLines  = "",
      trimmedStr   = "",                
      lastLine     = "",
      sliceLimit   = null;
      linesArray   = [];
      thisString = thisString.trim();

  for( var i = 0; i < options.numLines; i ++ ) {

      splitText = newText.split(" ");
      textArr = splitText.filter(function(n){ return n != "" }); // Remove any blanks
      var textPieces  = textArr.length;

      for( var p = 0; p < textPieces; p++) {

          var slicedPieces   = textArr.slice(0, (textPieces-p));
          slicedPiecesJoined = slicedPieces.join(" ");
          joinedPiecesWidth  = slicedPiecesJoined.calculateTextWidth(options.fontProps);

          // Check if Joined Pieces Fit Within Max Width
          if ( joinedPiecesWidth <= options.widthLimit ) {

              // If Joined Pieces Match Full Text, Text is Only 1 Line:
              if( slicedPiecesJoined == newText ) {

                 linesArray.push(slicedPiecesJoined);
                 break;

              } else {
                  // Keep going until something fits... (this will be the longest group of words that fits)
                  linesArray.push(slicedPiecesJoined);

              }
              // Then break once something fits...
              break;
          }
      } 

      joinedLines += linesArray[i];
      if( i < linesArray.length ) {
          joinedLines += " ";
      }
      var trimmedStr = joinedLines.trim();

      if( trimmedStr == thisString) {
          break; 

      } else {

          newText = newText.replace(linesArray[i], "");

          if(i == options.numLines-1) {
              // Clean cutoff (don't show last word split)... set this as an option:
              if(options.elipsize == true){
                  // Last line combines last array item with what would have been the next item
                  if(linesArray.length > 1) {
                    lastLine = linesArray[options.numLines-1]+" "+newText.trim();
                  } else {
                    lastLine = newText.trim();
                  }
                  
                  //widthDiff = lastLine.calculateTextWidth(options.fontProps) - ( options.widthLimit - ('...'.calculateTextWidth(options.fontProps))); 
                  //sliceLimit = Math.round(( (options.widthLimit - widthDiff)/options.widthLimit ) * lastLine.length);
                  //linesArray[options.numLines-1] = lastLine.slice(0, sliceLimit)+"...";
                  //changed below code replacing above three lines as it is giving bug in the content.
                  //in case of words more than 30 characters it is giving issue
                  var widthAllowed = (options.widthLimit - ('...'.calculateTextWidth(options.fontProps)));
                  var lastLineLength = lastLine.length;
                  for(var x = 0; x < lastLineLength; x++) {
                    var lastLineWidth = lastLine.calculateTextWidth(options.fontProps);
                    if(lastLineWidth <=  widthAllowed){
                      break;
                    }
                    lastLine = lastLine.substring(0,lastLine.length - 1);
                  }
                  linesArray[options.numLines-1] = lastLine + "...";
              }
          }
      }
  }

  //console.log(linesArray)
  //console.log('total line(s): '+linesArray.length)
  if(typeof linesArray[0] === 'undefined'){
    linesArray.shift();
  }

  return linesArray;
}



/*
inlineTextTrim()
Same as 'createLines', but puts text inline; this is for demo purposes
only; later these functions should be replaced by text trimming in Ember, 
though it may help to leverage the font size calculation functions

Example Usage: 

inlineTextTrim.createLines({
  numLines: 2,
  widthLimit: maxWidth,
  fontProps: '11px Arial, sans-serif',
  elipsize: true  
})
----------------------------------------------------------------------------------*/
String.prototype.inlineTextTrim = function(options){

    var linesArray = this.toString().createLines(options),
        joinedStr  = linesArray.join(" ");

    return joinedStr;
}




String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}