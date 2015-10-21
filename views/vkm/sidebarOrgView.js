define(["app",
	"ember",
	"text!templates/vkm/sidebarOrg.hbs",
	"httpClient"
	

], function(app, Ember, sidebarOrg, httpClient) {
		SidebarOrgView = Ember.View.extend({
			defaultTemplate: Ember.Handlebars.compile(sidebarOrg),
			
		});
	return SidebarOrgView;
});
