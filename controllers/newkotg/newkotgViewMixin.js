'use strict'

define(['app'],
	function(app) {
		App.NEWKOTGViewMixin = Ember.Mixin.create({
			setAutocomplete: function() {
				var that = this,
						usableTags = that.controller.get("usableTags");
				$("#tagInput").autocomplete({source: usableTags});
				$("#tagInput").keypress(function(e) {
					if(13 === e.keyCode) {
						that.controller.addTag($(this).val());
						$(this).val('');
					}
				});
			},
			load: function() {
				$('.article').html("<img src='../../assets/images/kotg/loading.gif'></img>");
				var model = this.controller.get("model");
				if(model.type === "File") {
					this.showFile();
				} else if(model.type === "Image") {
					this.showImage();
				} else {
					this.showArticle();
				}
			},
			showFile: function() {
				var model = this.controller.get("model");
				function formatFileSize(size) {
					if (!size) {
						return '0 Bytes';
					}
					var sizeNames = [' Bytes', ' KB', ' MB', ' GB', ' TB', ' PB', ' EB', ' ZB', ' YB'];
					var i = Math.floor(Math.log(size) / Math.log(1024));
					var p = (i > 1) ? 2 : 0;
					return (size / Math.pow(1024, Math.floor(i))).toFixed(p) + sizeNames[i];
				}
				var htmlTemplate = "<div class='file-download'>"+
						"<div class='file-name-img'>"+
							"<img src='" + this.parseIcon(model.contentType)+ "'/>"+
						"</div>"+
						"<div class='file-download-detail'>"+
							"<h3 class='block-text' title='" + model.title + "''>"+(model.title.length>20?model.title.substring(0,20)+"...":model.title)+"</h3>"+
							"<span>"+formatFileSize(model.contentLength)+"</span>"+
							"<a href='"+model.href+"' class='btn btn-primary'>Download</a>"+
						"</div>"+
					"</div>";
					$('.article').html(htmlTemplate);
			},
			parseIcon: function(filetype) {
				var thumImage = "";
				switch(filetype) {
					case 'application/pdf':
						thumImage = "assets/img/upload-file-type/PDF.png";
						break;
					case 'application/msword':
						thumImage = "assets/img/upload-file-type/DOC.png";
						break;
					case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
						thumImage = "assets/img/upload-file-type/DOCX.png";
						break;
					case 'application/epub+zip':
						thumImage = "assets/img/upload-file-type/epub.png";
						break;
					case 'application/vnd.ms-powerpoint':
						thumImage = "assets/img/upload-file-type/PPT.png";
						break;
					case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
						thumImage = "assets/img/upload-file-type/PPTX.png";
						break;
					case 'text/plain':
						thumImage = "assets/img/upload-file-type/TXT.png";
						break;
					case 'application/vnd.ms-excel':
						thumImage = "assets/img/upload-file-type/XLS.png";
						break;
					case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
						thumImage = "assets/img/upload-file-type/XLSX.png";
						break;
					case 'application/zip':
						thumImage = "assets/img/upload-file-type/ZIP.png";
						break;
					default:
						thumImage = "assets/img/upload-file-type/unknown.png";
						break;
				}
				return thumImage;
			},
			showImage: function() {
				var newImage = new Image();
				var model = this.controller.get("model");
				newImage.onload = function() {
					$(".article").html(this);
				}
				newImage.src = model.href;
			},
			showArticle: function() {
				var model = this.controller.get("model");
				var url = model.type==="Note"? model.rhref: model.href;
				$.ajax({
					url: url,
					dataType: "text",
					type: "GET",
					cache: false,
					beforeSend:function(xhr){
						app.encryptionService(xhr);
					},
					success: function (response) {
						var htmlTemplate = null;
						if ("Note" == model.type) {
							$('.article').html("<iframe id='note-iframe' src='javascript:;'></iframe>");
							var iframe = $("#note-iframe"),
									head = iframe.contents().find("head"),
									body = iframe.contents().find("body");
							head.append('<link type="text/css" rel="stylesheet" href="/assets/js/x-editable/lib/contents.css?t=F0RD">');
							head.append('<link type="text/css" rel="stylesheet" href="/assets/js/x-editable/lib/plugins/codesnippet/lib/highlight/styles/default.css">');
							body.append(response);
							iframe.height(iframe.contents().height());
						} else {
							htmlTemplate = $("<div>" + response + "</div>");
							htmlTemplate.find("a").attr("target", "_blank");
							//replace the img attachment
							if (model.attachments) {
								for (var i=0,len=model.attachments.length; i<len; i++) {
									var imgList = htmlTemplate.find('img[data-id="' + model.attachments[i].order + '"]');
									for (var j=0,len2=imgList.length; j<len2; j++) {
										imgList[j].setAttribute('src', model.attachments[i].href);
									}
								}
							}
							$('.article').html(htmlTemplate.html());
						}
					},
					error: function (xhr, errorInfo, exception) {
						$('.article').html('Service Unreachable.');
					}
				});
			},
			loadUYan: function() {
					var d = this.controller.get("model");
					var type = d.type == "Note"? "note": "collection";
					if(window.UYANCMT) {
						UYANCMT.loadBox(d.id, type, d.title, "");
					}
			}
		});
	});
