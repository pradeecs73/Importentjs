"use strict";

define(["app", "text!templates/adminCategories.hbs", "services/collaboration/categoriesService","underscore"],
    function (app, adminCategoriesTemplate, categories,_) {
        app.CollaborateCategoriesView = Ember.View.extend({
            template: Ember.Handlebars.compile(adminCategoriesTemplate)
        });

        app.CollaborateCategoriesRoute = Ember.Route.extend({
            model: function () {
                var _self = this;
               return categories
                        .getCategories({name:''})
                        .then(function(categories){
                            _self.set('categories', categories)
                            return categories;
                        })
                        .fail(function(err){
                            Ember.Logger.error("Error in retrieving categories from server. Please contact admin.",err);
                            return [];
                        });
                
            },
            setupController:function(controller,model){
              controller.set('allCategories',model);
              controller.set('model',model);
            }
        });

        app.CollaborateCategoriesController = Ember.ArrayController.extend({
              categoryNameEmpty: function() {
                var name = $.trim(this.name);
                return (name === "");
              },
              categoryNameTooLong: function() {
                var name = $.trim(this.name);
                return (name.length > 35);
              },
              categoryExists: function(currentcategory) {
                var existingCategory;
                //var existingCategories = window.__addCategoryInstance__.get('model');
                var existingCategories = this.get('allCategories');
                existingCategory= _.find(existingCategories, function(existingCat) {
                  return (existingCat.name.toLowerCase() == currentcategory.toLowerCase())
                })
                return existingCategory != null
              },
                save: function() {
                  if (this.categoryNameEmpty()) {
                    this.set('blankNameError', true);
                    return 1;
                  }

                  if (this.categoryNameTooLong()) {
                    this.set('nameTooLongError', true);
                    return 1;
                  }

                  if (this.categoryExists()) {
                    this.set('categoryExistsError', true)
                    return 1;
                  }
                },

              nameError: function() {
                return (this.blankNameError || this.nameTooLongError || this.categoryExistsError)
              }.property("blankNameError", "nameTooLongError", "categoryExistsError"),

              updateCategoryList: function(categories){
                // Now update the categories list
                sessionStorage.setItem("groupsCategories" , JSON.stringify(categories)); 
                sessionStorage.setItem("postsCategories", JSON.stringify(categories));
              },
            actions: {
                searchByName:function(){
                    var self=this;
                   var key=$("#txtSearch").val();    
                     return categories
                        .getCategories({name:key})
                        .then(function(categories){
                            self.set('model',categories);
                            return categories;
                        })
                        .fail(function(){
                            Ember.Logger.error("Error in retrieving categories from server. Please contact admin.")
                            return [];
                        });
                },
                updateCategoryNew:function(id){
                    var categoryValue = $("#"+id).val()
                    var selectedCat=_.findWhere(this.get('allCategories'),{_id:id});
                    if(!jQuery.trim(categoryValue)){
                      jQuery.gritter.add({title:'', text: 'Please enter a category name.', class_name: 'gritter-error'});
                      return;
                    }
                    else if(selectedCat.name.trim()==categoryValue.trim()){
                      $("#"+id).parent().find('p').removeClass('disnone'); 
                      $("#"+id).removeClass("disblock").addClass("disnone");
                      jQuery.gritter.add({title:'', text: 'Category has been successfully updated.', class_name: 'gritter-success'});
                      return;
                    }
                    else if(!this.categoryExists($("#"+id).val())){
                      this.send('updateCategory',$("#"+id).val(),id);
                    }
                    else{
                      jQuery.gritter.add({title:'', text: 'Category name already exists.', class_name: 'gritter-error'});
                      return;
                    }


                },
                editUpdateCategory:function(id){
                     $("#"+id).parent().find('p').addClass('disnone'); 
                     $("#"+id).removeClass("disnone").addClass("disblock");
                     $("#"+id).val($("#"+id).parent().find('p').text());
                     $("#"+id).focus();
                     $("#"+id).focusout(function(){
                         $("#"+id).parent().find('p').removeClass('disnone'); 
                         $("#"+id).removeClass("disblock").addClass("disnone");
                     });
                },
                addCategory: function(){
                    var self = this;           
                    var categoryName = jQuery("#txtSearch").val();
                    if( jQuery("#txtSearch") && jQuery("#txtSearch").val() !='')
                    {
                      if(!self.categoryExists(categoryName)){
                        return categories
                              .addCategory(categoryName)
                              .then(function(response){
                                  self.get('model').addObject(response.data);
                                  self.get('allCategories').addObject(response.data);
                                  self.updateCategoryList(_.where(self.get('allCategories'),{"active":true}));
                                  
                                  jQuery.gritter.add({title:'', text: 'Category has been successfully added.', class_name: 'gritter-success'});
                              })
                              .fail(function(err){
                                  Ember.Logger.error("Error in adding category. Please contact admin.",err);
                                  jQuery.gritter.add({title:'', text: 'Category addition failed. Please contact admin.', class_name: 'gritter-error'});
                                  return ;
                              }); 
                          }
                          else{
                             Ember.Logger.error("Category name already exists.");
                            jQuery.gritter.add({title:'', text: 'Category name already exists.', class_name: 'gritter-error'});
                          }
                                       
                    }
                     else
                       {
                          Ember.Logger.error("Please enter a category name.");
                          jQuery.gritter.add({title:'', text: 'Please enter a category name.', class_name: 'gritter-error'});
                       }               
                },
                updateCategory: function(categoryName, categoryId){
                    var self=this;
                    return categories
                            .updateCategory(categoryName, categoryId)
                             .then(function(resp){
                              var obj=self.get('allCategories');
                              var objCat=_.findWhere(obj,{_id:categoryId});
                              objCat.name=categoryName;
                               self.updateCategoryList(_.where(obj,{"active":true}));
                                 jQuery.gritter.add({title:'', text: 'Category has been successfully updated.', class_name: 'gritter-success'});
                                 $("#"+categoryId).parent().find('p').text($("#"+categoryId).val());
                                 $("#"+categoryId).parent().find('p').removeClass('disnone'); 
                                 $("#"+categoryId).removeClass("disblock").addClass("disnone");
                             })
                            .fail(function(){
                                Ember.Logger.error("Error in updating categories. Please contact admin.")
                                jQuery.gritter.add({title:'', text: 'Category updation failed. Please contact admin.', class_name: 'gritter-error'});
                                 $("#"+categoryId).parent().find('p').removeClass('disnone'); 
                                 $("#"+categoryId).removeClass("disblock").addClass("disnone");
                                return [];
                            });                            
                },
                deleteCategory: function(categoryId,category,selfModel){
                  var self=this;
                    return categories
                            .deleteCategory(categoryId,category,selfModel)
                            .then(function(){
                              var msg='';
                               var obj=self.get('model');
                               var objAll=self.get('allCategories');
                               var objCat=_.findWhere(obj,{_id:categoryId});
                               var objCatAll=_.findWhere(objAll,{_id:categoryId});
                               if(category.active){ 
                                   msg='deactivated'; 
                                   objCat.active=false;
                                   objCatAll.active=false;
                                   jQuery("#div_"+categoryId).addClass("inactivecategory");
                                   jQuery("#span_"+categoryId).removeClass("icon-remove").addClass("icon-checkmark");
                                   jQuery("#span_"+categoryId).attr("data-original-title","Activate");
                                 }
                               else{
                                    msg='activated' ;
                                    objCat.active=true; 
                                    objCatAll.active=true; 
                                    jQuery("#div_"+categoryId).removeClass("inactivecategory");
                                    jQuery("#span_"+categoryId).removeClass("icon-checkmark").addClass("icon-remove");
                                    jQuery("#span_"+categoryId).attr("data-original-title","De-activate");
                                 }
                               self.updateCategoryList(_.where(objAll,{"active":true}));
                               jQuery.gritter.add({title:'', text: 'Category has been successfully '+msg, class_name: 'gritter-success'});
                            })
                            .fail(function(err){
                               jQuery.gritter.add({title:'', text: 'Category active/incative failed. Please contact admin.', class_name: 'gritter-error'});
                                Ember.Logger.error("Error in active/incative category. Please contact admin.")
                                return {error: err};
                            });                            
                },
                getAllCategories: function(){
                    return categories
                            .getCategories()
                            .fail(function(){
                                Ember.Logger.error("Error in retrieving catergories from server. Please contact admin.")
                                return [];
                            });                            
                }

            }
        });        
    });