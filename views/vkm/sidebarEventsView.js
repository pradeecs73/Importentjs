define(["app",
	"text!templates/vkm/sidebarEvents.hbs",
	"httpClient"


], function(app, sidebarEvents, httpClient) {
		SidebarEventsView = Ember.View.extend({
			defaultTemplate: Ember.Handlebars.compile(sidebarEvents)

		});
	return SidebarEventsView;
});