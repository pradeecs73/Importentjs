define(['ember', 'jabberService', 'services/encryptionService', 'services/collaboration/userDetails', 'httpClientSync'],
    function (Ember, jabberService, encryptionService, userDetails, httpClientSync) {
        var value = {
            "configurationNames": ["FormalLearning", "KC", "Collaboration", "KOTG", "AcceptTermsAndConditions", "VKM"]
        };
        var preferenceToggleMap = {};
        _.each(_.pairs(httpClientSync.post('/knowledgecenter/tenantmanagement/configurations/preference', value)), function (preference) {
            preferenceToggleMap[preference[0]] = (preference[1].enabled == "true");
        });
        var configurableRoutesMap = {
            "myFileUploads": "Collaboration",
            "wikis": "Collaboration",
            "wiki": "Collaboration",
            "blogs": "Collaboration",
            "blog": "Collaboration",
            "questions": "Collaboration",
            "question": "Collaboration",
            "feeds": "Collaboration",
            "rssfeeds": "Collaboration",
            "communities": "Collaboration",
            "community": "Collaboration",
            "communityEdit": "Collaboration",
            "learningPlan": "FormalLearning",
            "quiz": "FormalLearning",
            "learningCourse": "FormalLearning",
            "trainingCatalog": "FormalLearning",
            "catalog": "FormalLearning",
            "myEnrollment": "FormalLearning",
            "shared": "FormalLearning",
            "learningPlans": "FormalLearning",
            "indLearningPlan": "FormalLearning",
            "plpDetails": "FormalLearning",
            "formalLearning": "FormalLearning",
            "profile.myprescribedlearningplans": "FormalLearning",
            "profile.myrecentlearnings": "FormalLearning",
            "profile.myplp": "FormalLearning",
            "adminReports.enrolment": "FormalLearning",
            "adminReports.learningPlan": "FormalLearning",
            "documents": "KC",
            "document": "KC",
            "documentEdit": "KC",
            "file": "KC",
            "myTags": "KOTG",
            "myContacts": "KOTG",
            "drives": "KOTG",
            "collections": "KOTG",
            "notes": "KOTG",
            "note": "KOTG",
            "sharedItems": "KOTG",
            "sharedItem": "KOTG",
            "trendingTopics": "KOTG",
            "vkmTopNav": "VKM",
            "vkmSidebar": "VKM",
            "vkmLeftNav": "VKM",
            "vkmHeader": "VKM",
            "map":"VKM"
        };

        var app = Ember.Application.create({
            LOG_TRANSITIONS: false,
            session: {
                feeds: [],
                users: [],
                groups: []
            },
            ready: function () {
                this.register('preferences:main', preferenceToggleMap, {instantiate: false});
                this.register('preferences:routes', configurableRoutesMap, {instantiate: false});
                this.inject('controller', 'preferences', 'preferences:main');
                this.inject('route', 'preferences', 'preferences:main');
                this.inject('route:application', 'configurableRoutes', 'preferences:routes');

            }
        });

        app.Router = Ember.Router.extend({
            enableLogging: true,
            didTransition: function (routes) {
                var transitionPath = "";
                for (var i = routes.length - 1; i > 0; i--) {
                    if (_.has(configurableRoutesMap, routes[i].name)) {
                        transitionPath = routes[i].name;
                        break;
                    }
                }
                if (!(configurableRoutesMap[transitionPath] == null) && !preferenceToggleMap[configurableRoutesMap[transitionPath]])
                    this.transitionTo("featureUnavailable");
                window.scrollTo(0, 0)
                $('.popover').hide();
                this._super(routes);
                var targetRoute = routes[1];
                if (targetRoute.name != "search") {
                    $(document).trigger("searchOutEvent");
                }
                var titleForAnalytics, categoryForAnalytics;
                try {
                    categoryForAnalytics = routes[1].name
                    if (routes[1].name == "document") {
                        titleForAnalytics = routes[1].context.description
                    }
                    else if (routes[1].name == "question") {
                        titleForAnalytics = routes[1].context.title
                        categoryForAnalytics = "Discussions"
                    }
                    else if (routes[1].name == "wiki" || routes[1].name == "blog") {
                        titleForAnalytics = routes[1].context.title
                    }
                    else if (routes[1].name == "community") {
                        titleForAnalytics = routes[2].context.name
                    }
                    else if (routes[1].name == "user") {
                        titleForAnalytics = routes[1].context.shortName + "(" + routes[1].context.fullName + " : " + routes[1].context.email + ")"
                    }
                    else if (routes[1].name == "learningCourse") {
                        titleForAnalytics = routes[1].context.courseDetails.title
                    }
                    else {
                        if (routes && (routes.length > 0) && routes[1].context && routes[1].context.name) {
                            titleForAnalytics = routes[1].context.name
                        } else {
                            titleForAnalytics = window.location.href
                        }
                    }
                    sessionStorage.setItem("titleForAnalytics", titleForAnalytics)
                    sessionStorage.setItem("categoryForAnalytics", categoryForAnalytics)
                } catch (err) {
                    console.log("Issue in sending analytics data: " + err)
                }
            }
        });

        app.getCookie = function (name) {
            var parts = document.cookie.split(name + '=');
            var value;
            if (parts.length == 2) {
                value = parts.pop().split(';').shift();
                return decodeURIComponent(value.replace(/\"/g, "")); //Temporary Hack to replace quoted and uri-encoded string
            }
        };
        
        app.uniqObjects = function( arrayOfObj ){
            return _.chain(arrayOfObj)
            .map(function(obj) {
            return JSON.stringify(obj)
            })
            .uniq()
            .map(function(stringified) {
            return JSON.parse(stringified)
            })
            .value();
        };

        app.setCookie = function (name, val) {
            document.cookie = document.cookie + ";" + name + "=" + val + ";";
        };

        app.getAuthToken = function () {
            return app.getCookie('auth-token');
        };

        app.videoUploadEnabled = function () {
            return app.getCookie('videoUploadEnabled') === "true";
        };

        app.getUsername = function () {
            return app.getCookie('username');
        };

        app.getEmailId = function () {
            return app.getCookie('username');
        };
        app.currentPathValue = '';

        app.getUserLoginId = function () {
            return app.getCookie('username');
        };

        app.getMoodleId = function () {
            return app.getCookie('moodleid');
        };

        app.getShortname = function () {
            return app.getCookie('shortName');
        };

        app.getMyJabberStatus = function () {
            if (jabberService.model.me.jabberId)
                return jabberService.model.me.statusName;
            return "offline";
        };

        app.PageSize = 12;
        app.Infinity = 9999;
        app.ReportPageSize = 200;
		app.todayDateinUnix = Math.round(new Date().getTime() / 1000);
        app.allowedVideoFileTypes = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'mpg', 'mpeg', 'webm', 'mkv', 'ogg', 'ogv', 'divx', 'xvid', '3gp', '3g2'],
            /* The below function accepts a string and returns emails that the string contain */
            app.extractEmail = function (strWithEmailAddress) {
                var separateEmailsBy = ", ";
                var email = "";
                var emailsArray = strWithEmailAddress.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
                if (emailsArray) {
                    email = "";
                    for (var i = 0; i < emailsArray.length; i++) {
                        if (i != 0) email += separateEmailsBy;
                        email += emailsArray[i];
                    }
                }
                return email;
            }

        /* Below function strips html chars */
        app.checkTitle = function (text) {
            var ck_title = /^[A-Za-z0-9_ .:!]*$/;
            return ck_title.test(text);
        }


        /* Below function strips html chars */
        app.HtmlCharsEncoder = function (simpleTextHolder) {
            var temporaryElement = document.createElement("div");
            temporaryElement.innerText = temporaryElement.textContent = simpleTextHolder;
            temporaryElement = temporaryElement.innerHTML;
            return temporaryElement;
        }

        app.profileImage = function (username, type) {
            return '/knowledgecenter/userpi/user/' + username + '/profile/image/_' + type + '?clock=' + new Date().getTime();
        }

        app.encryptionService = function (xhr) {
            var tagValue = App.getCookie('auth-token');
            if (typeof(headers) === 'undefined') var headers = {}
            headers["XSS-Tag"] = encryptionService.assymEncrypt(tagValue)
            headers["X-Source-Host"] = window.location.host
            _.each(_.keys(headers || {}), function (key) {
                xhr.setRequestHeader(key, headers[key]);
            });
        }

        /* Below function accepts content div from current DOM  and renders in new tab */
        app.displayContentInNewTab = function (htmlDOMElementForDisplay, parentSelectionFlag) {

            $("[class^='fullViewActionClass']").click(function () {
                try {
                    /* These temporary constructs shall be refactored */
                    var htmlDivConstruct = '<style>body{background-color: #e7e7e7;font-size: 13px;}';
                    htmlDivConstruct = htmlDivConstruct + '.fv-container .fv-detail-content {   width: 958px;   margin: 30px auto;  padding: 20px 0;    background: #fff;}';
                    htmlDivConstruct = htmlDivConstruct + '.fv-detail-content-text {margin-left: 20px; margin-right:20px; border-bottom:0px solid #e7e7e7; padding-bottom:20px}';
                    htmlDivConstruct = htmlDivConstruct + '.fv-entry-title {font-size: 2em;line-height: 1.3;font-weight:bold;}';
                    htmlDivConstruct = htmlDivConstruct + '.fv-entry-desc{color: #777!important;}';
                    htmlDivConstruct = htmlDivConstruct + '.fv-detail-content-left-holder{margin-left: 20px; margin-right:20px; padding-bottom:45px;padding-top:30px;border-bottom:1px solid #e7e7e7;}';
                    htmlDivConstruct = htmlDivConstruct + '.fv-detail-content-left-holder-image{ width:200px; float:left}';
                    htmlDivConstruct = htmlDivConstruct + '.fv-detail-content-left-holder-text{float:left;width:700px}';
                    htmlDivConstruct = htmlDivConstruct + '.fv-detail-content-right-holder{margin-left: 20px; margin-right:20px; padding-bottom:30px;padding-top:30px;border-bottom:1px solid #e7e7e7;}';
                    htmlDivConstruct = htmlDivConstruct + '.fv-detail-content-right-holder-image{ width:700px; float:left}';
                    htmlDivConstruct = htmlDivConstruct + '.fv-detail-content-right-holder-text{float:left;width:200px}';
                    htmlDivConstruct = htmlDivConstruct + '</style>';

                    htmlDivConstruct = htmlDivConstruct + '<div class="fv-container">';
                    htmlDivConstruct = htmlDivConstruct + '<div class="fv-detail-content">';
                    htmlDivConstruct = htmlDivConstruct + '<div class="fv-detail-content-text">';
                    htmlDivConstruct = htmlDivConstruct + '<div class="fv-entry-desc">';

                    if (parentSelectionFlag == 1) {
                        if (jQuery('.' + htmlDOMElementForDisplay).html()) {
                            htmlDivConstruct = htmlDivConstruct + jQuery('.' + htmlDOMElementForDisplay).html();
                        } else {
                            htmlDivConstruct = htmlDivConstruct + 'No details to display';
                        }

                    } else if (jQuery(this).attr("data-param-course") == "1") {
                        if (jQuery('#courseDeatilsCourseSummary').html()) {
                            htmlDivConstruct = htmlDivConstruct + jQuery('#courseDeatilsCourseSummary').html();
                        } else {
                            htmlDivConstruct = htmlDivConstruct + 'No details to display';
                        }

                    }

                    htmlDivConstruct = htmlDivConstruct + '</div></div></div></div>';
                    jQuery(window.open().document.body).html(htmlDivConstruct);
                } catch (err) {
                    jQuery(window.open().document.body).html("Error in Displaying Content");
                }

            });

        };

        var constructLinkForAnalytics = function (url) {
            var title = sessionStorage.getItem("titleForAnalytics");
            if (title == '' || title == 'undefined') {
                title = url
            }
            var constructLink = '<a target="_blank" href="/#' + url + '">' + title + '</a>'
            return constructLink;
        };

        app.Router.map(function () {

            this.resource("notifications", {
                path: "/notifications"
            }, function () {
                this.route("questions");
                this.route("endorsement");
            });

            this.resource("sysAdminStates", {
                path: "/sysadmin/states"
            });

            this.resource("activity");
            this.resource("streamactivity");

            this.resource("myAccount", {
                path: "/myAccount"
            });

            this.route("user", {
                path: "/user/:username"
            });

            this.route("followedUserActivties", {
                path: "/followed/user/activties"
            });

            this.route("allNotifications", {
                path: "/notification/all"
            });

            this.route("profileNotifications", {
                path: "/notification/profile"
            });

            this.resource("help", {
                path: "/help"
            });
            this.resource("featureUnavailable", {
                path: "/featureUnavailable"
            });
            this.resource("tnc", {
                path: "/tnc"
            });
            this.resource("tncUpdate", {
                path: "/tnc/update"
            });

            this.resource("passwordReset", {
                path: "/admin/resetPassword"
            });

            this.route("oauth");

            this.resource("home");

            this.resource("admin", function () {
                this.route("users");
                this.route("expertise");
                this.route("allactivities");
                this.route("categories");
                this.route("blogProxyAssignment");
                this.route("roles");
                this.route("licenseBatch");
                this.route("preferences");
            });
            this.resource("operation_admin", {
                path: "/operation_admin"
            });

            this.resource('people', function () {
                this.resource("expertUsers");
                this.resource("contacts");
            })

            this.resource("role", function () {
                this.route("add");
            });

            this.resource("profile", function () {
                this.route("my");
                this.route("myactivity");
                this.route("activitysettings");
            });


            this.resource("landing", {
                path: "/"
            });

            this.route("search", {
                path: "/search"
            });

            this.resource("vkmTopNav");
            this.resource("vkmSidebar");
            this.route("map", {
                path: "/vkm"
            });

            this.resource("topicPeople");
            this.resource("topicCourses");
            this.resource("topics", {
                path: "/knowledge-topic"
            });

            this.resource("vkmLeftNav");
            this.resource("vkmHeader");
            this.resource("pulse", {
                path: "/pulse"
            });
            this.resource("myTeam", {
                path: "/myTeam"
            });

        });

        app.Router.map(function () {
            this.resource("myFileUploads", {
                path: "/my-file-uploads"
            });

            this.resource("wikis", {
                path: "/wikis"
            }, function () {
                this.route('new');
                this.route('my');
            });

            this.resource("wiki", {
                path: "/wiki/:wiki_id"
            }, function () {
                this.route("edit");
            });

            this.resource("blogs", {
                path: "/blogs"
            }, function () {
                this.route('new');
                this.route('my');
            });

            this.resource("blog", {
                path: "/blog/:blog_id"
            }, function () {
                this.route("edit");
            });

            this.resource("questions", {
                path: "/questions"
            }, function () {
                this.route('new');
                this.route('my');
            });

            this.resource("question", {
                path: "/question/:question_id"
            }, function () {
                this.route("edit");
            });

            this.resource("feeds", {
                path: "/feeds"
            }, function () {
                this.route("index", {
                    path: "/index"
                });
                this.resource("feed", function () {
                    this.route("index", {
                        path: "/:name"
                    });
                });
            });

            this.resource("communities", function () {
                this.route("my");
                this.route("all");
                this.route('create');
            });

            this.resource("community", {path: '/community/:community_id'}, function () {
                this.route("edit");
                this.route('details');
                this.route('blogs');
                this.route("playbook",{path: '/playbook'},function(){
                });
                this.route('foundational',{path: 'playbook/foundational'});
                this.route('specialized',{path: 'playbook/specialized'});
                this.route('transformational',{path: 'playbook/transformational'});
                this.route('discussions');
                this.route('wikis');
                this.route('documents');
                this.route('members');
                this.route('files');
                this.route('proxies');
            });
            this.resource('communityEdit', {path: '/community/:community_id/edit'}, function () {
                this.route('edit');
            });

            this.resource("rssfeeds", function () {
                this.resource("rssfeedItems", {
                    path: ":name"
                })
            });

            this.resource("learningPlan", {
                path: "/learning-plan"
            });

            this.resource('quiz', {
                    path: '/launchQuiz/:quizId'
                },
                function () {
                    this.resource('launchquiz', {
                        path: ':courseId'
                    });
                });
            this.resource("learningCourse", {
                path: "/learningCourse/:courseid"
            }, function () {
                this.route("learningCourse");
            });

            this.resource("trainingCatalog", {
                path: "/trainingCatalog"
            });

            this.resource("catalog", {
                path: "/formalLearning/catalog"
            });

            this.resource("myEnrollment", {
                path: "/Learning/enrollments"
            });

            this.resource("shared", {
                path: "/Learning/shared"
            });

            this.resource("learningPlans", {
                path: "/Learning/learningPlans"
            });

            this.resource("indLearningPlan", {
                path: "/Learning/learningPlan/:id"
            });

            this.resource("plpDetails", {
                path: "/plpDetails/:id"
            });

            this.resource("formalLearning", {
                path: "/formal-learning"
            }, function () {
                this.route("my");
                this.route("catalog");
                this.route("shared");
                this.route("followed");
                this.route("liked");
                this.route("favorited");
                this.route("history");
            });

            this.resource("profile", function () {
                this.route("myprescribedlearningplans");
                this.route("myrecentlearnings");
                this.route("myplp");
            });

            /* this.resource("adminReports", function () {
                this.route("enrolment");
                this.route("learningPlan");
                this.route("dashboard");
            }); */

            /** Admin functionalities related  routes **/

            this.resource("userManagement", {path: "/admin/user"}, function () {
                this.route("users");
                this.route("roles", {path: "/roles_and_permissions"});
                this.route("registrations", {path: "/pending_registrations"});
                this.route("expertise", {path: "/expertise"});
            });

            this.resource("system", {path: "/admin/system"}, function () {
                this.route("licenseBatch", {path: "licensing"});
                this.route("preferences",{path:"site_management"});
            });

            this.resource("mobile",{path : "/admin/mobile"},function(){
                this.route("mobileFolder");
            });

            this.resource("collaborate",{path : "/admin/collaborate"}, function(){
                this.route("categories",{path: "categories"});
                this.route("blogProxyAssignment", {path: "blogproxyassignment"})
            });

            this.resource("reports",{path : "/admin/reporting"}, function(){
                this.route("usage",{path: "usage"});
                this.route("learningPlan", {path: "learningPlan"})
                this.route("enrollment", {path: "enrollment"})
                this.route("allactivities", {path: "global_activity_stream"})
            });

            /*
             TODO:Looks like this route creates problem while rendering training catalog page
             this.resource("shareds", {
             path: "/shareds"
             }, function() {
             this.resource("shared", {
             path: "/:id"
             });
             });
             */


            this.resource("documents", {
                path: "/documents"
            }, function () {
                this.route("my");
                this.route("catalog");
                this.route("shared");
            });

            this.resource("document", {
                path: "/document/:document_id"
            }, function () {
                this.route("catalog");
                this.route("my");
                this.route("shared");
                this.route("index");
            });

            this.resource("documentEdit", {
                path: "/document/:document_id/edit"
            }, function () {
                this.route("catalog");
                this.route("my");
                this.route("shared");
                this.route("index");
            });


            this.resource("file", function () {
                this.route("upload");
            });

            //}
            //if (preferenceMap["KOTG"] == "true") {



            this.resource("profile", function() {
                this.route("my");
                this.route("myactivity");
                this.route("activitysettings");
                this.route("myprescribedlearningplans"); 
                this.route("myrecentlearnings"); 
                this.route("myplp");
            });

            this.resource("myAccount", {
                path: "/myAccount"
            });

            this.route("user", {
                path: "/user/:username"
            });

            this.route("followedUserActivties", {
                path: "/followed/user/activties"
            });

            this.route("allNotifications", {
                path: "/notification/all"
            });

            this.route("profileNotifications", {
                path: "/notification/profile"
            });

            this.resource("help", {
                path: "/help"
            });
            this.resource("tnc", {
                path: "/tnc"
            });
            this.resource("tncUpdate", {
                path: "/tnc/update"
            });

            this.resource("passwordReset", {
                path: "/admin/resetPassword"
            });

            this.resource("vkmTopNav");
            this.resource("vkmSidebar");
            this.route("map", {
                path: "/vkm"
            });

            this.resource("topicPeople");
            this.resource("topicCourses");
            this.resource("topics", {
                path: "/knowledge-topic"
            });

            this.resource("vkmLeftNav");
            this.resource("vkmHeader");
            this.resource("pulse", {
                path: "/pulse"
            });
            this.resource("myTeam", {
                path: "/myTeam"
            });
            this.resource("pendingApprovals", {
                path: "/pendingApprovals"
            });
            this.resource("myTags", {
                path: "/myTags"
            });

            this.resource("myContacts", {
                path: "/myContacts"
            });

            this.resource("drives", {
                path: "/drives"
            }, function () {
                this.resource("drive", {
                    path: "/:id"
                });
            });

            this.resource("collections", {
                path: "/collections"
            }, function () {
            });

            this.resource("collection", {
                path: "/collection/:id"
            }, function () {
            });

            this.resource("notes", {
                path: "/notes"
            }, function () {
                this.route("add");
            });

            this.resource("note", {
                path: "/note/:id"
            }, function () {
                this.route("edit");
            });

            this.resource("sharedItems", {
                path: "/sharedItems"
            }, function () {
            });

            this.resource("sharedItem", {
                path: "/sharedItem/:id"
            }, function () {
            });

            this.resource("trendingTopics", {
                path: "/trending-topics"
            }, function () {
                this.resource("trendingTopic", {
                    path: "/:topic_name"
                });
            });

            this.resource("admin", function() {
                this.route("mobileFolder");
				this.route("registrations");
            });
        });

        Ember.LinkView.reopen({
            attributeBindings: ['data-toggle', 'data-target']
        });

        Ember.TextSupport.reopen({
            attributeBindings: ['required', 'title']
        });
        Ember.Router.reopen({
            notifyGoogleAnalytics: function () {
                return ga('send', 'pageview', {
                    'page': this.get('url'),
                    'title': constructLinkForAnalytics(this.get('url'))
                });
            }.on('didTransition')
        });
        Ember.Checkbox.reopen({
                attributeBindings: ['data-role-id', 'data-role-name']
            });

        window.App = app;

        return app;
    }
);
