"use strict";
define(["../../app", "httpClient", "Q", 'services/formallearning/courseService', 'services/formallearning/userService'],
    function(app, httpClient, Q, courseService, learningUserServices) {
        App.QuizController = Ember.ObjectController.extend({
            getQuizDetails: function(quizId, courseId) {
                var self = this;
				return learningUserServices.getUserToken().then(function (response) {
                    self.set("model", {
                        'quizErrorMessageFlag': false
                    });
                    if (response.userTokenDetails.error) {
						self.set("model", {
                            'quizErrorMessageFlag': true
                        });
                        var model = self.get('model');
                        return model;
                    }
					return courseService.getQuizData(courseId, quizId, response.userTokenDetails.token).then(function (response) {
                        _.each(response.quiz, function(question, key) {
                            if (question.qtype == 0 || question.qtype == 1) {
                                question.radio = true;
                            } else {
                                question.radio = false;
                                _.each(question.answerOptions, function(answer, key) {
                                    answer.choice = "choice" + key;
                                });
                            }
                        });
                        self.set("model", response);
                        var model = self.get('model');
                        if (response.quiz) {
                            model.quizid = quizId;
                            model.courseId = courseId
                            model.options = [];
                            var option = {
                                attempted: 0,
                                notattempted: response.quiz.length,
                                remaining: response.quiz.length
                            }
                            model.options.pushObject(option);
                            model.answers = [];

                            var unanswered = [];
                            model.unanswered = [];
                            _.each(model.quiz, function(question, key) {
                                unanswered.push(question.slot);
                            });
                            model.unanswered.pushObjects(unanswered);
                            model.results = [];
                            model.reviewResults = [];
                        }
                        self.set("model", model);
                        var notattempted = model.options[0].notattempted;
                        if (notattempted > 0) {
                            jQuery('#ReviewAndSubmit').show();
                            jQuery('#SubmitFinal').hide();
                        } else {
                            jQuery('#ReviewAndSubmit').hide();
                            jQuery('#SubmitFinal').show();
                        }
                        return model;
                    });
                });
            }
        });
		
        Ember.Handlebars.registerBoundHelper('radioButton', function(option, correctAnswer, questionId, correct) {
            if (correctAnswer != null && correctAnswer.length > 0) {
                if (option.name == parseInt(correctAnswer[0].value)) {
                    var radioTag = '<input type="radio" value="' + questionId + '" name="' + questionId + '" checked="true" disabled="disabled">';
                    if (correct)
                        radioTag += '<label class="text-success">' + option.value + '</label>';
                    else
                        radioTag += '<label class="text-danger">' + option.value + '</label>';
                    return new Handlebars.SafeString(radioTag);
                }
            }
            return new Handlebars.SafeString('<input type="radio" value="' + questionId + '" name="' + questionId + '" disabled="disabled"><label>' + option.value + '</label>');
        });

        Ember.Handlebars.registerBoundHelper('radioButtonTrueOrFalse', function(correctAnswer, questionId, option, correct) {
            var label = ""
            if (option)
                label = "True"
            else
                label = "False"
            if (correctAnswer != null && correctAnswer.length > 0) {
                if (option == parseInt(correctAnswer[0].value)) {
                    var radioTag = '<input type="radio" value="' + questionId + '" name="' + questionId + '" checked="true" disabled="disabled">';
                    if (correct)
                        radioTag += '<label class="text-success">' + label + '</label>';
                    else
                        radioTag += '<label class="text-danger">' + label + '</label>';
                    return new Handlebars.SafeString(radioTag);
                }
            }

            return new Handlebars.SafeString('<input type="radio" value="' + questionId + '" name="' + questionId + '" disabled="disabled"><label>' + label + '</label>');
        });

        Ember.Handlebars.registerBoundHelper('checkBox', function(correctAnswer, questionId, option, correct, partial) {
            var checkBox = "";
            if (correctAnswer != null && correctAnswer.length > 0) {
                _.each(correctAnswer, function(answer, key) {
                    if (answer.name == option.choice) {
                        checkBox = '<input type="checkbox" name="' + questionId + '" value="' + option.value + '" checked="true" disabled="disabled"/>';
                        if (correct)
                            checkBox += '<label class="text-success">' + option.value + '</label>';
                        else if (partial)
                            checkBox += '<label class="text-warning">' + option.value + '</label>';
                        else
                            checkBox += '<label class="text-danger">' + option.value + '</label>';
                    }
                });
                if (checkBox != "")
                    return new Handlebars.SafeString(checkBox);
            }
            return new Handlebars.SafeString('<input type="checkbox" name="' + questionId + '" value="' + option.value + '" disabled="disabled"/><label>' + option.value + '</label>');
        });
    });