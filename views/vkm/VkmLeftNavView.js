define([
	"ember",
	"text!templates/vkm/vkmLeftNavTemplate.hbs"
], function(Ember, vkmLeftNavTemplate) {
	var VkmLeftNavView = Ember.View.extend({		
		defaultTemplate: Ember.Handlebars.compile(vkmLeftNavTemplate),
        didInsertElement: function() {
        	// alert($('body').attr('class'));
        }
	});
	return VkmLeftNavView;
});