define(['app', 'httpClient'], function(App, httpClient) {
    App.ResourceShareUtil = Ember.Object.create({
        populatePostsShareData: function(postModel, postObject, sharesFromModalPopUp, postId) {
            var streamDataContract = null;
            var postShares = [];

            if (window.activityStream && sharesFromModalPopUp) {
                streamDataContract = new activityStream.StreamDataContract(postId, postObject.type, 'share');
                streamDataContract.title = postObject.title;
                var route = (postObject.type == "FORUM") ? "question" : postObject.type.toLowerCase();
                streamDataContract.resourceUrl = "/#/" + route + "/" + postId;
                streamDataContract.authorUserName = postObject.author;
            }

            var shares = [];
            if (postModel) {
                if(typeof(postModel.get('share'))=="string")
                {
                    shares = (postModel.get('share')) ? postModel.get('share').split(',') : [];
                }else{
                    
                    shares = postModel.get('share');
                }
                
            } else {
                try{
                    shares = (sharesFromModalPopUp) ? sharesFromModalPopUp.split(',') : [];
                }
                catch(err){
                    shares = sharesFromModalPopUp;
                }
                
            }

            _.each(shares, function(share, key) {
                var keyValue = share.split('|');
                var isAlreadyShared = false;
                _.each(postObject.postShares, function(queObj, index) {
                    if (queObj.share == keyValue[0]) {
                        isAlreadyShared = true;
                    }
                });
                var type = "email";
                if (keyValue[0].indexOf("@") == -1) {
                    type = "group";
                }
                var obj = {
                    share: keyValue[0],
                    display: keyValue[1],
                    type: type,
                    permission: postObject.permissions
                };

                postShares.push(obj);

                if (!isAlreadyShared) {
                    if (window.activityStream && streamDataContract && streamDataContract.sharedWith) {
                        var sharedTaget = (new activityStream.PersonObject(obj.share, obj.display)).toObject();
                        if (obj.type == "group") {
                            sharedTaget.objectType = obj.type;
                        }
                        streamDataContract.sharedWith.push(sharedTaget);
                    }
                }

            });
            postObject.postShares = postShares;
            return {
                postObject: postObject,
                streamDataContract: streamDataContract
            };
        },
        pushCourseSharesToStream: function(courseSharedDetails, alreadySharedData, courseTitle, courseType) {
            try {
                if (!window.activityStream) return;
                var sharedWith = _.pluck(courseSharedDetails.entityShares, "share");
                var alreadySharedWith = _.pluck(alreadySharedData, "share");
                var actualSharedWith = _.difference(sharedWith, alreadySharedWith);
                if (!actualSharedWith || !actualSharedWith.length) return;

                var streamDataContract = new activityStream.StreamDataContract('' + courseSharedDetails.id, 'course', 'share');
                streamDataContract.title = courseTitle;
                streamDataContract.resourceUrl = "/#/learningCourse/" + courseSharedDetails.id + "?coursetype=" + courseType;
                streamDataContract.authorUserName = "ccladmin@cisco.com";

                _.each(actualSharedWith, function(sharedId) {
                    var sharedWithUser = _.findWhere(courseSharedDetails.entityShares, {
                        "share": sharedId
                    });
                    var sharedTaget = (new activityStream.PersonObject(sharedWithUser.share, sharedWithUser.display)).toObject();
                    if (sharedWithUser.type == "group") {
                        sharedTaget.objectType = sharedWithUser.type;
                    }
                    streamDataContract.sharedWith.push(sharedTaget);
                });
                return activityStream.pushToStream(streamDataContract);

            } catch (ex) {
                console.log(ex);
                return ex;
            }
        }
    });
});