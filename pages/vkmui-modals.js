define(["app", "raphael", "pages/vkmui-circular-maps", "pages/vkmui-topic-bubbles", "pages/vkm-sidebar-filters", "services/vkmservices/landingDemoService", "pages/vkm-sidebar-filters"],function(app, Raphael, vkmui_circular, vkmui_bubbles, vkm_sidebar, landing_demo, vkm_sidebar){
	vkmui = app.vkmui;

// vCard Controls
window['vcard_button_close'] = {
  "button_class": "close-hover-modal",
  "button_icon": "x-thin"
};

window['vcard_button_target'] = {
  "button_class": "open-target-map",
  "button_icon": "crosshair"  
};

window['vcard_button_message'] = {
  "button_class": "send-message",
  "button_icon": "envelope-closed-light"
};

window['vcard_button_webex'] = {
  "button_class": "start-webex",
  "button_icon": "webex"
};

// vCard Summary Tab Links
window['vcard_tablink_people'] = {
  "button_class": "user-group3",
  "connection": "people",
  "connection_catg": "people",
  "data_prefix": "user"
};

window['vcard_tablink_communities'] = {
  "button_class": "community-dark",
  "connection": "communities",
  "connection_catg": "people",
  "data_prefix": "community"
};

window['vcard_tablink_files'] = {
  "button_class": "file-stack-filled",
  "connection": "files",
  "connection_catg": "content",
  "data_prefix": "file"
};

window['vcard_tablink_courses'] = {
  "button_class": "book-open-user",
  "connection": "courses",
  "connection_catg": "content",
  "data_prefix": "course"
};

window['vcard_tablink_assets'] = {
  "button_class": "cubes-three",
  "connection": "assets",
  "connection_catg": "content",
  "data_prefix": "asset"
};

window['vcard_tablink_rated'] = {
  "button_class": "star",
  "connection": "rated",
  "connection_catg": "content",
  "data_prefix": "asset"
};

window['vcard_tablink_shared'] = {
  "button_class": "arrow-shared",
  "connection": "shared",
  "connection_catg": "content",
  "data_prefix": "asset"
};

window['vcard_tablink_follow'] = {
  "button_class": "user-plus",
  "connection": "follow",
  "connection_catg": "content",
  "data_prefix": "asset"
};

window['vcard_tablink_favorite'] = {
  "button_class": "heart",
  "connection": "favorite",
  "connection_catg": "content",
  "data_prefix": "asset"
};

// USER MODAL
window['vcardLayout_user'] = {
  "modal_title": "Connection Details",
  "default_photo": "assets/images/vkm/defaults/default-node-user.png",
  "control_buttons": [
    window['vcard_button_close'],
    window['vcard_button_target'],
    window['vcard_button_message'],
    window['vcard_button_webex']  
  ],

  "summary_tabs": [
    window['vcard_tablink_people'],
    window['vcard_tablink_communities'],
    window['vcard_tablink_files'],
    window['vcard_tablink_courses'],
    window['vcard_tablink_assets']
  ]
}

// COMMUNITY MODAL
window['vcardLayout_community'] = {
  "modal_title": "Community Details",
  "default_photo": "assets/images/vkm/defaults/default-node-community.png",
  "control_buttons": [
    window['vcard_button_close'],
    window['vcard_button_target']
  ],
  "summary_tabs": [
    window['vcard_tablink_people'],
    window['vcard_tablink_rated'],
    window['vcard_tablink_shared'],
    window['vcard_tablink_follow'],
    window['vcard_tablink_favorite']
  ]
}

// FILE MODAL
window['vcardLayout_file'] = {
  "modal_title": "Document Details",
  "default_photo": "assets/images/vkm/defaults/default-node-file.png",
  "control_buttons": [
    window['vcard_button_close'],
    window['vcard_button_target']
  ],
  "summary_tabs": [
    window['vcard_tablink_rated'],
    window['vcard_tablink_shared'],
    window['vcard_tablink_follow'],
    window['vcard_tablink_favorite']
  ]
}

// COURSE MODAL
window['vcardLayout_course'] = {
  "modal_title": "Course Details",
  "default_photo": "assets/images/vkm/defaults/default-node-course.png",
  "control_buttons": [
    window['vcard_button_close'],
    window['vcard_button_target']
  ],
  "summary_tabs": [
    window['vcard_tablink_rated'],
    window['vcard_tablink_shared'],
    window['vcard_tablink_follow'],
    window['vcard_tablink_favorite']
  ]
}

// ASSET MODAL
window['vcardLayout_asset'] = {
  "modal_title": "Asset Details",
  "default_photo": "assets/images/vkm/defaults/default-node-asset.png",
  "control_buttons": [
    window['vcard_button_close'],
    window['vcard_button_target']
  ],
  "summary_tabs": [
    window['vcard_tablink_people'],
    window['vcard_tablink_communities'],
    window['vcard_tablink_files'],
    window['vcard_tablink_courses'],
    window['vcard_tablink_assets']
  ]
}

window['vcardLayout_blog'] = {
  "modal_title": "Blog Details",
  "default_photo": "assets/images/vkm/defaults/default-node-blog.png",
  "control_buttons": [
    window['vcard_button_close'],
    window['vcard_button_target']
  ],
  "summary_tabs": [
    window['vcard_tablink_rated'],
    window['vcard_tablink_shared'],
    window['vcard_tablink_follow'],
    window['vcard_tablink_favorite']
  ]
}

window['vcardLayout_forum'] = {
  "modal_title": "Forum Details",
  "default_photo": "assets/images/vkm/defaults/default-node-forum.png",
  "control_buttons": [
    window['vcard_button_close'],
    window['vcard_button_target']
  ],
  "summary_tabs": [
    window['vcard_tablink_rated'],
    window['vcard_tablink_shared'],
    window['vcard_tablink_follow'],
    window['vcard_tablink_favorite']
  ]
}

window['vcardLayout_wiki'] = {
  "modal_title": "Wiki Details",
  "default_photo": "assets/images/vkm/defaults/default-node-wiki.png",
  "control_buttons": [
    window['vcard_button_close'],
    window['vcard_button_target']
  ],
  "summary_tabs": [
    window['vcard_tablink_rated'],
    window['vcard_tablink_shared'],
    window['vcard_tablink_follow'],
    window['vcard_tablink_favorite']
  ]
}


// COMPARISON MODAL
window['vcardLayout_comparison'] = {
  "modal_title": "Insights and Engagement Level",
  "control_buttons": [
    window['vcard_button_close']
  ]
}

// make sure to initialize 'modalTemplateEl' globally ... there may be 2 for different types of modals
var renderModal = function(layoutType, modalContainer, modalTemplate, modalLayoutObj, modalCallback){	

	var modalWrap    = modalTemplate.clone(),
	modalWrapClass   = modalWrap.attr('class'),
	vkmModal         = modalWrap.find('.vkm-modal'),
	vkmModalBg       = modalWrap.find('.vkm-modal-bg'),
	modalInnerWrap 	 = vkmModal.find('.vkm-modal-inner-wrap'),
	controlsWrap   	 = modalInnerWrap.find('.modal-control-panel'),
	vCardEntityTypeVal = (modalLayoutObj.vcard_entity_type),
	allInnerContents    = vkmModal.find('.vkm-modal-content'),
	thisModalContent    = vkmModal.find('.vkm-modal-content-'+layoutType),
	
	modalTitle       	= modalInnerWrap.find('.modal-title h5');

	vkmModal.attr('id', 'vkm-modal-'+modalLayoutObj['modal_id']);
	vkmModal.addClass('vkm-modal-'+modalLayoutObj['modal_id']);
	modalTitle.text(modalLayoutObj.modal_title);

	// Control Buttons Wrapper
	controlsWrap.html('');
	var linkVal;
	$.each(modalLayoutObj.modal_control_buttons, function(b, controlBtn) {
		linkVal = "";
		if(b == 1){
			if(vCardEntityTypeVal === "user" && modalLayoutObj.vcard_entity_obj.personId !== ""){
				linkVal = "#/user/"+modalLayoutObj.vcard_entity_obj.personId;
			}else if(vCardEntityTypeVal === "course" && modalLayoutObj.vcard_entity_obj[0].url !== ""){
				linkVal = "#/learningCourse/"+vCardGetId(modalLayoutObj.vcard_entity_obj[0].url);
			}else if(vCardEntityTypeVal === "community" && modalLayoutObj.vcard_entity_obj[0].communityURI !== ""){
				linkVal = "#/community/"+vCardGetId(modalLayoutObj.vcard_entity_obj[0].communityURI);
			}else if(vCardEntityTypeVal === "file" && modalLayoutObj.vcard_entity_obj[0]["object"].url !== ""){
				linkVal = "#/document/"+vCardGetId(modalLayoutObj.vcard_entity_obj[0]["object"].url)+"/my";
			}else if(vCardEntityTypeVal === "forum" && modalLayoutObj.vcard_entity_obj[0]["object"].url !== ""){
				linkVal = "#/question/"+vCardGetId(modalLayoutObj.vcard_entity_obj[0]["object"].url);
			}else if((vCardEntityTypeVal === "blog" || vCardEntityTypeVal === "wiki") && modalLayoutObj.vcard_entity_obj[0]["object"].url !== ""){
				linkVal = "#/"+modalLayoutObj.vcard_entity_type +"/"+vCardGetId(modalLayoutObj.vcard_entity_obj[0]["object"].url);
			}
		}else if(b === 2 && vCardEntityTypeVal === "user"){
			linkVal = "mailto:"+modalLayoutObj.vcard_entity_obj.personId;
		}
		//var profileEmailId = (modalLayoutObj.vcard_entity_obj.personId) ? (modalLayoutObj.vcard_entity_obj.personId) : emailId;
		var newButton   = '<a href="'+linkVal+'" class="btn '+controlBtn['button_class']+'" data-icon-before="'+controlBtn['button_icon']+'" />';
		controlsWrap.append(newButton);
	});

	// Content
	allInnerContents.remove();
	modalInnerWrap.append(thisModalContent)

	// Tab Content (i.e., Updater Modals)
	if(layoutType == "tabbed"){
		modalTabbedContent(thisModalContent, modalLayoutObj.modal_structure);
	} 
	//============================================================================================
	// vCard Modals (when clicking on circular nodes)
	if(layoutType == "vcard"){
		//thisModalContent.addClass('vcard-'+modalLayoutObj.vcard_entity_type+'-content');
		thisModalContent.addClass('vcard-user-content');
		vcardModal(thisModalContent, modalLayoutObj);
	} 

	// Clear Out Template 
	if(modalTemplate.length > 0){
		modalTemplate.remove();
	}

	// ... and Any Previous Modals...
	clearExistingModals(modalWrap);

	// Height Constants
	var topNavHeight    = $('#navbar').height(),
		topVkmNavHeight = $('#vkm-navbar').height(),
		totalTopHeights = topNavHeight + topVkmNavHeight;
	
	var containerWidth  = $(modalLayoutObj.modal_draggable).width(),
		containerHeight = $(modalLayoutObj.modal_draggable).height() - totalTopHeights;

	$(window).on('resize', function(){
		$(vkmModalBg).css({
			"width": "100%",
			"height": "100%",
			"top": "0",
			"left": "0",
			"position": "fixed"
		})
	});

	// Append New Modal to VKM Widget Body (but keep hidden)
	$(modalContainer).prepend(modalWrap);

	// Display Modal 
	$(vkmModal).show(function(){

		// Do Any Custom Callback After Modal Renders
		var thisModal = $(vkmModal);

		modalCallback(thisModal, modalWrapClass, modalLayoutObj);

		// Actually Show by Revealing Outer
		$(modalWrap).show();

		$(vkmModalBg).css({
			"width": "100%",
			"height": "100%",
			"top": "0",
			"left": "0",
			"position": "fixed"
		}).fadeIn(300, function(){
			vkmModal.addClass('active');
			//$('#vkm-modal-vcard .mCustomScrollbar').mCustomScrollbar();
		});



	});
}


var vCardGetId = function(url){
	var vCardUrl = url;
	var vCardUrlId = vCardUrl.split("/");
	return vCardUrlId[vCardUrlId.length - 1];
}


/*

function fakeModal(modalEl, topicId){

	var modalWrapper     = $(modalEl);

	console.log(topicId)

	var vkmModalBg       = modalWrapper.find('.vkm-modal-bg'),
		widgetBody       = $('.widget-body'),
		topNavHeight     = $('#navbar').height(),
		topVkmNavHeight  = $('#vkm-navbar').height(),
		totalTopHeights  = topNavHeight + topVkmNavHeight;

	$(vkmModalBg).css({ 
		"width": $(widgetBody).width()+"px", 
		"height": $(widgetBody).height()+"px"
	}).fadeIn(300, function(){

		modalWrapper.find('.image-wrap').show();
		modalWrapper.fadeIn();

	  	modalWrapper.find('.image-wrap').draggable({ 
	    	containment: ".widget-body"
	  	}); 

	  	modalWrapper.find('.topic-target').on('click', function(){
	        $(modalWrapper).fadeOut(function(){

	        	modalWrapper.find('.image-wrap').hide();
	  			renderTopic(topicId);
	        });
	  	})

	    modalWrapper.find('.close-hover-modal').on('click', function(){
	        $(modalWrapper).fadeOut();
	        modalWrapper.find('.image-wrap').hide();
	    });		
	});

	$(window).on('resize', function(){
		$(vkmModalBg).css({ 
			"width": widgetBody.width()+"px",
			"height": (widgetBody.height() - totalTopHeights)+"px"		
		})
	});	

  	
	 	
}*/


// VCARD MODALS ELEMENTS

// VCARD BASE 
var vcardModal = function(modalContentWrap, modalStructure){

	var vcardTabs      = modalContentWrap.find('.vcard-entity-summary');
		//vcardContent   = modalContentWrap.find('#vcard-modal-tab-content');

	vcardEntityObj     = modalStructure.vcard_entity_obj,
	vcardEntityType    = modalStructure.vcard_entity_type,
	vcardEntityId      = modalStructure.vcard_entity_id,
	vcardTabLayout     = window['vcardLayout_'+window['vcardType']].summary_tabs,
	vcardRelatedMax    = modalStructure.vcard_related_max,

	// vcardSummary
	vcardTabs.html('');
	//vcardContent.html('');

	vCardName(modalContentWrap, modalStructure);
	vCardPhoto(modalContentWrap, modalStructure);
	vCardUserComponents(modalContentWrap, modalStructure);
	vcardModalTabs(modalContentWrap, modalStructure);	
	
}




// VCARD TABS
var vcardModalTabs = function(modalContentWrap, modalStructure){

	var thisModal      = modalContentWrap.parents('#vkm-modal-vcard'),
		modalControls  = thisModal.find('.modal-control-panel'),
		vcardTabs      = modalContentWrap.find('.vcard-entity-summary');
		//vcardContent   = modalContentWrap.find('#vcard-modal-tab-content');

	vcardEntityObj     = modalStructure.vcard_entity_obj,
	vcardEntityType    = modalStructure.vcard_entity_type,
	vcardEntityId      = modalStructure.vcard_entity_id,
	vcardTabLayout     = window['vcardLayout_'+window['vcardType']].summary_tabs,
	vcardRelatedMax    = modalStructure.vcard_related_max,

	// vcardSummary
	vcardTabs.html('');
	//vcardContent.html('');

	$.each(vcardTabLayout, function(i, summaryItem){
		var connectionType   = summaryItem['connection'];
		var connectionCatg   = summaryItem['connection_catg'];
		var iconClass        = summaryItem['button_class'];
		var dataPrefix       = summaryItem['data_prefix'];
		var userConnections  = [];
		if(vcardEntityType === "user"){
			userConnections  = vcardEntityObj.resources;
		}else if(vcardEntityType === "community" || vcardEntityType === "course"){
			userConnections  = vcardEntityObj[0];
		}else if(vcardEntityType === "file" || vcardEntityType === "blog" || vcardEntityType === "wiki" || vcardEntityType === "forum"){
			userConnections  = vcardEntityObj[0];
		}

		var connectionItems  =  null;

		// Only if Connection Exists:
		var totalItems  = 0;
		var cappedTotal = null;
		var nameKey     = null;
		var idKey       = null;
		var nameLink    = null;
		var allNames    = "";
 
		var newTabLink  = null,
			newTabPane  = null,
			activeLink  = "",
			activePane  = "",
			tabHeading  = "",

			topNames    = [];

		if(userConnections){
			if(vcardEntityType === "user"){
				switch(connectionType) {
	                case "people":
	                    totalItems = (userConnections.followers.count + userConnections.following.count) || 0;
	                    break;
	                case "communities":
	                    totalItems = userConnections.groups.count || 0;
	                    break;
	                case "files":
	                    totalItems = 0;
	                    break;
	                case "courses":
	                    totalItems = userConnections.courses.count || 0;
	                    break;
	                default:
	                    totalItems = (userConnections.blogposts.count + userConnections.forums.count + userConnections.wikis.count) || 0;
	            }
	        }else if(vcardEntityType === "community"){
	        	if(connectionType === "people"){
	        		totalItems = userConnections.numberOfMembers;
	        	}
	        }else if(vcardEntityType === "course"){
				switch(connectionType) {
	                case "rated":
	                    totalItems = 0;
	                    break;
	                case "shared":
	                    totalItems = userConnections.courseSharedCount || 0;
	                    break;
	                case "follow":
	                    totalItems = userConnections.courseFollowCount || 0;
	                    break;
	                default:
	                	//favorites come here
	                    totalItems = userConnections.courseFavoritedCount || 0;
	            }
	        }else if(vcardEntityType === "file" ||vcardEntityType === "blog" || vcardEntityType === "wiki" || vcardEntityType === "forum"){
				switch(connectionType) {
	                case "rated":
	                    totalItems = userConnections.timesRated || 0;
	                    break;
	                case "shared":
	                    totalItems = userConnections.timesShared || 0;
	                    break;
	                case "follow":
	                    totalItems = userConnections.timesFollowed || 0;
	                    break;
	                default:
	                	//favorites come here
	                    totalItems = userConnections.timesFavorited || 0;
	            }
	        }

			newTabLink  = $('<li data-connection-type="'+connectionType+'" data-connection-category="'+connectionCatg+'" data-entity-prefix="'+dataPrefix+'"><a class="btn" data-icon-before="'+iconClass+'" data-toggle-rm="tab1" href="#'+vcardEntityType+'-'+vcardEntityId+'-'+connectionType+'"><span class="counter-'+connectionType+'">'+totalItems+'</span></a></li>');
			vcardTabs.append(newTabLink);

		/*	tabHeading  = connectionType.charAt(0).toUpperCase() + connectionType.slice(1);
			// newTabPane  = $('<div class="tab-pane'+activePane+'" id="'+vcardEntityType+'-'+vcardEntityId+'-'+connectionType+'"><h5>Top Related '+tabHeading+'</h5></div>');
			newTabPane  = $('<div class="tab-pane" id="'+vcardEntityType+'-'+vcardEntityId+'-'+connectionType+'"><h5>Top Related '+tabHeading+'</h5></div>');
			
			topListDiv  = $('<div class="top-connections-list mCustomScrollbar content fluid light" data-mcs-theme="inset-2-dark"></div>');
			// topListDiv  = $('<div class="top-connections-list scroller-wrap"></div>');
			// topListInr  = $('<div class="viewport"><div class="scroll-content"></div></div>');
			// scrollerBar = $('<div class="scrollbar"><div class="track"><div class="thumb"><div class="end"></div></div></div></div>');

			if( totalItems > 0 ) {

				idKey   = dataPrefix+'_name';
				nameKey = dataPrefix+'_name';
				window['currentEntityType'] = vcardEntityType;

				connectionItems = getLinkedData(vcardEntityId, connectionType, {  }, { 'connection_name': nameKey }, vcardEntityType, dataPrefix );

				$.each(connectionItems, function(c, connectionItem){
					if( c < vcardRelatedMax ) {
						nameLink = '<a class="">'+connectionItem['connection_name']+'</a>';
						allNames += nameLink;
						if( c < vcardRelatedMax-1){
							allNames += ", &nbsp;";
						}
					} else {
						return false;
					}				
				});

				// topListDiv.append(topListInr);
				// topListDiv.prepend(scrollerBar);
				// topListInr.find('.scroll-content').html(allNames);

				topListDiv.html(allNames);
				newTabPane.append(topListDiv);
				modalControls.find('.btn.open-target-map').removeAttr('disabled');

				// if(i == 0){
				// 	// newTabButton.addClass('active');
				// 	newTabPane.addClass('active');
				// }				
		
			} else {

				newTabLink.find('a').removeAttr('data-toggle');
				newTabLink.addClass('tab-disabled');

				// also disable target button to disallow putting item in center since it has no data
				modalControls.find('.btn.open-target-map').attr('disabled', 'disabled');
			}*/
			
			//vcardContent.append(newTabPane);
		}
	});



	
	/*$.each(vcardTabLayout, function(m, summaryItem){

		var userConnections  = [] || vcardEntityObj[vcardEntityType+'_'+summaryItem['connection']];

		if(userConnections.length > 0){

			vcardTabs.find('li:eq('+m+')').addClass('active');
			//vcardContent.find('.tab-pane:eq('+m+')').addClass('active');

			return false;			

		}

	});*/






}


// Name
var vCardName = function(modalWrapper, modalStructure){

	var entityObj       = modalStructure.vcard_entity_obj,
		vcardName       = modalWrapper.find('.vcard-entity-name h3'),
		vcardEntityName = "Name Unavailable";	
	if(modalStructure.vcard_entity_type === "community"){
		vcardEntityName = entityObj[0].communityName;
	}else if(modalStructure.vcard_entity_type === "course"){
		vcardEntityName = entityObj[0].displayName;
	}else if(modalStructure.vcard_entity_type === "file" ||modalStructure.vcard_entity_type === "blog" || modalStructure.vcard_entity_type === "wiki" || modalStructure.vcard_entity_type === "forum"){
		vcardEntityName = entityObj[0]["object"].displayName;
	}else{
		//vcardEntityName = (entityObj.personName[modalStructure.vcard_entity_type+'Name']);
		vcardEntityName = (entityObj.personName['userName']);
	}
		
		vcardEntityName = vcardEntityName.inlineTextTrim({
						  		numLines: 2,
						  		widthLimit: 160,
						  		fontProps: '16px Arial, sans-serif',
						  		elipsize: true
						 	});

	//vcardName.text(nameDefault);
	if( typeof(vcardEntityName) != "undefined" && vcardEntityName != null && vcardEntityName != "" ){
		vcardName.text(vcardEntityName);
	}
}





// Photo
var vCardPhoto = function(modalWrapper, modalStructure){

	var entityObj        = modalStructure.vcard_entity_obj,
		vcardPhoto       = modalWrapper.find('.vcard-entity-photo'),
		photoDefault     = modalStructure.vcard_default_img,
		vcardEntityPhoto = entityObj[modalStructure.vcard_entity_type+'_image_path'],
		onErrorSrc		 = "this.src='"+photoDefault+"'";

	if(modalStructure.vcard_entity_type === "user"){
		var vCardPhotobaseUrl = window.location.protocol + "//" + window.document.domain;
        var vCardPhotoUrl = vCardPhotobaseUrl + App.profileImage(entityObj.personId, "profile");
		vcardPhoto.html('<img src="'+vCardPhotoUrl+'" onerror="'+onErrorSrc+'"/>');
	}else{
		vcardPhoto.html('<img src="'+photoDefault+'" />');
	}

	/*if( typeof(vcardEntityPhoto) != "undefined" && vcardEntityPhoto != null && vcardEntityPhoto != "" ){
		vcardPhoto.html('<img src="'+vcardEntityPhoto+'" />');
	}*/
}


// Jabber Status
var vcardJabberContent = function(modalWrapper, elContainer, modalStructure){

	var entityObj     = modalStructure.vcard_entity_obj,
		vcardJabber   = $('<span class="jabber-status" data-jabber-status="" data-icon-before="pill"></span>');
		jabberDefault = "offline";

	vcardJabber.attr('data-jabber-status', jabberDefault);
	elContainer.append(vcardJabber);
	/*if( typeof(entityObj['user_jabber_status']) != "undefined" && entityObj['user_jabber_status'] != null && entityObj['user_jabber_status'] != "" ){
		vcardJabber.attr('data-jabber-status', entityObj['user_jabber_status']);
		elContainer.append(vcardJabber);
	}*/	
}


// Like Count
var vCardLikes = function(modalWrapper, elContainer, modalStructure){

	var entityObj      = modalStructure.vcard_entity_obj,
		vcardLikes     = $('<span class="like-count" data-icon-before="thumbs-up"></span>'),
		likes          = "0";
	
	if(modalStructure.vcard_entity_type === "course" && entityObj[0].courseLikeCount !== ""){
		likes = entityObj[0].courseLikeCount;
	}else if((modalStructure.vcard_entity_type === "file" ||modalStructure.vcard_entity_type === "blog" || modalStructure.vcard_entity_type === "wiki" || modalStructure.vcard_entity_type === "forum") && entityObj[0].likes !== ""){
		likes = entityObj[0].likes;
	}
	/*if( typeof(entityObj['user_like_count']) != "undefined" && entityObj['user_like_count'] != null && entityObj['user_like_count'] != "" ){
		if( entityObj['user_like_count'] <= 9999 ) {
			vcardLikes.text(entityObj['user_like_count']);
		} else {
			vcardLikes.text('9999+');
			vcardLikes.addClass('max-count');
		}
		elContainer.append(vcardLikes);
	}*/
	vcardLikes.text(likes);
	vcardLikes.addClass('max-count');
	elContainer.append(vcardLikes);
}

// Like Count
var vCardViews = function(modalWrapper, elContainer, modalStructure){

	var entityObj      = modalStructure.vcard_entity_obj,
		vcardViews     = $('<span class="like-count"></span>'),
		views          = "0 Views";
		//vcardViews     = $('<span class="like-count" data-icon-before="eye"></span>'),
	
	if(modalStructure.vcard_entity_type === "user" && typeof(entityObj.profileViewCount) !== "undefined" && entityObj.profileViewCount !== ""){
		views = entityObj.profileViewCount + " Views";
	}else if(modalStructure.vcard_entity_type === "course" && entityObj[0].courseViewedCount !== ""){
		views = entityObj[0].courseViewedCount + " Views";
	}else if((modalStructure.vcard_entity_type === "file" ||modalStructure.vcard_entity_type === "blog" || modalStructure.vcard_entity_type === "wiki" || modalStructure.vcard_entity_type === "forum") && entityObj[0].views !== ""){
		views = entityObj[0].views + " Views";
	}
	//vcardViews.text(viewsDefault);
	/*if( typeof(entityObj['user_like_count']) != "undefined" && entityObj['user_like_count'] != null && entityObj['user_like_count'] != "" ){
		if( entityObj['user_like_count'] <= 9999 ) {
			vcardLikes.text(entityObj['user_like_count']);
		} else {
			vcardLikes.text('9999+');
			vcardLikes.addClass('max-count');
		}
		elContainer.append(vcardLikes);
	}*/
	vcardViews.text(views);
	elContainer.append(vcardViews);
}


// User/Job Title
var vCardTitle = function(modalWrapper, elContainer, modalStructure){

	var entityObj       = modalStructure.vcard_entity_obj,
		vcardTitleEl    = $('<span class="vcard-entity-title clearfix"></span>'),
		vcardNameWrap   = elContainer.find('.vcard-entity-name'),
		titleDefault    = "Title Unavailable";

	vcardTitleEl.html('<h4 class="eclipse-text">'+titleDefault+'</h4>');
	if( typeof(entityObj['jobTitle']) != "undefined" && entityObj['jobTitle'] != null && entityObj['jobTitle'] != "" ){
		vcardTitleEl.html('<h4 class="eclipse-text">'+entityObj['jobTitle']+'</h4>');
		vcardNameWrap.after(vcardTitleEl);
	}
}


// User-Specifics
var vCardUserComponents = function(modalWrapper, modalStructure){

	var vcardTitleWrap   = modalWrapper.find('.vcard-name-title-rating'),
		vcardLikesJabber = modalWrapper.find('.vcard-entity-visual'),
		
		vcardLikesAvail  = $('<div class="vcard-likes-availability" />'),
		likesAvailOvalBg = $('<div class="oval-bg" />');

		vcardLikesJabber.append(vcardLikesAvail);
		vcardLikesAvail.append(likesAvailOvalBg);

	vCardTitle(modalWrapper, vcardTitleWrap, modalStructure);
	if(modalStructure.vcard_entity_type === "user"){
		vcardJabberContent(modalWrapper, likesAvailOvalBg, modalStructure);
		vCardViews(modalWrapper, likesAvailOvalBg, modalStructure);
	}else{
		vCardViews(modalWrapper, likesAvailOvalBg, modalStructure);
		vCardLikes(modalWrapper, likesAvailOvalBg, modalStructure);
	}
	//vCardLikes(modalWrapper, likesAvailOvalBg, modalStructure);

}


var starRatings = function(ratingContainer, itemClass, modalLayoutObj){

	var starContainer = $(ratingContainer),
		starItem      = starContainer.find(itemClass);	

	var updateRating = function(ratingVal){

		activeItems    = null;

		// Update Actual Entity Rating

		modalLayoutObj.vcard_entity_obj[modalLayoutObj.vcard_entity_type+'_rating'] = ratingVal;
		// vcardEntity['user_rating'] = ratingVal;

		// Update HTML Attribute (use this later for better 'emberizing')
		starContainer.attr('data-current-rating', ratingVal);

		var currRating = parseFloat(ratingVal),
		scoreCount     = currRating*2;

		starItem.each(function(i){
			if(i < scoreCount){
				$(this).addClass('active');
			} else if(i == scoreCount) {
				return false;
			}
		});

		activeItems = starContainer.find('.active');
	}

	// Set Initial Rating
	updateRating(modalLayoutObj.vcard_entity_obj[modalLayoutObj.vcard_entity_type+'_rating']);

	// Clear Rating Termporarily on Hover
	/*starContainer.mouseover(function(){
		activeItems.removeClass('active');

	}).mouseout(function(){
		activeItems.addClass('active');
	});

	// Highlight Stars on Hover
	starItem.mouseover(function(){
		var thisItem = $(this);
		thisItem.addClass('hover');
		thisItem.prevAll().addClass('hover');
	}).mouseout(function(){
		starItem.removeClass('hover');
	});

	// Re-init Star Rating Click
	starItem.on('click', function(){

		var ratingStr = starContainer.attr('data-current-rating'),
		hoveredStars  = starContainer.find('.hover'),
		totalHovered  = hoveredStars.length,
		newRatingVal  = totalHovered/2;

		// If user clicks existing rating, clear out rating
		if( String(newRatingVal) == ratingStr) {
			updateRating(0);
		} else {
			updateRating(newRatingVal);
		}
	});*/
}


var vcardModalCallback = function(modalEl, modalOuterClass, modalLayoutObj){

	// Set Upper Part as Draggable Handle
    modalEl.draggable({ 
      	containment: modalLayoutObj.modal_draggable,
      	handle: ".vkm-modal-header"
    });

	var vcardEntityObj = modalLayoutObj.vcard_entity_obj,
	vcardEntityType    = modalLayoutObj.vcard_entity_type;

	
	$("#entity-rating").addClass("hide");
	/*if( vcardEntityObj[vcardEntityType+'_rating'] ) {
    	starRatings('#entity-rating', '.score-item', modalLayoutObj);
    }*/   

    // Modal Button Clicks
    modalEl.on('click', function(e){

    	if($(e.target).hasClass('open-target-map') || $(e.target).hasClass("send-message")){
    		return true;
    	}else{
    		e.preventDefault();
    	}

    	var thisTargetClick    = $(e.target),
    		thisTargetModal    = thisTargetClick.parents('#vkm-modal-vcard'),
    		thisModalTabBtns   = thisTargetModal.find('.vcard-tab-buttons'),
    		activeModalTab     = null,
    		activeTabPrefix    = null,
    		activeTabType      = null;

    	// CLOSE MODAL
    	if(thisTargetClick.hasClass('close-hover-modal')){
    		closeModal('.'+modalOuterClass);
            window['vcardType'] = null;
            window['vcardEntityId'] = null;
            window['vcardEntityObj'] = null;
    	}

    	//below for the cross hain mouse over and click
    	/*if(thisTargetClick.hasClass('open-target-map')){

            clearSvg();
            resetFilters();
            resetCompareBtn('.compare.btn');
            $('#map-menu').html('');

    		$('#social-map').attr('data-entity', vcardEntityObj[vcardEntityType+'_id'])	;
    		$('#social-map').attr('data-map-view', 'connections');

			defaultMapLayout = {
			  	radius: 250,
			  	vertical: 450,
			  	startAngle: 180,
			  	nodeRadius: 34,
			  	outer: "#social-map",
			  	inner: "#map-content",
			  	maxNodesPerPage: 12,
			  	maxNodePages: 3
			}

			activeModalTab = thisModalTabBtns.find('li.active');

			if( vcardEntityType == "user" ) {
				displayMainMenu(defaultMapLayout);

			} else {

				renderConnections(vcardEntityId, vcardEntityType, defaultMapLayout, activeModalTab.attr('data-connection-type'), 'other-entities', activeModalTab.attr('data-entity-prefix'));
				// renderConnections(vcardEntityId, vcardEntityType, defaultMapLayout, activeModalTab.attr('data-connection-type'), activeModalTab.attr('data-connection-category'), activeModalTab.attr('data-entity-prefix'))
			}

            // Check if I'm going back to viewing myself...
            if(myUserId == vcardEntityObj[vcardEntityType+'_id']) {
            	currentUserIsMe = true;	
            } else {
            	currentUserIsMe = false;
            }
			
			renderBreadcrumbs(['home'], currentUserIsMe);

    		closeModal('.'+modalOuterClass);
    		window['vcardEntityObj'] = null;

    	}*/

    });


}


var modalTabbedContent = function(modalContentWrap, modalStructure){	

	// Define Tab Elements, then clear out initial ones
	var newModal        = modalContentWrap.parents('.vkm-modal'),
	tabButtonsWrap      = modalContentWrap.find('.vkm-tab-buttons'),
	tabButtonsList      = tabButtonsWrap.find('.vkm-modal-nav-pills'),
	tabButtonLink       = tabButtonsList.find('li'),
	tabContentWrap      = modalContentWrap.find('.vkm-tab-content'),
	tabContentPane      = tabContentWrap.find('.tab-pane');
	
	tabButtonsList.html('');
	tabButtonsWrap.html('');
	tabContentWrap.html('');

	tabContentWrap.attr( 'id', newModal.attr('id')+'-tabs' );

	// Render Each Tab Button AND Content
	$.each(modalStructure['modal_tabs'], function(t, tabItem){

		// Tab Button/Link
		var newTabButton  = tabButtonLink.clone(),
			newTabBtnLink = newTabButton.find('a');

		newTabButton.attr('id', 'tab-'+tabItem['tab_href']);
		newTabBtnLink.attr('class', 'btn '+tabItem['tab_href']+'-tab-btn')
					 .attr('data-icon-before', tabItem['tab_icon'])
					 .attr('data-map-catg', tabItem['tab_icon'])
					 .attr('data-toggle', 'tab')
					 .attr('href', '#'+tabItem['tab_href'])

		newTabButton.html('');
		newTabButton.append(newTabBtnLink);	

		// Tab Content Template
		var thisTabPane   = null,
			thisTabPane   = tabContentPane.clone(),
			readWriteWrap = thisTabPane.find('.read-write-wrapper');
	
		if( typeof(tabItem['tab_start_mode']) != "undefined" && tabItem['tab_start_mode'] != null && tabItem['tab_start_mode'] != "" ){
			thisTabPane.attr('data-content-mode', tabItem['tab_start_mode']);
		}
		thisTabPane.attr('id', tabItem['tab_href']);
		thisTabPane.html($.parseHTML(tabItem['tab_content']));

		// By Default Show First Tab/Pane as Active
		// if(t == 0){
		// 	newTabButton.addClass('active');
		// 	thisTabPane.addClass('active');
		// }

		// Append Tab
		tabButtonsList.append(newTabButton);

		// Append Tab Pane
		tabContentWrap.append(thisTabPane);
		thisTabPane = null;
	});

	if( typeof(modalStructure['target_tab_id']) != "undefined" && modalStructure['target_tab_id'] != null && modalStructure['target_tab_id'] != "" ) {
		// later - should also make sure the called ID actually exists in the modal spec json... using indexOf()

		// Activate the Matching Tab
		tabButtonsList.find('li').removeClass('active');
		tabButtonsList.find('#tab-'+modalStructure['target_tab_id']).addClass('active');

		// ...and the Matching Tab Content
		tabContentWrap.find('.tab-pane').removeClass('active');
		tabContentWrap.find('.tab-pane#'+modalStructure['target_tab_id']).addClass('active');
	}

	tabButtonsWrap.append(tabButtonsList);
	modalContentWrap.html('').append(tabButtonsWrap).append(tabContentWrap);

}


var generateSelectMenu = function(currentEntity, objEntityKey, entityPropArgs, entityDataArr, optionVal, optionText){

    var selectMenu  = $('[data-entity-key="'+objEntityKey+'"]'),
    	optionItem  = null;

    selectMenu.html('');

    var createAppendOptions = function(item){
		optionItem = item[optionVal] == currentEntity[objEntityKey] ? '<option value="'+item[optionVal]+'" selected>'+item[optionText]+'</option>' : '<option value="'+item[optionVal]+'">'+item[optionText]+'</option>';
		selectMenu.append(optionItem);    	
    }

    $.each(entityDataArr, function(i, item){

    	if(typeof(entityPropArgs) != "undefined" && entityPropArgs != null){    		
	    	if(entityPropArgs['value'].indexOf(item[entityPropArgs['key']]) > -1) {
	    		createAppendOptions(item);
	    	}
    	} else {
    		createAppendOptions(item);
    	}
    });
}


var generateScrollableList = function(tabId, dataArr, itemTemplate, callbackFn){
	
	var scrollableList  = $(tabId).find('.scrollable-item-list');
		scrollableList.html("");

	var totalItems      = dataArr.length;

    $.each(dataArr, function(d, dataItem) {

    	var newListItem = $(itemTemplate).clone();

    	for(k = 0; k < Object.keys(dataItem).length; k++ ){
    		var itemKey = Object.keys(dataItem)[k];
    		var itemVal = dataItem[itemKey];

    		if(itemKey.indexOf('Image') > -1){
    			newListItem.find('.'+itemKey).html('<img src="'+itemVal+'" alt="" />');
    		} else if(itemKey.indexOf('Id') > -1){
    			newListItem.attr('data-entity', itemVal);
    		} else {
    			newListItem.find('.'+itemKey).html(itemVal);
    		}
    		newListItem.removeAttr('id');
    	}

        scrollableList.append(newListItem);
        newListItem = null;

        if( (d+1) == totalItems){
        	if( typeof(callbackFn) != "undefined" && callbackFn != null ) {
        		callbackFn();
        	}
        }

    });
}


// later make these json dynamic based on the forms themselves:
var eventFormInputs = [
	{
		"key": "event_name",
		"val_type": "inputText"
	},
	{
		"key": "event_type",
		"val_type": "select"
	},
	{
		"key": "event_description",
		"val_type": "inputText"
	},
	{
		"key": "event_url",
		"val_type": "inputText"
	},
	{
		"key": "event_tags",
		"val_type": "htmlTags"
	},
	{
		"key": "event_start_date",
		"val_type": "inputText"
	},
	{
		"key": "event_end_date",
		"val_type": "inputText"
	}
];

var userFormInputs = [
	{
		"key": "user_name",
		"val_type": "htmlText"
	},
	{
		"key": "user_email",
		"val_type": "htmlText"
	},
	{
		"key": "user_manager",
		"val_type": "select"
	},
	{
		"key": "user_function",
		"val_type": "select"
	},
	{
		"key": "user_biography",
		"val_type": "inputText"
	},
	{
		"key": "user_resume_file",
		"val_type": "inputText"
	},
	{
		"key": "user_topic_interests",
		"val_type": "htmlTags"
	}
];

var connectionFormInputs = [
	{
		"key": "user_name",
		"val_type": "htmlText"
	},
	{
		"key": "user_email",
		"val_type": "htmlText"
	},			
	{
		"key": "user_connection_rel",
		"val_type": "select"
	},
	{
		"key": "user_connection_expertise",
		"val_type": "htmlTags"
	},
	{
		"key": "user_connection_notes",
		"val_type": "inputText"
	}
];


var updaterModalCallback = function(modalEl, modalOuterClass, modalLayoutObj){

	// Set Upper Part as Draggable Handle
    modalEl.draggable({ 
      	containment: modalLayoutObj.modal_draggable,
      	handle: ".vkm-modal-header"
    });

    // Modal Button Clicks
    modalEl.on('click', function(e){

    	e.preventDefault();

    	var thisTargetClick    = $(e.target),
    		thisTabPane        = null,
    		tabHeading         = null,
    		thisEntityId       = null,
    		currEventInfo      = null,
    		currConnectionInfo = null;

    	// CLOSE MODAL
    	if(thisTargetClick.hasClass('close-hover-modal')){
    		closeModal('.'+modalOuterClass);
    	}

    	// EDIT OR CREATE ITEM (Start)
    	if(thisTargetClick.hasClass('edit-item-button') || thisTargetClick.hasClass('add-item-button')){

    		thisTabPane  = thisTargetClick.parents('.tab-pane.active'),
    		tabHeading   = thisTabPane.find('.write-mode .vkm-modal-heading h3');

    		// EDIT ITEM
    		if(thisTargetClick.hasClass('edit-item-button')){
    			
    			thisEntityId = thisTargetClick.parents('.vkm-modal-tab-row').attr('data-entity');
    			thisTabPane.find('.btn-save').attr('data-entity-id', thisEntityId);

	    		// Edit Event
	    		if(thisTargetClick.hasClass('edit-event')){

	    			tabHeading.text('Edit Projects and Events');
	    			changeReadWriteView($('#'+thisTabPane.attr('id')), 'write');

	    			currEventInfo = getCurrentEntity(window.eventData, 'event_id', thisEntityId);

				    displayFormInfo('#events', currEventInfo, eventFormInputs, function(){

				    	generateSelectMenu(currEventInfo, 'event_type', null, uniqueEventTypes, 'connectionType', 'connectionType');

						$('#events select').selectBoxIt({
							autoWidth: false,
							copyClasses: "container",
							showEffect: "fadeIn",
							hideEffect: "fadeOut"
						}).on({
						    "open": function() {
						      	$(this).parents('.vkm-modal-tab-row').addClass('active');
						    },
						    "close": function() {
						      	$(this).parents('.vkm-modal-tab-row').removeClass('active');
						    }
						});
				    });
	    		}

	    		// Edit Social Connection
	    		if(thisTargetClick.hasClass('edit-connection')){
	    			
	    			tabHeading.text('Edit Social Connection');
	    			changeReadWriteView($('#'+thisTabPane.attr('id')), 'write');

	    			window['userSocialConnections'] = getLinkedData(currUserEntityId, 'people', { 'user_id': 'user_id', 'user_connection_rel': 'user_connection_rel', 'user_connection_expertise': 'user_connection_expertise', 'user_connection_notes': 'user_connection_notes' }, { 'user_name': 'user_name', 'user_email': 'user_email', 'user_title': 'user_title', 'user_image_path': 'user_image_path' }, 'user', 'user');

	    			currConnectionInfo = getCurrentEntity(window.userSocialConnections, 'user_id', thisEntityId);

				    displayFormInfo('#connections', currConnectionInfo, connectionFormInputs, function(){

				    	generateSelectMenu(currConnectionInfo, 'user_connection_rel', null, uniqueRoleTypes, 'connectionRel', 'connectionRel');

						$('#connections select').selectBoxIt({
							autoWidth: false,
							copyClasses: "container",
							showEffect: "fadeIn",
							hideEffect: "fadeOut"
						}).on({
						    "open": function() {
						      	$(this).parents('.vkm-modal-tab-row').addClass('active');
						    },
						    "close": function() {
						      	$(this).parents('.vkm-modal-tab-row').removeClass('active');
						    }
						});
				    });
	    		}
    		} 

    		// CREATE ITEM
    		if(thisTargetClick.hasClass('add-item-button')){

    			// CREATE ITEM

    			// Clear Out Inputs
    			thisTabPane.find('input, textarea').val('');
    			thisTabPane.find('.html-input, .html-textarea').html('');

    			// Set Entity Id as 'new'... later change to length of entityArr+1
    			thisTabPane.find('.btn-save').attr('data-entity-id', 'new');

    			// Change Viewable Content Mode
    			changeReadWriteView($('#'+thisTabPane.attr('id')), 'write');

    			if(thisTargetClick.hasClass('add-new-event')){ 
	    			tabHeading.text('Add New Project or Event');	    			
    			}

    			if(thisTargetClick.hasClass('add-new-connection')){ 
	    			tabHeading.text('Add New Social Connection');
    			}
    		}

    	}

    	// SAVE MAIN USER
    	if(thisTargetClick.hasClass('btn-save-user')){

    		thisTabPane  = thisTargetClick.parents('.tab-pane.active');

			updateEntityAndCallback(thisTabPane, window.userData, thisTargetClick.attr('data-entity-id'), 'user_id', userFormInputs, function(){

				closeModal('.'+modalOuterClass);
			});

    	}

    	// SAVE EVENT
    	if(thisTargetClick.hasClass('btn-save-event')){

    		thisTabPane  = thisTargetClick.parents('.tab-pane.active');

			updateEntityAndCallback(thisTabPane, window.eventData, thisTargetClick.attr('data-entity-id'), 'event_id', eventFormInputs, function(){

				// closeModal('.'+modalOuterClass);
				var thisTab 		 = thisTargetClick.parents('.tab-pane.active');
				var userEvents       = null,
					userEvents 		 = getLinkedData(currUserEntityId, 'events', { 'connectionId': 'event_id' }, { 'connectionName': 'event_name', 'connectionType': 'event_type', 'connectionImage': 'event_image_path' }, 'user', 'event');

					generateScrollableList('#events', userEvents, "<div id=\"event-item-template\" class=\"vkm-modal-tab-row list-row\"> <div class=\"list-item-image image-rounded connectionImage\"> <img src=\"assets/images/list-item-sample-img.jpg\" alt=\"\" /> </div> <div class=\"list-item-text\"> <span class=\"list-item-title eclipse-text connectionName\"></span> <span class=\"list-item-type connectionType\"></span> </div> <div class=\"list-item-actions\"> <a href=\"\" class=\"btn btn-icon delete-item-button delete-event\" data-icon-before=\"trash-o\"></a> <a href=\"\" class=\"btn btn-icon edit-item-button edit-event switch-mode-button\" data-target-mode=\"write\" data-icon-before=\"pencil\"></a> </div> </div>", function(){
						thisTab.attr('data-content-mode', 'read');
					});				
			});
    	}


    	// SAVE CONNECTION
    	if(thisTargetClick.hasClass('btn-save-connection')){

    		thisTabPane  = thisTargetClick.parents('.tab-pane.active');

			updateEntityAndCallback(thisTabPane, window.userSocialConnections, thisTargetClick.attr('data-entity-id'), 'user_id', connectionFormInputs, function(){

				// closeModal('.'+modalOuterClass);
				var thisTab 		 	  = thisTargetClick.parents('.tab-pane.active');
				var userSocialConnections = null,
					userSocialConnections = getLinkedData(currUserEntityId, 'people', { 'connectionId': 'user_id' }, { 'connectionName': 'user_name', 'connectionTitle': 'user_title', 'connectionImage': 'user_image_path' }, 'user', 'user');
					// getLinkedData(currUserEntityId, 'people', { 'user_id': 'user_id', 'user_connection_rel': 'user_connection_rel', 'user_connection_expertise': 'user_connection_expertise', 'user_connection_notes': 'user_connection_notes' }, { 'user_name': 'user_name', 'user_email': 'user_email', 'user_title': 'user_title', 'user_image_path': 'user_image_path' }, 'user');

					generateScrollableList('#connections', userSocialConnections, "<div id=\"connection-item-template\" class=\"vkm-modal-tab-row list-row\"> <div class=\"list-item-image image-rounded connectionImage\"> <img src=\"assets/images/list-item-sample-img.jpg\" alt=\"\" /> </div> <div class=\"list-item-text\"> <span class=\"list-item-title eclipse-text connectionName\"></span> <span class=\"list-item-type connectionTitle\"></span> </div> <div class=\"list-item-actions\"> <a href=\"\" class=\"btn btn-icon delete-item-button delete-social-connection\" data-icon-before=\"cancel\"></a> <a href=\"\" class=\"btn btn-icon edit-item-button edit-connection switch-mode-button\" data-target-mode=\"write\" data-icon-before=\"pencil\"></a> </div> </div>", function(){
						thisTab.attr('data-content-mode', 'read');
					});
			});
    	}







    	// DELETE ITEM
    	if(thisTargetClick.hasClass('delete-item-button')){
    		// show confirmation alert, after which item gets deleted 
    		// thisTabPane = thisTargetClick.parents('.tab-pane.active');
    		// thisTabPane.attr('data-content-mode', 'write');
    	}


    	// if(thisTargetClick.hasClass('btn-update-info')){
    	// 	// var thisModalForm = 
    	// 	// updateInfo()
    	// }

    });

    // Read/Write Panel Toggles
    readWriteToggle();

    // Plus/Check Toggle... remove this
    activateConnectionToggle();

    






    // PROFILE TAB
    var currUserEntityId = $('#social-map').attr('data-entity'),
    currUserInfo = getCurrentEntity(window.userData, 'user_id', currUserEntityId),
    userPeople = getLinkedData(currUserEntityId, 'people', { 'connectionId': 'user_id', 'connectionRel': 'user_connection_rel' }, { 'connectionName': 'user_name', 'connectionEmail': 'user_email', 'connectionTitle': 'user_title', 'connectionImage': 'user_image_path' }, 'user', 'user');

    // Other User Values
    displayFormInfo('#profile', currUserInfo, userFormInputs, function(){

    	generateSelectMenu(currUserInfo, 'user_manager', { "key": "connectionRel", "value": ["Supervisor", "Manager", "Project Manager"] }, userPeople, 'connectionId', 'connectionName');
    	generateSelectMenu(currUserInfo, 'user_function', null, functionData, 'function_id', 'function_name');

		$('#profile select').selectBoxIt({
			autoWidth: false,
			copyClasses: "container",
			showEffect: "fadeIn",
			hideEffect: "fadeOut"
		}).on({
		    "open": function() {
		      $(this).parents('.vkm-modal-tab-row').addClass('active');
		    },
		    "close": function() {
		      $(this).parents('.vkm-modal-tab-row').removeClass('active');
		    }
		});
    });

    // EVENTS TAB
    var userEvents 	 = getLinkedData(currUserEntityId, 'events', { 'connectionId': 'event_id' }, { 'connectionName': 'event_name', 'connectionType': 'event_type', 'connectionImage': 'event_image_path' }, 'user', 'event'),
    uniqueEventTypes = filterUniques(userEvents, 'connectionType');

    	// Generate Scrollable Event Items
    	generateScrollableList('#events', userEvents, "<div id=\"event-item-template\" class=\"vkm-modal-tab-row list-row\"> <div class=\"list-item-image image-rounded connectionImage\"> <img src=\"assets/images/list-item-sample-img.jpg\" alt=\"\" /> </div> <div class=\"list-item-text\"> <span class=\"list-item-title eclipse-text connectionName\"></span> <span class=\"list-item-type connectionType\"></span> </div> <div class=\"list-item-actions\"> <a href=\"\" class=\"btn btn-icon delete-item-button delete-event\" data-icon-before=\"trash-o\"></a> <a href=\"\" class=\"btn btn-icon edit-item-button edit-event switch-mode-button\" data-target-mode=\"write\" data-icon-before=\"pencil\"></a> </div> </div>");


    //SOCIAL CONNECTIONS TAB
    var uniqueRoleTypes = filterUniques(userPeople, 'connectionRel');

    	// Generate Scrollable People Items
    	generateScrollableList('#connections', userPeople, "<div id=\"connection-item-template\" class=\"vkm-modal-tab-row list-row\"> <div class=\"list-item-image image-rounded connectionImage\"> <img src=\"assets/images/list-item-sample-img.jpg\" alt=\"\" /> </div> <div class=\"list-item-text\"> <span class=\"list-item-title eclipse-text connectionName\"></span> <span class=\"list-item-type connectionTitle\"></span> </div> <div class=\"list-item-actions\"> <a href=\"\" class=\"btn btn-icon delete-item-button delete-social-connection\" data-icon-before=\"cancel\"></a> <a href=\"\" class=\"btn btn-icon edit-item-button edit-connection switch-mode-button\" data-target-mode=\"write\" data-icon-before=\"pencil\"></a> </div> </div>");


    // Highlight Non-Select Dropdown Inputs
    highlightFormLabel('.optionless-input');
}


var closeModal = function(modalClass){

	var modalContent = null,
		modalBg      = null;

	if(modalClass.length > 0){

		modalContent = $(modalClass).find('.vkm-modal');
		modalBg 	 = $(modalClass).find('.vkm-modal-bg');

		modalContent.removeClass('active');

		$(modalBg).delay(200).fadeOut(300, function(){
			$(modalClass).remove();
			$('.updater-submenu > a').removeClass('active');
		});
	}
}





var clearExistingModals = function(modalEl){
	if(modalEl.length > 0){
		$(modalEl).remove();
	}
}



var displayFormInfo = function(tabId, currentEntity, inputJson, callbackFn){

  	$.each(inputJson, function(i, dataSpec){

    	var entityElement = $(tabId).find('[data-entity-key="'+dataSpec['key']+'"]');

    	if(dataSpec['val_type'] == "htmlTags"){

    		entityElement.html(generateTags(currentEntity[dataSpec['key']]));

    	} else if(dataSpec['val_type'] == "htmlText"){

    		entityElement.text(currentEntity[dataSpec['key']]);

    	} else if(dataSpec['val_type'] == "select"){

    		entityElement.val(currentEntity[dataSpec['key']]);

    	} else if(dataSpec['val_type'] == "inputText"){

    		entityElement.val(currentEntity[dataSpec['key']]);
    	}
  	});

  	if(typeof(callbackFn) != "undefined"){

    	callbackFn();

  	}
}



var updateEntityInfo = function(tabPane, entityArr, entityId, entityIdKey, inputJson){

    $.each(entityArr, function(i, entity) {
        if(entityId == entity[entityIdKey]){

		    $.each(inputJson, function(i, dataSpec){

		    	var entityElement = tabPane.find('[data-entity-key="'+dataSpec['key']+'"]');

		    	if(dataSpec['val_type'] == "htmlTags"){

		    		entity[dataSpec['key']] = stripTagText(entityElement.html());

		    	} else if(dataSpec['val_type'] == "htmlText"){

		    		entity[dataSpec['key']] = entityElement.text();

		    	} else if(dataSpec['val_type'] == "select"){

		    		entity[dataSpec['key']] = entityElement.val();

		    	} else if(dataSpec['val_type'] == "inputText"){

		    		entity[dataSpec['key']] = entityElement.val();
		    	}

		    });

        	return false;
        }
    });

	return entityArr;
}



var updateEntityAndCallback = function(tabPane, entityArr, entityId, entityIdKey, inputJson, callbackFn){

    updateEntityInfo(tabPane, entityArr, entityId, entityIdKey, inputJson);
	callbackFn();
}


var changeReadWriteView = function(tabId, contentMode){
	$(tabId).attr('data-content-mode', contentMode)
}


var readWriteToggle = function(){

	// Switch to Between Read/Write Modes
	$('.switch-mode-button').on('click', function(e){

		var thisButtonClick = $(e.target),
			thisTargetMode  = thisButtonClick.attr('data-target-mode'),
			thisTabPane     = thisButtonClick.parents('.tab-pane');

		thisTabPane.attr('data-content-mode', thisTargetMode);
	});
}


var activateConnectionToggle = function(){
	$('.connection-toggle').on('click', function(e){
		e.preventDefault();
		if($(this).attr('data-icon-before') === "plus-thin"){
			$(this).attr('data-icon-before', 'checkmark');
		} else {
			$(this).attr('data-icon-before', 'plus-thin');
		}
	});
}


var highlightFormLabel = function(formRowClass){
	$('body').on('click', function(e){
		var thisClickTarget = $(e.target),
		parentFormRow   = thisClickTarget.parents(formRowClass),
		calendarPanel   = $('.calendar-panel');
		
		$(formRowClass).removeClass('active');
		calendarPanel.addClass('collapsed');

		if(thisClickTarget.hasClass('date-input')){
			calendarPanel.removeClass('collapsed');
		} 

		if(thisClickTarget.is('textarea') || thisClickTarget.is('input') || thisClickTarget.attr('contenteditable') == "true"){
			parentFormRow.addClass('active');
		}
	});
}


var populateSelectDropdown = function(selectMenuId, optionValueStr, optionTextStr){
	$("select#"+selectMenuId).data("selectBox-selectBoxIt").add({ value: optionValueStr, text: optionTextStr });
}

return{
  renderModal: renderModal,
  vcardModalCallback: vcardModalCallback
}

});