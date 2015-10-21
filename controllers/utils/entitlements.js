   define(['app', 'httpClient'], function(App, httpClient) {
       App.EntitlementUtil = Ember.Object.create({
           pushEntitlements: function(post) {
               var entitlement = [];
               var shareEntitelment = [];
               if (post.scope == "public") {
                   entitlement.push({
                       type: "user",
                       id: "AllAuthenticatedUsers",
                       accessType: "write"
                   });
                   shareEntitelment.push({
                       type: "user",
                       id: "AllAuthenticatedUsers",
                       accessType: "write"
                   });
               }
               _.each(post.postShares, function(share, key) {
                   var accessTypes = [];
                   _.each(share.permission, function(permision, index) {

                       if (permision === "comment") {
                           accessTypes.push("write");

                       } else if (permision === "view") {
                           accessTypes.push("read");
                       } else if (permision == "share") {
                           accessTypes.push("share");
                       }
                   });
                   _.each(accessTypes, function(accessType, accInd) {
                       if (accessType == "share") {
                           if (share.type == "email") {
                               var obj = {
                                   type: "user",
                                   id: share.share,
                                   accessType: "write"
                               }
                               shareEntitelment.push(obj);
                           } else {
                               var obj = {
                                   type: "group",
                                   id: share.share,
                                   accessType: "write"
                               }
                               shareEntitelment.push(obj);
                           }
                       } else {
                           if (share.type == "email") {
                               var obj = {
                                   type: "user",
                                   id: share.share,
                                   accessType: accessType
                               }
                               entitlement.push(obj);
                           } else {
                               var obj = {
                                   type: "group",
                                   id: share.share,
                                   accessType: accessType
                               }
                               entitlement.push(obj);
                           }
                       }
                   });
               })

               // submit comment entitlement
               var reqdata = {
                   resource: "/posts/" + post._id,
                   subjects: entitlement
               }
            var header = {
                   //"X-B2B-AuthToken": app.getCookie('auth-token'),
                   "Content-Type": "application/json"
               }
               httpClient.post("/knowledgecenter/userpi/entitlements", reqdata, header)
                   .then(function(response) {
                       console.log(response);
                   }, function(err) {
                       console.log(err);
                   });

               // submit shared entitlement
               var reqdata = {
                   resource: "/posts/" + post._id + "/share",
                   subjects: shareEntitelment
               }
               var header = {
                   //"X-B2B-AuthToken": app.getCookie('auth-token'),
                   "Content-Type": "application/json"
               }
              return httpClient.post("/knowledgecenter/userpi/entitlements", reqdata, header)
                   .then(function(response) {
                       console.log(response);
                       return response;
                   }, function(err) {
                       console.log(err);
                       return err;
                   });
           }
       });
   });