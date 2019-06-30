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
                whRatio: 0,
            },
            controls: {
                defaultVideoOrientation: 'landscape',
                defaultDanmakuSwitch: true,
                defaultVoiceSwitch: true,
                defaultScreenFull: false,
                backgroundColor: '',
                showDanmakuBtn: true,
                showVoiceBtn: true,
                showScreenBtn: true,
                showPlaybackBtn: true,
                showReloadBtn: true,
            },
            danmaku: {
                maxRows: 3,
                maxLength: 30,
                speed: 0,
                easing: 'linear',
                loop: false,
                clearMemory: true,
                fontSize: 16,
                fontColor: '#FFF',
                backgroundColor: 'rgba(179,179,115,0.6)',
                myBackgroundColor: 'rgba(0,205,0,0.6)',
                filterKeyWords: [],
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
            danmakuListSize: 0,
            newPointer: -1,
            currentPointer: 0,
            danmakuState: false,
            danmakuSwitch: true,
            danmakuFilterRegExp: null,
        };

        if (this._isIOS()) {
            this.screen = {
                width: (window.orientation === 0 || window.orientation === 180 ? $(window).width() : screen.width),
                height: (window.orientation === 0 || window.orientation === 180 ? $(window).height() : screen.height - (screen.width - $(window).height())),
                toolBarHeight: (window.orientation === 0 || window.orientation === 180 ? screen.height - $(window).height() : screen.width - $(window).height())
            };
        } else {
            this.screen = {
                width: (window.orientation === 0 || window.orientation === 180 ? $(window).width() : screen.height),
                height: (window.orientation === 0 || window.orientation === 180 ? $(window).height() : screen.width - (screen.height - $(window).height())),
                toolBarHeight: (window.orientation === 0 || window.orientation === 180 ? screen.height - $(window).height() : screen.height - $(window).height())
            };
        }
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
            let danmakuList = this._filterDanmaku(options);
            this.danmaku.danmakuList[++this.danmaku.newPointer] = danmakuList;
            this.danmaku.danmakuListSize += danmakuList.length;
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

    operateLock(name, lock = false) {
        switch (name) {
            case 'voice':
                utils.isBoolean(lock) && lock ? $(this.id).find('.MPlayer-control-voice').css('pointer-events', 'none') : $(this.id).find('.MPlayer-control-voice').css('pointer-events', '');
                break;
            case 'danmaku':
                utils.isBoolean(lock) && lock ? $(this.id).find('.MPlayer-control-danmaku').css('pointer-events', 'none') : $(this.id).find('.MPlayer-control-danmaku').css('pointer-events', '');
                break;
            case 'screen':
                utils.isBoolean(lock) && lock ? $(this.id).find('.MPlayer-control-screen').css('pointer-events', 'none') : $(this.id).find('.MPlayer-control-screen').css('pointer-events', '');
                break;
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
        video.attr({
            'x5-video-player-type': 'h5',
            'x5-video-orientation': 'landscape|portrait',
            'webkit-playsinline': true,
            'playsinline': true,
            'x5-playsinline': true,
            'x-webkit-airplay': true,
            'x5-video-player-fullscreen': true,
            'x5-video-ignore-metadata': true,
            'controlslist': 'nodownload',
        });
        if (utils.isNumber(options.whRatio) && options.whRatio > 0) {
            $(this.configs.el).css('height', ($(this.configs.el).width() / options.whRatio) + (utils.isBoolean(options.controls) && options.controls ? 0 : $(this.id).find('.MPlayer-control').height()));
        }
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
            videoReload = $(this.id).find('.MPlayer-control-video-reload'),
            danmaku = $(this.id).find('.MPlayer-control-danmaku'),
            openDanmaku = $(this.id).find('.MPlayer-control-danmaku-open'),
            closeDanmaku = $(this.id).find('.MPlayer-control-danmaku-close'),
            voice = $(this.id).find('.MPlayer-control-voice'),
            openVoice = $(this.id).find('.MPlayer-control-voice-open'),
            closeVoice = $(this.id).find('.MPlayer-control-voice-close'),
            screen = $(this.id).find('.MPlayer-control-screen'),
            fullScreen = $(this.id).find('.MPlayer-control-screen-full'),
            middleScreen = $(this.id).find('.MPlayer-control-screen-middle'),
            playback = $(this.id).find('.MPlayer-control-playback'),
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
        if (utils.isBoolean(options.showScreenBtn) && !options.showScreenBtn) {
            screen.addClass('MPlayer-control-not-active');
        }
        if (utils.isBoolean(options.showPlaybackBtn) && !options.showPlaybackBtn) {
            playback.addClass('MPlayer-control-not-active');
        }
        if (utils.isBoolean(options.showDanmakuBtn) && !options.showDanmakuBtn) {
            danmaku.addClass('MPlayer-control-not-active');
        }
        if (utils.isBoolean(options.showVoiceBtn) && !options.showVoiceBtn) {
            voice.addClass('MPlayer-control-not-active');
        }
        if (utils.isBoolean(options.showReloadBtn) && !options.showReloadBtn) {
            videoReload.addClass('MPlayer-control-not-active');
        }

        controlMiddle.css({width: control.width() - controlLeft.width() - controlRight.width() - 3});
    }

    _renderDanmaku(options = {}) {
        let maxRows = Math.floor($(this.id).find('.MPlayer-player-danmaku').height() / ((options.fontSize || 16) + 10));
        this.configs.danmaku.maxRows = utils.isNumber(options.maxRows) && Math.abs(options.maxRows) < maxRows ? Math.abs(options.maxRows) : maxRows;
        this.configs.danmaku.speed = utils.isNumber(options.speed) && Math.abs(options.speed) > 0 ? Math.abs(options.speed) : $(this.id).width() / 0.2;
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
            middleScreen = $(this.id).find('.MPlayer-control-screen-middle'),
            playback = $(this.id).find('.MPlayer-control-playback');

        // click state btn
        state[0].addEventListener('click', function () {
            if (video[0].paused) {
                video[0].play();
            } else {
                if (state.hasClass('MPlayer-player-state-pause')) {
                    video[0].pause();
                } else {
                    clearTimeout(state.data('MPlayer-state-timer'));
                    state.removeClass('MPlayer-player-state-play').addClass('MPlayer-player-state-pause');
                    state.data('MPlayer-state-timer', setTimeout(function () {
                        state.removeClass('MPlayer-player-state-pause');
                    }, 3000));
                }
            }
        });

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

            clearTimeout(state.data('MPlayer-state-timer'));
            state.removeClass('MPlayer-player-state-play').addClass('MPlayer-player-state-pause');
            state.data('MPlayer-state-timer', setTimeout(function () {
                state.removeClass('MPlayer-player-state-pause');
            }, 3000));
        }, false);

        // video on pause
        video[0].addEventListener('pause', function () {
            pause.addClass('MPlayer-control-not-active');
            play.removeClass('MPlayer-control-not-active');

            clearTimeout(state.data('MPlayer-state-timer'));
            state.removeClass('MPlayer-player-state-pause').addClass('MPlayer-player-state-play');
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

        //click danmaku layer
        danmaku[0].addEventListener('click', function () {
            if (video.get(0).controls) {
                video[0].paused ? video[0].play() : video[0].pause();
            }
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
            clearInterval(control.data('MPlayer-control-timer'));
            control.show();
            middleScreen.addClass('MPlayer-control-not-active');
            fullScreen.removeClass('MPlayer-control-not-active');

            that._updateScreen('portrait-middle');
        }, false);

        // click player layer
        player[0].addEventListener('click', function () {
            if (fullScreen.hasClass('MPlayer-control-not-active')) {
                if (control.is(':hidden')) {
                    control.show() && control.data('MPlayer-control-timer', setTimeout(function () {
                        control.hide();
                    }, 3000));
                } else {
                    control.hide() && clearInterval(control.data('MPlayer-control-timer'));
                }
            }
        }, false);

        // click playback btn
        playback.each(function (index, item) {
            item.addEventListener('click', function () {
                for (let i = 0; i < playback.length; i++) {
                    if (Number(this.dataset.target) === i) {
                        $(playback[i]).removeClass('MPlayer-control-not-active');
                    } else {
                        $(playback[i]).addClass('MPlayer-control-not-active');
                    }
                }
                video.get(0)['playbackRate'] = Number(this.dataset.rate);
            }, false);
        });

        // listen screen change
        window.addEventListener("orientationchange", function (e) {
            if (video.data('orientation') !== 'portrait') {
                if (window.orientation === 90 || window.orientation === -90) {
                    fullScreen.hasClass('MPlayer-control-not-active') && that._updateScreen('landscape-full');
                } else if (window.orientation === 0 || window.orientation === 180) {
                    fullScreen.hasClass('MPlayer-control-not-active') && that._updateScreen('portrait-full');
                }
            }
        }, false);

        // listen screen size change
        ['fullscreenchange', 'mozfullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'].forEach(function (event) {
            document.addEventListener(event, function (e) {
                if (!that._isFullScreen()) {
                    that.controlScreen('middle');
                }
            }, false);
        });

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

    _isIOS() {
        let ua = navigator.userAgent.toLowerCase();
        return /iphone|ipad|ipod/.test(ua);
    }

    _isPc() {
        let ua = navigator.userAgent;
        return !/Android|webOS|iPhone|iPod|BlackBerry/i.test(ua);
    }

    _isFullScreen() {
        return document.webkitIsFullScreen || document.fullscreenElement;
    }

    _pcEnterFullScreen(element) {
        let requestMethod = element.requestFullScreen ||
            element.webkitRequestFullScreen ||
            element.mozRequestFullScreen ||
            element.msRequestFullScreen;
        if (requestMethod) {
            requestMethod.call(element);
        } else if (typeof window.ActiveXObject !== "undefined") {
            let wscript = new ActiveXObject("WScript.Shell");
            if (wscript !== null) {
                wscript.SendKeys("{F11}");
            }
        }
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
                    top: (this.screen.height - $(this.configs.el).height() - $(this.id).find('.MPlayer-control').height()) / 2
                });
                this._isPc() && this._pcEnterFullScreen($(this.id).find('video').get(0));
                break;
            case 'landscape-full':
                $(this.id).addClass('MPlayer-fullScreen');
                $(this.id).find('.MPlayer-player').css({
                    height: (this._isIOS() ? this.screen.width - this.screen.toolBarHeight : this.screen.width),
                    top: 0
                });
                this._isPc() && this._pcEnterFullScreen($(this.id).find('video').get(0));
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
            this.log(`round: ${this.danmaku.currentPointer} starting...`);
            let currentDanmakuList = this.danmaku.danmakuList[this.danmaku.currentPointer];
            utils.isBoolean(this.configs.danmaku.clearMemory) && this.configs.danmaku.clearMemory && delete this.danmaku.danmakuList[this.danmaku.currentPointer] && (this.danmaku.danmakuListSize -= currentDanmakuList.length);
            let run = (i) => {
                if (i < currentDanmakuList.length) {
                    this.log(`point: ${i} running...`);
                    let danmakuRowID = [];
                    for (let j = 0, k = 1; this.danmaku.danmakuSwitch && j < this.configs.danmaku.maxRows && i + j < currentDanmakuList.length; j++, k++) {
                        this.log(`order: ${i + k}`);
                        danmakuRowID[j] = utils.getUniqueID();
                        setTimeout(() => {
                            let danmakuRow = `<span class="MPlayer-player-danmaku-row" id="MPlayer-player-danmaku-row-${danmakuRowID[j]}"></span>`;
                            $(this.id).find('.MPlayer-player-danmaku').append(danmakuRow);

                            let operateDanmakuRow = $(this.id).find('#MPlayer-player-danmaku-row-' + danmakuRowID[j]);

                            if (currentDanmakuList[i + j]['name']) {
                                operateDanmakuRow.text(currentDanmakuList[i + j]['name'] + '：');
                            }
                            if (this.configs.danmaku.maxLength && utils.isNumber(this.configs.danmaku.maxLength)) {
                                currentDanmakuList[i + j]['text'] = (currentDanmakuList[i + j]['text'] + '').length <= this.configs.danmaku.maxLength ? currentDanmakuList[i + j]['text'] : (currentDanmakuList[i + j]['text'] + '').substr(0, Math.abs(this.configs.danmaku.maxLength)) + '...';
                            }

                            operateDanmakuRow.append(currentDanmakuList[i + j]['text']).css({
                                'color': currentDanmakuList[i + j]['fontColor'] || this.configs.danmaku.fontColor,
                                'font-size': this.configs.danmaku.fontSize,
                                'background-color': currentDanmakuList[i + j]['isMe'] && this.configs.danmaku.myBackgroundColor ? this.configs.danmaku.myBackgroundColor : this.configs.danmaku.backgroundColor,
                            });

                            let operateDanmakuRowHeight = operateDanmakuRow.height();

                            operateDanmakuRow.css({
                                'top': (operateDanmakuRowHeight * j) + (j * 5),
                                'line-height': operateDanmakuRowHeight + 'px',
                            });
                            if (currentDanmakuList[i + j]['img']) {
                                $(this.id).find('#MPlayer-player-danmaku-row-' + danmakuRowID[j]).prepend(`<img style="height: ${operateDanmakuRowHeight}px;width: ${operateDanmakuRowHeight}px;" src="${currentDanmakuList[i + j]['img']}">`);
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