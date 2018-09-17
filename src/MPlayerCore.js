import utils from "./utils.js";
import tplMPlayer from "./html/MPlayer.html";
import './css/MPlayer.less';

let mPlayerCore = new class MPlayerCore {
    constructor() {
        this.root = null;
        this.MPlayer_ID = '#MPlayer';
        this.configs = {
            el: '',
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
                defaultVideoSwitch: false,
                defaultDanmakuSwitch: true,
                defaultVoiceSwitch: true,
                defaultScreenFull: false,
                backgroundColor: '',
            },
            danmaku: {
                fontSize: 16,
                maxRow: 3,
            }
        };

        this.icons = {
            'comment': ['icon-1', 'icon-2'],
            'collect': ['icon-1', 'icon-2'],
            'hits': ['icon-1', 'icon-2'],
            'upvote': ['icon-1', 'icon-2'],
            'live': ['icon-1', 'icon-2'],
        };

        this.iconsEvent = {};

        this.danmaku = {
            danmakuList: [],
            newPointer: -1,
            currentPointer: 0,
            danmakuSwitch: this.configs.controls.defaultDanmakuSwitch,
            danmakuState: false,
        };

        this.client = {
            height: document.documentElement.clientHeight,
            width: document.documentElement.clientWidth,
            ratio: document.documentElement.clientHeight / document.documentElement.clientWidth
        };
    }

    initPlayer(options) {
        if (!this.root && utils.isString(options.el) && (this.root = document.querySelector(options.el))) {
            utils.mergeObject(mPlayerCore.configs, options);

            let playerObj = document.createElement('div');
            playerObj.innerHTML = tplMPlayer;
            this.root.appendChild(playerObj.children[0]);
        } else {
            return false;
        }

        this._bindEvents();
        this._render();
        this._display();
    }

    setOptions(name, value) {
        if (utils.isObject(name)) {
            utils.mergeObject(this.configs, name);
        } else if (utils.isString(name)) {
            if (utils.isObject(this.configs[name]) && utils.isObject(value)) {
                utils.mergeObject(this.configs[name], value);
            } else {
                this.configs[name] = value;
            }
        }

        this._render();
    }

    addDanmaku(options) {
        if (utils.isArray(options) && options.length) {
            this.danmaku.newPointer++;
            if (!this.danmaku.danmakuState) {
                this.danmaku.danmakuState = true;
                this._displayDanmaku();
            }
        }
    }

    setExtension(iconType, iconClass = null, iconEvent) {
        if (utils.isString(iconType) && this.icons.hasOwnProperty(iconType)) {
            let custom = document.querySelector('.MPlayer-control-custom-' + iconType);
            if (utils.isString(iconClass) && this.icons[iconType].indexOf(iconClass) !== -1) {
                this.iconsEvent.hasOwnProperty(iconType) ? custom.classList.remove(this.iconsEvent[iconType].iconClass) : this.iconsEvent[iconType] = {};
                this.iconsEvent[iconType].iconClass = iconClass;
                custom.classList.add('MPlayer-control-custom-' + iconType + '-' + iconClass);

                this.iconsEvent.hasOwnProperty(iconType) && this.iconsEvent[iconType].iconEvent ? custom.removeEventListener('click', this.iconsEvent[iconType].iconEvent, false) : this.iconsEvent[iconType].iconEvent = iconEvent;
                iconEvent && (utils.isFunction(iconEvent) || utils.isString(iconEvent)) && custom.addEventListener('click', iconEvent, false);

                custom.parentNode.style.display = 'table';

                return custom.nextElementSibling;
            } else {
                custom.parentElement.style.display = 'none';
            }
        }
    }

    addExtension(icon, iconEvent) {
        let iconHtml = [];
        iconHtml.push('<div class="MPlayer-control-custom">');
        icon && utils.isString(icon) && iconHtml.push('<div class="MPlayer-control-custom-icon"></div>');
        iconHtml.push('<div class="MPlayer-control-custom-desc"></div></div>');
        iconHtml = iconHtml.join('');

        let controlMiddle = document.querySelector('.MPlayer-control-middle');
        let tempObj = document.createElement('div');
        tempObj.innerHTML = iconHtml;
        controlMiddle.appendChild(tempObj.children[0]);

        if (icon && utils.isString(icon)) {
            controlMiddle.lastChild.firstChild.style.background = 'url(' + icon + ') no-repeat 0';
            (utils.isFunction(iconEvent) || utils.isString(iconEvent)) && controlMiddle.lastChild.firstChild.addEventListener('click', iconEvent, false);
        }

        controlMiddle.lastChild.style.display = 'table';

        return controlMiddle.lastChild.lastChild;
    }

    on(eventName, event = null) {
        let events = {};
        let video = document.querySelector('.MPlayer-player-video');

        if (utils.isString(eventName) && !utils.isNull(event)) {
            events[eventName] = event;
        } else if (utils.isObject(eventName)) {
            events = eventName;
        }
        for (let _eventName in events) {
            video.addEventListener(_eventName, events[_eventName], false);
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

    _display() {
        this._displayDanmaku();
    }

    _renderVideo(options = {}) {
        if (this.root) {
            let video = document.querySelector('.MPlayer-player-video');

            if (this._isWeChat()) {
                video.setAttribute('x5-video-player-type', 'h5');
                video.setAttribute('x5-video-orientation', 'landscape|portrait');
                video.setAttribute('webkit-playsinline', true);
                video.setAttribute('x-webkit-airplay', true);
                video.setAttribute('playsinline', true);
                video.setAttribute('x5-playsinline', true);
            }

            options.src && utils.isString(options.src) && (video.src = options.src);
            options.poster && utils.isString(options.poster) && (video.poster = options.poster);
            options.currentTime && utils.isNumber(options.currentTime) && (video.currentTime = options.currentTime);
            utils.isBoolean(options.autoplay) && (video.autoplay = options.autoplay);
            utils.isBoolean(options.loop) && (video.loop = options.loop);
            utils.isBoolean(options.preload) && (video.preload = options.preload);
            utils.isBoolean(options.controls) && (video.controls = options.controls);
            video.controls ? document.querySelector('.MPlayer-control').style.display = 'none' : document.querySelector('.MPlayer-control').style.display = 'block';
        }
    }

    _renderControls(options = {}) {
        if (this.root) {
            let play = document.querySelector('.MPlayer-control-video-play');
            let pause = document.querySelector('.MPlayer-control-video-pause');
            let reload = document.querySelector('.MPlayer-control-video-reload');
            let openDanmaku = document.querySelector('.MPlayer-control-danmaku-open');
            let closeDanmaku = document.querySelector('.MPlayer-control-danmaku-close');
            let openVoice = document.querySelector('.MPlayer-control-voice-open');
            let closeVoice = document.querySelector('.MPlayer-control-voice-close');
            let fullScreen = document.querySelector('.MPlayer-control-screen-full');
            let middleScreen = document.querySelector('.MPlayer-control-screen-middle');
            let control = document.querySelector('.MPlayer-control');
            let controlLeft = document.querySelector('.MPlayer-control-left');
            let controlMiddle = document.querySelector('.MPlayer-control-middle');
            let controlRight = document.querySelector('.MPlayer-control-right');

            utils.isBoolean(options.defaultVideoSwitch) && options.defaultVideoSwitch ? play.click() : pause.click();
            utils.isBoolean(options.defaultScreenFull) && options.defaultScreenFull ? fullScreen.click() : middleScreen.click();
            !utils.isBoolean(options.defaultDanmakuSwitch) || !options.defaultDanmakuSwitch ? openDanmaku.click() : closeDanmaku.click();
            !utils.isBoolean(options.defaultVoiceSwitch) || !options.defaultVoiceSwitch ? openVoice.click() : closeVoice.click();
            utils.isString(options.backgroundColor) && options.backgroundColor && (control.style.backgroundColor = options.backgroundColor);

            controlMiddle.style.width = control.offsetWidth - controlLeft.offsetWidth - controlRight.offsetWidth + 'px';
        }
    }

    _renderDanmaku(options = {}) {
        if (this.root) {
            let danmaku = document.querySelector('.MPlayer-player-danmaku');

            options.fontSize && utils.isNumber(options.fontSize) && (danmaku.style.fontSize = Math.abs(options.fontSize) + 'px');

            this.configs.danmaku.maxRow = options.maxRow && utils.isNumber(options.maxRow) && options.maxRow <= this._getDanmakuMaxRow() ? options.maxRow : this._getDanmakuMaxRow();
        }
    }

    _bindEvents() {
        let that = this;
        let video = document.querySelector('.MPlayer-player-video');
        let play = document.querySelector('.MPlayer-control-video-play');
        let pause = document.querySelector('.MPlayer-control-video-pause');
        let reload = document.querySelector('.MPlayer-control-video-reload');
        let openVoice = document.querySelector('.MPlayer-control-voice-open');
        let closeVoice = document.querySelector('.MPlayer-control-voice-close');
        let openDanmaku = document.querySelector('.MPlayer-control-danmaku-open');
        let closeDanmaku = document.querySelector('.MPlayer-control-danmaku-close');
        let fullScreen = document.querySelector('.MPlayer-control-screen-full');
        let middleScreen = document.querySelector('.MPlayer-control-screen-middle');

        // click video play btn
        play.addEventListener('click', function () {
            video.play();
        }, false);

        // click video pause btn
        pause.addEventListener('click', function () {
            video.pause();
        }, false);

        // click video reload btn
        reload.addEventListener('click', function () {
            video.load();
            video.play();
        }, false);

        // video on play
        video.addEventListener('play', function () {
            play.classList.add('MPlayer-control-not-active');
            pause.classList.remove('MPlayer-control-not-active');
        }, false);

        // video on pause
        video.addEventListener('pause', function () {
            pause.classList.add('MPlayer-control-not-active');
            play.classList.remove('MPlayer-control-not-active');
        }, false);

        // click voice open btn
        openVoice.addEventListener('click', function () {
            this.classList.add('MPlayer-control-not-active');
            closeVoice.classList.remove('MPlayer-control-not-active');

            that._controlVoice(true);
        }, false);

        // click voice close btn
        closeVoice.addEventListener('click', function () {
            this.classList.add('MPlayer-control-not-active');
            openVoice.classList.remove('MPlayer-control-not-active');

            that._controlVoice(false);
        }, false);

        // click danmaku open btn
        openDanmaku.addEventListener('click', function () {
            this.classList.add('MPlayer-control-not-active');
            closeDanmaku.classList.remove('MPlayer-control-not-active');

            that._controlDanmaku(false);
        }, false);

        // click danmaku close btn
        closeDanmaku.addEventListener('click', function () {
            this.classList.add('MPlayer-control-not-active');
            openDanmaku.classList.remove('MPlayer-control-not-active');

            that._controlDanmaku(true);
        }, false);

        // click full screen btn
        fullScreen.addEventListener('click', function () {
            this.classList.add('MPlayer-control-not-active');
            middleScreen.classList.remove('MPlayer-control-not-active');

            that._updateScreen('portrait-full');
        }, false);

        // click middle screen btn
        middleScreen.addEventListener('click', function () {
            this.classList.add('MPlayer-control-not-active');
            fullScreen.classList.remove('MPlayer-control-not-active');

            that._updateScreen('portrait-middle');
        }, false);

        // listen screen change
        window.addEventListener("orientationchange", function () {
            if (window.orientation === 90 || window.orientation === -90) {
                that._updateScreen('landscape-full');
            } else if (window.orientation === 0 || window.orientation === 180) {
                that._updateScreen('portrait-full');
            }
        }, false);
    }

    _isWeChat() {
        let ua = navigator.userAgent.toLowerCase();
        return ua.indexOf('micromessenger') > -1;
    }

    _controlVoice(muted = true) {
        let video = document.querySelector('.MPlayer-player-video');
        muted ? video.muted = true : video.muted = false;
    }

    _controlDanmaku(danmakuSwitch = true) {
        let danmaku = document.querySelector('.MPlayer-player-danmaku');
        if (danmakuSwitch) {
            this.danmaku.danmakuSwitch = true;
            danmaku.style.display = 'block';
        } else {
            this.danmaku.danmakuSwitch = false;
            danmaku.style.display = 'none';
        }
    }

    _updateScreen(direction = 'portrait-full') {
        let mPlayer = document.querySelectorAll('.MPlayer');
        let mPlayerPlayer = document.querySelector('.MPlayer-player');
        let mPlayerControl = document.querySelector('.MPlayer-control');

        switch (direction.toLowerCase()) {
            //竖屏半屏
            case 'portrait-middle':
                mPlayer.forEach(function (item, index) {
                    item.classList.remove('MPlayer-fullScreen');
                });
                mPlayerPlayer.style.height = this.root.offsetHeight - mPlayerControl.offsetHeight + 'px';
                mPlayerPlayer.style.top = '0px';
                break;
            //竖屏全屏
            case 'portrait-full':
                mPlayer.forEach(function (item, index) {
                    item.classList.add('MPlayer-fullScreen');
                });
                mPlayerPlayer.style.height = this.root.offsetHeight - mPlayerControl.offsetHeight + 'px';
                mPlayerPlayer.style.top = (this.client.height - this.root.offsetHeight - mPlayerControl.offsetHeight) / 2 + 'px';
                break;
            //横屏全屏
            case 'landscape-full':
                mPlayer.forEach(function (item, index) {
                    item.classList.add('MPlayer-fullScreen');
                });
                mPlayerPlayer.style.height = '100%';
                mPlayerPlayer.style.width = '100%';
                mPlayerPlayer.style.top = '0px';
                break;
        }
    }

    _getDanmakuMaxRow() {
        let danmaku = document.querySelector('.MPlayer-player-danmaku');
        return Math.round(danmaku.offsetHeight / 30);
    }

    _getDanmakuRowID = function () {
        return (new Date()).getTime() + (Math.floor(Math.random() * 1000));
    };

    displayDanmaku() {
        if (this.danmaku.currentPointer <= this.danmaku.newPointer) {
            this._log(`第${this.danmaku.currentPointer}组开始`);
            let danmaku = document.querySelector('.MPlayer-player-danmaku');
            let currentDanmakuList = this.danmaku.danmakuList[this.danmaku.currentPointer];
            let _displayDanmaku = (inwardPointer) => {
                if (inwardPointer < currentDanmakuList.length) {
                    this._log(`内部指针--${inwardPointer}`);
                    let danmakuRowID = [];
                    for (let j = 0, k = 1; j < this.configs.danmaku.maxRow; j++, k++) {
                        if (inwardPointer + j < currentDanmakuList.length) {
                            this._log(`第${inwardPointer + j}条`);
                            danmakuRowID[j] = this._getDanmakuRowID();
                            (function (i, j, k) {
                                setTimeout(function () {
                                    let danmakuRow = [];
                                    danmakuRow.push(`<span class="MPlayer-danmaku-row" id="MPlayer-danmaku-id-${danmakuRowID[j]}">`);
                                    if (currentDanmakuList[i + j]['img']) {
                                        danmakuRow.push(`<img src="${currentDanmakuList[i + j]['img']}">`);
                                    }
                                    if (currentDanmakuList[i + j]['name']) {
                                        danmakuRow.push(`${currentDanmakuList[i + j]['name']}：`);
                                    }
                                    if (currentDanmakuList[i + j]['text']) {
                                        danmakuRow.push(currentDanmakuList[i + j]['text']);
                                    }
                                    let tempObj = document.createElement('div');
                                    tempObj.innerHTML = danmakuRow.join('');
                                    danmaku.appendChild(tempObj.children[0]);
                                }, j * 200);
                            })(inwardPointer, j, k);
                        }
                    }
                }
            };
            _displayDanmaku(0);
        }
    }

    _log(message) {
        console.log(message);
    }
};

export default mPlayerCore;