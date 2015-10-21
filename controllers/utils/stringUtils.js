define(['app'],
    function (app) {
        app.StringUtils = Ember.Object.create({
            DEFAULT_TRIM_LENGTH: 30,
            trim: function (aString, length) {
                if (!length) length = this.DEFAULT_TRIM_LENGTH;
                var shortenedString = this.shorten(aString, length);
                if (aString.length > length) {
                    shortenedString = shortenedString + "...";
                }
                return shortenedString;
            },
            shorten: function (aString, length) {
                var contentLength = aString.length;
                var length = contentLength < length ? contentLength : length;
                return aString.substring(0, length);
            },
            escapeHtml: function(aString) {
                var div = document.createElement('div');
                div.appendChild(document.createTextNode(aString));
                return div.innerHTML;
            }
        });
    });
