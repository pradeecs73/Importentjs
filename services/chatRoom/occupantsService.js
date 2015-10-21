define(['services/jabberUsersService', 'jabberService', 'Q'], function (jabberUsersService, jabberService, Q) {

    var getActiveUsersJabberIds = function(occupantsStateMap) {
        var activeUsersJabberIds = [];
        _.each(_.keys(occupantsStateMap), function(jabberId) {
            if (occupantsStateMap[jabberId] === "active")
                activeUsersJabberIds.push(jabberId);
        });
        return activeUsersJabberIds;
    };

    var handleUserLeftScenario = function(jabberIds, myRoom, occupantsStateMap) {
        _.each(jabberIds, function(jabberId) {
            occupantsStateMap[jabberId] = "inactive";

            jabberUsersService.fetchUserInfo(jabberId).then(function(userDetails) {
                var notificationMessage = {
                    from: jabberId,
                    isNotification: true,
                    body: userDetails["shortName"] + " has left the room",
                    time: new Date()
                };
                myRoom.messages.pushObject(notificationMessage);
            });
        });

        return updateParticipantsDisplayInfo(occupantsStateMap);
    };

    var handleUserJoinedScenario = function(jabberIds, myRoom, occupantsStateMap) {
        _.each(jabberIds, function(jabberId) {
            occupantsStateMap[jabberId] = "active";
            jabberUsersService.fetchUserInfo(jabberId).then(function(userDetails) {
                var notificationMessage = {
                    from: jabberId,
                    isNotification: true,
                    body: userDetails["shortName"] + " has joined the room",
                    time: new Date()
                };
                myRoom.messages.pushObject(notificationMessage);
            });
        });

        return updateParticipantsDisplayInfo(occupantsStateMap);
    };

    var updateParticipantsDisplayInfo = function(occupantsStateMap) {
        var deferred = Q.defer();
        var occupantsJabberIds = _.keys(occupantsStateMap);
        var participantsInfo = [];
        var participantsInfoPromises = [];
        _.each(occupantsJabberIds, function(occupantsJabberId) {
            if (occupantsStateMap[occupantsJabberId] === "active") {
                var participantInfoPromise = jabberUsersService.fetchUserInfo(occupantsJabberId);
                participantsInfoPromises.push(participantInfoPromise);
            }
        });

        Q.allSettled(participantsInfoPromises).then(function(allUsersInfo) {
            _.each(allUsersInfo, function(userInfo, index) {
                participantsInfo.push({
                    shortName: userInfo.value["shortName"],
                    username: userInfo.value["username"],
                    contact: {
                        jabberUsername: occupantsJabberIds[index]
                    }
                })
            });

            deferred.resolve(participantsInfo);
        });

        return deferred.promise;
    };

    var handleOccupantsChange = function(myRoom, occupantsStateMap) {
        var activeUsersJabberIds = getActiveUsersJabberIds(occupantsStateMap);
        var exitedUserJabberIds = _.difference(activeUsersJabberIds, myRoom.occupantsJabberIds);
        if (exitedUserJabberIds.length > 0) {
            return handleUserLeftScenario(exitedUserJabberIds, myRoom, occupantsStateMap);
        }
        var newOccupantJabberIds = _.difference(myRoom.occupantsJabberIds, activeUsersJabberIds);
        if (newOccupantJabberIds.length > 0) {
            return handleUserJoinedScenario(newOccupantJabberIds, myRoom, occupantsStateMap);
        }
    };

    return {
        handleOccupantsChange: handleOccupantsChange
    }
});
