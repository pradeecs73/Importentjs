define(["app"],function(app){

  vkmui = app.vkmui;
  
  // $(window).on('resize', function(){
  //   vkmui.waitForFinalEvent(function(){
  //     // vkmui.resizeSidebar();
  //     vkmui.initSlider('#blog-slider');
  //     vkmui.initSlider('#docs-slider');
  //     vkmui.initSlider('#forums-slider');
  //     vkmui.initSlider('#wiki-slider');
  //   }, 200, "resize right sidebar");
  // }); 

  function instantTopicSearch(elem, minSearchLength, jsonArray, format, maxList, selectFunction){
    
    var searchInput = $(elem);
    
    $.ui.autocomplete.prototype._renderItem = function (ul, item) {
        item.label = item.value.split('##')[0].replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + $.ui.autocomplete.escapeRegex(this.term) + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>");
        return $("<li></li>")
                .data("item.autocomplete", item)
                .attr( "data-value", item.value.split('##')[0] ).attr( "data-uri", item.value.split('##')[1] )
                .append("<a>" + item.label + "</a>")
                .appendTo(ul);
    };
        
    searchInput.autocomplete({
    
      minLength: minSearchLength,
      source: function( request, response ) {
      	  var matcher = new RegExp($.trim(request.term).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "i" );
      	  var resources = jsonArray;
      	  response($.grep(resources, function(value) {
      	    return matcher.test( value.label || value.value || value );
      	  }));
      	},
      change: function(event, ui){  

      },
  	  focus: function( event, ui ) {
  		  event.preventDefault();
  		  searchInput.val(ui.item.value.split('##')[0]);
  	  },
      select:function(event){
       
      },
      select: selectFunction
    });

    // Disable 'Enter' unless search is 3+ characters
    searchInput.keypress(function(e) {
      var code         = (e.keyCode ? e.keyCode : e.which),
          searchedText = (searchInput.val()).replace(/\s/g, '');
          searchLength = searchedText.length;
        
        if(code === 13) {
          return false;
           if(searchLength < minSearchLength){
              return false;
            }
             /*if($('.ui-menu-item a').length === 1 && $('.ui-menu-item a').text() === ""){
                // window.location.href = ""; 
            	e.preventDefault();
                return false; 
            }*/
        }
    });
  };
  return {
    instantTopicSearch : instantTopicSearch
  }
});