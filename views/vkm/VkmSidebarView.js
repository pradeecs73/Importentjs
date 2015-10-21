
define(["app",
	"ember",
	"Q",
	"services/vkmservices/landingDemoService",
	"text!templates/vkm/vkmSidebarTemplate.hbs"
], function(app, Ember, Q, landing_Demo, vkmSidebarTemplate) {
	var VkmSidebarView = Ember.View.extend({
		defaultTemplate: Ember.Handlebars.compile(vkmSidebarTemplate),
		didInsertElement:function(){
			var controller = this.get('controller'),
				self = this;
			Q.all([
				landing_Demo.populateOrg(),
				landing_Demo.populateLocation(),
				landing_Demo.populateJobtitle()
			]).spread(function(organizations, locations, jobTitles){
				controller.set("model", {});
				controller.set("organizations", organizations);
				controller.set("locations", locations);
				controller.set("jobRoles", jobTitles);
			})
		}
	});
	return VkmSidebarView;
});