define(['ember', 'Q', 'services/usersService', 'jabberService'], function (Ember, Q, usersService, jabberService) {
    var jabberIdToUserDetailsMap = {};
    var jabberModel = jabberService.model;

    var fetchUserInfo = function(jabberId) {
        var deferred = Q.defer();

        if (jabberIdToUserDetailsMap[jabberId]) {
            deferred.resolve(jabberIdToUserDetailsMap[jabberId]);
        } else {
            fetchUserDetailsForJabberId(jabberId).then(function() {
                deferred.resolve(jabberIdToUserDetailsMap[jabberId]);
            });
        }

        return deferred.promise;
    };

    var lookUpUserInfo = function(jabberId) {
        return jabberIdToUserDetailsMap[jabberId];
    };

    var fetchUserDetailsForJabberId = function(jabberId) {
        return usersService.userForJabberId(jabberId).then(function(data) {
            updateUserDetailsMap(jabberId, data)
        })
    };

    var updateUserDetailsMap = function(jabberId, details) {
        var existingJabberIdToUserDetailsMap = jabberIdToUserDetailsMap;
        existingJabberIdToUserDetailsMap[jabberId] = {
            shortName: details.shortName,
            username: details.username,
            name: details.name,
            email: details.email
        };
        jabberIdToUserDetailsMap = existingJabberIdToUserDetailsMap;
    };

    var updateUserDetails =  function() {
        _.each(jabberModel.contacts, function(contact) {
            var jabberId = contact.name.split('@')[0];
            if (!jabberIdToUserDetailsMap[jabberId]) {
                fetchUserDetailsForJabberId(jabberId);
            }
        })
    };

    return {
        updateUserDetails: updateUserDetails,
        fetchUserInfo: fetchUserInfo,
        lookUpUserInfo: lookUpUserInfo
    }
});
