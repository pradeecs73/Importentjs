'use strict'

define(['ember', 'app'],
    function (Ember, app) {
        Ember.Handlebars.helper('avatarCommunityImg', function (shortName, username) {
            if (username === null)
                return

            var currentUsername = app.getUsername(),
                isUsernameCurrent = username === currentUsername,
                imgHtml = '<img class="nav-user-photo pull-left communityImg avatar" alt="' + shortName + '\'s Photo" src="' + app.profileImage(username, 'mini') + '" onerror="this.src=\'assets/images/avatars/noimage_mini.jpg\'" onrefresh="this.src=app.profileImage(\'' + username + '\', \'mini\')"></img>'

            if (isUsernameCurrent) {
                return new Handlebars.SafeString('<a href="#/profile">' + imgHtml + '</a>')
            }

            return new Handlebars.SafeString('<a href="#/user/' + username + '">' + imgHtml + '</a>')
        })
        Ember.Handlebars.helper('avatarCommunityImgWithGivenUrl', function (shortName, username, imageUrl) {
            if (username === null)
                return

            var currentUsername = app.getUsername(),
                isUsernameCurrent = username === currentUsername,
                imgHtml = '<img class="nav-user-photo pull-left communityImg avatar" alt="' + shortName + '\'s Photo" src="' + imageUrl + '" onerror="this.src=\'assets/images/avatars/noimage_mini.jpg\'" onrefresh="this.src=app.profileImage(\'' + username + '\', \'mini\')"></img>'

            if (isUsernameCurrent) {
                return new Handlebars.SafeString('<a href="#/profile">' + imgHtml + '</a>')
            }

            return new Handlebars.SafeString('<a href="#/user/' + username + '">' + imgHtml + '</a>')
        })
        Ember.Handlebars.helper('avatarMini', function (shortName, username) {
            if (username === null)
                return

            var currentUsername = app.getUsername(),
                isUsernameCurrent = username === currentUsername,
                imgHtml = '<img class="nav-user-photo pull-left avatar" alt="' + shortName + '\'s Photo" src="' + app.profileImage(username, 'mini') + '" onerror="this.src=\'assets/images/avatars/noimage_mini.jpg\'" onrefresh="this.src=app.profileImage(\'' + username + '\', \'mini\')"></img>'

            if (isUsernameCurrent) {
                return new Handlebars.SafeString('<a href="#/profile" class="inline-block" onclick="javascript:event.stopPropagation();">' + imgHtml + '</a>')
            }

            return new Handlebars.SafeString('<a class="inline-block" href="#/user/' + username + '" onclick="javascript:event.stopPropagation();">' + imgHtml + '</a>')
        })

        Ember.Handlebars.helper('avatarMiniNoLink', function (shortName, username) {
            if (username === null)
                return

            return new Handlebars.SafeString('<img class="nav-user-photo pull-left avatar" alt="' + shortName + '\'s Photo" src="' + app.profileImage(username, 'mini') + '" onerror="this.src=\'assets/images/avatars/noimage_mini.jpg\'" onrefresh="this.src=app.profileImage(\'' + username + '\', \'mini\')"></img>')       
        })


        Ember.Handlebars.helper('profileLink', function (displayName, username) {
            var currentUsername = app.getUsername(),
                isUsernameCurrent = username === currentUsername

            if(!displayName)
                displayName = username

            if (isUsernameCurrent) {
                return new Handlebars.SafeString('<a href="#/profile" onclick="javascript:event.stopPropagation();">' + displayName + '</a>')
            }

            return new Handlebars.SafeString('<a href="#/user/' + username + '" onclick="javascript:event.stopPropagation();">' + displayName + '</a>')
        })

        Ember.Handlebars.helper('profileLinkButton', function (username, buttonText) {
            var currentUsername = app.getUsername(),
                isUsernameCurrent = username === currentUsername

            if (isUsernameCurrent) {
                return new Handlebars.SafeString('<a href="#/profile" id="profile-button" class="cis-btn"  onclick="javascript:event.stopPropagation();">' + buttonText + '</a>')
            }

            return new Handlebars.SafeString('<a id="profile-button"  onclick="javascript:event.stopPropagation();" class="cis-btn" href="#/user/' + username + '" >' + buttonText + '</a>')
        })


        Ember.Handlebars.helper('avatar', function(username, shortname) {
            if (!shortname)
                return

            var imageBaseName = shortname.toLowerCase()
            return new Handlebars.SafeString('<img class="img-responsive editable-empty" alt="' + username + '\'s Avatar" src="/knowledgecenter/profiles/' + imageBaseName + '.jpg"></img>')
        })

        Ember.Handlebars.helper('avatarProfile', function (shortName, username, isLoggedInUser) {
            if (!shortName)
                return
            var actionParams = ["editProfileImage", arguments[arguments.length - 1]];
            var editButton = '';
            if(isLoggedInUser) {
                var editAction = Ember.Handlebars.helpers.action.apply(this, actionParams);
                editButton = '<button class="btn edit-image-button" data-icon-before="pencil-thick" data-dismiss="modal" data-toggle="modal" data-rel="tooltip" data-original-title="Edit" data-target="#profileImageUpload" ' + new Ember.Handlebars.SafeString(editAction) + '></button>'
            }
            return new Ember.Handlebars.SafeString(
                '<img class="img-responsive profileImg avatar" alt="' + username + '\'s Avatar" src="' + app.profileImage(username, 'profile') + '" onerror="this.src=\'assets/images/avatars/noimage.jpg\'" onrefresh="this.src=app.profileImage(\'' + username + '\', \'profile\')"></img>' +
                    editButton
                )
        })

        Ember.Handlebars.helper('feedLink', function(item) {
            return new Handlebars.SafeString('' +
                '<a href=' + item.link + ' target="_blank">' +
                '<h4>' + item.title + '</h4>' +
                '<p class="snippet">' + item.contentSnippet + '</p>' +
                '</a>'
            )
        })
        
        
        Ember.Handlebars.helper('ifCond', function(v1, v2, options) {
        	if(v1 == "0"){
        		v1 = parseInt(v1);
        	}
        	if(v1 === v2) {
        		return options.fn(this);
        	}
        	return options.inverse(this);
        })

        Ember.Handlebars.registerBoundHelper('formatCourseUrl', function(url) {
        	var l = document.createElement("a");
            l.href = url;
            return new Handlebars.SafeString(l.href.split(l.hostname)[1]);
        })


         Ember.Handlebars.registerBoundHelper('convertToUpperCaseASCategory', function(str) {
           var str = Handlebars.Utils.escapeExpression(str);
            return new Handlebars.SafeString(str.toUpperCase());
        });


        Ember.Handlebars.registerBoundHelper('formActivityStreamDisplayTitle', function(title, name, url, type, id, actorId, actorDisplayName) {
            
            var reformedTitle = "";
            var urlLink = "";
            var reformedTitle= "";
            var reformedActorDisplayName="";
            var lastIndexOfTitle="";
            var htmlEntityDecodeObjDiplayName="";
            var htmlEntityDecodeTitle="";
            
            /*
                -- Escape Expression (Safestring passing) for Iframe resource;
            */

            title               =   Handlebars.Utils.escapeExpression(title);
            name                =   Handlebars.Utils.escapeExpression(name);
            url                 =   Handlebars.Utils.escapeExpression(url);
            actorId             =   Handlebars.Utils.escapeExpression(actorId);
            actorDisplayName    =   Handlebars.Utils.escapeExpression(actorDisplayName);

            /*
                -- Reforming Hypelinked Actor Display Name.
                -- Title First Occurance will be Actor Dispaly Name. 
            */

            reformedActorDisplayName = '<a href="#/user/'+actorId+'">'+actorDisplayName+'</a>';
            title = title.replace(actorDisplayName, reformedActorDisplayName);// Reforming Actor Display name.

            /*
                -- Reforming Hyperlinked Object Display Name.
                -- Title Last Occurance will be Object Display Name.
            */

            lastIndexOfTitle = title.lastIndexOf(name); // getting Last Index of Title.

            if(type=="document" || type=="community"){
                var formedUrl;
                if(type == "document") {
                  formedUrl = '#/' + type + '/' + id + '/index' ;
                }
                else{
                  formedUrl = '#/' + type + '/' + id ;
                }
                reformedTitle =  '<a href=' + formedUrl + '>'+name+'</a>';
                reformedTitle = title.slice(0, lastIndexOfTitle) + title.slice(lastIndexOfTitle).replace(name,reformedTitle);// Replacing Last Index - Object  Display Name
            }else {
               if(url && url!='na'){
                    /*--
                        Required URL pattern #/urlstring, code below is the validation for url which is not being sent per the requirement.
                    --*/
                    
                    // validate for string URL starting with /#/
                    if(url.substr(0, 2)=="/#"){url = url.replace(url.substr(0, 2),"#");} 
                    
                    // validate string URL which is passed without /#/
                    if(url.substr(0, 2)!="#/"){url = url.replace(url.substr(0, 0),"#/");} 


                    if(url.indexOf("#") != -1){
                        urlLink ='<a href=' + url + '>'+name+'</a>';
                    }
                    else{
                        urlLink ='<a href=' + url + '>'+name+'</a>';
                    }                    
                }else{
                    urlLink = name; // When URL is not provided, will be not providing the link for object Display name
                }
                reformedTitle = title.slice(0, lastIndexOfTitle) + title.slice(lastIndexOfTitle).replace(name,urlLink);// Replacing Last Index - Object  Display Name                       
            }

            return new Handlebars.SafeString(reformedTitle);
            
        })
    })
