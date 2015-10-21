define(['app', "services/kotg/kotgShareService", 'services/kotg/kotgBoxService', "text!templates/shareTemplete.hbs", "Q"],
    function(App, shareService, boxServices, shareTemplete, Q) {

        App.KOTGBoxShareMixin = Ember.Mixin.create({
            getUsers: function() {
            	var deferred = Q.defer()
            	var username = App.getUsername();
        		shareService.getAllContact().done(function(obj) {
        			// obj: {response: [], status: xx}
        			deferred.resolve(obj);
        		}).fail(function(obj) {
        			// obj: {response: errorInfo, status: xx}
        			deferred.reject(obj.response);
        		});
            	return deferred.promise;
            },
            getGroups: function() {
            	return null;
            },
            openShareModel: function(routerContext) {
                var self = this;
                var userAndGroupdata = [];

                Q.all([
                    self.getUsers(),
                    self.getGroups()
                ]).spread(function(users, groups) {

                    // _.each(groups, function(group, key) {
                    //     userAndGroupdata.push({
                    //         "id": group._id + "|" + group.name,
                    //         "name": group.name
                    //     });
                    // });
                    _.each(users.response, function(user, key) {
                        userAndGroupdata.push({
                            "id": user.email,
                            "name": user.name
                        });
                    });
                }).
                catch (function(error) {
                    console.log("error", error);
                }).done(function() {
                    self.shareAutotag(userAndGroupdata, null);
                    $('#shareCourse').modal('show');
                    $('#shareCourse').find('.modal-dialog').attr('class', "");
                });
                // mock contacts data
                // var users = [{id:'aaa@cisco.com', name:"aaaaa"}, {id:'bbb@cisco.com', name:'bbbb'}];
                // setTimeout(function() {
                // 	userAndGroupdata = userAndGroupdata.concat(users);
                // 	self.shareAutotag(userAndGroupdata, null);
                //     $('#shareCourse').modal('show');
                //     $('#shareCourse').find('.modal-dialog').attr('class', "");
                // }, 1000);
                Ember.TEMPLATES['shareDocumentModalOutletView'] = Ember.Handlebars.compile(shareTemplete);
                routerContext.render('shareDocumentModalOutletView', {
                    into: routerContext.routeName,
                    outlet: 'shareDocumentModalOutlet'
                });
            },
            shareAutotag: function(data, shares) {
            	var elt = $('#form-field-mask-2');
            	elt.tagsinput({
            		itemValue: "id",
            		itemText: "name"
            	});
            	if (shares != null && shares.length > 0) {
            		elt.tagsinput('removeAll');
            		_.each(shares, function(share, key) {
            			elt.tagsinput('add', {
            				id: share.share + '|' + share.display,
            				name: share.display
            			})
            		})
            	}
            	elt.tagsinput('input').typeahead({
            		valueKey: 'name',
            		local: data
            	}).bind('typeahead:selected', $.proxy(function(obj, datum) {
            		this.tagsinput('add', datum);
            		this.tagsinput('input').typeahead('setQuery', '');
            	}, elt));
            	setTimeout(function(){$(".tt-query").focus()}, 500);
            },
            shareCourse: function(ignore, share) {
            	var self = this;
                var username = App.getUsername();
                var shared_link = self.get("shared_link");
                var sharedWith = (share) ? share.split(",") : [];
                if (sharedWith.length === 0) {
                    $('input[type=text]').val('');
                    self.set("comment", "");
                    alert("Please enter valid user name");
                } else {
	                var documentId = sessionStorage.getItem("selectedItem") || null;
	                var comment = self.get('comment');
                    $.each(sharedWith, function(index, user) {
                        boxServices.shareBoxFile(username, user, comment, shared_link).done(function(obj) {
                            console.log('share success', obj);
                        }).fail(function(obj) {
                            console.log('share fail', obj);
                        });

                    });
                    self.clearShare();
                    $("#shareCourse").modal('hide');
                }
            },
            clearShare: function() {
            	var elt = $('#form-field-mask-2');
            	elt.tagsinput('removeAll');
                $('input[type=text]').val('');
                $('textarea').val('');
                $('input[type=select]').val('');
                $('input[type=radio]').val('');
                $('input[type=checkbox]').val('');
                this.set("comment", "");
            }
        });
    });