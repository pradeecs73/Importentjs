define(["app", "text!templates/components/endorsementComponent.hbs", "services/endorsementService", "services/usersService", "Q"], function (app, endorsementComponentTemplate, endorsementService, usersService, Q) {

    app.EndorsementItemController = Ember.Controller.extend({

        inProgress: false,
        showCount: function () {
            return (this.get('model.endorsementCount') != 0)
        }.property('model.endorsementCount'),

        isNotLoggedInUser: function () {
            return !(this.get('parentController.isCurrentUser'));
        }.property(),

        actions: {
            addEndorsement: function () {
                this.toggleProperty("inProgress");
                var self = this;
                var userId = this.get('parentController.userId');
                var attributeType = this.get('parentController.attributeType');
                var attributeId = this.get('model.id');
                var attributeValue = this.get('model.name');
                var shortName = this.get('parentController.shortName');
                endorsementService.addEndorsement(userId, attributeType, attributeId, shortName).then(function () {
                    self.toggleProperty("inProgress");
                    var model = self.get('model');
                    Ember.set(model, 'endorsementCount', model.endorsementCount + 1);
                    Ember.set(model, 'isUserEndorsed', true);
                    if(window.activityStream) {
                        var streamDataContract =  new activityStream.StreamDataContract(userId, 'USER','endorse');
                        var markedTarget = (new activityStream.TargetObject(attributeId, attributeValue, "endorse")).toObject();
                        streamDataContract.title = shortName;
                        streamDataContract.resourceUrl = "/#/user/" + userId;
                        streamDataContract.authorUserName = userId;
                        streamDataContract.target = markedTarget;
                        activityStream.pushToStream(streamDataContract);
                    }
                });

            },

            removeEndorsement: function () {
                this.toggleProperty("inProgress");
                var self = this;
                var userId = this.get('parentController.userId');
                var expertiseName =this.get('model.name');
                var attributeType = this.get('parentController.attributeType');
                var attributeId = this.get('model.id');
                var model=this.get('model');
                var loginshortname=app.getShortname();
                var removeendorseusername=this.get('parentController.shortName');
                var resourceUrl = "/#/user/" + userId;

                endorsementService.removeEndorsement(userId, attributeType, attributeId).then(function () {
                    self.toggleProperty("inProgress");
                    var model = self.get('model');
                    Ember.set(model, 'endorsementCount', model.endorsementCount - 1);
                    Ember.set(model, 'isUserEndorsed', false);

                  if (window.activityStream) {
                     var streamDataContract = new activityStream.StreamDataContract(userId,'USER', 'remove-endorse');
                     var markedTarget = (new activityStream.TargetObject(attributeId,expertiseName, "expertise")).toObject();
                     streamDataContract.title = removeendorseusername;
                     streamDataContract.resourceUrl = resourceUrl;
                     streamDataContract.authorUserName = userId;
                     streamDataContract.target = markedTarget;
                     streamDataContract.displayMessage = loginshortname+" has removed an endorsement on "+expertiseName+" from " + removeendorseusername;
                     try {
                      activityStream.pushToStream(streamDataContract);
                     }
                     catch (err) {
                      console.log(err)
                     }
                  }

                 })
            },

            removeExpertise: function() {
                var idToRemove = this.get("model").id;
                var self = this;
                this.parentController.sendAction('removeAction', idToRemove,
                    function() {
                      console.log("error while removing expertise");
                    },
                    function() {
                        self.get("parentController").removeExpertise(idToRemove);
                });
            }
        }
    });

    app.EndorsementLinkComponent = Ember.Component.extend({

        layout: Ember.Handlebars.compile(endorsementComponentTemplate),
        attributeDetails: [],
        dummyProperty: function() {
            var attributeType = this.get('attributeType');
            var userId = this.get('userId');
            var shortName = this.get('shortName');
            var attributes = this.get('attributes');
            Ember.set(this, "attributeDetails", []);
            this.setEndorsementDetails(userId, attributeType, attributes);

            return "dummy";
        }.property('attributes.@each'),

        removeExpertise: function(idToRemove) {
            var attributeDetailsToRemove = _.find(this.attributeDetails, function(expertiseObject) {
                return expertiseObject.id === idToRemove;
            });
            this.attributeDetails.removeObject(attributeDetailsToRemove);
            var attributeToRemove = _.find(this.attributes, function(expertiseObject) {
                return expertiseObject.id === idToRemove;
            });
            this.attributes.removeObject(attributeToRemove);
        },

        setEndorsementDetails: function (userId, attributeType, attributes) {
            var self = this;
            var endorsementCountPromise = endorsementService.getEndorsements(userId, attributeType);
            var userEndorsedPromise = endorsementService.getEndorsementsEndorsedByCurrentUser(userId, attributeType);

            Q.all([endorsementCountPromise,userEndorsedPromise]).spread(function (countsResponse, existResponse){
                _.each(attributes,function(attribute){
                    var countResponseForAttribute = _.find(countsResponse, function (countMap) {
                        return countMap._id === attribute.id
                    });
                    var count = countResponseForAttribute ? countResponseForAttribute.endorsementCount : 0;

                    var isExistResponseForAttribute = _.find(existResponse,function(existMap){
                        return existMap._id === attribute.id
                    });
                    var isExist = isExistResponseForAttribute ? true : false;

                    self.attributeDetails.pushObject({
                        name: attribute.name,
                        id: attribute.id,
                        endorsementCount: count,
                        isUserEndorsed: isExist
                    })
                })
            })
        }
    })
})
