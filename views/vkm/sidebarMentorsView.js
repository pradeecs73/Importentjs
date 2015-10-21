define(["app",
	"text!templates/vkm/sidebarMentors.hbs",
	"httpClient"


], function(app, sidebarMentors, httpClient) {
		SidebarMentorsView = Ember.View.extend({
			defaultTemplate: Ember.Handlebars.compile(sidebarMentors)

		});
	return SidebarMentorsView;
});