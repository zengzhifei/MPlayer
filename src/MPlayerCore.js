import utils from "./utils.js";
import tplMPlayer from "./html/MPlayer.html";
import './css/MPlayer.less';

class MPlayerCore {
    constructor(id) {
        this.id = id;
        this.configs = {
            el: '',
            debug: false,
            video: {
                autoplay: false,
                controls: false,
                loop: false,
                preload: false,
                src: '',
                poster: '',
                currentTime: 0,
            },
            controls: {
                defaultVideoOrientation: 'landscape',
                defaultDanmakuSwitch: true,
                defaultVoiceSwitch: true,
                defaultScreenFull: false,
                backgroundColor: '',
            },
            danmaku: {
                maxRows: 3,
                maxLength: 30,
                speed: document.documentElement.clientWidth / 0.2,
                easing: 'linear',
                loop: false,
                fontSize: 16,
                fontColor: '#FFF',
                backgroundColor: 'rgba(179,179,115,0.6)',
                myBackgroundColor: 'rgba(0,205,0,0.6)',
                filterKeyWords: []
            }
        };

        this.extends = {
            'comment': ['icon-1', 'icon-2'],
            'collect': ['icon-1', 'icon-2'],
            'hits': ['icon-1', 'icon-2'],
            'upvote': ['icon-1', 'icon-2'],
            'live': ['icon-1', 'icon-2'],
        };

        this.extendsFn = {};

        this.danmaku = {
            danmakuList: [],
            newPointer: -1,
            currentPointer: 0,
            danmakuState: false,
            danmakuSwitch: true,
            danmakuFilterRegExp: null,
        };
    }

    log(message) {
        utils.isBoolean(this.configs.debug) && this.configs.debug && console.log(message);
    }

    initPlayer(options) {
        $.extend(true, this.configs, options);

        $(this.configs.el).append(tplMPlayer).children('.MPlayer:last').attr('id', this.id.slice(1));

        this._bindEvents();
        this._render();
    }

    addDanmaku(options) {
        if (this.danmaku.danmakuSwitch && utils.isArray(options) && options.length) {
            this.danmaku.danmakuList[++this.danmaku.newPointer] = this._filterDanmaku(options);
            if (!this.danmaku.danmakuState) {
                this.danmaku.danmakuState = true;
                this._runDanmaku();
            }
        }
    }

    extend(type = null, icon = null, fn = null) {
        if (utils.isString(type) && this.extends.hasOwnProperty(type)) {
            let extend = $(this.id).find('.MPlayer-control-middle').find('.MPlayer-control-custom-' + type);
            if (utils.isString(icon) && this.extends[type].indexOf(icon) !== -1) {
                if (this.extendsFn.hasOwnProperty(type)) {
                    extend.removeClass('MPlayer-control-custom-' + type + '-' + this.extendsFn[type].icon);
                } else {
                    this.extendsFn[type] = {};
                }
                this.extendsFn[type].icon = icon;
                extend.addClass('MPlayer-control-custom-' + type + '-' + icon);
                fn && utils.isFunction(fn) && (extend[0].onclick = fn);

                extend.parent().removeClass('MPlayer-control-not-active');

                return extend.siblings('.MPlayer-control-custom-desc').get(0);
            } else {
                extend.parent().addClass('MPlayer-control-not-active');
            }
        } else if (utils.isNull(type)) {
            return this.extends;
        }
    }

    addExtender(icon, fn = null) {
        let custom = $(this.id).find('.MPlayer-control-middle');
        let customHtml = [];
        customHtml.push('<div class="MPlayer-control-custom">');
        icon && utils.isString(icon) && customHtml.push(`<div class="MPlayer-control-custom-icon" style="background: url(${icon}) no-repeat 0"></div>`);
        customHtml.push('<div class="MPlayer-control-custom-desc"></div>');
        customHtml.push('</div>');

        custom.append(customHtml.join(''));
        if (icon && fn && utils.isString(icon) && utils.isFunction(fn)) {
            custom.find('.MPlayer-control-custom:last').find('.MPlayer-control-custom-icon').get(0).addEventListener('click', fn, false);
        }

        return custom.find('.MPlayer-control-custom:last').find('.MPlayer-control-custom-desc').get(0);
    }

    on(event, fn = null) {
        let video = $(this.id).find('.MPlayer-player-video');
        if (event && utils.isString(event) && !utils.isNull(fn)) {
            video[0].addEventListener(event, fn, false);
        } else if (event && utils.isObject(event)) {
            for (let eventName in event) {
                if (event.hasOwnProperty(eventName)) {
                    video[0].addEventListener(eventName, event[eventName], false);
                }
            }
        }
    }

    setConfig(name, value = null) {
        if (name && utils.isString(name) && this.configs.hasOwnProperty(name)) {
            $.extend(true, this.configs[name], value);
        } else if (name && utils.isObject(name)) {
            $.extend(true, this.configs, name);
        } else {
            return false;
        }
        this._render();
    }

    controlVideo(status) {
        switch (status) {
            case 'play':
                $(this.id).find('.MPlayer-control-video-play').trigger('click');
                break;
            case 'pause':
                $(this.id).find('.MPlayer-control-video-pause').trigger('click');
                break;
            case 'reload':
                $(this.id).find('.MPlayer-control-video-reload').trigger('click');
                break;
        }
    }

    controlVoice(status) {
        switch (status) {
            case 'open':
                $(this.id).find('.MPlayer-control-voice-close').trigger('click');
                break;
            case 'close':
                $(this.id).find('.MPlayer-control-voice-open').trigger('click');
                break;
        }
    }

    controlDanmaku(status) {
        switch (status) {
            case 'open':
                $(this.id).find('.MPlayer-control-danmaku-close').trigger('click');
                break;
            case 'close':
                $(this.id).find('.MPlayer-control-danmaku-open').trigger('click');
                break;
        }
    }

    controlScreen(status) {
        switch (status) {
            case 'full':
                $(this.id).find('.MPlayer-control-screen-full').trigger('click');
                break;
            case 'middle':
                $(this.id).find('.MPlayer-control-screen-middle').trigger('click');
                break;
        }
    }

    operateVideo(name, value = null) {
        if (name && utils.isString(name)) {
            let video = $(this.id).find('.MPlayer-player-video');
            return utils.isNull(value) ? video.get(0)[name] : video.get(0)[name] = value;
        }
    }

    _render() {
        if (utils.isObject(this.configs.video)) {
            this._renderVideo(this.configs.video);
        }
        if (utils.isObject(this.configs.controls)) {
            this._renderControls(this.configs.controls);
        }
        if (utils.isObject(this.configs.danmaku)) {
            this._renderDanmaku(this.configs.danmaku);
        }
    }

    _renderVideo(options = {}) {
        let video = $(this.id).find('.MPlayer-player-video');
        this._isWeChat() && video.attr({
            'x5-video-player-type': 'h5',
            'x5-video-orientation': 'landscape|portrait',
            'webkit-playsinline': true,
            'playsinline': true,
            'x5-playsinline': true,
            'x-webkit-airplay': true,
            'x5-video-player-fullscreen': true,
            'x5-video-ignore-metadata': true,
        });
        if (video[0].paused) {
            video.attr(options);
        } else {
            $(this.id).find('.MPlayer-control-video-pause').trigger('click');
            video.attr(options);
            $(this.id).find('.MPlayer-control-video-play').trigger('click');
        }
    }

    _renderControls(options = {}) {
        let video = $(this.id).find('.MPlayer-player-video'),
            openDanmaku = $(this.id).find('.MPlayer-control-danmaku-open'),
            closeDanmaku = $(this.id).find('.MPlayer-control-danmaku-close'),
            openVoice = $(this.id).find('.MPlayer-control-voice-open'),
            closeVoice = $(this.id).find('.MPlayer-control-voice-close'),
            fullScreen = $(this.id).find('.MPlayer-control-screen-full'),
            middleScreen = $(this.id).find('.MPlayer-control-screen-middle'),
            control = $(this.id).find('.MPlayer-control'),
            controlLeft = $(this.id).find('.MPlayer-control-left'),
            controlMiddle = $(this.id).find('.MPlayer-control-middle'),
            controlRight = $(this.id).find('.MPlayer-control-right');

        controlMiddle.css({width: control.width() - controlLeft.width() - controlRight.width() - 3});

        if (video.get(0).controls) {
            $(this.id).addClass('MPlayer-default');
        } else {
            $(this.id).removeClass('MPlayer-default');
        }
        if (options.defaultVideoOrientation === 'portrait') {
            options.defaultScreenFull = true;
            video.data('orientation', 'portrait');
        } else {
            video.data('orientation', 'landscape');
        }
        if (utils.isBoolean(options.defaultScreenFull) && options.defaultScreenFull) {
            fullScreen.trigger('click');
        } else {
            middleScreen.trigger('click');
        }
        if (utils.isBoolean(options.defaultDanmakuSwitch) && !options.defaultDanmakuSwitch) {
            openDanmaku.trigger('click');
        } else {
            closeDanmaku.trigger('click');
        }
        if (utils.isBoolean(options.defaultVoiceSwitch) && !options.defaultVoiceSwitch) {
            openVoice.trigger('click');
        } else {
            closeVoice.trigger('click');
        }
        if (utils.isString(options.backgroundColor) && options.backgroundColor) {
            control.css({backgroundColor: options.backgroundColor});
        }
    }

    _renderDanmaku(options = {}) {
        let maxRows = Math.floor($(this.id).find('.MPlayer-player-danmaku').height() / ((options.fontSize || 16) + 10));
        this.configs.danmaku.maxRows = utils.isNumber(options.maxRows) && Math.abs(options.maxRows) < maxRows ? Math.abs(options.maxRows) : maxRows;
        this.danmaku.danmakuFilterRegExp = utils.isArray(options.filterKeyWords) && options.filterKeyWords.length ? new RegExp(options.filterKeyWords.join('|')) : null;
    }

    _bindEvents() {
        let that = this,
            player = $(this.id).find('.MPlayer-player'),
            video = $(this.id).find('.MPlayer-player-video'),
            danmaku = $(this.id).find('.MPlayer-player-danmaku'),
            state = $(this.id).find('.MPlayer-player-state'),
            control = $(this.id).find('.MPlayer-control'),
            play = $(this.id).find('.MPlayer-control-video-play'),
            pause = $(this.id).find('.MPlayer-control-video-pause'),
            reload = $(this.id).find('.MPlayer-control-video-reload'),
            openVoice = $(this.id).find('.MPlayer-control-voice-open'),
            closeVoice = $(this.id).find('.MPlayer-control-voice-close'),
            openDanmaku = $(this.id).find('.MPlayer-control-danmaku-open'),
            closeDanmaku = $(this.id).find('.MPlayer-control-danmaku-close'),
            fullScreen = $(this.id).find('.MPlayer-control-screen-full'),
            middleScreen = $(this.id).find('.MPlayer-control-screen-middle');

        // click state btn
        player[0].addEventListener('click', function (e) {
            video[0].paused ? video[0].play() : (state.is(":hidden") ? state.stop(true).show().delay(3000).fadeOut() : video[0].pause());
        }, false);

        // click video play btn
        play[0].addEventListener('click', function () {
            video[0].play();
        }, false);

        // click video pause btn
        pause[0].addEventListener('click', function () {
            video[0].pause();
        }, false);

        // click video reload btn
        reload[0].addEventListener('click', function () {
            video[0].load();
            video[0].play();
        }, false);

        // video on play
        video[0].addEventListener('play', function () {
            play.addClass('MPlayer-control-not-active');
            pause.removeClass('MPlayer-control-not-active');
            state.removeClass('MPlayer-player-state-play').addClass('MPlayer-player-state-pause').delay(3000).fadeOut();
        }, false);

        // video on pause
        video[0].addEventListener('pause', function () {
            pause.addClass('MPlayer-control-not-active');
            play.removeClass('MPlayer-control-not-active');
            state.removeClass('MPlayer-player-state-pause').addClass('MPlayer-player-state-play').stop(true).show();
        }, false);

        // click voice open btn
        openVoice[0].addEventListener('click', function () {
            openVoice.addClass('MPlayer-control-not-active');
            closeVoice.removeClass('MPlayer-control-not-active');

            that._controlVoice(true);
        }, false);

        // click voice close btn
        closeVoice[0].addEventListener('click', function () {
            closeVoice.addClass('MPlayer-control-not-active');
            openVoice.removeClass('MPlayer-control-not-active');

            that._controlVoice(false);
        }, false);

        // click danmaku open btn
        openDanmaku[0].addEventListener('click', function () {
            openDanmaku.addClass('MPlayer-control-not-active');
            closeDanmaku.removeClass('MPlayer-control-not-active');

            that._controlDanmaku(false);
        }, false);

        // click danmaku close btn
        closeDanmaku[0].addEventListener('click', function () {
            closeDanmaku.addClass('MPlayer-control-not-active');
            openDanmaku.removeClass('MPlayer-control-not-active');

            that._controlDanmaku(true);
        }, false);

        // click full screen btn
        fullScreen[0].addEventListener('click', function () {
            if (video.data('orientation') === 'portrait') {
                control.hide();
                fullScreen.addClass('MPlayer-control-not-active');
                middleScreen.addClass('MPlayer-control-not-active');
                that._updateScreen('landscape-full');
            } else {
                control.hide();
                fullScreen.addClass('MPlayer-control-not-active');
                middleScreen.removeClass('MPlayer-control-not-active');
                that._updateScreen('portrait-full');
            }
        }, false);

        // click middle screen btn
        middleScreen[0].addEventListener('click', function () {
            clearInterval(control.data('controlTimer'));
            control.show();
            middleScreen.addClass('MPlayer-control-not-active');
            fullScreen.removeClass('MPlayer-control-not-active');

            that._updateScreen('portrait-middle');
        }, false);

        // click player layer
        player[0].addEventListener('click', function () {
            if (fullScreen.hasClass('MPlayer-control-not-active')) {
                if (control.is(':hidden')) {
                    control.show() && control.data('controlTimer', setTimeout(function () {
                        control.hide();
                    }, 3000));
                } else {
                    control.hide() && clearInterval(control.data('controlTimer'));
                }
            }
        }, false);

        // listen screen change
        window.addEventListener("orientationchange", function () {
            if (video.data('orientation') !== 'portrait') {
                if (window.orientation === 90 || window.orientation === -90) {
                    fullScreen.hasClass('MPlayer-control-not-active') && that._updateScreen('landscape-full');
                } else if (window.orientation === 0 || window.orientation === 180) {
                    fullScreen.hasClass('MPlayer-control-not-active') && that._updateScreen('portrait-full');
                }
            }
        }, false);

        // listen x5 enter full screen
        video[0].addEventListener('x5videoenterfullscreen', function () {
            // todo
        }, false);

        // listen x5 exit full screen
        video[0].addEventListener('x5videoexitfullscreen', function () {
            // todo
        }, false);
    }

    _isWeChat() {
        let ua = navigator.userAgent.toLowerCase();
        return ua.indexOf('micromessenger') > -1;
    }

    _controlVoice(muted = true) {
        $(this.id).find('.MPlayer-player-video').get(0).muted = muted;
    }

    _controlDanmaku(danmakuSwitch = true) {
        if (danmakuSwitch) {
            this.danmaku.danmakuSwitch = true;
            $(this.id).find('.MPlayer-player-danmaku').show();
        } else {
            this.danmaku.danmakuSwitch = false;
            this.danmaku.danmakuState = false;
            this.danmaku.currentPointer = 0;
            this.danmaku.newPointer = -1;
            this.danmaku.danmakuList = [];
            $(this.id).find('.MPlayer-player-danmaku').empty().hide();
        }
    }

    _updateScreen(direction = 'portrait-full') {
        switch (direction.toLowerCase()) {
            case 'portrait-middle':
                $(this.id).removeClass('MPlayer-fullScreen');
                $(this.id).find('.MPlayer-player').css({
                    height: $(this.configs.el).height() - $(this.id).find('.MPlayer-control').height(),
                    top: 0
                });
                break;
            case 'portrait-full':
                $(this.id).addClass('MPlayer-fullScreen');
                $(this.id).find('.MPlayer-player').css({
                    height: $(this.configs.el).height() - $(this.id).find('.MPlayer-control').height(),
                    top: (screen.height - $(this.configs.el).height() - $(this.id).find('.MPlayer-control').height()) / 2
                });
                break;
            case 'landscape-full':
                $(this.id).addClass('MPlayer-fullScreen');
                $(this.id).find('.MPlayer-player').css({
                    height: screen.height,
                    top: 0
                });
                break;
        }
    }

    _filterDanmaku(options = []) {
        let danmaku = [];
        if (this.danmaku.danmakuFilterRegExp) {
            for (let i = 0, len = options.length; i < len; i++) {
                if (!(options[i].hasOwnProperty('name') && options[i].name.match(this.danmaku.danmakuFilterRegExp)) &&
                    !(options[i].hasOwnProperty('text') && options[i].text.match(this.danmaku.danmakuFilterRegExp))
                ) {
                    danmaku.push(options[i]);
                }
            }
        } else {
            danmaku = options;
        }
        return danmaku;
    }

    _runDanmaku() {
        if (this.danmaku.currentPointer <= this.danmaku.newPointer) {
            this.log(`第${this.danmaku.currentPointer}轮开始`);
            let currentDanmakuList = this.danmaku.danmakuList[this.danmaku.currentPointer];
            let run = (i) => {
                if (i < currentDanmakuList.length) {
                    this.log(`内部指针:${i}`);
                    let danmakuRowID = [];
                    for (let j = 0, k = 1; this.danmaku.danmakuSwitch && j < this.configs.danmaku.maxRows && i + j < currentDanmakuList.length; j++, k++) {
                        this.log(`第${i + k}条`);
                        danmakuRowID[j] = utils.getUniqueID();
                        setTimeout(() => {
                            let danmakuRow = `<span class="MPlayer-player-danmaku-row" id="MPlayer-player-danmaku-row-${danmakuRowID[j]}"></span>`;
                            $(this.id).find('.MPlayer-player-danmaku').append(danmakuRow);

                            if (currentDanmakuList[i + j]['name']) {
                                $(this.id).find('#MPlayer-player-danmaku-row-' + danmakuRowID[j]).text(currentDanmakuList[i + j]['name'] + '：');
                            }

                            if (this.configs.danmaku.maxLength && utils.isNumber(this.configs.danmaku.maxLength)) {
                                currentDanmakuList[i + j]['text'] = (currentDanmakuList[i + j]['text'] + '').substr(0, Math.abs(this.configs.danmaku.maxLength));
                            }
                            $(this.id).find('#MPlayer-player-danmaku-row-' + danmakuRowID[j]).append(currentDanmakuList[i + j]['text']).css({
                                'color': currentDanmakuList[i + j]['fontColor'] || this.configs.danmaku.fontColor,
                                'font-size': this.configs.danmaku.fontSize,
                                'background-color': currentDanmakuList[i + j]['isMe'] && this.configs.danmaku.myBackgroundColor ? this.configs.danmaku.myBackgroundColor : this.configs.danmaku.backgroundColor,
                            }).css({
                                'top': ($(this.id).find('#MPlayer-player-danmaku-row-' + danmakuRowID[j]).height() * j) + (j * 5),
                                'line-height': $(this.id).find('#MPlayer-player-danmaku-row-' + danmakuRowID[j]).height() + 'px',
                            });

                            if (currentDanmakuList[i + j]['img']) {
                                let danmakuRowHeight = $(this.id).find('#MPlayer-player-danmaku-row-' + danmakuRowID[j]).height();
                                $(this.id).find('#MPlayer-player-danmaku-row-' + danmakuRowID[j]).prepend(`<img style="height: ${danmakuRowHeight}px;width: ${danmakuRowHeight}px;" src="${currentDanmakuList[i + j]['img']}">`);
                            }

                            let speedRatio = ($(this.id).find('.MPlayer-player-danmaku').width() + $(this.id).find('#MPlayer-player-danmaku-row-' + danmakuRowID[j]).width()) / $(this.id).find('.MPlayer-player-danmaku').width();
                            $(this.id).find('#MPlayer-player-danmaku-row-' + danmakuRowID[j]).animate({
                                left: -$(this.id).find('#MPlayer-player-danmaku-row-' + danmakuRowID[j]).width() - 5
                            }, (this.configs.danmaku.speed || 4000) * speedRatio, this.configs.danmaku.easing, function () {
                                $(this).remove();
                            });

                            if ((k >= this.configs.danmaku.maxRows) || (i + k >= currentDanmakuList.length)) {
                                let maxDanmakuWidthObj = $(this.id).find('#MPlayer-player-danmaku-row-' + danmakuRowID[0]),
                                    danmakuWidth = $(this.id).find('.MPlayer-player-danmaku').width();
                                for (let m = 1; m < danmakuRowID.length; m++) {
                                    maxDanmakuWidthObj = maxDanmakuWidthObj.width() > $(this.id).find('#MPlayer-player-danmaku-row-' + danmakuRowID[m]).width() ? maxDanmakuWidthObj : $(this.id).find('#MPlayer-player-danmaku-row-' + danmakuRowID[m]);
                                }
                                let danmakuTimer = setInterval(() => {
                                    let nowPositionLeft = maxDanmakuWidthObj.css('left').replace(/px/ig, ''),
                                        nowPosition = Number(nowPositionLeft) + Number(maxDanmakuWidthObj.width());
                                    if (nowPosition / danmakuWidth <= 0.8) {
                                        clearInterval(danmakuTimer);
                                        if (i + k >= currentDanmakuList.length) {
                                            this.danmaku.currentPointer++;
                                            this._runDanmaku();
                                        } else {
                                            run(i + this.configs.danmaku.maxRows);
                                        }
                                    }
                                }, 100);
                            }
                        }, j * 200);
                    }
                }
            };
            run(0);
        } else {
            if (utils.isBoolean(this.configs.danmaku.loop) && this.configs.danmaku.loop) {
                this.danmaku.currentPointer = 0;
                this._runDanmaku();
            } else {
                this.danmaku.danmakuState = false;
            }
        }
    }
}

export default MPlayerCore;