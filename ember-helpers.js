'use strict'

define(['ember', 'app'],
    function(Ember, app) {

        Ember.Handlebars.helper('ellipsis', function(str, limit, flag) {
            var domObj = $("<div>").html(str)

            domObj.find('style').empty().remove()
            var text = domObj.text().replace(/<(?:.|\n)*?>/gm, '').trim()
            var result = text
            if (text.length > limit) {
                result = text.substring(0, limit) + '...'
            }

            if (flag && flag == '1') {
                result = text;
            }

            return new Handlebars.SafeString(result)
        })

        var prepareLink = function(id, href, target) {
            var escaped = Handlebars.Utils.escapeExpression(id)
            return new Handlebars.SafeString('<a href="http://' + href + '/' + escaped + '" target="_blank">' + target + escaped + '</a>')
        }

        Ember.Handlebars.helper('facebook', function(id) {
            if (!id == "") {
                return prepareLink(id, "fb.com", "https://www.facebook.com/")
            }
        })

        Ember.Handlebars.helper('twitter', function(id) {
            if (!id == "") {
                return prepareLink(id, "twitter.com", "https://twitter.com/")
            }
        })

        Ember.Handlebars.helper('linkedin', function(id) {
            if (!id == "") {
                return prepareLink(id, "linkedin.com/in", "https://www.linkedin.com/")
            }
        })

        Ember.Handlebars.helper('mailto', function(email) {
            var escaped = Handlebars.Utils.escapeExpression(email)
            return new Handlebars.SafeString('<a href="mailto:' + escaped + '" target="_top">' + escaped + '</a>')
        })

        var formatDate = function(format, date) {
            var now = date === undefined ? moment() : moment(date)
            return now.format(format)
        }

        Ember.Handlebars.registerBoundHelper('currentDate', function(format) {
            return formatDate(format)
        })

        Ember.Handlebars.registerBoundHelper('formatDate', function(date, format) {
            return formatDate(format, date)
        })

        Ember.Handlebars.registerBoundHelper('formatDateSeconds', function(date, format) {
            return formatDate(format, date * 1000)
        })

        Ember.Handlebars.registerBoundHelper('from-now', function(date) {
            return moment(date).fromNow()
        })

        Ember.Handlebars.registerBoundHelper('toLowerCase', function(str) {
            return str.toLowerCase();
        })

        Ember.Handlebars.registerBoundHelper('convertToUpperCase', function(str) {
            return str.toUpperCase();
        });


        Ember.Handlebars.registerBoundHelper('join', function(strArray) {
            if (strArray)
                return strArray.join(", ");
            return "";
        });

        Ember.Handlebars.registerBoundHelper('checkForEmptyArray', function(strArray) {
            if (strArray) {
                if (strArray.length > 0) {
                    return strArray;
                } else {
                    return "";
                }
            }
            return "";
        });

        Ember.Handlebars.registerBoundHelper('humanReadableFileSize', function(fileSizeInBytes) {
            if (fileSizeInBytes >= 1000000000) {
                fileSizeInBytes = (fileSizeInBytes / 1000000000).toFixed(2) + ' GB';
            } else if (fileSizeInBytes >= 1000000) {
                fileSizeInBytes = (fileSizeInBytes / 1000000).toFixed(2) + ' MB';
            } else if (fileSizeInBytes >= 1000) {
                fileSizeInBytes = (fileSizeInBytes / 1000).toFixed(2) + ' KB';
            } else if (fileSizeInBytes > 1) {
                fileSizeInBytes = fileSizeInBytes + ' bytes';
            } else if (fileSizeInBytes == 1) {
                fileSizeInBytes = fileSizeInBytes + ' byte';
            } else {
                fileSizeInBytes = '0 byte';
            }
            return fileSizeInBytes;
        });

        Ember.Handlebars.registerBoundHelper('fileNameFromPath', function(path) {
            return path.replace(/^.*[\\\/]/, '');
        });

        Ember.Handlebars.registerBoundHelper('checkForCompletionStatus', function(statusFlag) {
            if (statusFlag) {
                return "Completed";
            } else {
                return "In progress";
            }

        });

        Ember.Handlebars.registerHelper('getMyDomain', function() {
            return window.location.protocol + "//" + window.location.host;
        });

        Ember.Handlebars.registerBoundHelper('dateInGMTFormat', function(date) {
            if (!(date === undefined)) {
                var dateGMT = new Date(date * 1000);
                return dateGMT.toUTCString().substring(4, dateGMT.length)
            }
            return "";
        });

        Ember.Handlebars.registerBoundHelper('dateConvertUnixTimestampAndInGMTFormat', function(date) {
            if (!(date === undefined)) {
                var timeStampDate = new Date(date);
                var gmtDate =  timeStampDate.toUTCString().substring(4, timeStampDate.length);
                return gmtDate.substr(0, 12)+","+gmtDate.substr(12);
            }
            return "";
        });
        
        Ember.Handlebars.registerBoundHelper('getSurveyId', function(flag) {
            var surveyId;
            var surveyDomain;
            try {
                surveyDomain = window.location.host.split(".")[0];
            } catch (e) {
                console.log("Issue in domain identification for surveys");
            }
            if (surveyDomain == 'showcase') {
                if (flag == 0) {
                    surveyId = '6A5348A71021B434';
                } else {
                    surveyId = '6A5348A71021B45B';
                }
            } else if (surveyDomain == 'preview') {
                if (flag == 0) {
                    surveyId = '6A5348A71021B434';
                } else {
                    surveyId = '6A5348A71021B45B';
                }
            } else {
                if (flag == 0) {
                    surveyId = 'suryvey-not-provided';
                } else {
                    surveyId = 'suryvey-not-provided';
                }
            }
            return surveyId;
        });

        Ember.Handlebars.helper('tagsellipsis', function(str) {
            var result = '';
            if(! str && str==undefined && str==null && str==""){
                return str;
            }
            var escaped = Handlebars.Utils.escapeExpression(str)
            if(! escaped && escaped==undefined && escaped==null && escaped==""){
                return str;                
            }
            var res = escaped.trim().split(",")
            var strLen = 0;
            var latestTags = [];
            var limitTags = 5;

            if (escaped.trim().length > 100) {

                for (var i = 0; i < limitTags; i++) {                   
                    if(res[i] && res[i]!=undefined && res[i]!=null && res[i]!=""){
                        latestTags.push(res[i].trim());
                    }                        
                }
                for (var i = 0; i < latestTags.length; i++) {
                    if (latestTags[i].trim().length > 40) {
                        result += '<span class="tag" data-rel="tooltip" data-original-title="' + latestTags[i].trim() + '" data-html="true" data-placement="top">' + latestTags[i].trim().substring(0, 20) + '.....' + '</span>'
                    } else {
                        result += '<span class="tag">' + latestTags[i].trim() + '</span>'
                    }
                }
            } else {
                for (var i = 0; i < res.length; i++) {
                    if (res[i].trim().length > 40) {
                        result += '<span class="tag" data-rel="tooltip" data-original-title="' + res[i].trim() + '" data-html="true" data-placement="top">' + res[i].trim().substring(0, 20) + '.....' + '</span>'
                    } else {
                        result += '<span class="tag">' + res[i].trim() + '</span>'
                    }
                }
            }

            return new Handlebars.SafeString(result);
        });
        Ember.Handlebars.registerHelper('ifchecklength', function (options) {
           
                var index = options.data.view.contentIndex,
                nth = options.hash.nth;
      
                if (index<4) {
                return options.fn(this);
                }
         
       });

        Ember.Handlebars.helper('checktotalLen', function (newdata,options) {
           
              var length=newdata.length;
               if (length>4) {

                    return options.fn(this);
                }
         
       });
        Ember.Handlebars.helper('blockQuoteForReply', function (parentId, discussionPostText, replies) {

            var parentIdForThisReply = _.findWhere(replies, {"_id":parentId})
            if(!parentIdForThisReply){
                return discussionPostText.htmlSafe();
            }
            var parentReplyText;
            if(parentIdForThisReply && parentIdForThisReply.discussionPostText){
                parentReplyText = parentIdForThisReply.discussionPostText.trim();
                discussionPostText = '<blockquote style="background-color:rgb(242, 236, 234);font-size: 12px;">'+ parentIdForThisReply.displayName +' says : ' + parentReplyText + '</blockquote>' +discussionPostText;        
            }else{
                discussionPostText = discussionPostText;
            }  
            return discussionPostText.htmlSafe();
       });
        Ember.Handlebars.helper('enableRichText', function (richText) { 
            return richText.htmlSafe();
       });

    })