define([], function() {
    return {
        filePreviewPreparationForFTPUpload: function() {
            /* Added for file preview using google docs */
            $("a[id^='file-link_']").click(function() {
                var html = $(this).parent().find('div.file-container').html();
                $(window.open().document.body).html(html);
            });

            $('[data-rel=tooltip]').tooltip();
        }

    };
});