define([
        'routes/landingPage/landingPageRoute',
        'controllers/landingPage/landingPageController',
        'views/landingPage/landingPageView',
        'routes/landingPage/selfRegistrationRoute',
        'controllers/landingPage/selfRegistrationController',
        'views/landingPage/selfRegistrationView'
    ],
    function(landingPageRoute, landingPageController, landingPageView, selfRegistrationRoute, selfRegistrationController, selfRegistrationView) {

        var load = function(app) {
            app.set("LandingPageRoute", landingPageRoute.LandingPageRoute);
            app.set("LandingPageController", landingPageController.LandingPageController);
            app.set("LandingPageView", landingPageView.LandingPageView);
            app.set("SelfRegistrationRoute", selfRegistrationRoute.SelfRegistrationRoute);
            app.set("SelfRegistrationController", selfRegistrationController.SelfRegistrationController);
            app.set("SelfRegistrationView", selfRegistrationView.SelfRegistrationView);
        };

        return {
            load : load
        }
    }
);
