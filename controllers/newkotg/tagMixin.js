define(['app', "services/newkotg/newkotgService", "Q"],
    function(app, newkotgService, shareTemplete, Q) {

        app.NEWKOTGTagMixin = Ember.Mixin.create({
        	actions: {
						unbindTag: function(tagId) {
							var that = this,
								documentId = that.get("model").id,
								tags = that.get("tags"),
								usableTags = that.get("usableTags");
								newkotgService.unBindTag(documentId, tagId).done(function() {
									var p = [], x = null;
									$.each(tags, function(index, tag) {
										tag.id === tagId? x = tag: p.push(tag);
									});
									that.set("tags", p);
									usableTags.push(x);
								}).fail(function() {
								});
						},
			    	showTagInput: function() {
			    		this.set("isAddingTag", true);
			    	},
			    	hideTagInput: function() {
			    		this.set("isAddingTag", false);
			    	}
        	},
					addTag: function(tagText) {
						var that = this,
							tags = that.get('tags'),
							usableTags = that.get("usableTags"),
							p = null;
						for(var i=0,len=tags.length; i<len; i++) {
							if(tagText === tags[i].label) {
								return;
							}
						}
						for(var i=0,len=usableTags.length; i<len; i++) {
							if(tagText === usableTags[i].label) {
								p = usableTags[i];
								break;
							}
						}
						p? that.bindTag(p): that.createTag(tagText);
					},
					createTag: function(tagText) {
						var that = this,
							model = that.get("model"),
							documentId = model.id,
							usableTags = that.get("usableTags"),
							tags = that.get("tags");
						newkotgService.createTag(tagText).done(function(result) {
							newkotgService.bindTag(documentId, result.id).done(function() {
								// alltags.push(result);
								var p = [];
								$.each(tags, function(index, tag) {
									p.push(tag);
								});
								p.push(result);
								that.set("tags", p);
							}).fail(function() {
							});
						}).fail(function() {
						});
					},
					bindTag: function(tag) {
						var that = this,
							model = that.get("model"),
							documentId = model.id,
							tags = that.get("tags"),
							usableTags = that.get("usableTags");
						newkotgService.bindTag(documentId, tag.id).done(function() {
							var p = [], loc;
							$.each(tags, function(index, item) {
								p.push(item);
							});
							p.push(tag);
							that.set("tags", p);
							$.each(usableTags, function(index, item) {if(tag.id === item.id) return loc = index;});
							usableTags.splice(loc, 1);
						}).fail(function() {
						});
		    	}
		    });
		});
