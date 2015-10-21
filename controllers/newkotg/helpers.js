'use strict'

define(['ember', 'app'],
    function(Ember, app) {
				Ember.Handlebars.helper('showDomain', function(str) {
						var result = " ";
						if(str) {
							var p = $("<a>");
							var x = p[0];
							x.href = str;
							result = x.hostname;
						}
						return result;
				});
    });
