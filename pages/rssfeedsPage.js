define([], function() {

  function initialize() {
    var self = this;

    $("#navbar").on("resize", function(){
      if(self.smallerScreen()){
        $.each($(".js-rss-feed-link"), function(i, rssfeedLink){
          if($(rssfeedLink).hasClass("active")){
            self.expandFeedDetails($(rssfeedLink))
          } else {
            self.collapseFeedDetails($(rssfeedLink))
          }
        })
      }
    })

    $(document).delegate(".js-rss-feed-link", 'click', function(event){
      console.log("clicked")
      var elem = $(event.currentTarget)
      if(self.smallerScreen()){
        if(elem.hasClass("js-accordion-closed")){
          self.expandFeedDetails(elem);
        }
        else {
          $(".js-rss-feeds-names").addClass("result-closed");
          self.collapseFeedDetails(elem);
        }
      }
      event.stopPropagation()
    })
  };

  function expandFirstRssFeed() {
    var self = this;
    window.scrollTo(0,0)
    $.each($(".js-rss-feed-link"), function(i, rssfeedLink){
      if(i === 0){
        self.expandFeedDetails($(rssfeedLink))
      } else {
        self.collapseFeedDetails($(rssfeedLink))
      }
    })
  };

  function toggleIconDown(icon) {
    icon.removeClass("icon-chevron-right")
    icon.addClass("icon-chevron-down")
  }

  function toggleIconRight(icon) {
    icon.removeClass("icon-chevron-down")
    icon.addClass("icon-chevron-right")
  }

  function collapseFeedDetails(rssFeedLink) {
    rssFeedLink.addClass("js-accordion-closed");
    this.toggleIconRight(rssFeedLink.find(".js-direction-icon"));
  };

  function expandFeedDetails(rssFeedLink) {
    $(".js-rss-feeds-names").removeClass("result-closed");
    rssFeedLink.removeClass("js-accordion-closed");
    this.toggleIconDown(rssFeedLink.find(".js-direction-icon"));
  };

  function undelegateEvents() {
    $(document).undelegate(".js-rss-feed-link", 'click')
  };

  function smallerScreen() {
    return parseInt(window.innerWidth) < 786;
  };

  return {
    smallerScreen: smallerScreen,
    initialize: initialize,
    undelegateEvents: undelegateEvents,
    expandFeedDetails: expandFeedDetails,
    collapseFeedDetails: collapseFeedDetails,
    toggleIconRight: toggleIconRight,
    toggleIconDown: toggleIconDown,
    toggleIconDown: toggleIconDown,
    expandFirstRssFeed: expandFirstRssFeed

  }
})
