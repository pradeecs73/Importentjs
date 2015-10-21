define(['app'], function(App) {
  App.PopOverUtils = Ember.Object.create({
    popoverCatalog: function() {
      var self = this;

      $(".withPopOver a,.withPopOver input").click(function(event) {
        event.stopPropagation();
      });

      $('body').on('click', function(e) {
        $('.popover.fade.right').css( "display", "none", "important");
        $('.popover.fade.left').css( "display", "none", "important");

        $("[data-toggle='popover']").each(function() {
          if ($(this).is(e.target) || $(this).has(e.target).length != 0){
            if (!self.popoverExists($(this))) {
              self.createPopover($(this))
            }
            $(this).popover('toggle');
          }
          if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
            if (self.popoverExists($(this))) {
              $(this).popover('hide');
              //<Vaibhav> - Temporary fix to change the popover display to none. Bootstrap 3.1.1 has this issue fixed
              $('.popover.fade.right').css( "display", "none", "important");
              $('.popover.fade.left').css( "display", "none", "important");
            }
          }
        })
      });
    },

    createPopover: function(ele){
      ele.popover({
        selector: '.withPopOver',
        trigger: 'manual',
        html: true,
        delay: {show: 100, hide: 10},
        content: function() {
          return $(this).find('.catalogPopover').html()
        }
      });
    },

    popoverExists: function(ele){
      return !!ele.data('bs.popover');
    }
  });
})
