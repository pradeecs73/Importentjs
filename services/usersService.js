define(['app', 'httpClient', 'underscore', 'Q', 'services/searchService', 'jabberService'], function (app, httpClient, _, Q, searchService, jabberService) {

    var searchUsers = function (searchText, filters, pageNumber, pageSize, luceneQuery, sortBy, sortOrder) {
        var type = ["user"];
        var sortConfig = [];
        sortConfig.push({
          "sortBy" : sortBy,
          "sortOrder" : sortOrder
        });
        if(sortBy != "shortName")
          sortConfig.push({
            "sortBy":"shortName",
            "sortOrder" : "asc"
          })
        return searchService.genericSearchWithPost(searchText, filters, type, pageSize, pageNumber, luceneQuery, sortConfig);
    };

  var transformUserProfile = function (user) {
    user["id"] = user['username'].replace(/[\.@]/g, '_')
    user["adminAssignedExpertise"] = user["adminAssignedExpertise"] == null ? new Array() : user["adminAssignedExpertise"]
    user["roles"] = user["roles"] == null ? new Array() : user["roles"]
    return user;
  };

  var transformExpertise = function(expertise){
    return _.extend(expertise, {id: expertise.expertiseId, name: expertise.expertiseName});
  };

    var extendUsers = function (allUsers) {
        return _.chain(allUsers)
            .map(function (user) {
                if(user['username']){
                    user["id"] = user['username'].replace(/[\.@]/g, '_');
                    user["multiSelectEnabled"] = true;

                    return user;
                }else{
                    Ember.Logger.error("Not a valid user");
                }
            }).value();
    };

  var groupByAssignmentType = function(approvedExpertise) {
    return approvedExpertise["assignmentType"] === "ADMIN" ? "adminAssignedExpertise" : "selfTaggedExpertise";
  }
  return {
    getFollowedUsersDataFromCloudlet: function(thisObject, type, entityType, queryParams) {
        var url ;
        var self = this;
        var filters, searchText, sortBy, sortOrder, pageNumber;
        
        if (window.follow && window.follow.getConfig()) {
            pageNumber = (queryParams.pageNumber && queryParams.pageNumber > 0)? queryParams.pageNumber : 1;
            var config = window.follow.getConfig();
            url = "/knowledgecenter/cloudlet";
            url += "/" + type + "/";
            url += config.appId + "/" + (config.userName);
            url += "?entityType=" + entityType;
        } else {
            var deferred = Q.defer();            
            return deferred.promise;
        }

        return httpClient.get(url).then(function(followsData) {
        followsData=_.uniq(followsData);
        var convertedFollowsData=followsData.join();

        return httpClient.get("knowledgecenter/userpi/users?usernames="+convertedFollowsData)
                .then(function(followDataResponseFromUserpi){
                        var config = window.follow.getConfig();
                        url = "/knowledgecenter/cloudlet";
                        url += "/app/" + (config.appId) + "/user";
                        url +=  "/" +  (config.userName);
                        url += "/followers/count?entityType="+entityType;

						var pluckedUser = extendUsers(followDataResponseFromUserpi);
						pluckedUser=_(pluckedUser).filter(function(item) {
						  return typeof(item) != "undefined"
						});  
						  var _contacts = [];
						  _.each(followsData, function(followed){
							  _.each(pluckedUser, function(users){
								if(followed == users.username){
								  _contacts.push(users)
								}
							  });
						  });
                     return {
                        allUsers: _contacts
                      };
                }).fail(function(err){
                      Ember.Logger.error("Issues in retrieving profile details for processing. " + err);      
                });
        }).fail(function(err){
            Ember.Logger.error("Issues in retrieving followers. " + err);
        });
    },  

    extractDataFromSearchResults: function(followsData, searchText, filters, pageNumber, pageSize, luceneQuery, sortBy, sortOrder, _contacts){         

      var self = this;
      var totalPages;

        return searchUsers(searchText, filters, pageNumber, pageSize, luceneQuery, sortBy, sortOrder)
            .then(function (usersResponse) {          
              console.log("Users Response: ",usersResponse);
              totalPages = Math.round(usersResponse.users.totalResults/pageSize);
              
              /* @rahul              
              * pluck the followed data from response after comparing with cloudlet response data
              */
              
              var pluckedUsers = extendUsers(_.pluck(usersResponse.users.results, "resource"));
              _.each(followsData, function(followed){
                console.log("Point ",followed);
                 _.each(pluckedUsers, function(users){
                  if(followed == users.email){
                   console.log(users.email);
                   _contacts.push(users);                    
                  }
                });
              });
              
              /*@rahul
              * _search gets only first 12 users data from the database, 
              * if the current user is unable to see the person he follows in the received 12 users, 
              * then we have to fetch the next 12 users and compare with the cloudlet data.
              * And return the modified model data
              */           
            
            if(_contacts.length<app.PageSize){
                pageNumber += 1;           
                console.log("_contacts", _contacts);
                self.extractDataFromSearchResults(followsData, searchText, filters, pageNumber, pageSize, luceneQuery, sortBy, sortOrder, _contacts);
            }else{
                  return {
                    allFacets: searchService.facetsFor(usersResponse, "users"),
                    allUsers: _contacts,
                    totalResults : (followsData.length+1),
                    pageNumber : pageNumber
                  };
                }
          });

    }, 
    allUsersWithFilters: function(searchText, filters, includeLoggedIn, pageNumber, includeAllExpertise, sortBy, sortOrder) {
          var luceneQuery;
          var excludeLoggedInUserLuceneQuery = "-id:" + app.getUsername()
            if (!includeLoggedIn) {
                luceneQuery = excludeLoggedInUserLuceneQuery;
                if(includeAllExpertise){
                    luceneQuery =  luceneQuery + " AND " + includeAllExpertise;
                }
            }
            return searchUsers(searchText, filters, pageNumber, app.PageSize, luceneQuery, sortBy, sortOrder)
                .then(function (usersResponse) {
                    return {
                        allFacets: searchService.facetsFor(usersResponse, "users"),
                        allUsers: extendUsers(_.pluck(usersResponse.users.results, "resource")),
                        totalResults : usersResponse.users.totalResults
                    };
                })

    },
	
    managerTeamWithFilters: function(searchText, filters, includeLoggedIn, pageNumber, includeAllExpertise, sortBy, sortOrder, managerid) {
        var luceneQuery;
        var userArray = new Array();

        if(managerid === undefined) {
          managerid = app.getUsername();
        }
        if (!filters.length) {
          filters = ["managerId:" + managerid];
        } else {
          filters.push("managerId:" + managerid);
        }

        var excludeLoggedInUserLuceneQuery = "-id:" + app.getUsername()
        if (!includeLoggedIn) {
            luceneQuery = excludeLoggedInUserLuceneQuery;
            if(includeAllExpertise){
                luceneQuery =  luceneQuery + " AND " + includeAllExpertise;
            }
        }

        function reporteesLmsData(userresp,respData) {
            var allUsersData = extendUsers(_.pluck(userresp.users.results, "resource"));
            var usersArray = _.pluck(allUsersData, 'email').join();
            var lmsUrl = '/knowledgecenter/ka/proxy/lms/users/enrolments?users=' + usersArray;
            var lmsFlag = true;
            var defaultData = {"coursecount":0,"completedcount":0,"plpcount":0}
             
            function count(u) {
                return _.extend(u, {reporteeNumber: respData ? respData[u.email].reporteeCount : 0, lmsInfo:defaultData});
            };
            allUsersData.map(count);
            return lmsFlag ? httpClient.get(lmsUrl).then(function(lmsData) {
               
              function lmsCount(u) {
                var lmsObject = _.find(lmsData.result, function(l){
                  return l.username === u.email;
                });
                return _.extend(u, {lmsInfo: lmsObject.data});
              };

        return {
                  allFacets: searchService.facetsFor(userresp, "users"),
                  myTeamfilterArray: _.omit(searchService.facetsFor(userresp, "users"), 'managerId'),
                  allUsers: allUsersData.map(lmsCount),
                  totalResults : userresp.users.totalResults,
              };
           }, function(error){
            return {
              allFacets: searchService.facetsFor(userresp, "users"),
              myTeamfilterArray: _.omit(searchService.facetsFor(userresp, "users"), 'managerId'),
              allUsers: allUsersData,
              totalResults : userresp.users.totalResults,
            };
           }) :  {
                  allFacets: searchService.facetsFor(usersResponse, "users"),
                  myTeamfilterArray: _.omit(searchService.facetsFor(userresp, "users"), 'managerId'),
                  allUsers: allUsersData,
                  totalResults : userresp.users.totalResults,
        };
      };

      return searchUsers(searchText, filters, pageNumber, app.PageSize, luceneQuery, sortBy, sortOrder)
          .then(function (usersResponse) {
            _.each(usersResponse.users.results, function (users) {
              userArray.push(users.resource.email);
            });

            var rqstbody = {
              users : userArray,
              attributes : ["reporteeCount"]
            }

            var url = '/knowledgecenter/userpi/users/attributes';
                

            return httpClient.post(url, rqstbody).then(function(followsData) {
              return reporteesLmsData(usersResponse, followsData);
            }, function(error){
                return reporteesLmsData(usersResponse);
             }); 
      })
    },

    myTeamWithFilters: function(searchText, filters, includeLoggedIn, pageNumber, includeAllExpertise, sortBy, sortOrder) {
        var luceneQuery;
        if (!filters.length) {
          filters = ["managerId:" + app.getUsername()];
        } else {
          filters.push("managerId:" + app.getUsername());
        }
        var excludeLoggedInUserLuceneQuery = "-id:" + app.getUsername()
        if (!includeLoggedIn) {
            luceneQuery = excludeLoggedInUserLuceneQuery;
            if(includeAllExpertise){
                luceneQuery =  luceneQuery + " AND " + includeAllExpertise;
            }
        }
        return searchUsers(searchText, filters, pageNumber, app.PageSize, luceneQuery, sortBy, sortOrder)
            .then(function (usersResponse) {
                return {
                    allFacets: searchService.facetsFor(usersResponse, "users"),
                    allUsers: extendUsers(_.pluck(usersResponse.users.results, "resource")),
                    totalResults : usersResponse.users.totalResults
                };
            })
    },
    
    expertUsersWithFilters: function (searchText, filters, pageNumber,  sortBy, sortOrder) {
        var includeAllExpertise =  "+expertise:" + "[* TO *]"
        return this.allUsersWithFilters(searchText, filters, false, pageNumber, includeAllExpertise, sortBy, sortOrder)
    },
    transformUserProfile: transformUserProfile,
    allUsers: function() {
        return searchUsers('*', [], 1, 99999, "-id:" + app.getUsername(),"shortName","asc")
            .then(function (usersResponse) {
                return extendUsers(_.pluck(usersResponse.users.results, "resource"))
            })
    },

    usersAutoSuggest: function (members) {
      if (_.isUndefined(members)) {
        members = []
      }
      return {
        url: searchService.getSuggestUrl(),
        requestBody: [
          {type: "user", fieldName: "shortName", excludes: {username: members}, resultSize: 50},
        ],
        filter: function (response) {
          var users = _.pluck(response.users.results, "resource")
          return _.map(users, function (user) {
            return {value: user.username, text: user.shortName + " (" + user.username + ")"}
          })
        },
        limit: 50

      }

    },

    usersAndGroupsAutoSuggest: function(excludeUsersAndGroups) {
      if(_.isUndefined(excludeUsersAndGroups)){
        excludeUsersAndGroups = []
      }
      return {
        url: searchService.getSuggestUrl(),
        requestBody: [
            { type: "user", fieldName: "shortName", excludes: { username: excludeUsersAndGroups}, resultSize: 50},
            { type: "group", fieldName: "name", excludes: {id: excludeUsersAndGroups, active: [false]}, resultSize: 50}
        ],
        filter: function(response) {
            var transformations = {
                users: function(user) {
                    return {value: user.username + "|" + user.shortName + "|" + "user"+ "|" + user.applicationId, "text": user.shortName};
                },
                groups: function(group) {
                    return {value: group._id + "|" + group.name + "|" + "group" + "|" + group.applicationId , "text": group.name};
                 }
            };
            var results = [];
            _.each(response, function(v, k) {
                results.addObjects(_.map(_.pluck(v.results, "resource"), transformations[k]));
            });
            return results;
        },
        limit: 100
      }
    },

    usersAutoSuggestForJabber: function(loggedInUsername) {
      return {
          url:searchService.getSuggestUrl(),
          requestBody: [
            { type: "user", fieldName: "shortName", excludes: { username: [loggedInUsername]}, resultSize: 50},
          ],
          filter: function(response) {
              var users = _.pluck(response.users.results, "resource")
              return _.map(users, function(user) {
                  return { value: user.jabberUsername + "|" + user.shortName, text: user.shortName + " (" + user.username + ")" }
              })
          },
          limit: 50
      }
    },

    userProfileFor: function(username) {
        var fetchProfileRequest = "/knowledgecenter/userpi/user/" + username + "/profile";
        return httpClient.get(fetchProfileRequest).then(this.processProfileResponse.bind(this))
    },

    getSession: function() {
        return httpClient.get("/knowledgecenter/userpi/user/session")
            .then(function (response) {
                return {
                    username : response.username,
                    shortName: response.shortName,
                    jabberUsername: response.jabberUsername,
                    jabberPassword: aesUtil.decrypt(response.jabberPassword),
                    webexId: response.webexId,
                    webexPassword: aesUtil.decrypt(response.webexPassword)
                }
            });
    },

    myProfile: function() {
        var fetchProfileRequest = "/knowledgecenter/userpi/user/myProfile";
        return httpClient.get(fetchProfileRequest).then(this.processProfileResponse.bind(this))
    },

    processProfileResponse: function(profile) {
        if (!_.isUndefined(profile.groups)) {
            _.each(profile.groups, function (group) {
                group.isLast = false
            });
            var lastGroup = _.last(profile.groups);
            if (!_.isUndefined(lastGroup))
                lastGroup.isLast = true
        }
        return profile
    },

    myRecommendations: function() {
        var recommendationsRequest = "/knowledgecenter/userpi/recommendations";
        return httpClient.get(recommendationsRequest)
    },

    recommendationsFor: function (userId) {
        var recommendationsRequest = "/knowledgecenter/userpi/recommendations?userId="+userId;
        return httpClient.get(recommendationsRequest)
    },

    pendingExpertise: function() {
      return httpClient.get("/knowledgecenter/userpi/users/expertise/_pending").then(function(response) {
        return _.map(response["pendingExpertise"], transformExpertise);
      });
    },

    approvedExpertise: function() {
      return httpClient.get("/knowledgecenter/userpi/users/expertise/_approved").then(function(response) {
        return _.chain(response["approvedExpertise"]).map(transformExpertise).groupBy(groupByAssignmentType).value()
      });
    },

    approvedExpertiseFor: function(userId) {
      return httpClient.get("/knowledgecenter/userpi/users/" + userId + "/expertise/_approved").then(function(response) {
        return _.chain(response["approvedExpertise"]).map(transformExpertise).groupBy(groupByAssignmentType).value()
      });
    },

    userForJabberId: function (jabberId) {
      return httpClient.get("/knowledgecenter/userpi/user?jabberId=" + jabberId);
    },
    rssFeedsForUser: function (email) {
      return httpClient.get("/knowledgecenter/cclom/rss/feeds/user/" + email + "/all");
    },
    rssFeedsForUserWithName: function (feedId) {
      return httpClient.get("/knowledgecenter/cclom/rss/feeds/"+ feedId);
    },
    deleterssFeeds: function (feedId) {
      return httpClient.remove("/knowledgecenter/cclom/rss/feeds/"+ feedId);
    },
    addFeedsForUser: function (feed) {
      return httpClient.post("/knowledgecenter/cclom/rss/feeds", feed);
    },
    updateFeedForUser:function(feed,feedId){
      return httpClient.put("/knowledgecenter/cclom/rss/feeds/"+feedId, feed);
    },
    captureAddExpertiseActivity: function (username, shortName, expertiseId, expertiseName, resourceUrl) {
      if (window.activityStream) {
          var streamDataContract = new activityStream.StreamDataContract(username, 'USER', 'endorse');
          var markedTarget = (new activityStream.TargetObject(expertiseId, expertiseName, "expertise")).toObject();
          streamDataContract.title = shortName;
          streamDataContract.resourceUrl = resourceUrl;
          streamDataContract.authorUserName = username;
          streamDataContract.target = markedTarget;
          try {
              activityStream.pushToStream(streamDataContract);
          }
          catch (err) {
              console.log(err)
          }
      }
    },

    captureRemoveExpertiseActivity: function(username, shortName, expertiseId, expertiseName, expertiseAssignmentType, resourceUrl) {
      var loggedinUserName = app.getShortname();
        if (window.activityStream) {
		  if (loggedinUserName !== shortName) {
            var streamDataContract = new activityStream.StreamDataContract(username, 'USER', 'remove');
		  }
		  else {
			var streamDataContract = new activityStream.StreamDataContract(username, 'USER', 'self-remove');
		  }
          var markedTarget = (new activityStream.TargetObject(expertiseId, expertiseName, "expertise")).toObject();
          streamDataContract.title = shortName;
          streamDataContract.resourceUrl = resourceUrl;
          streamDataContract.authorUserName = username;
          streamDataContract.target = markedTarget;
          if (loggedinUserName !== shortName) {
            streamDataContract.displayMessage = loggedinUserName +" has removed "+ shortName + " as an Expert on " + expertiseName;
          }
          else {
            streamDataContract.displayMessage = shortName + " has self-removed as an expert on " + expertiseName;
          }

          try {
              activityStream.pushToStream(streamDataContract);
          }
          catch (err) {
              console.log(err)
          }
      }

    },

    addAndRemoveExpertise: function(username, shortName, addingexpertises, removingexpertises) {

        return httpClient.put("/knowledgecenter/userpi/users/" + username + "/expertises/assign", addingexpertises).then(function(followsData) {
              
              if(removingexpertises.removes.selfAssignedExpertise.length > 0 || removingexpertises.removes.adminAssignedExpertise.length > 0) 
              {
                  return httpClient.put("/knowledgecenter/userpi/users/" + username + "/expertises/unassign", removingexpertises);
               }  
            }).fail(function(error) {
                return reporteesLmsData(usersResponse);
             }); 


    },

    addExpertise: function(username, shortName, expertiseId, expertiseName) {
      var self = this;
      return httpClient.post("/knowledgecenter/userpi/users/" + username + "/expertise/admin", {'expertiseId': expertiseId}).then(function(response) {
        self.captureAddExpertiseActivity(username, shortName, expertiseId, expertiseName, "/#/user/" + username);
        return response;
      });
    },

    removeExpertise: function (username,shortName, expertiseId, expertiseAssignmentType, expertiseName) {
	  var self = this; 	
      return httpClient.remove("/knowledgecenter/userpi/users/" + username + "/expertise/" + expertiseId + "/" +  expertiseAssignmentType).then(function(response) {
        self.captureRemoveExpertiseActivity(username, shortName, expertiseId, expertiseName, expertiseAssignmentType, "/#/user/" + username); 
      })
    },

    removeSelfAssignedExpertise: function(username, expertiseId,expertisename,loginshortname) {
        return httpClient.remove("/knowledgecenter/userpi/users/" + username + "/expertise/" + expertiseId + "/self").then(function(response){

            if (window.activityStream) {
                var streamDataContract = new activityStream.StreamDataContract(username, 'USER', 'self-remove');
                var markedTarget = (new activityStream.TargetObject(expertiseId, expertisename, "expertise")).toObject();
                streamDataContract.title = loginshortname;
                streamDataContract.resourceUrl = '/#/profile/my';
                streamDataContract.authorUserName = username;
                streamDataContract.target = markedTarget;
                streamDataContract.displayMessage = loginshortname + " has self-removed as an expert on " + expertisename;
                try {
                activityStream.pushToStream(streamDataContract);
                }
                catch (err) {
                console.log(err)
                }
           }
              return response;

        });

           
    },

    users: function (usernames) {
        usernames = typeof usernames === "string" ? [usernames] : usernames; // ensure usernames is an array of usernames

      return httpClient.get("/knowledgecenter/userpi/users?usernames=" + usernames.join(","))
    },

    basicProfiles: function (usernames) {
        usernames = typeof usernames === "string" ? [usernames] : usernames; // ensure usernames is an array of usernames

        if(usernames.length > 0)
          return httpClient.get("/knowledgecenter/userpi/users/basicProfile?usernames=" + usernames.join(","))
        else
          return Q({});
    },

    allRoles: function () {
      var self = this;
      return httpClient.get("/knowledgecenter/authorization/roles/_all?applicationId=userpi").then(function(allRoles) {
        return _(allRoles).map(function(role) {
                   return role["_id"];
        }).filter(function(role) {
            return role != "OperationAdmin";
        });
      });
    },

    addRole: function (username, role) {
      return httpClient.put("/knowledgecenter/userpi/users/" + username + "/roles", {'role': role})
    },

    removeRole: function (username, role) {
      return httpClient.remove("/knowledgecenter/userpi/users/" + username + "/roles/" + role)
    },

    editProfile: function (userId, editedProfileJson, loginshortname, editedDisplayMessageText) {
      return httpClient.put("/knowledgecenter/userpi/user/" + userId + "/profile", editedProfileJson).then(function(response){
     
            if (window.activityStream) {
                var streamDataContract = new activityStream.StreamDataContract(userId,'USER', 'edit');
                streamDataContract.title = loginshortname;
                streamDataContract.resourceUrl = '/#/profile/my';
                streamDataContract.authorUserName = userId;

                streamDataContract.displayMessage = loginshortname+" has edited self-profile - " + editedDisplayMessageText;
                try {
                activityStream.pushToStream(streamDataContract);
                }
                catch (err) {
                console.log(err)
                }
             }

      });
    },
    addSelfTaggedExpertise: function(userId, selfTaggedExpertiseId,expertiseName,loginshortname) {
        return httpClient.post('/knowledgecenter/userpi/users/' + userId + '/expertise/self', {'expertiseId': selfTaggedExpertiseId}).then(function(response){

           if (window.activityStream) {
              var streamDataContract = new activityStream.StreamDataContract(userId,'USER', 'self-add');
              var markedTarget = (new activityStream.TargetObject(selfTaggedExpertiseId, expertiseName, "expertise")).toObject();
              streamDataContract.title = loginshortname;
              streamDataContract.resourceUrl = '/#/profile/my';
              streamDataContract.authorUserName = userId;
              streamDataContract.target = markedTarget;

              streamDataContract.displayMessage = loginshortname+" has self-added as an expert on "+expertiseName;
              try {
              activityStream.pushToStream(streamDataContract);
              }
              catch (err) {
              console.log(err)
              }
          }
          return response;
        });
    },
    addLearnerTaggedExpertise: function(userId, shortName, learnerTaggedExpertiseId, learnerTaggedExpertiseName) {
        var self = this;
        return httpClient.post('/knowledgecenter/userpi/users/' + userId + '/expertise/learner', {'expertiseId': learnerTaggedExpertiseId}).then(function(response){
            self.captureAddExpertiseActivity(userId, shortName, learnerTaggedExpertiseId, learnerTaggedExpertiseName, "/#/user/" + userId);
            return response;
        });
    },
    approveExpertise: function(userId, shortName, assignedBy, expertiseId, expertiseName){
      return httpClient.put('/knowledgecenter/userpi/users/' + userId + '/expertise/'+ expertiseId +'/_approve', {"assignedBy": assignedBy}).then(function(response){
          if (window.activityStream) {
              var streamDataContract = new activityStream.StreamDataContract(expertiseId, 'expertise', 'approve');
              var markedTarget = (new activityStream.TargetObject(assignedBy, assignedBy, "USER")).toObject();
              streamDataContract.title = expertiseName;
              streamDataContract.resourceUrl = "/#/user/" + userId;
              streamDataContract.authorUserName = assignedBy;
              streamDataContract.target = markedTarget;
              try {
                  activityStream.pushToStream(streamDataContract);
              }
              catch (err) {
                  console.log(err)
              }
          }
          return response;
      });
    },
    rejectExpertise: function(userId, expertiseId, expertiseName){
      return httpClient.remove('/knowledgecenter/userpi/users/' + userId + '/expertise/'+ expertiseId +'/_reject').then(function(response){
          if (window.activityStream) {
              var streamDataContract = new activityStream.StreamDataContract(expertiseId, 'expertise', 'reject');
              streamDataContract.title = expertiseName;
              streamDataContract.resourceUrl = "/#/user/" + userId;
              streamDataContract.authorUserName = userId;
              try {
                  activityStream.pushToStream(streamDataContract);
              }
              catch (err) {
                  console.log(err)
              }
          }
          return response;
      });
    },
    addRecommendation: function(userId, userShortName, recommendation) {

        return httpClient.post("/knowledgecenter/userpi/recommendations", {message: recommendation, userId: userId}).then(function(response){
                var recommendationId=response.recommendationId;
                var recommendationmessage=response.message;

             if(recommendationmessage.length >139)
             {
                recommendationmessage = recommendationmessage.substr(0, 140)+"...";
             }

             if (window.activityStream) {
                var streamDataContract = new activityStream.StreamDataContract(userId, 'USER', 'recommend');
                var markedTarget = (new activityStream.TargetObject(recommendationId, recommendationmessage, "recommendation")).toObject();
                streamDataContract.title = userShortName;
                streamDataContract.resourceUrl = "/#/user/" + userId;
                streamDataContract.authorUserName = userId;
                streamDataContract.target = markedTarget;
                try {
                    activityStream.pushToStream(streamDataContract);
                }
                catch (err) {
                    console.log(err)
                }
            }
            return response;
        });
    },

    approveRecommendation : function(recommendationId, userId, recommendedBy, recommendedByName,recommendationmessage,recommendationbyshortname){
      return httpClient.put("/knowledgecenter/userpi/recommendations/" + recommendationId + "/_approve").then(function(response){

           if(recommendationmessage.length >139)
             {
                recommendationmessage = recommendationmessage.substr(0, 140)+"...";
             }

          if (window.activityStream) {
            var streamDataContract = new activityStream.StreamDataContract(recommendationId, 'recommendation', 'approve');
            var markedTarget = (new activityStream.TargetObject(recommendationId, recommendationmessage, "recommendation")).toObject();
            streamDataContract.title = recommendationbyshortname;
            streamDataContract.resourceUrl = "/#/user/" + recommendedBy;
            streamDataContract.authorUserName = recommendedByName;
            streamDataContract.target = markedTarget;
            try {
              activityStream.pushToStream(streamDataContract);
            }
            catch (err) {
              console.log(err)
            }
          }
          return response;
      });
    },

    rejectRecommendation : function(recommendationId, userId, recommendedBy, recommendedByName,recommendationmessage,recommendationbyshortname){
      return httpClient.remove("/knowledgecenter/userpi/recommendations/" + recommendationId + "/_reject").then(function(response){
        if(recommendationmessage.length >139)
             {
                recommendationmessage = recommendationmessage.substr(0, 140)+"...";
             }

        if (window.activityStream) {
          var streamDataContract = new activityStream.StreamDataContract(recommendationId, 'recommendation', 'reject');
          var markedTarget = (new activityStream.TargetObject(recommendationId, recommendationmessage, "recommendation")).toObject();
          streamDataContract.title = recommendationbyshortname;
          streamDataContract.resourceUrl = "/#/user/" + recommendedBy;
          streamDataContract.authorUserName = recommendedByName;
          streamDataContract.target = markedTarget;
          try {
            activityStream.pushToStream(streamDataContract);
          }
          catch (err) {
            console.log(err)
          }
        }
        return response;
      });
    },

    getMoodleIds : function(usernames, managerUserName){
        return httpClient.post('/knowledgecenter/cclom/usermetainfo/ccl', { userIDs: usernames }).then(function(usersInfo) {
            var userMoodleIDs = [], managerId;
            usersInfo.forEach(function(userInfo){
                if(userInfo.cclId === managerUserName){
                    managerId = userInfo.moodleId;
                }else {
                    userMoodleIDs.push(userInfo.moodleId)
                }
            });
            userMoodleIDs.push(managerId);
            return userMoodleIDs;
        });
    },

    getMoodleId: function(){
        return this.getMoodleIds([app.getCookie('username').toLowerCase()]).then(function (moodleIds) {
            app.setCookie("moodleId", moodleIds[0]);
            return moodleIds[0];
        })
    },
    hasPermission: function(permissionType) {
      var endpoint = "/knowledgecenter/ka/proxy/lms/user/permissions?permission=" + permissionType;
      return httpClient.get(endpoint).then(function (response) {
        return response;
      })
    }
  }
})
