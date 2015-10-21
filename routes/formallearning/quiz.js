"use strict";
define(["app", "httpClient", "Q", 'services/formallearning/courseService', 'services/formallearning/userService'],
    function(app, httpClient, Q, courseService, learningUserServices) {
        App.QuizRoute = Ember.Route.extend({
            afterModel: function(params, context) {
                var self = this;
                return this.controllerFor('quiz').getQuizDetails(params.quizId, params.courseId, params);
            },
            setupController: function(controller, context) {

            },
            showStatusMessage: function (alertClass, iconClass, alertMsg) {
                jQuery('#successMessageDiv').removeClass('hide');
                jQuery('#successMessageDiv').removeClass().addClass("alert " + alertClass);
                jQuery('#status-message-icon').removeClass().addClass(iconClass);
                jQuery('#status-message-text').text(alertMsg);
            },
            actions: {
                answered: function(questionId, answerId, questionType) {
                    var self = this;
                    var model = self.controllerFor("quiz").get("model");
                    if (model.answers) {
                        var answer = model.answers.findBy("questionId", questionId);
                        if (answer) {
                            if (questionType == 2) {
                                answer.answerId.push(answerId);
                            } else {
                                answer.answerId = answerId;
                            }

                        } else {
                            var answer = {};
                            if (questionType == 2) {
                                answer = {
                                    questionId: questionId,
                                    answerId: [answerId]
                                }
                            } else {
                                answer = {
                                    questionId: questionId,
                                    answerId: answerId
                                }
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
                        if (questionType == 2) {
                            answer = {
                                questionId: questionId,
                                answerId: [answerId]
                            }
                        } else {
                            answer = {
                                questionId: questionId,
                                answerId: answerId
                            }
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
                    console.log(notattempted)
                    if (notattempted > 0) {
                        jQuery('#ReviewAndSubmit').show();
                        jQuery('#SubmitFinal').hide();
                    } else {
                        jQuery('#ReviewAndSubmit').hide();
                        jQuery('#SubmitFinal').show();
                    }
                },
                submit: function(quizId, courseId) {
                    var self = this;
                    var model = self.controllerFor("quiz").get("model");
                    var data = [];
                    data.push("quizid=" + quizId);
                    data.push("finish=1");
                    if (model.answers.length == 0) {
                        var question = model.quiz[0];
                        if (question.qtype == 2) {
                            data.push("quizresponses[0][slotid]=" + question.slot);
                            data.push("quizresponses[0][qtype]=" + question.qtype);
                            data.push("quizresponses[0][userAnswerResponse][0][name]=");
                            data.push("quizresponses[0][userAnswerResponse][0][value]=");
                        } else if (question.qtype == 1) {
                            data.push("quizresponses[0][slotid]=" + question.slot);
                            data.push("quizresponses[0][qtype]=" + question.qtype);
                            data.push("quizresponses[0][userAnswerResponse][0][name]=answer");
                            data.push("quizresponses[0][userAnswerResponse][0][value]=");
                        } else {
                            data.push("quizresponses[0][slotid]=" + question.slot);
                            data.push("quizresponses[0][qtype]=" + question.qtype);
                            data.push("quizresponses[0][userAnswerResponse][0][name]=");
                            data.push("quizresponses[0][userAnswerResponse][0][value]=");
                        }
                    } else {
                        _.each(model.quiz, function(question, key) {
                            var answer = model.answers.findBy("questionId", question.id);
                            if (answer) {
                                if (question.qtype == 2) {
                                    data.push("quizresponses[" + key + "][slotid]=" + question.slot);
                                    data.push("quizresponses[" + key + "][qtype]=" + question.qtype);
                                    _.each(answer.answerId, function(obj, index) {
                                        _.each(question.answerOptions, function(ansObj, ansKey) {
                                            if (ansObj.name == obj) {
                                                data.push("quizresponses[" + key + "][userAnswerResponse][" + index + "][name]=" + ansObj.choice);
                                            }
                                        });
                                        data.push("quizresponses[" + key + "][userAnswerResponse][" + index + "][value]=" + obj);
                                    });
                                } else if (question.qtype == 1) {
                                    data.push("quizresponses[" + key + "][slotid]=" + question.slot);
                                    data.push("quizresponses[" + key + "][qtype]=" + question.qtype);
                                    data.push("quizresponses[" + key + "][userAnswerResponse][0][name]=answer");
                                    _.each(question.answerOptions, function(val, ind) {
                                        if (val.name == answer.answerId) {
                                            data.push("quizresponses[" + key + "][userAnswerResponse][0][value]=" + ind);
                                        }
                                    })
                                } else {
                                    data.push("quizresponses[" + key + "][slotid]=" + question.slot);
                                    data.push("quizresponses[" + key + "][qtype]=" + question.qtype);
                                    data.push("quizresponses[" + key + "][userAnswerResponse][0][name]=answer");
                                    data.push("quizresponses[" + key + "][userAnswerResponse][0][value]=" + answer.answerId);
                                }
                            }
                        });
                    }
					return learningUserServices.getUserToken().then(function (response) {
                        data.push("wstoken=" + response.userTokenDetails.token);
                        return courseService.submitQuiz(courseId, data).then(function (response) {
                            model.results.clear();
                            var marks_obtained = Math.round(response.courseDetails.marksObtained * 100) / 100;
                            var total_marks = Math.round(response.courseDetails.totalMarks * 100) / 100;
                            model.results.pushObject({
                                marks_obtained: marks_obtained,
                                percent: response.courseDetails.percent,
                                total_marks: total_marks
                            });
                            console.log(model);
                        })
                    });
                },
                reviewQuiz: function(quizId, courseId) {
                    var self = this;
                    var model = self.controllerFor("quiz").get("model");
					return learningUserServices.getUserToken().then(function (response) {
						return courseService.getQuizReview(courseId, quizId, response.userTokenDetails.token).then(function (response) {
							var data = response.quiz;
							_.each(data, function(question, key) {
								if (question.isCorrectResponse == "Correct") {
									question.correct = true;
								} else if (question.isCorrectResponse == "Partially correct") {
									question.partial = true;
								}
								if (question.qtype == 0 || question.qtype == 1) {
									question.radio = true;
								} else {
									question.radio = false;
									_.each(question.answerOptions, function(answer, key) {
										answer.choice = "choice" + key;
									});
								}
								if (question.qtype == 1 && question.userAnswerResponse && question.userAnswerResponse.length > 0) {
									_.each(question.answerOptions, function(val, ind) {
										if (ind === parseInt(question.userAnswerResponse[0].value)) {
											question.userAnswerResponse[0].value = val.name
										}
									})
								}
							});
							model.reviewResults.clear();
							model.reviewResults.pushObjects(data);
						});
					});
                },
                finish: function() {
					var self = this;
                    jQuery('#finishAssesment').hide();
					 $.gritter.add({title:'', text: 'You have completed Quiz successfully.', class_name: 'gritter-success'});
                }
            }
        });
    });