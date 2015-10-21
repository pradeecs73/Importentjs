'use strict'

define(['app', 'services/newkotg/newkotgService'],
	function (app, newkotgService) {
		App.NEWKOTGRouteMixin = Ember.Mixin.create({
			beforeModel: function(transition) {
			},
			model: function(params, transition) {
				return newkotgService.findOneDocument(params.id);
			},
			afterModel: function(resolvedModel, transition) {
				this.preprocess(resolvedModel);
				try {
					var alltags = JSON.parse(sessionStorage.getItem("alltags"));
				} catch(err) {
					return;
				}
				resolvedModel.usableTags = [];
				resolvedModel.tags = [];
				return newkotgService.findOneAsset(resolvedModel.id).done(function(result) {
					resolvedModel.userId = result.userId;
					if(result.tags.indexOf("starred") >= 0) {resolvedModel.isStared = true;}
					$.each(alltags, function(index, item) {
						if(result.tags.indexOf(item.id) >= 0) {
							resolvedModel.tags.push(item);
						} else {
							resolvedModel.usableTags.push(item);
						}
					});
				}).fail(function() {
				});
			},
			actions: {
				didTransition: function() {
					this.renderTemplate();
				},
        openNewkotgShareModal: function (id) {
            var controller = this.controllerFor('newkotgShare');
            controller.init(this, id);
            this.render("newkotgShare", {
                into: 'application',
                outlet: 'modal',
                controller: controller
            });
        },
        closeNewkotgShareModal: function() {
            this.disconnectOutlet({
                outlet: 'modal',
                parentView: 'application'
            });
        }
			},
			preprocess: function(data) {
				if(data.type === "File" || data.type === 'Image') {
					data.pLink = data.href;
					data.pLinkTxt = data.title;
				} else if(data.type === "Note") {
					data.isNote = true;
				} else {
					data.pLink = data.url;
					data.pLinkTxt = data.url
				}
			}
		});
	});
