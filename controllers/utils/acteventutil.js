define(['app'], function (App) {
	App.ActEventUtil = Ember.Object.create({
		nextpeople : function (event, me) {
			var sliderImageWidth = parseFloat($(me).prev().width());
			var rightpos = parseFloat($($($(me).prev()).children()[0]).css("right")) + sliderImageWidth;
			var imgobj = $($(me).find('img[total-people]'));
			var total = parseInt(imgobj.attr("total-people")); // Divide the input val by 4, as we accomodate 4 images at one point of time.
			var totalimgwidth = parseInt($($($(me).prev()).find("div.pull-left")[0]).width())*total;
			if(rightpos <= totalimgwidth) {
				$($($(me).prev()).children()[0]).css("right",rightpos);
			}
			if((rightpos+sliderImageWidth) > totalimgwidth) {
				$(me).hide();
			}
			$(me).prev().prev().show();
			event.stopImmediatePropagation();
		},
		prevpeople : function (event, me) {
			var sliderImageWidth = parseFloat($(me).next().width());
			var rightpos = parseFloat($($($(me).next()).children()[0]).css("right")) - sliderImageWidth;
			if(rightpos > 0) {
				$($($(me).next()).children()[0]).css("right",rightpos);
			}  else {
				$($($(me).next()).children()[0]).css("right","3px");
			}
			if(rightpos  - sliderImageWidth < 0) {
				$(me).hide();
			}
			$(me).next().next().show();
			event.stopImmediatePropagation();
		},
		calculatelike : function (event, me) {
			if($(me).find("#__thumbs_up") && $(me).find("#__thumbs_up").css("color") == "rgb(119, 119, 119)") {
				var likecount = ($($(me).find("#__thumbs_up").closest(".active-stream-page").siblings(".activityrow")).find(".likeiconcls")).html();
				likecount = parseInt(likecount) + 1;
				if(isNaN(likecount)) {
					likecount = 0;
				}
				($($(me).find("#__thumbs_up").closest(".active-stream-page").siblings(".activityrow")).find(".likeiconcls")).html(likecount);
			} else {
				var likecount = ($($(me).find("#__thumbs_up").closest(".active-stream-page").siblings(".activityrow")).find(".likeiconcls")).html();
				likecount = parseInt(likecount) - 1;
				if(isNaN(likecount) || likecount < 0) {
					likecount = 0;
				}
				($($(me).find("#__thumbs_up").closest(".active-stream-page").siblings(".activityrow")).find(".likeiconcls")).html(likecount);
			}
		},
		showHideNextArrow : function() {
				var pplsection = $("[class^='avlblppl']");
				for(var i = 0; i < pplsection.length; i++) {
					var imgtg = $(pplsection[i]).find("img");
					var wdt = ($(imgtg[0]).parent()).width();
					var totwidth = wdt * imgtg.length;
					var parentwdt = $($(pplsection[i]).parent()).width();
					if(parseInt(totwidth)-10 > parseInt(parentwdt)) {
						$($($(pplsection[i]).parent()).next()).show();
					} else {
						$($($(pplsection[i]).parent()).next()).hide();
					}
				}
		}
	});
});