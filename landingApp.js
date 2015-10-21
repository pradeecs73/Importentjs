define(['ember','loadModules'],
    function(Ember, loadModules) {
        var landingApp = Ember.Application.create({});

        landingApp.Router.map(function() {
            this.resource("landingPage", {
                path: "/"
            });
            this.resource("selfRegistration", {
                path: "/register"
            });
        });

        loadModules.load(landingApp);

        window.LandingApp = landingApp;
        return landingApp;
    }
);
