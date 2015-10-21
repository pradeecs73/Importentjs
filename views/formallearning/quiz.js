"use strict";
define(["../../app", "text!templates/formallearning/quiz.hbs",  "Q", "pages/quiz", "pages/messageModelHide"],
    function(app, quizTemplate, Q, quizTimer, messageModelHide) {
        App.QuizView = Ember.View.extend({
            template: Ember.Handlebars.compile(quizTemplate),
            didInsertElement: function() {
				messageModelHide.addHideMessageModelEvent("successMessageDiv");
                var model = this.controller.get('model');
                quizTimer.quizTimer(model.quiz.length);
                var notattempted = model.options[0].notattempted;
                if (notattempted > 0) {
                    this.$().find('#ReviewAndSubmit').show();
                    this.$().find('#SubmitFinal').hide();
                } else {
                    this.$().find('#ReviewAndSubmit').hide();
                    this.$().find('#SubmitFinal').show();
                }
                this.$().find('div#1').addClass("active");
            },
            change: function(event) {
                var self = this;
                var questionId = event.target.name;
                var answerId = event.target.value;
                var checked = event.target.checked;
                if (event.target.type == "checkbox") {
                    var model = self.controller.get("model");

                    if (model.answers) {
                        var answer = model.answers.findBy("questionId", parseInt(questionId));
                        if (answer) {
                            if (checked)
                                answer.answerId.push(answerId);
                            else {
                                answer.answerId.removeObject(answerId);
                                if (answer.answerId.length == 0) {
                                    var oldStatus = model.options[0];
                                    model.answers.removeObject(answer);
                                    var option = {
                                        attempted: oldStatus.attempted - 1,
                                        notattempted: oldStatus.notattempted + 1,
                                        remaining: oldStatus.remaining + 1
                                    }
                                    model.options.clear();
                                    model.options.pushObject(option);
                                }
                            }
                        } else {
                            var answer = {};
                            answer = {
                                questionId: parseInt(questionId),
                                answerId: [answerId]
                            }

                            model.answers.pushObject(answer);
                            var oldStatus = model.options[0];

                            var option = {
                                attempted: oldStatus.attempted + 1,
                                notattempted: oldStatus.notattempted - 1,
                                remaining: oldStatus.remaining - 1
                            }
                            model.options.clear();
                            model.options.pushObject(option);
                        }
                    } else {
                        var answer = {};
                        answer = {
                            questionId: parseInt(questionId),
                            answerId: [answerId]
                        }

                        model.answers = [];
                        model.answers.pushObject(answer);
                        var oldStatus = model.options[0];

                        var option = {
                            attempted: oldStatus.attempted + 1,
                            notattempted: oldStatus.notattempted - 1,
                            remaining: oldStatus.remaining - 1
                        }
                        model.options.clear();
                        model.options.pushObject(option);
                    }
                    var unanswered = [];
                    _.each(model.quiz, function(question, key) {
                        var answer = model.answers.findBy("questionId", question.id);
                        if (!answer) {
                            unanswered.push(question.slot);
                        }
                    });
                    model.unanswered.clear();
                    model.unanswered.pushObjects(unanswered);
                    var notattempted = model.options[0].notattempted;
                    if (notattempted > 0) {
                        jQuery('#ReviewAndSubmit').show();
                        jQuery('#SubmitFinal').hide();
                    } else {
                        jQuery('#ReviewAndSubmit').hide();
                        jQuery('#SubmitFinal').show();
                    }
                }
            }
        });
    });