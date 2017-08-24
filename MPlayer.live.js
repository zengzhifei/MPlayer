/**
 * MPlayer.live.js
 * 视频弹幕插件，可用于直播
 * zengzhfiei
 * 2017.4.12
 * 
 * 调用方式:
 * $(id|calss).MPlayer(options)
 * 参数 options:
 * video:{} controls:{} danmu:{} 如果不传 默认为空
 * API调用方式:
 * $(id|calss).MPlayer(functionName,argument)
 *
 */

(function ($) {
    //播放器构造函数
    var MPlayer = function (element, options) {
    	//绑定标签
        this.$element = $(element);
        //全局配置参数
        this.options = options;
        //弹幕列表
        this.danmuList = [];
        //弹幕列表最新指针
        this.newPointer = -1;
        //弹幕列表当前指针
        this.currentPointer = 0;
        //弹幕当前状态
        this.currentStatus = false;
        //绑定弹幕当前状态
        this.$element.data('currentStatus',0);
        //绑定弹幕开关
        MPlayer.DANMU_DEFAULTS.danmuSwitch ? this.$element.data('danmuSwitch',1) : this.$element.data('danmuSwitch',0); 
        //绑定终端屏幕宽高
        this.$element.data('screenSize',{height:document.documentElement.clientHeight,width:document.documentElement.clientWidth});
        //当前对象
        var $this = this;

        //私有方法
        //获取弹幕唯一ID
        this.getDanmuRowID = function () {
            return (new Date()).getTime() + (Math.floor(Math.random() * 1000));
        };
        //弹幕行数修正
        this.updateDanmuRow = function () {
        	var maxRow = Math.round($("#" + this.id + ' .MPlayer-danmu').height() / 30);
        	if (MPlayer.DANMU_DEFAULTS.maxRow >= maxRow) {
        		MPlayer.DANMU_DEFAULTS.maxRow = MPlayer.DANMU_DEFAULTS.captionDefend ? maxRow - 1 : maxRow; 
        	}
        };
        //屏幕宽高比修正
        this.updateScreenRatio = function () {
            var screenWidth = screen.width;
            var screenHeight = screen.height;      
            var screenRatio = (screenHeight / screenWidth).toFixed(1);
            if ((this.options.ratio).toFixed(1) == screenRatio) {
                return true;
            } else {
                return false;
            }
        }
        //横竖屏宽高修正
        this.updateScreen = function (direction) {
            switch (direction) {
                //横屏全屏
                case 'landscape-full':
                    //计算新宽度和位置          
                    var newWidth = $this.updateScreenRatio() ? '100%' : $this.$element.data('screenSize').width * $this.options.ratio;
                    var newLeft = newWidth == '100%' ? 0 : ($this.$element.data('screenSize').height / 2) - (newWidth / 2);            
                    //视频，弹幕
                    $("#" + $this.id + ' .MPlayer-video,' + "#" + $this.id + ' .MPlayer-danmu').css({
                        'top': 0,
                        'left': newLeft,
                        'height': '100%',
                        'width': newWidth
                    })
                    //控件
                    $("#" + $this.id + ' .MPlayer-control').css({
                        'width': '100%',
                        'display': 'none'
                    });
                    break;
                //竖屏全屏
                case 'portrait-full':
                    //计算新高度和位置 
                    var newHeight = $this.$element.data('screenSize').width / $this.options.ratio;
                    var newTop = ($this.$element.data('screenSize').height / 2) - (newHeight / 2);
                    //视频，弹幕
                    $("#" + $this.id + ' .MPlayer-video,' + "#" + $this.id + ' .MPlayer-danmu').css({
                        'top': newTop,
                        'left': 0,
                        'height': newHeight,
                        'width': '100%'
                    })                   
                    //控件
                    $("#" + $this.id + ' .MPlayer-control').css({
                        'width': '100%',
                        'display': 'block'
                    });
                    break;
                //竖屏半屏
                case 'portrait-middle':
                    //视频，弹幕
                    $("#" + $this.id + ' .MPlayer-video,' + "#" + $this.id + ' .MPlayer-danmu').css({
                        'top': $this.options.top,
                        'left': $this.options.left,
                        'height': $this.$element.data('elementWidth') / $this.options.ratio,
                        'width': $this.options.width
                    })                   
                    //控件
                    $("#" + $this.id + ' .MPlayer-control').css({
                        'width': $this.options.width,
                        'display': 'block'
                    });
                    //组件
                    $("#" + $this.id).css('height', $("#" + $this.id + ' .MPlayer-control').height() + $("#" + $this.id + ' .MPlayer-video').height());
                    break;
            }
        }
        //控件响应横竖屏
        this.updateControlTime = function (type) {
            if (type == 'open') {
                $this.$element.data('updateControlTime',setTimeout(function() {
                    if ($("#" + $this.id).hasClass('MPlayer-full-screen')) {
                        if (window.orientation == 90 || window.orientation == -90) {
                            if ((new Date()).getTime() - $this.$element.data('controlTime') >= 3000) {
                                $("#" + $this.id + ' .MPlayer-control').css('display','none');
                            }
                        }
                    }                               
                },3000))
            } else {
                clearTimeout($this.$element.data('updateControlTime'));
            }                       
        }
        //弹幕
        this.displayDanmu = function () {
            if (this.currentPointer <= this.newPointer) {
            	console.log('第'+$this.currentPointer+'轮开始');
            	$this.updateDanmuRow();
                var currentDanmuList = this.danmuList[this.currentPointer];
                var doDisplay = function (inwardPointer) {      	
                	if (inwardPointer < currentDanmuList.length) {
                		console.log('内部指针--'+inwardPointer);
                		var danmuRowID = [];
                		for (var j = 0 , k = 1; j < MPlayer.DANMU_DEFAULTS.maxRow; j++,k++) {
                			if (inwardPointer + j < currentDanmuList.length) {
                				danmuRowID[j] = $this.getDanmuRowID();
                				console.log(inwardPointer + j);
		                    	(function(i,j,k){
									setTimeout(function() {
				                        var danmuRow = '<span class="danmuRow" id="danmuRow' + danmuRowID[j] +'"></span>';                  
				                        $("#" + $this.id + " .MPlayer-danmu").append(danmuRow);
				                        //姓名
				                        if (currentDanmuList[i+j]["name"]) {
				                        	$("#danmuRow" + danmuRowID[j]).text(currentDanmuList[i+j]["name"]+"：");
				                        }				                
				                        //内容		                        				                   
				                        $("#danmuRow" + danmuRowID[j]).append(currentDanmuList[i+j]["text"]).css({				                      				           					                
					                        "color" : currentDanmuList[i+j]['fontColor'] || MPlayer.DANMU_DEFAULTS.fontColor,
					                        "font-size" : currentDanmuList[i+j]['fontSize'] || MPlayer.DANMU_DEFAULTS.fontSize,
					                        "background-color" : (currentDanmuList[i+j]["isMe"] && MPlayer.DANMU_DEFAULTS.myBgColor) || currentDanmuList[i+j]['bgColor'] || MPlayer.DANMU_DEFAULTS.bgColor,
				                        }).css({
				                        	"top" : ($("#danmuRow" + danmuRowID[j]).height() * j) + (j * 5),
				                        	"line-height" : $("#danmuRow" + danmuRowID[j]).height() + 'px',
				                        });
				                        //头像
				                        if (currentDanmuList[i+j]["img"]) {
				                        	var danmuImgHeight = $("#danmuRow" + danmuRowID[j]).height();
				                        	$("#danmuRow" + danmuRowID[j]).prepend('<img style="width:'+danmuImgHeight+'px;height:'+danmuImgHeight+'px" src="' + currentDanmuList[i+j]["img"] + '" />');
				                        }			                        
				                        var newSpeedRatio = ($("#" + $this.id + " .MPlayer-danmu").width() + $("#danmuRow" + danmuRowID[j]).width()) / $("#" + $this.id + " .MPlayer-danmu").width();
					                    $("#danmuRow" + danmuRowID[j]).animate({
				                        	left : -$("#danmuRow" + danmuRowID[j]).width()
				                        },MPlayer.DANMU_DEFAULTS.speed * newSpeedRatio,'linear',function() {
				                        	$(this).remove();
				                        });
				                       if (k >= MPlayer.DANMU_DEFAULTS.maxRow) {
				                       		var maxDanmuWidthObj = $("#danmuRow" + danmuRowID[0]);
				                       		var danmuWidth = $("#" + $this.id + " .MPlayer-danmu").width();
				                       		for (var m = 1 ; m < MPlayer.DANMU_DEFAULTS.maxRow; m++) {
				                       			maxDanmuWidthObj = maxDanmuWidthObj.width() > $("#danmuRow" + danmuRowID[m]).width() ? maxDanmuWidthObj : $("#danmuRow" + danmuRowID[m]);
				                       		}               
				                       		var danmuTimer = setInterval(function() {
				                       			var nowPositionLeft = maxDanmuWidthObj.css('left').replace(/px/ig, '');					
												var nowPosition = Number(nowPositionLeft) + Number(maxDanmuWidthObj.width());		
												if (nowPosition/danmuWidth <= 0.8) {
													clearInterval(danmuTimer);
													if (inwardPointer + MPlayer.DANMU_DEFAULTS.maxRow >= currentDanmuList.length) {
														console.log('第'+$this.currentPointer+'轮结束');
														$this.currentPointer++;
	                    								$this.displayDanmu();
													} else {
														doDisplay(inwardPointer + MPlayer.DANMU_DEFAULTS.maxRow);
													}											
												}		
				                       		},100)			                    
				                       } else if (inwardPointer + k >= currentDanmuList.length) {
				                       		var maxDanmuWidthObj = $("#danmuRow" + danmuRowID[0]);
				                       		var danmuWidth = $("#" + $this.id + " .MPlayer-danmu").width();
				                       		for (var m = 1 ; m < k; m++) {
				                       			maxDanmuWidthObj = maxDanmuWidthObj.width() > $("#danmuRow" + danmuRowID[m]).width() ? maxDanmuWidthObj : $("#danmuRow" + danmuRowID[m]);
				                       		}              
				                       		var danmuTimer = setInterval(function() {
				                       			var nowPositionLeft = maxDanmuWidthObj.css('left').replace(/px/ig, '');					
												var nowPosition = Number(nowPositionLeft) + Number(maxDanmuWidthObj.width());		
												if (nowPosition/danmuWidth <= 0.8) {
													clearInterval(danmuTimer);											
													console.log('第'+$this.currentPointer+'轮结束');
													$this.currentPointer++;
                    								$this.displayDanmu();											
												}		
				                       		},100);				                       		 
				                       } 		                      		
			                        },j*200);
		                    	})(inwardPointer,j,k)
	                    	}                			
                    	}
                	}
                }
                doDisplay(0);                             
            } else {
            	//是否循环
            	if (MPlayer.DANMU_DEFAULTS.loop) {
        			$this.currentPointer = 0;
        			$this.displayDanmu();
            	} else {
            		$this.currentStatus = false;
            		$this.$element.data('currentStatus',0);
            	}            	
            }
        };


        //组件
        //组件样式
        this.$element.css({
            'position': 'relative',
            'width': this.options.width,
            'z-index': this.options.zIndex
        })
        //绑定组件宽度
        this.$element.data('elementWidth',this.$element.width());

        //组件ID
        !this.$element.attr('id') && this.$element.attr('id', 'MPlayer');
        this.id = this.$element.attr('id');

        //插入播放器层
        var videoHtml = '<video class="MPlayer-video" x5-video-player-type="h5" x5-video-player-fullscreen="true" webkit-playsinline="true" playsinline="true"  x-webkit-airplay="true"></video>';
        this.$element.append(videoHtml);
        //渲染设置播放器
        $("#" + this.id + ' .MPlayer-video').css({
			'position': 'absolute',
            //'object-fit': 'fill',    //填充后视频会变形
            'top': this.options.top,
            'left': this.options.left,
            'width': this.options.width,
            'height': this.$element.width() / this.options.ratio,
            'z-index': this.options.zIndex       
        }).attr({
        	'controls': this.options.controls,
        	'src': this.options.src,            
            'poster': this.options.poster
        })

        //插入控件层
        var controlHtml = '<div class="MPlayer-control"></div>';
        !this.options.controls && this.$element.append(controlHtml);
        //播放暂停按钮
        var playPauseBtnHtml = '<div class="MPlayer-btn circle_inner_play"></div>';
		$("#" + this.id + ' .MPlayer-control').append(playPauseBtnHtml);
		//全屏按钮
        var fullScreenHtml = '<div class="full-btn full-screen"></div>';
        MPlayer.CONTROL_DEFAULTS.fullScreen && $("#" + this.id + ' .MPlayer-control').append(fullScreenHtml);
        //弹幕开关按钮
	    var switchDanmuHtml = '<div class="danmu-switch danmu-close"></div>';
	    MPlayer.DANMU_DEFAULTS.danmuSwitch && $("#" + this.id + ' .MPlayer-control').append(switchDanmuHtml);       
        //渲染设置播放器控件
        $("#" + this.id + ' .MPlayer-control').css({
        	'position': 'absolute',
        	'height': MPlayer.CONTROL_DEFAULTS.height,
        	'width': this.options.width,       	
        	'bottom': MPlayer.CONTROL_DEFAULTS.bottom,
        	'left': MPlayer.CONTROL_DEFAULTS.left,
        	'background-color': MPlayer.CONTROL_DEFAULTS.backgroundColor,
        	'font-size': MPlayer.CONTROL_DEFAULTS.fontSize,
        	'z-index': Number($("#" + this.id + " .MPlayer-video").css('z-index')) + 2
        })

        //插入弹幕层
        var danmuHtml = '<div class="MPlayer-danmu"></div>';
        MPlayer.DANMU_DEFAULTS.danmuSwitch && this.$element.append(danmuHtml);
        //渲染弹幕层
        $("#" + this.id + ' .MPlayer-danmu').css({
            'position': 'absolute',
            'overflow': 'hidden',
            'height': $("#" + this.id + " .MPlayer-video").height(),
            'width': $("#" + this.id + " .MPlayer-video").width(),
            'left': $("#" + this.id + " .MPlayer-video").css('left'),
            'top': $("#" + this.id + " .MPlayer-video").css('top'),                      
            'z-index': Number($("#" + this.id + " .MPlayer-video").css('z-index')) + 1
        })

        //更新组件高度
        $("#" + this.id).css('height', $("#" + this.id + ' .MPlayer-control').height() + $("#" + this.id + ' .MPlayer-video').height());

        //事件
        //播放暂停监听
        $("#" + this.id + " .MPlayer-video").bind({
            play: function () {
                $("#" + $this.id + ' .MPlayer-btn').removeClass('circle_inner_play').addClass('circle_inner_pause');
            	$("#" + $this.id + ' .MPlayer-loading').remove();                        	
            },
            pause: function () {
                $("#" + $this.id + ' .MPlayer-btn').removeClass('circle_inner_pause').addClass('circle_inner_play');           	
            }
        })
        //全屏滑动监听
        $(window).bind('touchmove', function (e) {
            if ($("#" + $this.id).hasClass('MPlayer-full-screen')) {
                e.preventDefault();
            }          
        })
        //横竖屏监听
        $(window).bind('orientationchange', function (e) {
            //全屏
            if ($("#" + $this.id).hasClass('MPlayer-full-screen')) {               
                if (window.orientation == 90 || window.orientation == -90) {
                    //横屏
                    $this.updateScreen('landscape-full');                
                } else if (window.orientation == 0 || window.orientation == 180) {
                    //竖屏
                    $this.updateScreen('portrait-full');
                 } 
            }          
        });
        //播放暂停
        $("#" + this.id + ' .MPlayer-btn,' + "#" + this.id + ' .MPlayer-video').on('click', function () {
            $this.playPause();
        })
        //播放等待
        $("#" + this.id + " .MPlayer-video").on('waiting',function () {
        	var videoLoadingZindex = Number(MPlayer.DEFAULTS.zIndex) + 3;
        	var videoLoadingHtml = '<div class="MPlayer-loading"><span style="z-index:' + videoLoadingZindex + ' class="spinner-loader"></span></div>';
        	$this.options.videoLoading && $("#" + $this.id).append(videoLoadingHtml);
        })
        //开启关闭弹幕
        $("#" + this.id + ' .danmu-switch').on('click', function () {
            $(this).toggleClass('danmu-close').toggleClass('danmu-open');
            if ($(this).hasClass('danmu-open')) {
				$("#" + $this.id + " .MPlayer-danmu").css('opacity',0);
				$this.$element.data('danmuSwitch',0);
            } else {
            	$("#" + $this.id + " .MPlayer-danmu").css('opacity','');
            	$this.$element.data('danmuSwitch',1);
            }
        })
        //全屏退出全屏
        $("#" + this.id + ' .full-btn').on('click', function () {
            $(this).toggleClass('full-screen').toggleClass('middle-screen');
            $this.$element.toggleClass('MPlayer-full-screen');            
            if ($this.$element.hasClass('MPlayer-full-screen')) {          
            	$this.updateScreen('portrait-full');
            } else {
            	$this.updateScreen('portrait-middle');
            }
        })
        //弹幕响应横屏全屏控件
        $("#" + $this.id + " .MPlayer-danmu").on('click',function () {
            if (window.orientation == 90 || window.orientation == -90) {
                if ($("#" + $this.id).hasClass('MPlayer-full-screen')) {
                   if ($("#" + $this.id + ' .MPlayer-control').css('display') == 'none') {
                        $("#" + $this.id + ' .MPlayer-control').css('display','block');
                        $this.$element.data('controlTime', (new Date()).getTime());
                        $this.updateControlTime('open');                          
                   } else {
                        $("#" + $this.id + ' .MPlayer-control').css('display','none');
                        $this.updateControlTime('close');                             
                   }                         
                }
            }       
        })
        //控件响应横屏全屏控件
        $("#" + $this.id + ' .MPlayer-control').on('click',function () {
            if (window.orientation == 90 || window.orientation == -90) {
                if ($("#" + $this.id).hasClass('MPlayer-full-screen')) {
                    $this.updateControlTime('close');
                    $this.$element.data('controlTime', (new Date()).getTime());
                    $this.updateControlTime('open'); 
                }
            }
        })
    }


    //API
    //设置控件层属性
    MPlayer.prototype.setAttr = function (arg) {
    	var elementClassName = {
        		'video': ' .MPlayer-video',
        		'controls': ' .MPlayer-control',
        		'danmu': ' .MPlayer-danmu'
        	}
        if (typeof arg == 'object') {
            for (var i in arg) {
            	if (elementClassName.hasOwnProperty(i) && typeof arg[i] == 'object') {
            		for (var j in arg[i]) {
            			$("#" + this.id + elementClassName[i]).attr(j, arg[i][j]);
            		}
            	} else {
            		throw new Error('(' + j + ')：参数格式错误[video|controls|danmu]');
            	}                
            }
        } else {
            throw new Error('(' + arg + ')：参数格式错误[object]');
        }
    };
    //视频播放暂停
    MPlayer.prototype.playPause = function (arg) {
        var playArg = ['play', 'pause'];
        if (typeof arg == 'string' && playArg.indexOf(arg) >= 0) {
            $("#" + this.id + " .MPlayer-video").trigger(arg);
        } else {
            $("#" + this.id + " .MPlayer-video").get(0).paused ? $("#" + this.id + " .MPlayer-video").trigger('play') : $("#" + this.id + " .MPlayer-video").trigger('pause');
        }
    };
    //添加弹幕列表
    MPlayer.prototype.addDanmu = function (arg) {
        if (typeof arg == 'object' && arg.length > 0) {
            this.newPointer++;
            this.danmuList[this.newPointer] = arg;
            if(!this.currentStatus) {
             	this.currentStatus = true;
             	this.$element.data('currentStatus',1);
             	this.displayDanmu();
            }
        }
    };
    //自定义或更新控件功能
 	MPlayer.prototype.addControl = function(arg) {
 		if (typeof arg == 'object') {
 			if (arg.length && arg.length > 0) {
 				for (var i = 0; i < arg.length; i++) {
 					if (arg[i].hasOwnProperty('id') && arg[i].hasOwnProperty('html')) {
 						var css = {};			
 						if ($("#" + this.id + " .MPlayer-control #" + arg[i]['id']).length > 0) {
 							css = $("#" + this.id + " .MPlayer-control #" + arg[i]['id']).attr('style');
 							css = css.replace(/;/g,',');
 							$("#" + this.id + " .MPlayer-control #" + arg[i]['id']).remove();
 						} 
 						css = arg[i].hasOwnProperty('css') ? arg[i]['css'] : css;
 						var customHtml = $(arg[i]['html']).attr('id') ? arg[i]['html'] : $(arg[i]['html']).attr('id',arg[i]['id']); 						
 						var customId = $(customHtml).attr('id');
 						$("#" + this.id + " .MPlayer-control").append(customHtml);
						$("#" + this.id + " .MPlayer-control #" + customId).css({'line-height':'40px','color':'#FFFFFF'}).css(css);				
 					} else {
 						throw new Error('参数格式错误:对象参数必须有[标签ID:id|标签:html]');
 					} 					
 				}
 			} else {
 				if (arg.hasOwnProperty('id') && arg.hasOwnProperty('html')) {
					var css = {};			
					if ($("#" + this.id + " .MPlayer-control #" + arg['id']).length > 0) {
						css = $("#" + this.id + " .MPlayer-control #" + arg['id']).attr('style');
						css = css.replace(/;/g,',');
						$("#" + this.id + " .MPlayer-control #" + arg['id']).remove();
					} 
					css = arg.hasOwnProperty('css') ? arg[i]['css'] : css;
					var customHtml = $(arg['html']).attr('id') ? arg['html'] : $(arg['html']).attr('id',arg['id']); 						
					var customId = $(customHtml).attr('id');
					$("#" + this.id + " .MPlayer-control").append(customHtml);
					$("#" + this.id + " .MPlayer-control #" + customId).css({'line-height':'40px','color':'#FFFFFF'}).css(css);				
				} else {
					throw new Error('参数格式错误:对象参数必须有[标签ID:id|标签:html]');
				} 
 			}
 		} else {
 			throw new Error('(' + arg + ')：参数格式错误[object]');
 		}
 	};
    //更新横竖屏宽高
    MPlayer.prototype.setScreen = function(direction) {
        this.updateScreen(direction);
    };


    //全局控件默认配置参数
    MPlayer.DEFAULTS = {
        left: 0,                         //视频距离盒子左侧距离
        top: 0,                          //视频距离盒子顶部距离
        width: '100%',                   //视频在盒子内显示宽度
        ratio: 16/9,                     //视频宽高比例
        zIndex: 100,                     //视频层优先级
        videoLoading: true,              //视频加载时等待层
        controls: false                  //视频原生控件
    };

    //控件层默认配置参数
    MPlayer.CONTROL_DEFAULTS = {
    	fullScreen: true,                 //控件全屏显示功能
        height: 40,                       //控件显示高度
        bottom: 0,                        //控件距离盒子底部距离
        left: 0,                          //控件距离盒子左侧距离
        backgroundColor: '#000000',       //控件背景颜色
        fontSize: 16                      //控件字体大小
    };

    //弹幕层默认配置参数
    MPlayer.DANMU_DEFAULTS = {
    	danmuSwitch: true,                 //弹幕显示功能
        maxRow: 3,                         //弹幕显示最大行数
        fontSize: 16,                      //弹幕默认字体大小
        fontColor: '#FFFFFF',              //弹幕弄人字体颜色
        speed: 4000,                       //弹幕滚动速度
        loop: false,                       //弹幕循环显示开关
        captionDefend:true,                //弹幕显示字幕保护开关
        bgColor: 'rgba(179,179,115,0.6)',  //弹幕背景颜色
        myBgColor: 'rgba(0,205,0,0.6)'     //弹幕个人背景颜色
    };

    //移动端播放器入口
    var MPlayerIndex = function (option, arg) {
        return this.each(function () {
  			var option_video = option.hasOwnProperty('video') ? option['video'] : false;
  			var option_controls = option.hasOwnProperty('controls') ? option['controls'] : false
  			var option_danmu = option.hasOwnProperty('danmu') ? option['danmu'] : false;
  			$.extend(MPlayer.CONTROL_DEFAULTS,typeof option_controls == 'object' && option_controls);
  			$.extend(MPlayer.DANMU_DEFAULTS,typeof option_danmu == 'object' && option_danmu);
            var options = $.extend({}, MPlayer.DEFAULTS, typeof option == 'object' && option_video);
            var MPlayerData = $(this).data('MPlayer');
            var action = typeof option == 'string' ? option : false;
            !MPlayerData && $(this).data('MPlayer', (MPlayerData = new MPlayer(this, options)));
            action && MPlayerData[action](arg);
        })
    }


    $.fn.MPlayer = MPlayerIndex;
    $.fn.MPlayer.Constructor = MPlayer;

})(jQuery)