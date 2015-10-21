"use strict";

define([],
  function () {
    var uniqueBy = function (objectArray, keyForUniqueness) {
      var unique = {};
      var distinct = [];
      objectArray.forEach(function (x) {
        if (!unique[x[keyForUniqueness]]) {
          distinct.push(x);
          unique[x[keyForUniqueness]] = true;
        }
      });
      return distinct
    };
    var defaultFor = function (arg, val) {
      return typeof arg !== 'undefined' ? arg : val;
    };

    var ActivityBuilder = function () {
      var actType;
      var author;
      var resource;
      var addedRecipients = [];
      var removedRecipients = [];
      return {
        addRecipient: function (id, name, type,appId) {
          var aRecipient = {id: id, name: name, type: defaultFor(type, "user"),applicationId: appId};
          addedRecipients.push(aRecipient);
          return this;
        },
        removeRecipient: function (id, name, type,appId) {
          var aRecipient = {id: id, name: name, type: defaultFor(type, "user"),applicationId: appId};
          removedRecipients.push(aRecipient);
          return this;
        },
        onResource: function (id, type, name) {
          resource = {id: id, name: name, type: type};
          return this;
        },
        shareAct: function () {
          actType = "share";
          return this
        },
        likeAct: function () {
          actType = "like";
          return this
        },
        build: function () {
          return {
            on: resource,
            author: author,
            recipients: {
              adds: uniqueBy(addedRecipients, "id"),
              removes: uniqueBy(removedRecipients, "id")
            },
            type: actType
          }
        }
      }
    };
    return {
      activityBuilder: ActivityBuilder
    }

  });