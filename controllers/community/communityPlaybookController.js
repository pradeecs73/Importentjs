'use strict';

define(['app', 'underscore', 'services/groupService',
        'services/usersService', 'services/webExService',
        'services/searchService', 'services/documentsService',
        'pages/flashMessage', 'emberPageble',
        'services/collaborationUtil', 'httpClient'
    ],
    function(app, _, groupService, userService,
        webExService, searchService, documentsService,
        flashMessage, emberPageble, collaborationUtil, httpClient) {
        app.CommunityPlaybookController = Ember.ObjectController.extend({
            //Refactored and moved to respective controllers. Place holder for now.
        });
    });
