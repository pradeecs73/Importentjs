define([], function() {
    var setMessage = function(text, type) {
        window.App.__container__.lookup("controller:application").set("flashMessage", {message: text, type: type});
    }

    return {
        setMessage: setMessage
    }
});
