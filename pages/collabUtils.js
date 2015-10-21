define([], function() {

        var openUrlInPostContentInNewTab = function() {
        	/* Avoided greedy DOM search and depends on the only class in that post view page. */
            jQuery(".message-body").find("a").prop("target","_blank");
        }

        return{
        	openUrlInPostContentInNewTab : openUrlInPostContentInNewTab
        };

});