define(['app','text!templates/welcome.hbs', 'pages/welcome', 'httpClient'], function(app, welcomeTemplate, welcome, httpClient){
    App.WelcomeView = Ember.View.extend({
        template: Ember.Handlebars.compile(welcomeTemplate),
        didInsertElement: function() {
            welcome.initialize();
        }
    });

    App.WelcomeController = Ember.ObjectController.extend({
        name: function() {
            var name = app.getShortname()
            return name.charAt(0).toUpperCase() + name.slice(1)
        }.property(),
        actions: {
            trendingTopics: function() {
                this.transitionToRoute('trendingTopics')
            },
            post: function() {
                this.transitionToRoute('blogs.my')
            },
            visitLearningPlan: function() {
                this.transitionToRoute('learningPlan')
            },
            fillProfile: function() {
                this.transitionToRoute('profile')
            }
        }
    });
});
