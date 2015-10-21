var userProfileData = null;
define(["app",
	"ember",
	"text!templates/vkm/mapTemplate.hbs",
	'httpClient',
	"services/vkmservices/landingDemoService",
	"services/usersService",
	"pages/vkmui-init-events",
	"pages/vkmui-circular-maps",
	"pages/vkm-sidebar-filters",
	"raphael",
	"pages/vkmui-modals",
	"controllers/utils/vkmuiUtil"
	
], function(app, Ember, mapTemplate, httpClient, landing_Demo, usersService, vkmui_init, vkmui_maps, vkm_sidebar, raphael, vkm_modals, vkm_utils) {
	App.MapView = Ember.View.extend({

		classNameBindings: ['vkmMapPage'],
  		vkmMapPage: true,

		defaultTemplate: Ember.Handlebars.compile(mapTemplate),

        didInsertElement: function() {
        	var self = this,
        		controller = self.get('controller'),
        		vkmui = app.vkmui;
        		this._super();
        	
        	var dropdown = [
                {"name": "Endorsed Topics",
                  "value": "myendorseMap"
                },
                {"name": "Activity Topics",
                "value": "myMap"
                },
                {"name": "Job Role Topics",
                  "value": "jobRoleMap"
                },
                {"name": "Organization Topics",
                 "value": "orgMap"
                }
            ];
            
           
            //controller.set('dropdown', dropdown);
            //console.log(dropdown);
        	//$('body').addClass('vkm-page vkm-map-page');

        	$(window).on('resize', function(){

				if($(window).width() < 768){
					var dispTxt = 'Best viewed on 10" Tablet, Laptop and Desktop';
					vkm_utils.showDeviceAlert($(window).width(), $(window).height(), dispTxt);
				}else{
					vkm_utils.removeDeviceAlert();
				}

				vkmui.waitForFinalEvent(function(){
					vkmui.initSlider('#blog-slider');
					vkmui.initSlider('#docs-slider');
					vkmui.initSlider('#forums-slider');
					vkmui.initSlider('#wiki-slider');
				}, 200, "resize right sidebar");
      		}); 

			if($(window).width() < 768){
			   var displayText = 'Best viewed on 10" Tablet, Laptop and Desktop';
			   vkm_utils.showDeviceAlert($(window).width(), $(window).height(), displayText);
			}

		    var vkmUiOptions = {
		        slidePanelEl: '#rightPanelTabs',
		        outerPanel: '.widget-body',
		        slideAnimCls: 'nav-slide',
		        slideActiveCls: 'active',
		        slideTimer: 150,
		        topicSearchField: '#searchTopicsInput',
				topicFormWrap: '#searchTopicsForm',
				topRightPanelTabs: '.vkm-top-panel-right',
				showTopicDetailCls: 'show-topic-contents'
		    }

		    window['mapLayoutOptions'] = {
			  	radius: 250,
			  	vertical: 450,
			  	startAngle: 180,
			  	nodeRadius: 34,
			  	outer: "#social-map",
			  	inner: "#map-content"
			};

			myUserId = userName; // for demo only... needs to be dynamically tested
			startingType = "user";
			currentUserIsMe = true;

			landing_Demo.getCommunities().then(function (communityarray){
				communityarry = communityarray;
			}, function(error){
				vkm_utils.getServiceError("Communities", error);
            });

			landing_Demo.getAllCourses().then(function (datacourses){
				courses = datacourses[8];
			}, function(error){
				vkm_utils.getServiceError("Courses", error);
            });
			
			landing_Demo.getUserData(emailId).then(function(profileData){
				userProfileData = profileData;
				//vkmui_init.initLoad(myUserId, startingType,  window['mapLayoutOptions'], userProfileData, self);

				$.ajaxSetup({ cache: true });
				$.when(
					$.getJSON( 'assets/data/vkm/navigation.json' ),
					$.getJSON( 'assets/data/vkm/users.json' )
				).done(function(data1, data2) {
					window['navData']       = data1[0];
					window['userData']      = data2[0];
					// Display Main Menu after the service calls are complete
					vkmui_maps.displayMainMenu(window['mapLayoutOptions'], userProfileData);
					window['currentEntityType'] = startingType;
				});

				if(typeof(isBodyOnclickEvent) === "undefined"){
 					vkm_sidebar.initRightNavClickEvents();
				}
				//App.vkmui.filterPopulate(idClicked); //need to check if this is needed
		    	//vkmui.initUx('#vkm-window', vkmUiOptions);
		    
				var emailId;
  				usersService.myProfile().then(function (data){
					emailId = data.email;
				});

		 	}, function(error){
				vkm_utils.getServiceError("Profile Summary", error);
            });

        }

	});

	App.clickKnowledgeView = Ember.View.extend({
		click: function(e) {
			var mapClickTarget = $(e.target);
			this.get('controller').send('callConnections', mapClickTarget, e);
		}
	});

	return App.MapView;
});