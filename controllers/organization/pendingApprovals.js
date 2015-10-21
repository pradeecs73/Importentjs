'use strict'
define(['app', 'services/formallearning/courseService', 'pages/trainingCatalog'], function(app, courseService, pageTraningCatalog) {
    app.PendingApprovalsController = Ember.Controller.extend({
        actions:{
            approveOrRejectEnrollment: function(id, approveType) {
                var self = this;
                courseService.approveOrRejectEnrollment(id, approveType).then(function (response) {
                    var listData = _.find(self.get('model.allPendings.entity'), function(type){
                        return type.id === response.entity.id;
                    });
                    self.get('model.allPendings.entity').removeObject(listData);
                    var pendings = pageTraningCatalog.pendingEnrollmentList(self.get('model.allPendings.entity'));
                    self.set('pendingApprovals', pendings);
                }, function() {
                    $.gritter.add({title: '', text: 'The manager does not have permission to accept/reject the enrollment', class_name: 'gritter-error'});
                });
            }
        }
    });
});