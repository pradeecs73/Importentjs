define(['app'], function (App) {
	Ember.Handlebars.registerBoundHelper('timeagofilter', function(time, local, raw) {
		if (!time) return "never";
	        var d = new Date();
		local = d.getTime();
        time = new Date(time).getTime();
        var offset = Math.abs((local - time) / 1000),
            span = [],
            MINUTE = 60,
            HOUR = 3600,
            DAY = 86400,
            WEEK = 604800,
            MONTH = 2629744,
            YEAR = 31556926,
            DECADE = 315569260;
        if (offset <= MINUTE)              span = [ '', raw ? 'now' : 'less than a minute' ];
        else if (offset < (MINUTE * 60))   span = [ Math.round(Math.abs(offset / MINUTE)), 'min' ];
        else if (offset < (HOUR * 24))     span = [ Math.round(Math.abs(offset / HOUR)), 'hr' ];
        else if (offset < (DAY * 7))       span = [ Math.round(Math.abs(offset / DAY)), 'day' ];
        else if (offset < (WEEK * 52))     span = [ Math.round(Math.abs(offset / WEEK)), 'week' ];
        else if (offset < (YEAR * 10))     span = [ Math.round(Math.abs(offset / YEAR)), 'year' ];
        else if (offset < (DECADE * 100))  span = [ Math.round(Math.abs(offset / DECADE)), 'decade' ];
        else                               span = [ '', 'a long time' ];
        span[1] += (span[0] === 0 || span[0] > 1) ? 's' : '';
        span = span.join(' ');
        if (raw === true) {
            return span;
        }
        return (time <= local) ? span + ' ago' : 'in ' + span;   
	});

	Ember.Handlebars.registerBoundHelper('removeHTMLTagsForEllipsisDisplay', function(text) {
		if(text) {
			text = text.replace(/<(?:.|\n)*?>/gm, '');
		} else {
			text = "";
		}
		if(text.length >= 140) {
			text = text.substring(0,140);
		}
		return text;
	});

	Ember.Handlebars.registerBoundHelper('discussioncount', function(discussions) {
		if(discussions) {
			return parseInt(discussions.length)-1;
		} 
		return 0;
	});

	Ember.Handlebars.registerBoundHelper('displayDate', function(text) {
		var d  = new Date(text),date = d.getDate();
		return (date < 10) ? '0' + date : date;
	});

	Ember.Handlebars.registerBoundHelper('displayMonth', function(text) {
		var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		var d  = new Date(text),m = d.getMonth();
		return months[m]; 
	});

	Ember.Handlebars.registerBoundHelper('displayTime', function(text) {
		var d  = new Date(text), hh = d.getHours(), m = d.getMinutes(), dd = "AM";
	    var h = hh;
	    if (h >= 12) {
	        h = hh-12;
	        dd = "PM";
	    }
	    h = (h == 0) ? 12 : h;
	    m = (m < 10) ? ("0" +m) : m;
	    return h+":"+m+" "+dd;
	});

	Ember.Handlebars.helper('avatarPerson', function (shortName, username) {
	  	if (username === null) return ;
	    var currentUsername = username,
	        isUsernameCurrent = username === currentUsername,
	        imageBaseName = (shortName == null ? null : shortName.toLowerCase()),
	        imgHtml = '<img class="img-circle pull-left" alt="' + shortName + '\'s Photo" src="/knowledgecenter/profiles/' + imageBaseName + '_mini.jpg" onerror="this.src=\'assets/avatars/noimage_mini.jpg\'"></img>';
	    if (isUsernameCurrent) {
	        return new Handlebars.SafeString('<a href="#/profile" class="inline-block">' + imgHtml + '</a>')
	    }
	    return new Handlebars.SafeString('<a class="inline-block" href="#/user/' + username + '" >' + imgHtml + '</a>')
	});

	Ember.Handlebars.helper('avatarMiniDisc', function (shortName) {
	  	var currentUsername = "ccl", imageBaseName = (shortName == null ? null : shortName.toLowerCase()),
			imgHtml = '<div class="pull-left"><img width="45" discussion_ppl_img=\"'+shortName+'\" style="margin:5px;" class="img-circle discussion_ppl_img" alt="' + shortName + '\'s Photo" title="' + shortName + '\'s Photo" src="/knowledgecenter/profiles/' + imageBaseName + '_mini.jpg" onerror="this.src=\'assets/avatars/noimage_mini.jpg\'"></img><div style=text-align:center>'+shortName.substring(0,6)+'</div></div>';
		return new Handlebars.SafeString(imgHtml);       
	});

	Ember.Handlebars.helper('displayobjecttype', function (objtype) {
	  	var imgHtml = '<img style="padding:10px 0 0 0;" align="center" alt="' + objtype + '" title="' + objtype + '" src="../../../assets/images/activity/' + objtype + '.png" onerror="this.src=\'assets/images/activity/default-category.png\'"></img>';
		return new Handlebars.SafeString(imgHtml);       
	});

	Ember.Handlebars.registerHelper('oddevenrow', function(index,options) {
		index = Ember.Handlebars.get(this, index, options);
		if (index % 2 == 0) {
		        return options.fn(this);
		} else {
	        	return options.inverse(this);
		}	
	});

	Ember.Handlebars.registerBoundHelper('truncateTitle', function(title) {
		if(title && title.length > 22) {
			title = title.substring(0,22) + "...";
		}
		return title;
	});
});