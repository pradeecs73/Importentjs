"use strict";

define(["app", 'emberValidator'],
  function(app) {
    app.DocumentCreate = Ember.Object.extend(Ember.Validations.Mixin, {
      validations: {
        description: {
          length: {
            allowBlank: true,
            maximum: 5000,
            messages: {
              maximum: 'Maximum length allowed is 5000 characters'
            }
          }
        },
        title: {
          length: {
            allowBlank: true,
            maximum: 255,
            messages: {
              maximum: 'Maximum length allowed is 255 characters'
            }
          }
        }
      }
    })

    app.DocumentEdit = Ember.Object.extend(Ember.Validations.Mixin, {
      validations: {
        descriptionSansHtml: {
          length: {
            allowBlank: true,
            maximum: 5000,
            messages: {
              maximum: 'Maximum length allowed is 5000 characters'
            }
          }
        },
        title: {
          length: {
            allowBlank: true,
            maximum: 255,
            messages: {
              maximum: 'Maximum length allowed is 255 characters'
            }
          }
        },
        userTags: {
          format: {
            with: /^[^":]+$/,
            allowBlank: true,
            message: 'Tags contain quotes (") and colon (:)'
          }
        }
      }
    })

  });
