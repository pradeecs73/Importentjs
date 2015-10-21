define(['app', 'httpClient', 'Q', 'underscore','services/groupService'], function (App, httpClient, Q, _,groupService) {
  return {
    getCategories: function(query) {
        var fetchCategoriesRequest = "/knowledgecenter/cclom/categories?list=all";
        if(query.name!='')
           fetchCategoriesRequest = "/knowledgecenter/cclom/categories?list=all&q="+query.name;
        return httpClient.get(fetchCategoriesRequest).then(function(result){
           return result;
        }).fail(function(err){
          Ember.Logger.error('[categoriesService:getCategories]',err);
        });
    },

    addCategory: function(categoryName){
    	var data = {};
    	data.categoryName = categoryName;
    	data.userId = App.getUsername();
      var __response={};
    	var addCategoryRequest = "/knowledgecenter/cclom/categories/add";
        return httpClient.post(addCategoryRequest, data).then(function(response){
                __response.data=response
                __response.verb = "Create"
                return groupService.asPreObjectFactory(__response).then(function(asResponse){
                  Ember.Logger.info("Acivity stream response is >>>",asResponse);
                  return __response;
                },function(error){
                  Ember.Logger.error("Failed to get Acivity stream response>>>",error);
                })
        }).fail(function(err){
          Ember.Logger.error('[categoriesService:addCategory]',err);
        }) 
    },

    updateCategory: function(categoryName, categoryId){
    	var data = {};
    	data.categoryName = categoryName;
    	data.id = categoryId;
    	data.userId = App.getUsername();
    	var updateCategoryRequest = "/knowledgecenter/cclom/categories";
        return httpClient.put(updateCategoryRequest, data).then(function(response){
                response.verb = "Update"  
            response.data = window.modelObject
            try{
              return groupService.asPreObjectFactory(response).then(function(asResponse){
                Ember.Logger.info("Acivity stream response is >>>",asResponse);
              },function(error){
                Ember.Logger.error("Failed to get Acivity stream response>>>",error);
              })
            }catch(error){
              Ember.Logger.error("[categoriesService :: ][updateCategory ::: ]", error);
            }  
        },function(error){
            console.log("Acivity stream response is >>>",error);
        })
    },
     deleteCategory: function(categoryId,category,selfModel){
       var data = {};
       data.id = categoryId;
       data.userId = App.getUsername();
        if(category.active)
            data.active=false;
        else
            data.active=true;
        var deleteCategoryRequest = "/knowledgecenter/cclom/categories";
        window.modelObject = data;
        window.modelObject['categoryName'] = category.name
        return httpClient.put(deleteCategoryRequest, data).then(function(response){
            if(window.modelObject.active){
                response.verb = "Activate"  
            }else{
                response.verb = "DeActivate"  
            }
            response.data = window.modelObject
            try{
              return groupService.asPreObjectFactory(response).then(function(asResponse){
                Ember.Logger.info("Acivity stream response is >>>",asResponse);
              },function(error){
                Ember.Logger.error("Failed to get Acivity stream response>>>",error);
              })
            }catch(error){
              Ember.Logger.error("[categoriesService :: ][deleteCategory ::: ]", error);
            }  
        },function(error){
            console.log("Acivity stream response is >>>",error);
        })
    }

  }
})