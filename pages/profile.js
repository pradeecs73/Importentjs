define(['httpClient'], function(httpClient) {
    return {
        initialize: function() {

            /* Adding js for the dropdown in 'activities settings tab' */
            enableSelectBoxes();
            /* Start :Adding preferences persistence */
            var status = 0;

            // making activity Select All
            jQuery(".activitySelectall").click(function() {
                if ($(this).is(":checked")) {
                    $(".activityPreference").each(function() {
                        $(this).prop("checked", true);
                    });

                } else {
                    $(".activityPreference").each(function() {
                        $(this).prop("checked", false);
                    });
                }
            });

            jQuery(".activitySectionAll").click(function() {
                var thisActivityPanel = $(this).parents('.widget-box');
                if ($(this).is(":checked")) {
                    thisActivityPanel.find(".activityPreference").each(function() {
                        $(this).prop("checked", true);
                    });

                } else {
                    thisActivityPanel.find(".activityPreference").each(function() {
                        $(this).prop("checked", false);
                    });
                }
            });

            /*
            -- My view Select All - Selectes all the pillar.
            */
            
            jQuery(".myviewSelectAll").change(function() {
                if ($(this).is(":checked")) {
                    $(".activitySectionAll").prop("checked",true);$(".activityPreference").prop("checked", true);
                }else{

                    $(".activitySectionAll").prop("checked",false);$(".activityPreference").prop("checked", false);
                }
            });

             jQuery(".activitySectionAll").change(function() {
                if($(".activitySectionAll:checked").length==$(".activitySectionAll").length){$(".myviewSelectAll").prop("checked",true);}else{$(".myviewSelectAll").prop("checked",false);}
            });




            /*
             -- Making Pillar wise Activities Select All or Unselect All.
            */
            jQuery(".course").change(function() {
                    if($(".course:checked").length==$(".course").length){$(".courseAll").prop("checked",true);}else{$(".courseAll").prop("checked",false);}
                });


            jQuery(".expertDiscovery").change(function() {
                     if($(".expertDiscovery:checked").length==$(".expertDiscovery").length){$(".expertDiscoveryAll").prop("checked",true);}else{$(".expertDiscoveryAll").prop("checked",false);}
                });

            jQuery(".collection").change(function() {
                    if($(".collection:checked").length==$(".collection").length){$(".collectionAll").prop("checked",true);}else{$(".collectionAll").prop("checked",false);}
                });

            jQuery(".blog").change(function() {
                    if($(".blog:checked").length==$(".blog").length){$(".blogsAll").prop("checked",true);}else{$(".blogsAll").prop("checked",false);}
                });

            jQuery(".note").change(function() {
                   if($(".note:checked").length==$(".note").length){$(".noteAll").prop("checked",true);}else{$(".noteAll").prop("checked",false);}
                });

            jQuery(".community").change(function() {
                    if($(".community:checked").length==$(".community").length){$(".comunitiesAll").prop("checked",true);}else{$(".comunitiesAll").prop("checked",false);}
                });

            jQuery(".wiki").change(function() {
                    if($(".wiki:checked").length==$(".wiki").length){$(".wikiAll").prop("checked",true);}else{$(".wikiAll").prop("checked",false);}
                });

            jQuery(".forum").change(function() {
                   if($(".forum:checked").length==$(".forum").length){$(".forumAll").prop("checked",true);}else{$(".forumAll").prop("checked",false);}
                });

            jQuery(".kc").change(function() {
                   if($(".kc:checked").length==$(".kc").length){$(".kcAll").prop("checked",true);}else{$(".kcAll").prop("checked",false);}
                });

            /*
             -- Save Activity Preferences.
            */


              jQuery(".activityPreference").change(function() {
                if($(".activitySectionAll:checked").length==$(".activitySectionAll").length){$(".myviewSelectAll").prop("checked",true);}else{$(".myviewSelectAll").prop("checked",false);}
            });

            //Cancel the ActivityPreferences.
            jQuery(".cancelActivityPrefences").click(function() {
                 retainActivityPreferences();
            });


            jQuery(".saveActivityPreferences").click(function() {

                //seting status flag.

                $(".activityPreference").each(function() {
                    if ($(this).is(":checked")) {
                        status = 1;
                    }

                });

                if (status == 1) {

                     /*
                     -- Variables requried for Activity Settings are Declared and Assigned.
                    */
                    var  keyDefined = {}, user = {} , expertise = {}, profile = {} , collection = {}, note = {}, community = {} , blog = {} , wiki = {} , forum = {} , document = {} ,file = {} , course = {}, plp = {};
                    var activityPreferencesList = [],  verbs = [], profileVerbs = [], expertiseVerbs = [], userVerbs =[], communityVerbs = [], collectionVerbs = [], noteVerbs = [], blogVerbs = [], wikiVerbs = [], forumVerbs = [], courseVerbs = [], plpVerbs = [], documentVerbs = [], fileVerbs = [];

                     user.verbs         =   userVerbs;
                     expertise.verbs    =   expertiseVerbs;
                     profile.verbs      =   profileVerbs;
                     collection.verbs   =   collectionVerbs;
                     note.verbs         =   noteVerbs;
                     community.verbs    =   communityVerbs;
                     blog.verbs         =   blogVerbs;
                     wiki.verbs         =   wikiVerbs;
                     forum.verbs        =   forumVerbs;
                     document.verbs     =   documentVerbs;
                     file.verbs         =   fileVerbs;
                     course.verbs       =   courseVerbs;
                     plp.verbs          =   plpVerbs;

                    // Expert Discovery (user, Expertise, Profile)
                    $(".expertDiscovery:not(:checked)").each(function() {
                        var key = $(this).attr("data-param-keys"), value = $(this).val();
                        if(key=="user"){ userVerbs.push(value);user.verbs = userVerbs;}
                        if(key=="expertise"){ expertiseVerbs.push(value);expertise.verbs = expertiseVerbs;}
                        if(key=="profile"){ profileVerbs.push(value);profile.verbs = profileVerbs; }
                    });

                    // Collection
                    $(".collection:not(:checked)").each(function() {
                        var key = $(this).attr("data-param-keys"), value = $(this).val();
                        collectionVerbs.push(value); collection.verbs = collectionVerbs;     
                    });

                    // Notes  
                    $(".note:not(:checked)").each(function() {
                        var key = $(this).attr("data-param-keys"), value = $(this).val();
                        noteVerbs.push(value); note.verbs = noteVerbs; 
                    }); 

                    //Community
                    $(".community:not(:checked)").each(function() {
                        var key = $(this).attr("data-param-keys"), value = $(this).val();
                        communityVerbs.push(value); community.verbs = communityVerbs; 
                    }); 

                    //Blog
                    $(".blog:not(:checked)").each(function() {
                        var key = $(this).attr("data-param-keys"), value = $(this).val();
                        blogVerbs.push(value);  blog.verbs = blogVerbs;     
                    });

                    //Wiki
                    $(".wiki:not(:checked)").each(function() {
                        var key = $(this).attr("data-param-keys"), value = $(this).val();
                        wikiVerbs.push(value); wiki.verbs = wikiVerbs; 
                    }); 

                    //Forum
                    $(".forum:not(:checked)").each(function() {
                        var key = $(this).attr("data-param-keys"), value = $(this).val();
                        forumVerbs.push(value); forum.verbs = forumVerbs; 
                            
                    }); 

                    //Course
                    $(".course:not(:checked)").each(function() {
                        var key = $(this).attr("data-param-keys"), value = $(this).val();
                        courseVerbs.push(value);    course.verbs = courseVerbs; 
                    }); 

                    //Plp(Prescriped Learning Plan)
                    $(".plp:not(:checked)").each(function() {
                        var key = $(this).attr("data-param-keys"),  value = $(this).val();
                        plpVerbs.push(value);   plp.verbs = plpVerbs; 
                    }); 

                    //Document
                    $(".document:not(:checked)").each(function() {
                        var key = $(this).attr("data-param-keys"), value = $(this).val();
                        documentVerbs.push(value); document.verbs = documentVerbs; 
                    }); 

                   //File
                    $(".file:not(:checked)").each(function() {
                        var key = $(this).attr("data-param-keys"), value = $(this).val();
                        fileVerbs.push(value);  file.verbs = fileVerbs; 
                    }); 

                   //KeyDefined - Keydefining for all the Pillars(JSON key)

                    keyDefined.ED               = {user:user, expertise:expertise, profile:profile};
                    keyDefined.KOTG             = {collection:collection, note:note};
                    keyDefined.COLLAB           = {community:community, blog:blog, wiki:wiki, forum:forum};
                    keyDefined.LEARNING         = {course:course, plp:plp};
                    keyDefined.KC               = {document:document, file:file};
                    
                    var activityPreferenceList  = keyDefined;
                    var selectAll = false; // select all flag  , set this flag to true when all the pillars are Selected All activities.

                    if($(".activitySectionAll:checked").length==$(".activitySectionAll").length){
                        selectAll = true; // flag is set to true, when All activitySectionAll is selected.
                    }

                    //Assigning Gathered Activity Preference Information and Email id.
                    var gatheredPreferences = {
                        "Userid": getCookie("username").replace(/"/g, ""),
                        "selectAll":selectAll,
                        "npreferences": activityPreferenceList
                    };
                    

                    /* Check whether the user already stored any activity preferences. If so, use PUT else POST : TODO */
                    
                    var methodForCall = "POST";

                    /* Persist the activity preferences */
                    
                    httpClient.post("/knowledgecenter/cclom/activities/preferences", gatheredPreferences).then(function(response){
                        //*Successfully saved your preferences.*//*
                        $('#pleaseSelectAtLeast').hide();
                        $('#faildToSave').hide();

                        if ($('#successfullySaved').is(':visible')) {
                            $('#successfullySaved').hide();
                            $('#successfullySaved').show();
                             setTimeout(function(){ $('#successfullySaved').fadeOut(); }, 3000);
                        } else {
                            $('#successfullySaved').show();
                             setTimeout(function(){ $('#successfullySaved').fadeOut(); }, 3000);
                        }

                    }, function(err){
                        //*Failed to save your preferences.*//*
                        $('#successfullySaved').hide();
                        $('#pleaseSelectAtLeast').hide();
                        $(".activityPreference").prop("disabled",true);$(".activitySectionAll").prop("disabled",true);
                        $(".saveActivityPreferences").prop("disabled",true);
                        $("#faildToAccessDb").show();
                         setTimeout(function(){ $('#faildToAccessDb').fadeOut(); }, 3000);
                 return;
                    });

                    status = 0; // setting status to 0 after saving the Preferences.
                   
                } else {
                    $('#successfullySaved').hide();
                    $('#faildToSave').hide();
                    $('#pleaseSelectAtLeast').show();
                    setTimeout(function(){ $('#pleaseSelectAtLeast').fadeOut(); }, 3000);
                }

            });// End of Save Activity Preferences.

              $('li ul.navbar-profile li').on('click', function(){
                   
                    if ($('div.slimScrollDiv').length > 0) {
                            $('#sidebar')
                                    .addClass('ui-sub-panel-close')
                                    .removeClass("ui-sub-panel-open");
                    }else if($('#sidebar').hasClass('ui-sub-panel-close')) {
                            $('#sidebar')
                                    .addClass('ui-sub-panel-open')
                                    .removeClass("ui-sub-panel-close");
                    }
                });

            $(".activityPreference").click(function(){
                var status=0;

                  $(".activityPreference").each(function()
                    {
                       if ($(this).prop("checked")==false){
                        status = 1;
                         }
                    });
                  
                  if(status!=1)
                  {
                      $(".activitySelectall").prop("checked", true);
                  }else{

                     $(".activitySelectall").prop("checked", false);
                  }
                   
            });
    
            /* End: Adding preferences persistence */

            //editables on first profile page



            $.fn.editable.defaults.mode = 'inline';
            $.fn.editableform.loading = "<div class='editableform-loading'><i class='light-blue icon-2x icon-spinner-dots icon-spin'></i></div>";
            $.fn.editableform.buttons = '<button type="submit" class="btn btn-info editable-submit"><i class="icon-ok icon-white"></i></button>' +
                '<button type="button" class="btn editable-cancel"><i class="icon-remove"></i></button>';

            //            $('#jobtitle').editable({
            //                type: 'text',
            //                name: 'jobtitle'
            //            });
            //
            //
            //            $('#mail').editable({
            //                type: 'email',
            //                name: 'mail'
            //            });
            //
            //            $('#phone').editable({
            //                type: 'number',
            //                name: 'phone'
            //            });
            //
            //            $('#social').editable({
            //                type: 'text',
            //                name: 'jobtitle'
            //            });
            //
            //
            //            $('#fbook').editable({
            //                type: 'text',
            //                name: 'fbook'
            //            });
            //
            //            $('#twitter').editable({
            //                type: 'text',
            //                name: 'twitter'
            //            });
            //
            //            $('#linkedin').editable({
            //                type: 'text',
            //                name: 'linkedin'
            //            });
            //
            //
            //            var countries = [];
            //            $.each({ "CA": "Canada", "IN": "India", "NL": "Netherlands", "TR": "Turkey", "US": "United States"}, function (k, v) {
            //                countries.push({id: k, text: v});
            //            });
            //
            //            var cities = [];
            //            cities["CA"] = [];
            //            $.each(["Toronto", "Ottawa", "Calgary", "Vancouver"], function (k, v) {
            //                cities["CA"].push({id: v, text: v});
            //            });
            //            cities["IN"] = [];
            //            $.each(["Delhi", "Mumbai", "Bangalore"], function (k, v) {
            //                cities["IN"].push({id: v, text: v});
            //            });
            //            cities["NL"] = [];
            //            $.each(["Amsterdam", "Rotterdam", "The Hague"], function (k, v) {
            //                cities["NL"].push({id: v, text: v});
            //            });
            //            cities["TR"] = [];
            //            $.each(["Ankara", "Istanbul", "Izmir"], function (k, v) {
            //                cities["TR"].push({id: v, text: v});
            //            });
            //            cities["US"] = [];
            //            $.each(["New York", "Miami", "Los Angeles", "Chicago", "Wysconsin"], function (k, v) {
            //                cities["US"].push({id: v, text: v});
            //            });
            //
            //            var currentValue = "NL";
            //            $('#country').editable({
            //                type: 'select2',
            //                value: 'NL',
            //                source: countries,
            //                success: function (response, newValue) {
            //                    if (currentValue == newValue) return;
            //                    currentValue = newValue;
            //
            //                    var new_source = (!newValue || newValue == "") ? [] : cities[newValue];
            //
            //                    //the destroy method is causing errors in x-editable v1.4.6
            //                    //it worked fine in v1.4.5
            //                    /**
            //                     $('#city').editable('destroy').editable({
            //                     type: 'select2',
            //                     source: new_source
            //                     }).editable('setValue', null);
            //                     */
            //
            //                    //so we remove it altogether and create a new element
            //                    var city = $('#city').removeAttr('id').get(0);
            //                    $(city).clone().attr('id', 'city').text('Select City').editable({
            //                        type: 'select2',
            //                        value: null,
            //                        source: new_source
            //                    }).insertAfter(city);//insert it after previous instance
            //                    $(city).remove();//remove previous instance
            //
            //                }
            //            });
            //
            //            $('#city').editable({
            //                type: 'select2',
            //                value: 'Amsterdam',
            //                source: cities[currentValue]
            //            });
            //
            //
            //            $('#signup').editable({
            //                type: 'date',
            //                format: 'yyyy-mm-dd',
            //                viewformat: 'dd/mm/yyyy',
            //                datepicker: {
            //                    weekStart: 1
            //                }
            //            });
            //
            //            $('#age').editable({
            //                type: 'spinner',
            //                name: 'age',
            //                spinner: {
            //                    min: 16, max: 99, step: 1
            //                }
            //            });
            //
            //            //var $range = document.createElement("INPUT");
            //            //$range.type = 'range';
            //            $('#login').editable({
            //                type: 'slider',//$range.type == 'range' ? 'range' : 'slider',
            //                name: 'login',
            //                slider: {
            //                    min: 1, max: 50, width: 100
            //                },
            //                success: function (response, newValue) {
            //                    if (parseInt(newValue) == 1)
            //                        $(this).html(newValue + " hour ago");
            //                    else $(this).html(newValue + " hours ago");
            //                }
            //            });
            //
            //            $('#about').editable({
            //                mode: 'inline',
            //                type: 'wysiwyg',
            //                name: 'about',
            //                wysiwyg: {
            //                    //css : {'max-width':'300px'}
            //                },
            //                success: function (response, newValue) {
            //                }
            //            });
            //
            //
            // *** editable avatar *** //
            try { //ie8 throws some harmless exception, so let's catch it

                //it seems that editable plugin calls appendChild, and as Image doesn't have it, it causes errors on IE at unpredicted points
                //so let's have a fake appendChild for it!
                if (/msie\s*(8|7|6)/.test(navigator.userAgent.toLowerCase())) Image.prototype.appendChild = function(el) {}

                var last_gritter
                $('#avatar').editable({
                    type: 'image',
                    name: 'avatar',
                    value: null,
                    image: {
                        //specify cis file input plugin's options here
                        btn_choose: 'Change Avatar',
                        droppable: true,
                        /**
                         //this will override the default before_change that only accepts image files
                         before_change: function(files, dropped) {
                         return true;
                         },
                         */

                        //and a few extra ones here
                        name: 'avatar', //put the field name here as well, will be used inside the custom plugin
                        max_size: 110000, //~100Kb
                        on_error: function(code) { //on_error function will be called when the selected file has a problem
                            if (last_gritter) $.gritter.remove(last_gritter);
                            if (code == 1) { //file format error
                                last_gritter = $.gritter.add({
                                    title: 'File is not an image!',
                                    text: 'Please choose a jpg|gif|png image!',
                                    class_name: 'gritter-error gritter-center'
                                });
                            } else if (code == 2) { //file size rror
                                last_gritter = $.gritter.add({
                                    title: 'File too big!',
                                    text: 'Image size should not exceed 100Kb!',
                                    class_name: 'gritter-error gritter-center'
                                });
                            } else { //other error
                            }
                        },
                        on_success: function() {
                            $.gritter.removeAll();
                        }
                    },
                    url: function(params) {
                        // ***UPDATE AVATAR HERE*** //
                        //You can replace the contents of this function with examples/profile-avatar-update.js for actual upload


                        var deferred = new $.Deferred

                        //if value is empty, means no valid files were selected
                        //but it may still be submitted by the plugin, because "" (empty string) is different from previous non-empty value whatever it was
                        //so we return just here to prevent problems
                        var value = $('#avatar').next().find('input[type=hidden]:eq(0)').val();
                        if (!value || value.length == 0) {
                            deferred.resolve();
                            return deferred.promise();
                        }


                        //dummy upload
                        setTimeout(function() {
                            if ("FileReader" in window) {
                                //for browsers that have a thumbnail of selected image
                                var thumb = $('#avatar').next().find('img').data('thumb');
                                if (thumb) $('#avatar').get(0).src = thumb;
                            }

                            deferred.resolve({
                                'status': 'OK'
                            });

                            if (last_gritter) $.gritter.remove(last_gritter);
                            last_gritter = $.gritter.add({
                                title: 'Avatar Updated!',
                                text: 'Uploading to server can be easily implemented. A working example is included with the template.',
                                class_name: 'gritter-info gritter-center'
                            });

                        }, parseInt(Math.random() * 800 + 800))

                        return deferred.promise();
                    },

                    success: function(response, newValue) {}
                })
            } catch (e) {}


            //another option is using modals
            $('#avatar2').on('click', function() {
                var modal =
                    '<div class="modal hide fade">\
                        <div class="modal-header">\
                            <button type="button" class="close" data-dismiss="modal">&times;</button>\
                            <h4 class="blue">Change Avatar</h4>\
                        </div>\
                        \
                        <form class="no-margin">\
                        <div class="modal-body">\
                            <div class="space-4"></div>\
                            <div style="width:75%;margin-left:12%;"><input type="file" name="file-input" /></div>\
                        </div>\
                        \
                        <div class="modal-footer center">\
                            <button type="submit" class="btn btn-small btn-success"><i class="icon-ok"></i> Submit</button>\
                            <button type="button" class="btn btn-small" data-dismiss="modal"><i class="icon-remove"></i> Cancel</button>\
                        </div>\
                        </form>\
                    </div>';


                var modal = $(modal);
                modal.modal("show").on("hidden", function() {
                    modal.remove();
                });

                var working = false;

                var form = modal.find('form:eq(0)');
                var file = form.find('input[type=file]').eq(0);
                file.cis_file_input({
                    style: 'well',
                    btn_choose: 'Click to choose new avatar',
                    btn_change: null,
                    no_icon: 'icon-picture',
                    thumbnail: 'small',
                    before_remove: function() {
                        //don't remove/reset files while being uploaded
                        return !working;
                    },
                    before_change: function(files, dropped) {
                        var file = files[0];
                        if (typeof file === "string") {
                            //file is just a file name here (in browsers that don't support FileReader API)
                            if (!(/\.(jpe?g|png|gif)$/i).test(file)) return false;
                        } else { //file is a File object
                            var type = $.trim(file.type);
                            if ((type.length > 0 && !(/^image\/(jpe?g|png|gif)$/i).test(type)) || (type.length == 0 && !(/\.(jpe?g|png|gif)$/i).test(file.name)) //for android default browser!
                            ) return false;

                            if (file.size > 110000) { //~100Kb
                                return false;
                            }
                        }

                        return true;
                    }
                });

                form.on('submit', function() {
                    if (!file.data('cis_input_files')) return false;

                    file.cis_file_input('disable');
                    form.find('button').attr('disabled', 'disabled');
                    form.find('.modal-body').append("<div class='center'><i class='icon-spinner icon-spin bigger-150 orange'></i></div>");

                    var deferred = new $.Deferred;
                    working = true;
                    deferred.done(function() {
                        form.find('button').removeAttr('disabled');
                        form.find('input[type=file]').cis_file_input('enable');
                        form.find('.modal-body > :last-child').remove();

                        modal.modal("hide");

                        var thumb = file.next().find('img').data('thumb');
                        if (thumb) $('#avatar2').get(0).src = thumb;

                        working = false;
                    });


                    setTimeout(function() {
                        deferred.resolve();
                    }, parseInt(Math.random() * 800 + 800));

                    return false;
                });

            });


            //////////////////////////////
            $('#profile-feed-1').slimScroll({
                height: '250px',
                alwaysVisible: true
            });

            $('.profile-social-links > a').tooltip();

            $('.easy-pie-chart.percentage').each(function() {
                var barColor = $(this).data('color') || '#555';
                var trackColor = '#E2E2E2';
                var size = parseInt($(this).data('size')) || 72;
                $(this).easyPieChart({
                    barColor: barColor,
                    trackColor: trackColor,
                    scaleColor: false,
                    lineCap: 'butt',
                    lineWidth: parseInt(size / 10),
                    animate: false,
                    size: size
                }).css('color', barColor);
            });



            //show the user info on right or left depending on its position
            $('#user-profile-2 .memberdiv').on('mouseenter', function() {
                var $this = $(this);
                var $parent = $this.closest('.tab-pane');

                var off1 = $parent.offset();
                var w1 = $parent.width();

                var off2 = $this.offset();
                var w2 = $this.width();

                var place = 'left';
                if (parseInt(off2.left) < parseInt(off1.left) + parseInt(w1 / 2)) place = 'right';

                $this.find('.popover').removeClass('right left').addClass(place);
            }).on('click', function() {
                return false;
            });



            $('#user-profile-3')
                .find('input[type=file]').cis_file_input({
                    style: 'well',
                    btn_choose: 'Change avatar',
                    btn_change: null,
                    no_icon: 'icon-picture',
                    thumbnail: 'large',
                    droppable: true,
                    before_change: function(files, dropped) {
                        var file = files[0];
                        if (typeof file === "string") { //files is just a file name here (in browsers that don't support FileReader API)
                            if (!(/\.(jpe?g|png|gif)$/i).test(file)) return false;
                        } else { //file is a File object
                            var type = $.trim(file.type);
                            if ((type.length > 0 && !(/^image\/(jpe?g|png|gif)$/i).test(type)) || (type.length == 0 && !(/\.(jpe?g|png|gif)$/i).test(file.name)) //for android default browser!
                            ) return false;

                            if (file.size > 110000) { //~100Kb
                                return false;
                            }
                        }

                        return true;
                    }
                })
                .end().find('button[type=reset]').on(cis.click_event, function() {
                    $('#user-profile-3 input[type=file]').cis_file_input('reset_input');
                })
                .end().find('.date-picker').datepicker().next().on(cis.click_event, function() {
                    $(this).prev().focus();
                })
            $('.input-mask-phone').mask('(999) 999-9999');



            //change profile
            $('[data-toggle="buttons"] .btn').on('click', function(e) {
                var target = $(this).find('input[type=radio]');
                var which = parseInt(target.val());
                $('.user-profile').parent().addClass('hide');
                $('#user-profile-' + which).parent().removeClass('hide');
            });

            //alert('in profile js');
            $('#cis-settings-btn').on('click', function(e) {
                //alert("Hibbmbn");
                $(this).toggleClass('open');
                $('#cis-settings-box').toggleClass('open');
            });

            try {
                $('#skin-colorpicker').cis_colorpicker();
            } catch (e) {}

            $('#skin-colorpicker').on('change', function() {
                var skin_class = $(this).find('option:selected').data('skin');

                var body = $(document.body);
                body.removeClass('skin-1 skin-2 skin-3 ');


                if (skin_class != 'default') body.addClass(skin_class);

                if (skin_class == 'skin-1') {
                    $('.cis-nav > li.grey').addClass('dark');
                    $('.sidebar > li.grey').addClass('dark');
                } else {
                    $('.cis-nav > li.grey').removeClass('dark');
                    $('.sidebar > li.grey').addClass('dark');
                }

                if (skin_class == 'skin-2') {
                    $('.cis-nav > li').addClass('no-border margin-1');
                    $('.cis-nav > li:not(:last-child)').addClass('light-pink').find('> a > [class*="icon-"]').addClass('pink').end().eq(0).find('.badge').addClass('badge-warning');
                } else {
                    $('.cis-nav > li').removeClass('no-border margin-1');
                    $('.cis-nav > li:not(:last-child)').removeClass('light-pink').find('> a > [class*="icon-"]').removeClass('pink').end().eq(0).find('.badge').removeClass('badge-warning');
                    $('.sidebar > li.grey').addClass('light-pink');
                }

                if (skin_class == 'skin-3') {
                    $('.cis-nav > li.grey').addClass('red').find('.badge').addClass('badge-yellow');
                } else {
                    $('.cis-nav > li.grey').removeClass('red').find('.badge').removeClass('badge-yellow');
                    $('.sidebar > li.grey').addClass('red');
                }
            });


        }
    }

});


function enableSelectBoxes() {
    $('div.selectBox').each(function() {
        $(this).children('span.selected').html($(this).children('ul.selectOptions').children('li.selectOption:first').html());
        $('input.price_values').attr('value', $(this).children('ul.selectOptions').children('li.selectOption:first').attr('data-value'));

        $(this).children('span.selected,span.selectArrow').click(function() {
            if ($(this).parent().children('ul.selectOptions').css('display') == 'none') {
                $(this).parent().children('ul.selectOptions').css('display', 'block');
            } else {
                $(this).parent().children('ul.selectOptions').css('display', 'none');
            }
        });

        $(this).find('li.selectOption').click(function() {
            $(this).parent().css('display', 'none');
            $('input.price_values').attr('value', $(this).attr('data-value'));
            $(this).parent().siblings('span.selected').html($(this).html());
        });
    });
}

function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}

function retainActivityPreferences() {
   $(".collapse").collapse('hide');
    $.ajax({
        type: "GET",
        url: "/knowledgecenter/cclom/activities/preferences/" + getCookie("username").replace(/"/g, ""),
        dataType: "json",
        contentType: "application/json",
        success: function(activityPreferences) {
            //Default set all preferences are checked.
            $(".activityPreference").prop("checked",true);$(".activitySectionAll").prop("checked",true);
            $(".myviewSelectAll").prop("checked",true);

            //activityPreferences Response handling.
            if(activityPreferences.code=="200"){
               return;
            }else if(activityPreferences.code=="200E"){ 
                 $(".activityPreference").prop("disabled",true);$(".activitySectionAll").prop("disabled",true);$(".saveActivityPreferences").prop("disabled",true);
                 $("#faildToAccessDb").show();
                 return;
            }

            /*
            -- Retaining the Activity Preference settings and validating the Settings.
            */
            var edUser, edProfile, edExpertise, kotgCollection, kotgNote, colabCommunity, colabBlog, colabWiki, colabForum, flCourse, flPlp, kcDocument, kcFile, preferenceId;
            activityPreferences.forEach(function(res) {
                var id           =  res.id;
                 edUser          =  res.ED.user.verbs; 
                 edProfile       =  res.ED.profile.verbs;
                 edExpertise     =  res.ED.expertise.verbs;
                 kotgCollection  =  res.KOTG.collection.verbs;
                 kotgNote        =  res.KOTG.note.verbs;
                 collabCommunity =  res.COLLAB.community.verbs;
                 collabBlog      =  res.COLLAB.blog.verbs;
                 collabWiki      =  res.COLLAB.wiki.verbs;
                 collabForum     =  res.COLLAB.forum.verbs;
                 flCourse        =  res.LEARNING.course.verbs;
                 flPlp           =  res.LEARNING.plp.verbs;
                 kcDocument      =  res.KC.document.verbs;
                 kcFile          =  res.KC.file.verbs;
            });

            

            if(edUser.length>0){
                edUser.forEach(function(settingValues){ preferenceId = "#user-"+settingValues;$(preferenceId).prop("checked", false); });
            }

            if(edProfile.length>0){
                edProfile.forEach(function(settingValues){ preferenceId = "#profile-"+settingValues;$(preferenceId).prop("checked", false); });
            }

            if(edExpertise.length>0){
                edExpertise.forEach(function(settingValues){ preferenceId = "#expertise-"+settingValues;$(preferenceId).prop("checked", false); });
            }

            if(kotgCollection.length>0){
                kotgCollection.forEach(function(settingValues){ preferenceId = "#collection-"+settingValues;$(preferenceId).prop("checked", false); });
            }

            if(kotgNote.length>0){
                kotgNote.forEach(function(settingValues){ preferenceId = "#note-"+settingValues;$(preferenceId).prop("checked", false); });
            }

            if(collabCommunity.length>0){
                collabCommunity.forEach(function(settingValues){ preferenceId = "#community-"+settingValues;$(preferenceId).prop("checked", false); });
            }

            if(collabBlog.length>0){
                collabBlog.forEach(function(settingValues){ preferenceId = "#blog-"+settingValues;$(preferenceId).prop("checked", false); });
            }

            if(collabWiki.length>0){
                collabWiki.forEach(function(settingValues){ preferenceId = "#wiki-"+settingValues;$(preferenceId).prop("checked", false); });
            }

            if(collabForum.length>0){
                collabForum.forEach(function(settingValues){ preferenceId = "#forum-"+settingValues;$(preferenceId).prop("checked", false); });
            }

            if(flCourse.length>0){
                flCourse.forEach(function(settingValues){ preferenceId = "#course-"+settingValues;$(preferenceId).prop("checked", false); });
            }

            if(flPlp.length>0){
                flPlp.forEach(function(settingValues){ preferenceId = "#plp-"+settingValues;$(preferenceId).prop("checked", false); });
            }

            if(kcDocument.length>0){
                kcDocument.forEach(function(settingValues){ preferenceId = "#document-"+settingValues;$(preferenceId).prop("checked", false); });
            }

            if(kcFile.length>0){
                kcFile.forEach(function(settingValues){ preferenceId = "#file-"+settingValues;$(preferenceId).prop("checked", false); });
            }

            /*
            --  Retainging the Gathered Preferences and setting select All/Unselect All .
            */
            if($('.expertDiscovery:checked').length!=$('.expertDiscovery').length){$(".expertDiscoveryAll").prop("checked",false);}
            if($('.collection:checked').length!=$('.collection').length){$(".collectionAll").prop("checked",false);}
            if($('.blog:checked').length!=$('.blog').length){$(".blogsAll").prop("checked",false);}
            if($('.course:checked').length!=$('.course').length){$(".courseAll").prop("checked",false);}
            if($('.note:checked').length!=$('.note').length){$(".noteAll").prop("checked",false);}
            if($('.community:checked').length!=$('.community').length){$(".comunitiesAll").prop("checked",false);}
            if($('.wiki:checked').length!=$('.wiki').length){$(".wikiAll").prop("checked",false);}
            if($('.forum:checked').length!=$('.forum').length){$(".forumAll").prop("checked",false);}
            if($('.kc:checked').length!=$('.kc').length){$(".kcAll").prop("checked",false);}
            if($(".activitySectionAll:checked").length!=$(".activitySectionAll").length){$(".myviewSelectAll").prop("checked",false);}

        },
        error: function(err) {

        }
    });

}


