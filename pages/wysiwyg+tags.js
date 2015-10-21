define([], function() {
    var initializeWysiwyg = function() {
        //initialize wysiwyg editor

         $('.wysiwyg-editor').each(function(){
           CKEDITOR.replace(this)
        });

    }

    var initializeTags = function() {
        //initialize tags
        return ["management",
            "people",
            "job",
            "cost",
            "time",
            "employee",
            "organization",
            "contribution",
            "problem",
            "turnover",
            "individual",
            "option",
            "case",
            "information",
            "day",
            "notice",
            "force",
            "talent",
            "employer",
            "skill",
            "leader",
            "benefit",
            "reduction",
            "business",
            "company",
            "year",
            "percent",
            "group",
            "rule",
            "service",
            "plan",
            "datum",
            "period",
            "performance",
            "work",
            "strategy",
            "development",
            "training",
            "team",
            "person",
            "manager",
            "workplace",
            "office",
            "rate",
            "health",
            "act",
            "law",
            "care",
            "process",
            "role",
            "change",
            "policy",
            "compensation",
            "medical",
            "coverage",
            "employment",
            "claim",
            "resource",
            "sigma",
            "scheme",
            "pay",
            "disease",
            "leadership",
            "learning",
            "center",
            "coaching",
            "goal",
            "income",
            "meeting",
            "premium",
            "insurance",
            "function",
            "media",
            "search"
        ];

    }

    var initializeUserSuggestion = function() {
        /*$('.user-suggest').autocomplete({
            messages: {
                noResults: '',
                results: function(){}
            },
            source: function(req, res){
            	 var groupList =[];
          
                try{
					    $.when(
					    		$.ajax('/userrepository/UserLDAPAuthentication/users/findUsers?term='+req.term,
				                        {
				                            type: "POST",
				                            accepts: 'json',
				                            contentType: 'application/json',
				                            data: JSON.stringify({
				                                "keyword": req.term
				                            }),
				                            dataType: 'json'
				                            
				                 }),
				                 $.ajax('/groups',
			                             {
			                                 type: "GET",
			                                 //accepts: 'json',
			                                 contentType: 'application/json',
			                                 dataType: 'json'
			                          
			                   })).then(function (res1, res2) {
			                	  var userList = res1[0].UserList;
			                	  _.each(userList,function(user){
			                		   var userDetails = {
			                				   label: "",
		                                       value: user.email
    	  								};
                                		groupList.push(userDetails);
                               	  });
			                	  
			                	   _.each(res2[0],function(group){
			                		   var groupDetails = {
                                				value: group.name,
    	  										label: ""
    	  								};
                                		groupList.push(groupDetails);
                               	  });
			                	   //console.log(groupList);
			                	   res(groupList);
							   });
					   
                } catch(e) {
                    res([]);
                }
            }
        }).data('ui-autocomplete')._renderItem = function(ul, item){
            return $( "<li>" )
                .append( "<a>" + item.value + "<br><small>" + item.label + "</small></a>" )
                .appendTo( ul );        
            };*/
    };

    var shareAutotag = function(data, shares) {
        var elt = $('#form-field-mask-2');
        var alreadyLoaded = false;
        try {
            elt.tagsinput({
                itemValue: "id",
                itemText: "name"
            });
        } catch (error) {
            elt.tagsinput('destroy');
            elt.tagsinput({
                itemValue: "id",
                itemText: "name"
            });
            //alreadyLoaded = true;
        }
        if (shares != null && shares.length > 0) {
            _.each(shares, function(share, key) {
                elt.tagsinput('add', {
                    id: share.share + '|' + share.display,
                    name: share.display
                })
            })
        }
        if (!alreadyLoaded) {
            elt.tagsinput('input').typeahead({
                valueKey: 'name',
                local: data
            }).bind('typeahead:selected', $.proxy(function(obj, datum) {
                this.tagsinput('add', datum);
                this.tagsinput('input').typeahead('setQuery', '');
            }, elt));
        }
    };

    var disableWysiwygEditor = function() {
      $('.wysiwyg-editor.wysiwyg-editor-height').attr('contentEditable','false').addClass('look-disabled');
    }

    var enableWysiwygEditor = function() {
      $('.wysiwyg-editor.wysiwyg-editor-height').attr('contentEditable','true').removeClass('look-disabled');
    }

    return {
        initializeWysiwyg: initializeWysiwyg,
        initializeTags: initializeTags,
        initializeWysiwygAndTags: function() {
            initializeWysiwyg();
            // initializeTags();
        },
        initializeUserSuggestion: initializeUserSuggestion,
        shareAutotag: shareAutotag,
        enableWysiwygEditor: enableWysiwygEditor,
        disableWysiwygEditor: disableWysiwygEditor
    }
});