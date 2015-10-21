define([
	"ember",
	"text!templates/vkm/vkmModalTemplate.hbs",
	

], function(Ember, vkmModalTemplate) {
	var VkmModalView = Ember.View.extend({
		defaultTemplate: Ember.Handlebars.compile(vkmModalTemplate),

        didInsertElement: function() {

        	this._super();

			 // Primary Global Template
             vkmModalTemplateHtml = $('#vkm-modal-outer');

			
        } //end /didInsertElement

	});
	return VkmModalView;
});