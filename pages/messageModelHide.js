define([], function() {

    var addHideMessageModelEvent = function(divId) {
    	if(divId) {
    		$('.close').click(function () {
            	jQuery('#' + divId ).addClass('hide');
        	});
    	} 
    }

    return {
    	addHideMessageModelEvent: addHideMessageModelEvent
    };
});
