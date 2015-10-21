define(["app",
	"ember",
	"text!templates/vkm/topicCourses.hbs",
	"services/vkmservices/topicDemoServices",
	"httpClient"
	

], function(app, Ember, topicCourses, topicDemo, httpClient) {
		TopicCoursesView = Ember.View.extend({
		defaultTemplate: Ember.Handlebars.compile(topicCourses),
		didInsertElement:function(){
			var self = this;
			topicDemo.showCourses(skillUri,skillLabel).then(function(topicCourses){

				topicCourses.forEach(function(course){
					course.courseURL = course.courseURL.substring(course.courseURL.lastIndexOf('/')+1);
				});
        		self.get('controller').set("courses", topicCourses);
                self.get('controller').set("coursecount", topicCourses.length);
        	});
		}
	});
	return TopicCoursesView;
});
