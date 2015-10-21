define(["app"], function(app) {
	app.OauthRoute = Ember.Route.extend({
	    beforeModel: function() {
	    },
	    actions:{
	        didTransition: function(){
	            var query = location.hash.substr(location.hash.indexOf("?")+1);
	            var result = {};
	            query.split("&").forEach(function(part) {
	                var item = part.split("=");
	                result[item[0]] = decodeURIComponent(item[1]);
	            });

	            //console.log(location.href);
	            if (result.box_oauth_status){
	                if (result.box_oauth_status == 200){
	                    localStorage.setItem("box_token", result.access_token);
	                    localStorage.setItem("box_exptime", result.expires_in);
	                    localStorage.setItem("box_createtime", new Date());
	                    localStorage.setItem("box_reftoken", result.refresh_token);
	                    localStorage.setItem("box_oauth_status", 200);
	                    window.close();
	                } else {
	                    localStorage.setItem("box_oauth_status", 401);
	                    window.close();
	                    //认证失败了
	                }
	            } else {
	                window.close();
	            }
	            //window.close();
	        }
	    }
	});
});
