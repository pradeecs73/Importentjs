define([
	"ember",
	"text!templates/vkm/vkmHeaderTemplate.hbs"
], function(Ember, vkmHeaderTemplate) {
	var VkmHeaderView = Ember.View.extend({
		defaultTemplate: Ember.Handlebars.compile(vkmHeaderTemplate)
	});
	return VkmHeaderView;
});