'use strict';

define(['app', 'text!templates/breadcrumbs.hbs'],
    function(app, breadcrumbsTemplate) {
        App.BreadcrumbsView = Ember.View.extend({
            template: Ember.Handlebars.compile(breadcrumbsTemplate),
            click: function(e) {
                var self = this;
                var targetElement = $(e.target)[0];
                if (targetElement.nodeName.toLowerCase() == "a") {
                    self.controller.target.reset();
                    self.controller.transitionTo(self.controller.currentRouteName);
                }
            }
        });

        Ember.Handlebars.registerBoundHelper('registerPath', function(pathForBreadCrumb) {

            if (this.currentRouteName === 'myTeam' && this.currentRouteName != pathForBreadCrumb) {
                pathForBreadCrumb = 'refreshmyTeam';
            }
            if (pathForBreadCrumb != 'learningCourse.index' && this.currentRouteName != 'catalog') {
                $('#_trainingCatalog > a').removeClass("active");
            }
            if (pathForBreadCrumb != 'blog.index' && this.currentRouteName != 'blogs.index') {
                $('#_blogs > a').removeClass("active");
            }
            if (pathForBreadCrumb != 'question.index' && this.currentRouteName != 'questions.index') {
                $('#_questions > a').removeClass("active");
            }
            if (pathForBreadCrumb != 'wiki.index' && this.currentRouteName != 'wikis.index') {
                $('#_wikis > a').removeClass("active");
            }
            if (pathForBreadCrumb != 'learningPlans' && this.currentRouteName != 'indLearningPlan') {
                $('#_learningPlans > a').removeClass("active");
            }
            if (pathForBreadCrumb != 'documents.catalog' && this.currentRouteName != 'document') {
                $('#_documentsCatalog > a').removeClass("active");
            }
            if (pathForBreadCrumb != 'documents.my' && this.currentRouteName != 'document.my') {
              $('#_documentsMy > a').removeClass("active");
            }
            if (pathForBreadCrumb != 'documents.shared' && this.currentRouteName != 'document.shared') {
              $('#_documentsShared > a').removeClass("active");
            }
            if (pathForBreadCrumb != 'communities.all' && this.currentRouteName != 'community.index') {
                $('#_communities > a').removeClass("active");
            }
            if (pathForBreadCrumb != 'collection.index' && this.currentRouteName != 'collections.index') {
                $('#mf-collections > a').removeClass("active");
            }
            if (pathForBreadCrumb != 'note.index' && this.currentRouteName != 'notes.index') {
                $('#mf-notes > a').removeClass("active");
            }
            if (pathForBreadCrumb != 'sharedItem.index' && this.currentRouteName != 'sharedItems.index') {
                $('#mf-sharedItems > a').removeClass("active");
            }
            var path = "<li><i class='icon-home home-icon'></i><a href='#'>Workspace</a></li>";
            $('div > #breadcrumbs').addClass('arwbreadcrumb')
            if(pathForBreadCrumb == "landing") {
                Ember.run.scheduleOnce('afterRender', this, function() {
                    $('div > #breadcrumbs').removeClass('arwbreadcrumb');
                });
                path = "";

            }
            switch (pathForBreadCrumb) {

                case 'profile.my':
                    path += "<li><a href='#/profile/my'>Profile</a></li>";
                    path += "<li class='active'>My Profile</li>";
                    break;

                case 'profile.myactivity':
                    path += "<li><a href='#/profile/my'>Profile</a></li>";
                    path += "<li class='active'>My Activities</li>";
                    break;

                case 'trendingTopics':
                    path += "<li><a href='#/trending-topics'>Profile</a></li>";
                    path += "<li class='active'>Trending Topics</li>";
                    break;

                case 'profile.activitysettings':
                    path += "<li><a href='#/profile/my'>Profile</a></li>";
                    path += "<li class='active'>Activity Stream Preferences</li>";
                    break;
                    
                case 'profile.myprescribedlearningplans':
                    path += "<li><a href='#/profile/my'>Profile</a></li>";
                    path += "<li class='active'>Prescribed Learning Plans</li>";
                    break;
                    
                case 'profile.myrecentlearnings':
                    path += "<li><a href='#/profile/my'>Profile</a></li>";
                    path += "<li class='active'>Recent Learnings</li>";
                    break;
                    
                case 'trendingTopics':
                    path += "<li class='active'>Topics</li>";
                    break;

                case 'blogs.index':
                    path += "<li><a href='#/blogs?filterType=all&pageNumber=1&searchText=&filters='>Collaborate</a></li>";
                    //path += "<li><a href='#/blogs?filterType=all&pageNumber=1&searchText=&filters='>Blogs</a></li>";
                    path += "<li class='active'>Blogs</li>";
                    break;

                case 'blog.index':
                    path += "<li><a href='#/blogs?filterType=all&pageNumber=1&searchText=&filters='>Collaborate</a></li>";
                    path += "<li><a href='#/blogs?filterType=all&pageNumber=1&searchText=&filters='>Blogs</a></li>";
                    $('#_blogs > a').addClass("active");
                    break;

                case 'blogs.my':
                    path += "<li><a href='#/blogs?filterType=all&pageNumber=1&searchText=&filters='>Collaborate</a></li>";
                   //path += "<li><a href='#/blogs?filterType=all&pageNumber=1&searchText=&filters='>Blogs</a></li>";
                    path += "<li class='active'>Blogs</li>";
                    break;

                case 'blogs.recent':
                    path += "<li><a href='#/blogs'>Collaborate</a></li>";
                    //path += "<li><a href='#/blogs'>Blogs</a></li>";
                    path += "<li class='active'>Blogs</li>";
                    break;

                case 'blogs.shared':
                    path += "<li><a href='#/blogs'>Collaborate</a></li>";
                    //path += "<li><a href='#/blogs'>Blogs</a></li>";
                    path += "<li class='active'>Blogs</li>";
                    break;

                case 'blogs.followed':
                    path += "<li><a href='#/blogs'>Collaborate</a></li>";
                    //path += "<li><a href='#/blogs'>Blogs</a></li>";
                    path += "<li class='active'>Blogs</li>";
                    break;

                case 'blogs.liked':
                    path += "<li><a href='#/blogs'>Collaborate</a></li>";
                   // path += "<li><a href='#/blogs'>Blogs</a></li>";
                    path += "<li class='active'>Blogs</li>";
                    break;

                case 'blogs.favorited':
                    path += "<li><a href='#/blogs'>Collaborate</a></li>";
                    //path += "<li><a href='#/blogs'>Blogs</a></li>";
                    path += "<li class='active'>Blogs</li>";
                    break;

                case 'blogs.new':
                    path += "<li><a href='#/blogs'>Collaborate</a></li>";
                    path += "<li><a href='#/blogs'>Blogs</a></li>";
                    path += "<li class='active'>Create New Blog</li>";
                    $('#_blogs > a').addClass("active");
                    break;

                case 'blogs.edit':
                    path += "<li><a href='#/blogs'>Collaborate</a></li>";
                    path += "<li><a href='#/blogs'>Blogs</a></li>";
                    path += "<li class='active'>Edit Blog</li>";
                    $('#_blogs > a').addClass("active");
                    break;

                case 'questions.my':
                    path += "<li><a href='#/questions?filterType=my&pageNumber=1&searchText=&filters='>Collaborate</a></li>";
                    //path += "<li><a href='#/questions?filterType=my&pageNumber=1&searchText=&filters='>Questions</a></li>";
                    path += "<li class='active'>Discussions</li>";
                    break;
                    
                case 'questions.index':
                    path += "<li><a href='#/questions?filterType=all&pageNumber=1&searchText=&filters='>Collaborate</a></li>";
                   // path += "<li><a href='#/questions?filterType=all&pageNumber=1&searchText=&filters='>Questions</a></li>";
                    path += "<li class='active'>Discussions</li>";
                    break;
                    
                case 'question.index':
                    path += "<li><a href='#/questions?filterType=all&pageNumber=1&searchText=&filters='>Collaborate</a></li>";
                    path += "<li><a href='#/questions?filterType=all&pageNumber=1&searchText=&filters='>Discussions</a></li>";
                    $('#_questions > a').addClass("active");
                    break;

                case 'questions.recent':
                    path += "<li><a href='#/questions'>Collaborate</a></li>";
                    //path += "<li><a href='#/questions'>Questions</a></li>";
                    path += "<li class='active'>Discussions</li>";
                    break;

                case 'questions.shared':
                    path += "<li><a href='#/questions'>Collaborate</a></li>";
                   // path += "<li><a href='#/questions'>Questions</a></li>";
                    path += "<li class='active'>Discussions</li>";
                    break;

                case 'questions.followed':
                    path += "<li><a href='#/questions'>Collaborate</a></li>";
                   // path += "<li><a href='#/questions'>Questions</a></li>";
                    path += "<li class='active'>Discussions</li>";
                    break;

                case 'questions.liked':
                    path += "<li><a href='#/questions'>Collaborate</a></li>";
                    //path += "<li><a href='#/questions'>Questions</a></li>";
                    path += "<li class='active'>Discussions</li>";
                    break;

                case 'questions.favorited':
                    path += "<li><a href='#/questions'>Collaborate</a></li>";
                    //path += "<li><a href='#/questions'>Questions</a></li>";
                    path += "<li class='active'>Discussions</li>";
                    break;

                case 'questions.new':
                    path += "<li><a href='#/questions'>Collaborate</a></li>";
                    path += "<li><a href='#/questions'>Discussions</a></li>";
                    path += "<li class='active'>Start a Discussion</li>";
                    $('#_questions > a').addClass("active");
                    break;

                case 'questions.edit':
                    path += "<li><a href='#/questions'>Collaborate</a></li>";
                    path += "<li><a href='#/questions'>Discussions</a></li>";
                    path += "<li class='active'>Edit a Discussion</li>";
                    $('#_questions > a').addClass("active");
                    break;

                case 'wikis.my':
                    path += "<li><a href='#/wikis?filterType=all&pageNumber=1&searchText=&filters='>Collaborate</a></li>";
                    //path += "<li><a href='#/wikis?filterType=all&pageNumber=1&searchText=&filters='>Wikis</a></li>";
                    path += "<li class='active'>Wikis</li>";
                    break;
                    
                case 'wikis.index':
                    path += "<li><a href='#/wikis?filterType=all&pageNumber=1&searchText=&filters='>Collaborate</a></li>";
                    //path += "<li><a href='#/wikis?filterType=all&pageNumber=1&searchText=&filters='>Wikis</a></li>";
                    path += "<li class='active'>Wikis</li>";
                    break;
                    
                case 'wiki.index':
                    path += "<li><a href='#/wikis?filterType=all&pageNumber=1&searchText=&filters='>Collaborate</a></li>";
                    path += "<li><a href='#/wikis?filterType=all&pageNumber=1&searchText=&filters='>Wikis</a></li>";
                    $('#_wikis > a').addClass("active");
                    break;

                case 'wikis.recent':
                    path += "<li><a href='#/wikis'>Collaborate</a></li>";
                    //path += "<li><a href='#/wikis'>Wikis</a></li>";
                    path += "<li class='active'>Wikis</li>";
                    break;

                case 'wikis.shared':
                    path += "<li><a href='#/wikis'>Collaborate</a></li>";
                    //path += "<li><a href='#/wikis'>Wikis</a></li>";
                    path += "<li class='active'>Wikis</li>";
                    break;

                case 'wikis.liked':
                    path += "<li><a href='#/wikis'>Collaborate</a></li>";
                    //path += "<li><a href='#/wikis'>Wikis</a></li>";
                    path += "<li class='active'>Wikis</li>";
                    break;

                case 'wikis.favorited':
                    path += "<li><a href='#/wikis'>Collaborate</a></li>";
                    //path += "<li><a href='#/wikis'>Wikis</a></li>";
                    path += "<li class='active'>Wikis</li>";
                    break;

                case 'wikis.followed':
                    path += "<li><a href='#/wikis'>Collaborate</a></li>";
                   //path += "<li><a href='#/wikis'>Wikis</a></li>";
                    path += "<li class='active'>Wikis</li>";
                    break;

                case 'wikis.new':
                    path += "<li><a href='#/wikis'>Collaborate</a></li>";
                    path += "<li><a href='#/wikis'>Wikis</a></li>";
                    path += "<li class='active'>Create New Wiki</li>";
                    $('#_wikis > a').addClass("active");
                    break;

                case 'wikis.edit':
                    path += "<li><a href='#/wikis'>Collaborate</a></li>";
                    path += "<li><a href='#/wikis'>Wikis</a></li>";
                    path += "<li class='active'>Edit Wiki</li>";
                    $('#_wikis > a').addClass("active");
                    break;

                case 'feeds.index':
                    path += "<li class='active'>Feeds</li>";
                    break;

                case 'expertUsers':
                    path += "<li class='active'>Expertise</li>";
                    break;
                    
                case 'help':
                    path += "<li class='active'>Help</li>";
                    break;

                case 'myFileUploads':
                    path += "<li class='active'>my file uploads</li>";
                    break;

                case 'contacts':
                    path += "<li class='active'>Contacts</li>";
                    break;

                case 'pulse':
                    path += "<li class='active'>Pulse</li>";
                    break;

                case 'myTags':
                    path += "<li class='active'>My Tags</li>";
                    break;

                case 'myContacts':
                    path += "<li class='active'>My Contacts</li>";
                    break;


                case 'catalog':
                    path += "<li><a href='#/formalLearning/catalog'>Learning</a></li>";
                    path += "<li class='active'>Training Catalog</li>";
                    break;
                case 'learningCourse':
                    var controller = this.controllerFor("learningCourse");
                    path += "<li><a href='#/formalLearning/catalog'>Learning</a></li>";
                    if(controller.content.title){
                      path += "<li class='active'>" + App.StringUtils.trim(controller.content.title) + "</li>";
                    }
                    break;
                case 'learningCourse.index':
                    path += "<li><a href='#/formalLearning/catalog'>Learning</a></li>";
                    path += "<li class='active'>Training Catalog</li>";
                    $('#_trainingCatalog > a').addClass("active");
                    break;

                 case 'myEnrollment':
                    path += "<li><a href='#/Learning/enrollments'>Learning</a></li>";
                    path += "<li class='active'>My Enrollments</li>";
                    break;
                case 'shared':
                    path += "<li><a href='#/Learning/shared'>Learning</a></li>";
                    path += "<li class='active'>Shared Learning</li>";
                    break;
                case 'learningPlans':
                case 'plpDetails':
                    path += "<li><a href='#/Learning/learningPlans'>Learning</a></li>";
                    path += "<li class='active'>Learning Plans</li>";
                    break;
                case 'indLearningPlan':
                    path += "<li><a href='#/Learning/learningPlans'>Learning</a></li>";
                    path += "<li class='active'>Individual Learning Plan</li>";
                    $('#_learningPlans > a').addClass("active");
                    break;

                
                
                
                

                case 'rssfeeds.index':
                    path += "<li><a href='#/rssfeeds'>Collaborate</a></li>";
                    path += "<li class='active'>Feeds</li>";
                    break;

                case 'rssfeeds.rssfeedItems':
                    path += "<li><a href='#/rssfeeds'>Collaborate</a></li>";
                    path += "<li class='active'>Feeds</li>";
                    break;

                case 'people.contacts':
                    path += "<li><a href='#/people/contacts'>People</a></li>";
                    path += "<li class='active'>All People</li>";
                    break;

                case 'people.expertUsers':
                    path += "<li><a href='#/people/contacts'>People</a></li>";
                    path += "<li class='active'>Experts</li>";
                    break;

                case 'user':
                    var controller = this.controllerFor("user");
                    path += "<li><a href='#/people/contacts'>People</a></li>";
                    if(controller.content.fullName) {
                      path += "<li class='active'>" + App.StringUtils.trim(controller.content.fullName) + "</li>"
                    }
                    break;

                case 'documents.catalog':
                    var controller = this.controllerFor("documentsCatalog");
                    path += "<li><a href='#/documents/catalog?filterType=all&pageNumber=1&searchText=&filters='>Knowledge Center</a></li>";
                    path += "<li class='active'>"+controller.pageTitle+"</li>";
                    break;

                case 'documents.my':
                    var controller = this.controllerFor("documentsMy");
                    path += "<li><a href='#/documents/catalog?filterType=all&pageNumber=1&searchText=&filters='>Knowledge Center</a></li>";
                    path += "<li class='active'>"+controller.pageTitle+"</li>";
                    break;

                case 'documents.shared':
                    var controller = this.controllerFor("documentsShared");
                    path += "<li><a href='#/documents/catalog?filterType=all&pageNumber=1&searchText=&filters='>Knowledge Center</a></li>";
                    path += "<li class='active'>"+controller.pageTitle+"</li>";
                    break;

                case 'document.my':
                    var controller = this.controllerFor("document");
                    var myController = this.controllerFor("documentsMy");
                    path += "<li><a href='#/documents/catalog?filterType=all&pageNumber=1&searchText=&filters='>Knowledge Center</a></li>";
                    path += "<li class='active'><a href='#/documents/my?filterType=all&pageNumber=1&searchText=&filters='>"+ myController.pageTitle+"</a> </li>"
                    if (controller.content.title) {
                         path += "<li>" + App.StringUtils.trim(controller.content.title) + "</li>"
                    }
                    $('#_documentsMy > a').addClass("active");
                    break;

                case 'document.catalog':
                    var controller = this.controllerFor("document");
                    var catalogController = this.controllerFor("documentsCatalog");
                    path += "<li><a href='#/documents/catalog?filterType=all&pageNumber=1&searchText=&filters='>Knowledge Center</a></li>";
                    path += "<li class='active'><a href='#/documents/catalog?filterType=all&pageNumber=1&searchText=&filters='>"+catalogController.pageTitle+"</a></li>"
                    if (controller.content.title) {
                      path += "<li>" + App.StringUtils.trim(controller.content.title) + "</li>"
                    }
                    $('#_documentsCatalog > a').addClass("active");
                    break;

                case 'document.shared':
                    var controller = this.controllerFor("document");
                    var sharedController = this.controllerFor("documentsShared");
                    path += "<li><a href='#/documents/catalog?filterType=all&pageNumber=1&searchText=&filters='>Knowledge Center</a></li>";
                    path += "<li class='active'><a href='#/documents/shared?filterType=all&pageNumber=1&searchText=&filters='>"+sharedController.pageTitle+"</a></li>"
                    if (controller.content.title) {
                      path += "<li>" + App.StringUtils.trim(controller.content.title) + "</li>"
                    }
                    $('#_documentsShared > a').addClass("active");
                    break;
                    
                case 'document.index':
                    var controller = this.controllerFor("document");
                    path += "<li><a href='#/documents/catalog?filterType=all&pageNumber=1&searchText=&filters='>Knowledge Center</a></li>";
                    if (controller.content.title) {
                      path += "<li>" + App.StringUtils.trim(controller.content.title) + "</li>"
                    }
                    break;

                case 'documentEdit.catalog':
                    var controller = this.controllerFor("documentEdit");
                    var catalogController = this.controllerFor("documentsCatalog");
                    path += "<li><a href='#/documents/catalog?filterType=all&pageNumber=1&searchText=&filters='>Knowledge Center</a></li>";
                    path += "<li class='active'><a href='#/documents/catalog?filterType=all&pageNumber=1&searchText=&filters='>"+catalogController.pageTitle+"</a></li>"
                    if (controller.pageTitle) {
                      path += "<li class='active'>" + App.StringUtils.trim(controller.pageTitle) + "</li>"
                    }
                    $('#_documentsCatalog > a').addClass("active");
                    break;
                    
                case 'documentEdit.my':
                    var controller = this.controllerFor("documentEdit");
                    var myController = this.controllerFor("documentsMy");
                    path += "<li><a href='#/documents/catalog?filterType=all&pageNumber=1&searchText=&filters='>Knowledge Center</a></li>";
                    path += "<li class='active'><a href='#/documents/my?filterType=all&pageNumber=1&searchText=&filters='>"+myController.pageTitle+"</a> </li>"
                    if (controller.pageTitle) {
                      path += "<li class='active'>" + App.StringUtils.trim(controller.pageTitle) + "</li>"
                    }
                    $('#_documentsMy > a').addClass("active");
                    break;
                    
                case 'documentEdit.shared':
                    var controller = this.controllerFor("documentEdit");
                    var sharedController = this.controllerFor("documentsShared");
                    path += "<li><a href='#/documents/catalog?filterType=all&pageNumber=1&searchText=&filters='>Knowledge Center</a></li>";
                    path += "<li class='active'><a href='#/documents/shared?filterType=all&pageNumber=1&searchText=&filters='>"+sharedController.pageTitle+"</a></li>"
                    if (controller.pageTitle) {
                      path += "<li class='active'>" + App.StringUtils.trim(controller.pageTitle) + "</li>"
                    }
                    $('#_documentsShared > a').addClass("active");
                    break;
                    
                case 'documentEdit.index':
                    var controller = this.controllerFor("documentEdit");
                    path += "<li><a href='#/documents/catalog?filterType=all&pageNumber=1&searchText=&filters='>Knowledge Center</a></li>";
                    if (controller.pageTitle) {
                      path += "<li class='active'>" + App.StringUtils.trim(controller.pageTitle) + "</li>"
                    }
                    break;

                case 'communities.all':
                    path += "<li><a href='#/communities/all?filterType=all&pageNumber=1&searchText=&filters='>Collaborate</a></li>";
                    path += "<li class='active'>Communities</li>";
                    break;

                case 'communities.create':
                    path += "<li><a href='#/communities/all?filterType=all&pageNumber=1&searchText=&filters='>Collaborate</a></li>";
                    path += "<li class='active'>Create Community</li>";
                    $('#_communities > a').addClass("active");
                    break;

                case 'community.edit':
                    path += "<li><a href='#/communities/all?filterType=all&pageNumber=1&searchText=&filters='>Collaborate</a></li>";
                    path += "<li class='active'>Edit Community</li>";
                    $('#_communities > a').addClass("active");
                    break;

                case 'communities.my':
                    path += "<li><a href='#/communities/my?filterType=all&pageNumber=1&searchText=&filters='>Collaborate</a></li>";
                    path += "<li class='active'>My Communities</li>";
                    break;
                    
                case 'community.index':
                    var controller = this.controllerFor("community.index");
                    path += "<li><a href='#/communities/all?filterType=all&pageNumber=1&searchText=&filters='>Collaborate</a></li>";
                    if(controller.content.name) {
                      path += "<li class='active'>" + App.StringUtils.trim(controller.content.name) + "</li>"
                    }
                    $('#_communities > a').addClass("active");
                    break;

                case 'collections.index':
                    path += "<li><a href='#/collections'>Mobile Folder</a></li>";
                    path += "<li class='active'>My Collections</li>";
                    break;

                case 'collection.index':
                    path += "<li><a href='#/collections'>Mobile Folder</a></li>";
                    path += "<li><a href='#/collections'>My Collections</a></li>";
                    $('#mf-collections > a').addClass("active");
                    break;

                case 'notes.index':
                    path += "<li><a href='#/collections'>Mobile Folder</a></li>";
                    path += "<li class='active'>My Notes</li>";
                    break;

                case 'notes.add':
                    path += "<li><a href='#/collections'>Mobile Folder</a></li>";
                    path += "<li><a href='#/notes'>My Notes</a></li>";
                    path += "<li class='active'>Add</li>";
                    $('#mf-notes > a').addClass("active");
                    break;

                case 'note.index':
                    path += "<li><a href='#/collections'>Mobile Folder</a></li>";
                    path += "<li><a href='#/notes'>My Notes</a></li>";
                    $('#mf-notes > a').addClass("active");
                    break;

                case 'note.edit':
                    path += "<li><a href='#/collections'>Mobile Folder</a></li>";
                    path += "<li><a href='#/notes'>My Notes</a></li>";
                    path += "<li class='active'>Edit</li>";
                    $('#mf-notes > a').addClass("active");
                    break;
                    
                case 'sharedItems.index':
                    path += "<li><a href='#/collections'>Mobile Folder</a></li>";
                    path += "<li class='active'>Shared Folders</li>";
                    break;

                case 'sharedItem.index':
                    path += "<li><a href='#/collections'>Mobile Folder</a></li>";
                    path += "<li><a href='#/sharedItems'>Shared Folders</a></li>";
                    $('#mf-sharedItems > a').addClass("active");
                    break;

                case 'drives.index':
                    path += "<li><a href='#/drives'>Mobile Folder</a></li>";
                    path += "<li class='active'>Box</li>";
                    break;

                case 'drives.drive':
                    path += "<li><a href='#/drives'>Mobile Folder</a></li>";
                    path += "<li class='active'>Box</li>";
                    break;

                case 'drive.index':
                    Ember.set(this.controllerFor('application'), "currentPath", "drives.index");
                    break;
                    
                case 'activity':
                    path += "<li class='active'>Activity Stream</li>";
                    break;    

                case 'followedUserActivties':
                    path += "<li><a href='#/followed/user/activties'>Notification</a></li>";
                    path += "<li class='active'>Followers</li>";
                    break;

                case 'notifications.endorsement':
                    path += "<li><a href='#/notifications/endorsement'>Notification</a></li>";
                    path += "<li class='active'>Endorsements</li>";
                    break;
                    
                case 'notifications.questions':
                    path += "<li><a href='#/notifications/questions'>Notification</a></li>";
                    path += "<li class='active'>Discussions</li>";
                    break;
                    
                case 'notifications.index':
                    path += "<li class='active'><a href='#/notifications'>Notification</a></li>";
                    break;
                    
                case 'admin.model':
                    path += "<li><a href='#/admin/model'>Admin</a></li>";
                    path += "<li class='active'>Model</li>";
                    break;
                    
                case 'admin.categorise':
                    path += "<li><a href='#/admin/model'>Admin</a></li>";
                    path += "<li class='active'>Categorise</li>";
                    break;
                    
                case 'admin.users':
                    path += "<li><a href='#/admin/model'>Admin</a></li>";
                    path += "<li class='active'>Users</li>";
                    break;
                    
                case 'admin.documents':
                    path += "<li><a href='#/admin/model'>Admin</a></li>";
                    path += "<li class='active'>Documents</li>";
                    break;
                    
                case 'admin.expertise':
                    path += "<li><a href='#/admin/model'>Admin</a></li>";
                    path += "<li class='active'>Areas of Expertise</li>";
                    break;
                    
                case 'admin.allactivities':
                    path += "<li><a href='#/admin/model'>Admin</a></li>";
                    path += "<li class='active'>All Activities</li>";
                    break;
                    
                case 'search':
                    path += "<li class='active'>Find Answers</li>";
                    break;
                    
                case 'allNotifications':
                    path += "<li><a href='#/notification/all'>Notification</a></li>";
                    path += "<li class='active'>All Notifications</li>";
                    break;
                    
                case "myTeam":
                    var controller = this.controllerFor("myTeam");
                    path += "<li class='active'><a href='#/myTeam' class='breadcrummyteam'>Manager</a></li>";
                    path += "<li class='active'><a href='#/myTeam' class='breadcrummyteam'>My Team</a></li>"; 

                     if(controller.managerUserName){
                         path += "<li class='active' >"+controller.managerUserName+"'s Team</li>";
                     }
                     $(".breadcrummyteam").click(function(){
                           var manageruserid=app.getUsername();
                           var managershortname=app.getShortname();
                           controller.transitionToRoute('myTeam',{queryParams:{manageruniqueid:manageruserid,managerUserName:managershortname,filters:"",searchText:"",pageNumber:1}});   
                        });

                    break;

                case "refreshmyTeam":
                    var controller = this.controllerFor("myTeam");
                    path += "<li class='active'><a href='#/myTeam' class='breadcrumrefreshmyteam'>Manager</a></li>";
                    path += "<li class='active'><a href='#/myTeam' class='breadcrumrefreshmyteam'>My Team</a></li>"; 
    
                     if(controller.managerUserName){
                         path += "<li class='active'>"+controller.managerUserName+"'s Team</li>";
                     }

                     $(".breadcrumrefreshmyteam").click(function(){
                           var manageruserid=app.getUsername();
                           var managershortname=app.getShortname();
                           controller.transitionToRoute('myTeam',{queryParams:{manageruniqueid:manageruserid,managerUserName:managershortname,filters:"",searchText:"",pageNumber:1}});   
                        });

                    break;
                    
                case "map":
                    path += "<li class='active'>Knowledge Map</li>";
                    break;
                
                case "topics":
                    path += "<li><a href='#/vkm'>Knowledge Map</a></li>"
                    path += "<li class='active'>Knowledge Topic</li>";
                    break;

                case 'admin.roles':
                    path += "<li><a href='#/admin/model'>Admin</a></li>";
                    path += "<li class='active'>Roles and Permissions</li>";
                    break;
                    
               case 'adminReports.enrolment':
                    path += "<li><a href='#/adminReports/enrolment'>Admin</a></li>";
                    path += "<li class='active'>Reports</li>";
                    break;

                case 'adminReports.learningPlan':
                    path += "<li><a href='#/adminReports/enrolment'>Admin</a></li>";
                    path += "<li class='active'>Reports</li>";
                    break;
                case 'pendingApprovals':
                    path += "<li><a href='#/pendingApprovals'>Pending Approvals</a></li>";
                    path += "<li class='active'>Pending Approvals</li>";
                    break;
            }

            //return pathForBreadCrumb;
            return new Handlebars.SafeString(path);
        });

    });