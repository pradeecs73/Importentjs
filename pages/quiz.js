'use strict';
define([], function(){
	var quizTimer = function(questionsCount) {
		//timer
		var $stopwatch, // Stopwatch element on the page
        incrementTime = 70, // Timer speed in milliseconds
        currentTime = 0, // Current time in hundredths of a second
        updateTimer = function() {
			//alert('update timer...');
            $stopwatch.html(formatTime(currentTime));
            currentTime += incrementTime / 10;
        },
        init = function() {
			//alert('hello frim init');
            $stopwatch = $('#stopwatch');
            Example1.Timer = $.timer(updateTimer, incrementTime, true);
        };
		this.resetStopwatch = function() {
			currentTime = 0;
			this.Timer.stop().once();
		};
		$(init);
		
		function pad(number, length) {
			var str = '' + number;
			while (str.length < length) {str = '0' + str;}
			return str;
		}
		function formatTime(time) {
			/* 	var min = parseInt(time / 6000),
					sec = parseInt(time / 100) - (min * 60),
					hundredths = pad(time - (sec * 100) - (min * 6000), 2);
				//return (min > 0 ? pad(min, 2) : "00") + ":" + pad(sec, 2) + ":" + hundredths;
				return (min > 0 ? pad(min, 2) : "00") + ":" + pad(sec, 2); */
				
			var hrs = parseInt(time/360000),
				min = parseInt(time/6000);
				
				return (hrs > 0 ? pad(hrs,2) : "00") + ":" + pad(min,2);
			
		}
				
		
		
		var $validation = false;
		$('#fuelux-wizard').cis_wizard().on('change' , function(e, info){
			if(info.step == 1 && $validation) {
				if(!$('#validation-form').valid()) return false;
			}
		}).on('finished', function(e) {
			bootbox.dialog({
				message: "Successfully Completed!", 
				buttons: {
					"success" : {
						"label" : "OK",
						"className" : "btn-sm btn-primary"
					}
				}
			});
		}).on('stepclick', function(e){
			//return false;//prevent clicking on steps
		});
		
		$("#ReviewAndSubmit").click(function(){		
			$('div#review').addClass('active');
			$('div.question').removeClass('active');
			$('#nextButton').hide();
			$(this).hide();
			$('#SubmitFinal').show();
			$('h3.panel-title>strong').text("Submit");
			$('h3.panel-title>i').removeClass("assessment-headericon").addClass("quiz-submit-icon");
		});
		
		$("#SubmitFinal").click(function(){			
			$('div#result').addClass('active');
			$('div.question').removeClass('active');
			$('div#review').removeClass('active');
			$('#nextButton').hide();
			$('#prevButton').hide();
			$(this).hide();
			$('#reviewAssesment').show();
			$('h3.panel-title>strong').text("Assessment");
			$('h3.panel-title>i').removeClass("assessment-headericon").addClass("quiz-review-success");
			$('.question .question-set .badge').hide();
			$('#stopwatch').hide();			
			$('.review-perpage').hide();
		});
		
		$("#prevButton").click(function(){			
			$('#nextButton').show();
			$('#ReviewAndSubmit').show();
			$('#SubmitFinal').hide();
			$('h3.panel-title').text("Assessment");
			$('h3.panel-title>i').removeClass("icon-ok").addClass("assessment-headericon");
			
		});
	
		$("#nextButton").click(function(){	
			var isThere = $('#review').hasClass('active');
			if(isThere){
				$('#nextButton').hide();
			}
			
			if($('#'+ questionsCount).hasClass('active')){
				$(this).hide();
			}
		});
		
		
		$("#nextButton-Review").click(function(){
			$('.active').next().addClass('active');
			$('.active').prev().removeClass('active');
			$('#prevButton-Review').removeClass('disabled');
			
			 if ($('#review' + questionsCount).hasClass('active')) {
			   $('#nextButton-Review').addClass('disabled');
			 }
			
         
       });
       $("#prevButton-Review").click(function(){
	   
			 $('.active').prev().addClass('active');
			 $('.active').last().removeClass('active');
			 $('#nextButton-Review').removeClass('disabled');
         
			 if ($('#review1').hasClass('active')) {
			   $('#prevButton-Review').addClass('disabled');
			 }
         
       });
		$("#finishAssesment").click(function(){      
			jQuery("#successMessageDiv").removeClass('hide');
			$("#quizPercentage").show();
         
		});			
							  
       $("#reviewAssesment").click(function(){  
    	 $('div#result').removeClass('active');
			//show
         $('#nextButton-Review').show();
         $('#prevButton-Review').show();
		 $('#finishAssesment').show();
			//make active
         $('#review1').addClass('active');
			//hiding
         $('#SubmitFinal').hide();
		 $('span#stopwatch').hide();
		 $('#summaryinfo').hide();
		 $('#nextButton').hide();
         $('#prevButton').hide();
         $('#reviewAssesment').hide();
         $('div.review-question').show();
         
		 $('div.grade-screen').removeClass('active');
			 //disabling
		  $('#prevButton-Review').addClass('disabled');
        
       });
	}

	    return{
	    	quizTimer:quizTimer
	    };
});
