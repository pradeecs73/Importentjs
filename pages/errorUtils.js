define([], function(){
  return{
    showErrorMessage: function(message, errorSpanIdentifier){
      var errorSpan = $(errorSpanIdentifier);
      errorSpan.text(message)
        .removeClass("hide")
        .fadeIn("fast").delay(2000)
        .fadeOut("slow");
    }
  }
})
