define(['jabberService'], function (jabberService) {

    var inviteesDetailsMap = {};
    var jabberModel = jabberService.model;
    var inviteeExistsErrorSpanIdentifier = ".js-invitee-exists-error";
    var inviteeExistsErrorMessage = " is/are already invited";
    var inviteeUnavailableErrorSpanIdentifier = ".js-invitee-unavailable-error";
    var inviteeUnavailableErrorMessage = " is/are offline, so cannot invite";
    var inviteeJabberUnavailableErrorSpanIdentifier = ".js-invitee-unavailable-error";

    var refreshTemporaryContactInvitees = function(myRoom, temporaryContactInvitees) {
        var contactIds = _.map(jabberModel.contacts, function(contact) {
            return contact.name.split("@")[0]
        });
        var contactsToInvite = _.intersection(contactIds, temporaryContactInvitees);
        var inviteIfAvailableErrors = inviteIfAvailable(myRoom, contactsToInvite);
        temporaryContactInvitees.removeObjects(contactsToInvite);
        return inviteIfAvailableErrors;
    };

    var processInvitees = function(invitees, temporaryContactInvitees) {
        var contactInvitees = [];
        _.each(invitees, function(invitee) {
            jabberService.isMyContact(invitee) ? contactInvitees.push(invitee) : addToTemporaryContactInvitee(invitee, temporaryContactInvitees);
        });

        _.each(temporaryContactInvitees, function(invitee) {
            jabberService.addTemporaryContact(invitee);
        });
        return contactInvitees;
    };

    var addToTemporaryContactInvitee = function(invitee, temporaryContactInvitees) {
        var existingInvitee = _.find(temporaryContactInvitees, function(existingInvitee) {
            return existingInvitee === invitee;
        });
        if(!existingInvitee) {
            temporaryContactInvitees.push(invitee);
        }
    };

    var invite = function(myRoom, inviteesObjects, temporaryContactInvitees) {
        var invitees = [];
        var noJabberIDErrors = [];
        _.each(inviteesObjects, function(inviteeObject) {
            var jabberUsername = inviteeObject.split("|")[0];
            if(jabberUsername) {
                invitees.push(jabberUsername);
                inviteesDetailsMap[jabberUsername] = inviteeObject.split("|")[1];
            }
            else{
                var errorMessage = inviteeObject.split("|")[1] + " " + inviteeUnavailableErrorMessage;
                var error = {
                    errorMessage: errorMessage,
                    errorSpanId: inviteeJabberUnavailableErrorSpanIdentifier
                };
                noJabberIDErrors.push(error);
            }

        });
        var alreadyInvitedJabberIds = _.intersection(invitees, myRoom.occupantsJabberIds);
        var alreadyInvitedErrors = [];
        if (alreadyInvitedJabberIds.length > 0) {
            var alreadyInvitedUsers = getShortNamesForJabberIds(alreadyInvitedJabberIds).join(" ,");
            var errorMessage = alreadyInvitedUsers + " " + inviteeExistsErrorMessage;
            var error = {
                errorMessage: errorMessage,
                errorSpanId: inviteeExistsErrorSpanIdentifier
            };
            alreadyInvitedErrors.push(error);
        }

        var processedInvitees = processInvitees(invitees, temporaryContactInvitees);
        var inviteIfAvailableErrors = inviteIfAvailable(myRoom, processedInvitees);
        return alreadyInvitedErrors.concat(inviteIfAvailableErrors).concat(noJabberIDErrors);
    };

    var inviteIfAvailable =  function(myRoom, invitees) {
        var availableInvitees = [];
        var unAvailableInvitees = [];
        var errors = [];
        _.each(invitees, function(invitee){
            var contact = jabberService.getContactFor(invitee);
            (contact.statusName !== "offline" && contact.statusName !== "unavailable")? availableInvitees.push(invitee) : unAvailableInvitees.push(invitee);
        });

        jabberService.inviteToRoom(myRoom.name, availableInvitees);

        if(unAvailableInvitees.length != 0) {
            var unAvailableUsers = getShortNamesForJabberIds(unAvailableInvitees).join(",");
            var errorMessage = unAvailableUsers + " " + inviteeUnavailableErrorMessage;
            var error = {
                errorMessage: errorMessage,
                errorSpanId: inviteeUnavailableErrorSpanIdentifier
            };
            errors.push(error);
        }
        return errors;
    };

    var getShortNamesForJabberIds = function(jabberIds) {
        return _.map(jabberIds, function(jabberId) {
            return inviteesDetailsMap[jabberId];
        });
    };

    var accept = function(roomName) {
        jabberService.acceptRoomInvite(roomName)
    };

    var reject = function(roomName) {
        jabberService.removeRoomInvite(roomName);
    };

    return {
        invite: invite,
        accept: accept,
        reject: reject,
        refreshTemporaryContactInvitees: refreshTemporaryContactInvitees
    }
});
