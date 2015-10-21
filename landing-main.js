'use strict';

require.config({
    baseUrl: 'js',
    waitSeconds: 0,
    paths: {
        ember: 'libs/ember-1.12.0.debug',
        emberValidator: 'libs/ember-validations-0.2.1.min',
        emberTemplateCompiler: 'libs/ember-template-compiler-1.12.0',
        text: 'libs/text-loader-plugin',
        underscore: 'libs/underscore-min',
        Q: 'libs/q',
        jsEncrypt: '../assets/js/jsencrypt.min',
        httpClient: 'libs/http-client',
        handlebars: 'libs/handlebars-1.3.0.min'
    },
    shim: {
        ember: {
            deps: ['emberTemplateCompiler','handlebars'],
            exports: 'Ember'
        },
        underscore: {
            exports: '_'
        },
        httpClient: {
            deps: ['Q', 'jsEncrypt']
        },
        emberValidator: {
            deps: ['ember'],
            exports: 'EmberValidator'
        },
        handlebars: {
            exports: 'handlebars'
        }
    }
});

require(['ember', 'emberValidator', 'landingApp']);
