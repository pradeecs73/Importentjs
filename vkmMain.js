define(["app",
	'views/vkm/ApplicationView',
    'views/vkm/mapView',
    'views/vkm/TopicsView',
    'views/vkm/VkmHeaderView',
    'views/vkm/VkmLeftNavView',
    'views/vkm/VkmSidebarView',
    'views/vkm/VkmTopNavView',
    'views/vkm/topicPeopleView',
    'views/vkm/VkmModalView',
    'views/vkm/topicCoursesView',
    'views/vkm/topicCommunityView',
    'views/vkm/topicAssetsView',
    'views/vkm/topicAssetsBlogsView',
    'views/vkm/topicAssetsDocumentsView',
    'views/vkm/topicAssetsForumsView',
    'views/vkm/topicAssetsWikisView',
    'views/vkm/sidebarOrgView',
    'views/vkm/sidebarLocationsView',
    'views/vkm/sidebarJobTitlesView',
    'views/vkm/sidebarTopicClassificationView',
    'views/vkm/sidebarRelatedTopicsView',
    'views/vkm/sidebarCommunitiesView',
    'views/vkm/sidebarCoursesView',
    'views/vkm/sidebarDocumentsView',
    'views/vkm/sidebarBlogsView',
    'views/vkm/sidebarWikisView',
    'views/vkm/sidebarForumsView',
    'views/vkm/sidebarEventsView',
    'views/vkm/sidebarMentorsView',
    'views/vkm/sidebarExpertsView',
    'controllers/vkm/mapController',
	
], function(app, ApplicationView, MapView, TopicsView,  VkmHeaderView, VkmLeftNavView, VkmSidebarView, VkmTopNavView, topicPeopleView, vkmModalView, topicCoursesView, topicCommunityView, topicAssetsView, topicAssetsBlogsView, topicAssetsDocumentsView, topicAssetsForumsView, topicAssetsWikisView, sidebarOrgView, sidebarLocationsView, sidebarJobTitlesView, sidebarTopicClassificationView, sidebarRelatedTopicsView, sidebarCommunitiesView, sidebarCoursesView, sidebarDocumentsView, sidebarBlogsView, sidebarWikisView, sidebarForumsView, sidebarEventsView, sidebarMentorsView, sidebarExpertsView,
 MapController) {

	/*Module Pattern*/
	var vkmApp = {
		VkmView: ApplicationView,
		MapView: MapView,
		TopicsView: TopicsView,
		VkmHeaderView: VkmHeaderView,
		VkmLeftNavView: VkmLeftNavView,
		VkmSidebarView: VkmSidebarView,
		VkmTopNavView: VkmTopNavView,
		MapController: MapController,
		TopicPeopleView: topicPeopleView,
		VkmModalView: vkmModalView,
		TopicCoursesView: topicCoursesView,
		TopicCommunityView: topicCommunityView,
		TopicAssetsView: topicAssetsView,
		TopicAssetsBlogsView : topicAssetsBlogsView,
		TopicAssetsDocumentsView : topicAssetsDocumentsView,
		TopicAssetsForumsView : topicAssetsForumsView,
		TopicAssetsWikisView : topicAssetsWikisView,
		SidebarOrgView : sidebarOrgView,
		SidebarLocationsView : sidebarLocationsView,
		SidebarJobTitlesView : sidebarJobTitlesView,
		SidebarTopicClassificationView : sidebarTopicClassificationView,
		SidebarRelatedTopicsView : sidebarRelatedTopicsView,
		SidebarCommunitiesView : sidebarCommunitiesView,
		SidebarCoursesView : sidebarCoursesView,
		SidebarDocumentsView : sidebarDocumentsView,
		SidebarBlogsView : sidebarBlogsView,
		SidebarWikisView : sidebarWikisView,
		SidebarForumsView : sidebarForumsView,
		SidebarEventsView : sidebarEventsView,
		SidebarMentorsView : sidebarMentorsView,
		SidebarExpertsView : sidebarExpertsView
		//IndexRoute: IndexRoute
	};

	// Run jQuery in Controllers
	Ember.View.reopen({
	  didInsertElement : function(){
		this._super();
		Ember.run.scheduleOnce('afterRender', this, this.afterRenderEvent);
	  },
	  afterRenderEvent : function(){
		if (window.favorite) window.favorite.render();
	  }
	});
	var vkmKeys = Object.keys(vkmApp);
	vkmKeys.forEach( function(key){
		app[key] = vkmApp[key];
	});

	return vkmApp;
});