define([], function() {
    var visualSearch = function(jQueryContext, types, cb, context, preferences) {
        var visualSearch = VS.init({
            container: jQueryContext.find('#activityStreamView'),
            query: '',
            minLength: 0,
            showFacets: true,
            readOnly: false,
            unquotable: [],
            placeholder: "Filter by Types",
            callbacks: {
                search: function(query, searchCollection) {
                    var $query = $('#search_query2');
                    $query.stop().animate({
                        opacity: 1
                    }, {
                        duration: 300,
                        queue: false
                    });
                    clearTimeout(window.queryHideDelay2);
                    window.queryHideDelay2 = setTimeout(function() {
                        $query.animate({
                            opacity: 0
                        }, {
                            duration: 1000,
                            queue: false
                        });
                    }, 2000);

                    cb(context, searchCollection);
                },
                valueMatches: function(category, searchTerm, callback) {
                    switch (category) {
                        case 'Type':
                            var types = ['user', 'profile'];
                            if(preferences.Collaboration)
                                types.push('blog', 'discussions', 'wiki', 'community')
                            if(preferences.KC)
                                types.push('document')
                            if(preferences.FormalLearning)
                                types.push('course')
                            callback(types);
                            break;

                    }
                },
                facetMatches: function(callback) {
                    callback([
                        'Type'
                    ], {
                        preserveOrder: true
                    });
                }
            }
        });

    }
    return {
        visualSearch: visualSearch,
        initialize: function() {
            $('[data-toggle="buttons"] .btn').on('click', function(e) {
                var target = $(this).find('input[type=radio]');
                var which = parseInt(target.val());
                $('[id*="timeline-"]').addClass('hide');
                $('#timeline-' + which).removeClass('hide');
            });
            var prevTab = '#blogs-my';

            $('#inbox-tabs a[data-toggle="tab"]').on('show.bs.tab', function(e) {
                currentTab = $(e.target).data('target');
                if (currentTab == '#write') {
                    $("#id-message-new-navbar").show();
                    Inbox.show_form();
                } else {

                    if (prevTab == 'write') {
                        Inbox.show_list('#questions-my');
                    } else
                        Inbox.show_list(currentTab);
                    //load and display the relevant messages 
                }
                prevTab = currentTab;
            })

            //display first message in a new area                       
            $('.message-list .text').on('click', function() {
                //show the loading icon
                $('.message-container').append('<div class="message-loading-overlay"><i class="icon-spin icon-spinner-dots loading-icon bigger-160"></i></div>');

                $('.message-inline-open').removeClass('message-inline-open').find('.message-content').remove();

                var message_list = $(this).closest('.message-list');

                //some waiting
                setTimeout(function() {
                    //hide everything that is after .message-list (which is either .message-content or .message-form)
                    message_list.next().addClass('hide');
                    $('.message-container').find('.message-loading-overlay').remove();

                    //close and remove the inline opened message if any!

                    //hide all navbars
                    $('.message-navbar').addClass('hide');
                    //now show the navbar for single message item
                    $('#id-message-item-navbar').removeClass('hide');

                    //move .message-content next to .message-list and hide .message-list
                    message_list.addClass('hide').after($('.message-content')).next().removeClass('hide');

                    //add scrollbars to .message-body
                    $('.message-content .message-body').slimScroll({
                        height: 200,
                        railVisible: true
                    });

                }, 500 + parseInt(Math.random() * 500));
            });

            //back to message list
            $('.btn-back-message-list').on('click', function(e) {
                e.preventDefault();
                Inbox.show_list(currentTab);
                $('#inbox-tabs a[data-target="' + currentTab + '"]').tab('show');
            });
            var Inbox = {}

            //show message list (back from writing mail or reading a message)
            Inbox.show_list = function(data) {
                $('.message-navbar').addClass('hide');
                if (data != "#blogs-my") {
                    $(data).find('.message-navbar').removeClass('hide');
                }
                $('#id-message-list-navbar').removeClass('hide');
                $('.message-list').removeClass('hide').next().addClass('hide');
                $('.message-form').addClass('hide');
            }

            //show write mail form
            Inbox.show_form = function() {
                if (!form_initialized) {
                    initialize_form();
                }

                var message = $('.message-list');
                $('.message-container').append('<div class="message-loading-overlay"><i class="icon-spin icon-spinner-dots loading-icon bigger-160"></i></div>');

                $('.message-navbar').addClass('hide');
                //$('#id-message-new-navbar').removeClass('hide');      

                $("#id-message-new-navbar").removeClass('hide');
                $('#id-message-edit-navbar').addClass('hide');
                $("#new-actions").removeClass('hide');
                $("#edit-actions").addClass('hide');

                setTimeout(function() {
                    message.next().addClass('hide');

                    $('.message-container').find('.message-loading-overlay').remove();
                    $('.message-list').addClass('hide');
                    $('.message-form').removeClass('hide').insertAfter('#write');
                    $('.message-form:not(:first)').remove();
                    var numItems = $('.message-form:first').length;



                    //reset form??
                    $('.message-form .wysiwyg-editor').empty();
                    $('.message-form .cis-file-input').closest('.file-input-container:not(:first-child)').remove();
                    $('.message-form input[type=file]').cis_file_input('reset_input');
                    $('.message-form').get(0).reset();

                }, 300 + parseInt(Math.random() * 300));

            }

            var form_initialized = false;

            function initialize_form() {
                if (form_initialized) return;
                form_initialized = true;

                //intialize wysiwyg editor
                $('.message-form .wysiwyg-editor').summernote({
					height: 300,
					minHeight: null,
					maxHeight: null,
					focus: true,  		
				  toolbar: [			 
					['style', ['bold', 'italic', 'underline', 'clear']],
					['font', ['strikethrough']],
					['para', ['paragraph']],
					['insert', ['picture','link','video']],
					['misc', ['undo','redo','fullscreen']],
				  ]
                }).prev().addClass('wysiwyg-style1');

            } //initialize_form

            $('.dialogs,.comments').slimScroll({
                height: '300px'
            });

            //auto resize textarea  
            //$('textarea[class*=autosize]').autosize({append: "\n"});

            $('[data-rel=popover]').popover({
                html: true
            });


            $('.edit-blog').on('click', function() {
                Inbox.show_form();
                $("#id-message-new-navbar").addClass('hide');
                $('#id-message-edit-navbar').removeClass('hide');
                $("#new-actions").addClass('hide');
                $("#edit-actions").removeClass('hide');
            });

            $('.edit-list-blog').on('click', function() {
                Inbox.show_form();
                $("#id-message-new-navbar").addClass('hide');
                $('#id-message-edit-navbar').removeClass('hide');
                $("#new-actions").addClass('hide');
                $("#edit-actions").removeClass('hide');
            });

            $('#edit-cancel-btn').on('click', function() {
                $('#id-message-new-navbar').addClass('hide');
                $('#id-message-item-navbar').removeClass('hide');
                $('.message-content').removeClass('hide');
                $('#id-message-form').addClass('hide');
            });

            $('#edit-update-btn').on(cis.click_event, function() {
                $.gritter.add({
                    title: 'Blog updated successfully!',
                    class_name: 'gritter-center' + ' gritter-success' + ' align-center'
                });

                return false;
            });
        }
    };

});