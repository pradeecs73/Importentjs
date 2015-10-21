
define(['app','httpClient','services/collaboration/postService'], function (App,httpClient,postService) {
    
     var getAllBloggers=function(){
              return postService.getUsersForRole().then(function(allBloggers){
                if(allBloggers && allBloggers.length>0){
                    return allBloggers;
                }
                else{
                   return [];
                }
               }).fail(function(){
                  Ember.Logger.error('[adminBlogProxyAssignmentService::getAllBloggers]',err);
                  return [];
               })
        };
      var  getAllAssignedProxies = function() {
            return httpClient.get("/knowledgecenter/cclom/proxy/all?resourceType=blog").then(function(proxyResult){
                   if(proxyResult && proxyResult.length>0){
                      return proxyResult;
                   }
                   else{
                     return [];
                   }

            }).fail(function(err){
                Ember.Logger.error("[adminBlogProxyAssignmentService :: getAllAssignedProxies],",err);
                return [];
            });
         };
       var getBloggerAssignedProxies=function(){
          var result=[];
          var self=this;
          return self.getAllBloggers().then(function(allBloggers){
             return  self.getAllAssignedProxies().then(function(assignedProxies){
                    if(allBloggers && allBloggers.length>0){
                        for(var j=0;j<allBloggers.length;j++){
                            var obj={_id:j,displayName:allBloggers[j].displayName,userId:allBloggers[j].userId,proxies:[]};
                           for(var i=0;i<assignedProxies.length;i++)
                           {
                               if(assignedProxies[i].blogger.userId == allBloggers[j].userId)
                               {
                                    var objfilter=assignedProxies[i];
                                    if(objfilter && objfilter.proxies.length>0)
                                    {
                                        obj.proxies=objfilter.proxies;
                                        break;
                                    }
                               }
                           }
                        result.push(obj);
                      }
                    }
                    return result;
                }).fail(function(err){
                   Ember.Logger.error('[adminBlogProxyAssignmentService :: bloggerProxies:: getAllAssignedProxies]',err);
                   return result;
                });
              }).fail(function(err){
                Ember.Logger.error('[adminBlogProxyAssignmentService :: bloggerProxies:: getAllBloggers]',err);
                return result;
              });
        };
       var addProxies= function(data,resourceType) {
            return httpClient.put("/knowledgecenter/cclom/proxy?action=0&resourceType="+resourceType,data).then(function(result){
                return result;
            }).fail(function(err){
                Ember.Logger.error('[adminBlogProxyAssignmentService::addProxies]',err);
                return err;
            });
        };
       var removeProxies=function(data,resourceType) {
            return httpClient.put("/knowledgecenter/cclom/proxy?action=1&resourceType="+resourceType,data).then(function(result){
                return result;
            }).fail(function(err){
                Ember.Logger.error('[adminBlogProxyAssignmentService::removeProxies]',err);
                return err;
            });
        };
       var validateProxyUser=function(proxy){
          try{
                if(proxy && proxy!="" && proxy.indexOf('(') !=-1 && proxy.indexOf(')') !=-1){
                        var displayName=proxy.substring(0,proxy.indexOf('('));
                        var userId=proxy.substring(proxy.indexOf('(')+1,proxy.indexOf(')')) 
                        var pattern =/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                         if(pattern.test(userId)){
                            return displayName+'|'+userId;
                         }
                         else{
                            return false;
                         }              
                 }
                else
                  return false; 
            }
           catch(err){
                  Ember.Logger.error("[adminBlogProxyAssignmentService :: validateProxyUser]" , err);
                  return false;
            } 
        }
      
      return {
        validateProxyUser:validateProxyUser,
        removeProxies:removeProxies,
        addProxies:addProxies,
        getBloggerAssignedProxies:getBloggerAssignedProxies,
        getAllAssignedProxies:getAllAssignedProxies,
        getAllBloggers:getAllBloggers
      }

});