define([], function() {
    return {
      initialize: function() {
						$('#skin-colorpicker').ace_colorpicker();
						$('#skin-colorpicker').on('change', function(){
								var skin_class = $(this).find('option:selected').data('skin');

								var body = $(document.body);
								body.removeClass('skin-1 skin-2 skin-3');


								if(skin_class != 'default') body.addClass(skin_class);

								if(skin_class == 'skin-1') {
									$('.ace-nav > li.grey').addClass('dark');
								}
								else {
									$('.ace-nav > li.grey').removeClass('dark');
								}

								if(skin_class == 'skin-2') {
									$('.ace-nav > li').addClass('no-border margin-1');
									$('.ace-nav > li:not(:last-child)').addClass('light-pink').find('> a > [class*="icon-"]').addClass('pink').end().eq(0).find('.badge').addClass('badge-warning');
								}
								else {
									$('.ace-nav > li').removeClass('no-border margin-1');
									$('.ace-nav > li:not(:last-child)').removeClass('light-pink').find('> a > [class*="icon-"]').removeClass('pink').end().eq(0).find('.badge').removeClass('badge-warning');
								}

								if(skin_class == 'skin-3') {
									$('.ace-nav > li.grey').addClass('red').find('.badge').addClass('badge-yellow');
								} else {
									$('.ace-nav > li.grey').removeClass('red').find('.badge').removeClass('badge-yellow');
								}
						});
            $('#ace-settings-btn').on(ace.click_event, function(){
                $(this).toggleClass('open');
                $('#ace-settings-box').toggleClass('open');
            });
      }
    }
});