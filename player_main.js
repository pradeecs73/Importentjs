'use strict';

require.config({
    baseUrl: 'js',
    waitSeconds: 0,
    paths: {
        underscore: 'libs/underscore-min',
        Q: 'libs/q',
        httpClient: 'libs/http-client',
        jsEncrypt: '../assets/js/jsencrypt.min'
    },
    shim: {
        underscore: {
            exports: '_'
        },
        httpClient: {
            deps: ["underscore"]
        }
    }
});

require([
    'underscore',
    'Q',
    'jsEncrypt',
    'services/encryptionService',
    'httpClient',
    'services/pipelineResourceService',
    'pages/popUpPlayer'
]);