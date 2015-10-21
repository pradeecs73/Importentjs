define(['app','underscore','Q','services/encryptionService'],function(app, _, Q, encryptionService){
	return function(keywords){
		var queryParams = "?sortby=id&query="+keywords;
		var q = Q.defer();
		$.ajax({
			type: "GET",
            url: '/knowledgecenter/kotg/search/asset/' + queryParams,
            dataType: 'json',
            crossDomain: true,
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Accept", "application/json");
                xhr.setRequestHeader("Content-Type", "application/json");
                // xhr.setRequestHeader('Authorization', "Bearer " + localStorage.getItem("account_token"));
                var tagValue = App.getCookie('auth-token');
                xhr.setRequestHeader("XSS-Tag", encryptionService.assymEncrypt(tagValue));
            },
            success:function(res){
            	q.resolve(res);
            },
            error:function(){
            	q.reject();
            }
		});
		return q.promise;
	};
});