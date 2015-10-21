/**
 * @class CollaborationUtil 
 * This  is a generic util class for the handling all collaboration(Blogs, Questions, Wikis) request.
 * 
 * @author Mohan rathour
 * TODO  move all the services calls from Collaboration call to services util layer. 
 */
define(['app'], function (app) {
	
	/*
	 * Sort the object's values by a criterion.
	 * @author Mohan rathour
	 */
	var sortedDataList = function (jsonData, sortFieldName,orderType) {
		var sortData=[];
		var propPath = (sortFieldName.constructor===Array) ? sortFieldName : sortFieldName.split(".");
		sortData = jsonData.sort(function(a, b) {
			for (var p in propPath){
				if (a[propPath[p]] && b[propPath[p]]){
					a = a[propPath[p]];
					b = b[propPath[p]];
				}
			}
			if(propPath[0]=="members" || propPath[0]=='views'){
				a=a.length;
				b=b.length;
			}else{
				a=(a+"").toLowerCase().trim();
				b=(b+"").toLowerCase().trim();
			}
			if(!orderType){
				if(!a==undefined && !b==undefined){
					a = a.match(/^\d+$/) ? +a : a;
					b = b.match(/^\d+$/) ? +b : b;
					return ( (b > a) ? 1 : ((b < a) ? -1 : 0) );
				}
				return ( (b > a) ? 1 : ((b < a) ? -1 : 0) );
			}else{
				if(!a==undefined && !b==undefined){
					a = a.match(/^\d+$/) ? +a : a;
					b = b.match(/^\d+$/) ? +b : b;
					return ( (a > b) ? 1 : ((a < b) ? -1 : 0) );
				}
				return ( (a > b) ? 1 : ((a < b) ? -1 : 0) );
			}
		});
		return sortData;
	};
	
	/**
	 * create sort criteria on the basis of request.
	 * @author Mohan rathour
	 */
	var sortCriteria =  function(self){
		var criteria=[]
		var sortField="updateDate";
    	var oderType =-1;
    	var sortOption = self.get('sortFieldName');
    	if (sortOption && sortOption != "") {
        	if (sortOption == "title-desc" || sortOption == 'updateDate' || sortOption == 'views') {
        		sortField = sortOption.split('-')[0];
                oderType =-1;
            }else{
            	sortField = sortOption.split('-')[0];
                oderType =1;
            }
            
         }
    	criteria.pushObject(sortField);
    	criteria.pushObject(oderType);
    	return criteria;
    	
	};
	/**
	 * Sort data on the basis of sort Icon(asc/desc).
	 * @author Mohan rathour
	 */
	var sortedDataByDirection = function(self,dropId,toggleFlag){
		var dropEl 	 = $(dropId),
		dropItems 	 = $(dropId).find('ul > li > a'),
		selectedDrop = $(dropId).find('ul > li > a.selected');
		if(toggleFlag){
			dropEl.toggleClass('sort-descending');
		}
		if(dropEl.hasClass('sort-descending')){
			self.set('sortOrder',false);
			dropItems.attr('data-sort-direction', 'des');
		} else {
			self.set('sortOrder',true);
			dropItems.attr('data-sort-direction', 'asc');
		}
	};
	
	/**
	 * Sort data on the basis of sort Icon(asc/desc).
	 * @author Mohan rathour
	 */
	var communitySortedDataByDirection = function(self,dropId,toggleFlag){
		var dropEl 	 = $(dropId),
		dropItems 	 = $(dropId).find('ul > li > a'),
		selectedDrop = $(dropId).find('ul > li > a.selected');
		if(toggleFlag){
			dropEl.toggleClass('sort-descending');
		}
		if(dropEl.hasClass('sort-descending')){
			self.set('sortOrder','desc');
			dropItems.attr('data-sort-direction', 'des');
		} else {
			self.set('sortOrder','asc');
			dropItems.attr('data-sort-direction', 'asc');
		}
	};
	/**
	 * change toggle direction.
	 * @author mohan rathour
	 */
	var toggleDirection = function(self,dropId){
		var dropEl 	 = $(dropId),
		dropItems 	 = $(dropId).find('ul > li > a'),
		selectedDrop = $(dropId).find('ul > li > a.selected');
		if(!dropEl.hasClass('sort-descending')){
			dropEl.toggleClass('sort-descending');
		}
		if(self.get('sortOrder')=='desc'){
			dropItems.attr('data-sort-direction', 'des');
		}else{
			dropItems.attr('data-sort-direction', 'asc');
		}
	}
	
	return {
		getSortedDataList: sortedDataList,
		getSortCriteria: sortCriteria,
		getSortedDataByDirection: sortedDataByDirection,
		setToggleDirection: toggleDirection,
		getCommunitySortedDataByDirection:communitySortedDataByDirection
		
	}
})