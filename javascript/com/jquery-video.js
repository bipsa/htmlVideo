;(function($){
	
	/**
	 * @author Juan Sebastian Romero
	 * @public methods 
	 */
	var videoPlayerMethods = {
		/**
		 * @public
		 * this method plays the video player
		 */
		"play" : function(){
			if (this.data("htmlPlayer") == true)
				this.find("video").get(0).play();
			else
				try{
					$("#" + this.data("videoObject")).get(0).playVideo();
				}catch(e){
					this.data("next", "play");
				}
		},
		
		
		/**
		 * @public
		 * This method gets the video duration
		 */
		"duration" : function(){
			var duration;
			if (this.data("htmlPlayer") == true)
				duration = this.find("video").get(0).duration;
			else
				duration = $("#" + this.data("videoObject")).get(0).getDuration();
			return duration;
		},
		
		/**
		 * @public
		 * This method seeks into the video, time in seconds
		 */
		"seekTo" : function(time){
			if (this.data("htmlPlayer") == true)
				this.find("video").get(0).currentTime = time;
			else{
				$("#" + this.data("videoObject")).get(0).seekTo(time, false);
			}
		},
		
		
		/**
		 * @public
		 * This method pauses the video player
		 */
		"pause" : function(){
			if (this.data("htmlPlayer") == true)
				this.find("video").get(0).pause();
			else 
				try{
					$("#" + this.data("videoObject")).get(0).pauseVideo();
				}catch(e){
					this.data("next", "pause");
				}
		},
		/**
		 * @public
		 * Mutes and unmuted the video stream
		 */
		"mute" : function(muted){
			if (this.data("htmlPlayer") == true)
				this.find("video").prop('muted', muted);
			else
				try{
					if(muted)
						$("#" + this.data("videoObject")).get(0).mute();
					else
						$("#" + this.data("videoObject")).get(0).unMute();
				}catch(e){
					this.data("next", "mute");
				}
		}
	};
	
	/**
	 * @author Juan Sebastian Romero
	 * @class This object creates a video player with html 5
	 * @version 2.0
	 * @return jQueryObject
	 * 
	 */	
	$.fn.video = function(options){
		
		/**
		 * optional values
		 */
		var defaults = {
			"videos" : null,
			"youtubeId" : null,
			"controls" : false,
			"playerCreated" : null,
			"timeUpdated" : null
		};
	
	
		/**
		* @private
		* @param element [HTMLElement / jQueryObject]
		* this method inits the video player instance
		*/
		var initVideoPlayer = function(element){
			var video = document.createElement("video");
			if(video.play){
				element.append(video).data("htmlPlayer", true);
				setSizeToVideo(video, element);
				if(options.videos)
					if(options.videos.length > 0)
						createSources(video, options.videos);
				if(options.controls)
					$(video).attr("controls", options.controls);
				addEventsVideoObject(video);
			} else {
				if(options.youtubeId){
					var content = $(document.createElement("div"));
					if(element.attr("id") === "")
						content.attr("id", options.youtubeId);
					else
						content.attr("id", element.attr("id") + "_video");
					element.append(content)
						.data("htmlPlayer", false).data("videoObject", options.youtubeId);
					loadYouTubeVideo(options.youtubeId, content.attr("id"));
				}
			}
		};
		
		
		/**
		 * @private
		 */
		var addEventsVideoObject = function(video){
			if(options.playerCreated)
				options.playerCreated();
			$(video).bind("timeupdate", function(event){
				if(options.timeUpdated)
					options.timeUpdated(this.currentTime, this.duration, this);
			});
		};
	
		
		/**
		 * @private
		 */
		var loadYouTubeVideo = function(videoId, containerId){
			var params = { allowScriptAccess: "always", wmode: "transparent" };
			var attributes = { id: videoId };
			var parent = $("#" + containerId).parent();
			var interval, currentTime = 0;
			currentPlayer = videoId;
			swfobject.embedSWF("http://www.youtube.com/v/" + videoId + "&version=3&showinfo=0&rel=0&controls=0&enablejsapi=1&playerapiid=" + videoId, containerId, parent.width(), parent.height(), "9", null, null, params, attributes)
			window.onStateChange = function(state){
				switch(state){
					case 1:
						interval = setInterval(function(){
							currentTime +=100;
							if(options.timeUpdated)
								options.timeUpdated(currentTime/1000, parent.video("duration"), $("#" + videoId));
						}, 100);
					break;
					case -1:
					case 0:
					case 2:
					case 3:
						clearInterval(interval);
					break;
				}
			};
			window.onYouTubePlayerReady = function(){
				if(parent.data("next")){
					parent.video(parent.data("next"));
					parent.data("next", null);
				}
				if(options.playerCreated)
					options.playerCreated();
				$("#" + videoId).get(0).addEventListener("onStateChange", "onStateChange");
			};
		};
		
		
		/**
		 * @private
		 */
		var createSources = function(videoObject, videos){
			var i = 0, source;
			for (; i<videos.length; i++){
				source = $(document.createElement("source"));
				$(videoObject).append(source.attr({
					"src" : videos[i]
				}));
			}
		};
		
		
		/**
		 * @private
		 */
		var setSizeToVideo = function(videoObject, element){
			return $(videoObject).attr({
				"width" : $(element).width(),
				"height" : $(element).height()
			});
		};

		
		if(!videoPlayerMethods[options])
			return this.each(function(index, value){
				if (options)
					$.extend(defaults, options);
				initVideoPlayer($(value)); 
			});
		else
			return videoPlayerMethods[options].apply(this, Array.prototype.slice.call(arguments, 1));
		
	};
})(jQuery);
