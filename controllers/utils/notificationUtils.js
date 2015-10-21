define(['app'],
    function (app) {
        app.NotificationUtils = Ember.Object.create({
            sendActivityStreamEvent: function(entity, entityType, verb) {
                if (window.activityStream) {
                    var streamDataContract = new activityStream.StreamDataContract(entity.id.toString(), entityType);
                    streamDataContract.resourceUrl = entity.resourceUrl;
                    streamDataContract.title = entity.title;
                    streamDataContract.verb = verb;
                    streamDataContract.authorUserName = "ccl@cisco.com";
                    activityStream.pushToStream(streamDataContract);
                } else {
                    console.log("Not able to send the activity stream event as 'activityStream' has not been initialized/defined");
                }
            }
        });
    });
