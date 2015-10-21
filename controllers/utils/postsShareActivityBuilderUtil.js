define(['app', 'objects/activityBuilder', 'services/activityService'], function(App, ActivityBuilder, activityService) {

    App.postsShareActivityBuilderUtil = Ember.Object.create({

    formatIntoNewShares: function (sharesAdded,sharesRemoved,postId) {
                var activity = new ActivityBuilder.activityBuilder();

                activity.onResource(postId,"post");

                _.map(sharesAdded,function(share){
                    if(share.share){
                        share = share.share
                    }

                    share = share.split("|");
                    var idNameAndTypeArray = share[1].split("@");
                    var applicationId , appType ;
                    appType=share[2];
                    if(appType=="group"){
                        
                        applicationId = "zion";

                    }else{
                        appType="user";
                        applicationId = "userpi";
                    }
                    activity.addRecipient( share[0].trim(), idNameAndTypeArray[0], appType, applicationId);
                })

                _.map(sharesRemoved,function(share){
                    if(share.share){
                        share = share.share
                    }                    
                    share = share.split("|");
                    var idNameAndTypeArray = share[1].split("@");
                     var applicationId , appType ;
                     appType=share[2];
                     if(appType=="group"){

                        applicationId = "zion";

                    }else {
                        appType="user";
                        applicationId = "userpi";
                    }
                    activity.removeRecipient( share[0].trim(), idNameAndTypeArray[0], appType, applicationId);
                })

                return activity.shareAct().build();
    },

    callToShareBuilder: function(newlyAddedShareList, oldShareList, postId,specificAction){
                var updateShares;
				var sharesAdded = []; 
				var sharesRemoved=[];
				var shareRemove;
                if(newlyAddedShareList){
                    if(typeof(newlyAddedShareList)=="string"){
                       sharesAdded =  newlyAddedShareList.split(',');

                    }else{
                        sharesAdded =  newlyAddedShareList;
                    }
                 } 
                if(specificAction)
                {
					sharesRemoved=sharesAdded;
					_.each(sharesRemoved,function(asRemoved){
							if(shareRemove && asRemoved)
							{
								shareRemove=shareRemove+","+asRemoved.share+"|"+asRemoved.display+"|"+asRemoved.type;
							}else if(asRemoved){
								shareRemove=asRemoved.share+"|"+asRemoved.display+"|"+asRemoved.type;
							}
						});		
					sharesAdded=[];
					sharesRemoved=shareRemove.split(',');
                }
                
				var activity = App.postsShareActivityBuilderUtil.formatIntoNewShares(sharesAdded,sharesRemoved, postId);
				updateShares = activityService.sendUpdate(activity, applicationIdConfig.cclom); 
                  
    },
    callToShareBuilderFromPopup: function(allExistingShares, allShares, postId,specificAction){
			var removedSharesOnly;
			var newSharesOnly;
			var shareAdded;
			var shareRemoved;
			
			if(typeof(allShares) == 'string'){
				allShares=allShares.split(',');
			}
			
			if(allExistingShares.length==0&&allShares.length==0){
				console.log("Nothing to share ...");
				return 0;
			}else if(allExistingShares.length==0&&allShares.length!=0){
					newSharesOnly=[];
					_.each(allShares,function(shares){

							 var shareObj=shares.split('|');
							 newSharesOnly.push({"display":shareObj[1],'share':shareObj[0],'type':shareObj[2]})
					});
					 _.each(newSharesOnly,function(asAdded){

						if(shareAdded)
						{
							shareAdded=shareAdded+","+asAdded.share+"|"+asAdded.display+"|"+asAdded.type;

						}else{

							shareAdded=asAdded.share+"|"+asAdded.display+"|"+asAdded.type;
						}
					});
					shareAdded=shareAdded.split(',');
					shareRemoved=[];

			}else  {
					var existingShare = _.map(allExistingShares, function(result) {
						   return _.omit(result, 'permission');
					}); 
					var newShare=[];
					 _.each(allShares,function(shares){

							var shareObj=shares.split('|');
							 var type=shareObj[2];
							if(shareObj[2]=="email"||shareObj[2]==undefined)
							{
								type="user";     
							}
							newShare.push({"display":shareObj[1],'share':shareObj[0],'type':type})
					});  
					
					var allExistingShares =existingShare;
					var allShares = newShare;
					
					if(allShares.length == 0){
						App.postsShareActivityBuilderUtil.callToShareBuilder(allExistingShares, [], postId,specificAction);
						return 1 ;
					}
										
					/* Perform individual pluck, so that comparison would be successful */
					var allExistingSharesForComparision = _.pluck(allExistingShares, "share");
					var allSharesForComparision = _.pluck(allShares, "share");
					
					newSharesOnlyFromComparison = _.difference(allSharesForComparision, allExistingSharesForComparision)
					removedSharesOnlyFromComparison = _.difference(allExistingSharesForComparision, allSharesForComparision)
					
					if(newSharesOnlyFromComparison.length == 0 && removedSharesOnlyFromComparison == 0 ){
						console.log("No Shares to update .");
						return 0;
					}
					var newSharesOnly = [];
					/* Now, reconstruct the objects from the calculated new and to be removed shares */
					_.each(newSharesOnlyFromComparison, function(newSharesOnlyFromComparisonKey){
						if(newSharesOnlyFromComparisonKey){
							console.log( _.findWhere(allShares, {"share":newSharesOnlyFromComparisonKey}) )
							newSharesOnly.push( _.findWhere(allShares, {"share":newSharesOnlyFromComparisonKey}) )
						}
					}); 
					
					var removedSharesOnly = [];
					if(removedSharesOnlyFromComparison.length > 0){
						_.each(removedSharesOnlyFromComparison, function(removedSharesOnlyFromComparisonKey){
							if(removedSharesOnlyFromComparisonKey){
								console.log( _.findWhere(allExistingShares, {"share":removedSharesOnlyFromComparisonKey}) )
								removedSharesOnly.push( _.findWhere(allExistingShares, {"share":removedSharesOnlyFromComparisonKey}) )
							}
						}); 				
					}
					if(newSharesOnly.length > 0){
						_.each(newSharesOnly,function(asAdded){
							if(shareAdded && asAdded)
							{
								shareAdded=shareAdded+","+asAdded.share+"|"+asAdded.display+"|"+asAdded.type;

							}else if(asAdded){
								shareAdded=asAdded.share+"|"+asAdded.display+"|"+asAdded.type;
							}
						});				
					}
					
					if(removedSharesOnly.length > 0){
						_.each(removedSharesOnly,function(asRemoved){
							if(shareRemoved && asRemoved)
							{
								shareRemoved=shareRemoved+","+asRemoved.share+"|"+asRemoved.display+"|"+asRemoved.type;
							}else if(asRemoved){
								shareRemoved=asRemoved.share+"|"+asRemoved.display+"|"+asRemoved.type;
							}
						});				
					}
					if(shareAdded)
						shareAdded=shareAdded.split(',');
					
					if(shareRemoved)
						shareRemoved=shareRemoved.split(',');
			}          
			  var activity = App.postsShareActivityBuilderUtil.formatIntoNewShares(shareAdded,shareRemoved,postId);
			  updateShares = activityService.sendUpdate(activity, applicationIdConfig.cclom);
                   
    }

    });
});