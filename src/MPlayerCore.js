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
                controls: false
            }
        };
    }

    initPlayer() {
        if (!this.root && utils.isString(this.configs.el) && (this.root = document.querySelector(this.configs.el))) {
            let playerObj = document.createElement('div');
            playerObj.innerHTML = tplMPlayer;
            this.root.appendChild(playerObj.children[0]);
        } else {
            return false;
        }

        this._bindEvents();
        this._render();
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

    _render() {
        if (utils.isObject(this.configs.video)) {
            this._renderVideo(this.configs.video);
        }
        if (utils.isObject(this.configs.control)) {
            this._renderControl(this.configs.control);
        }
        if (utils.isObject(this.configs.danmaku)) {
            this._renderDanmaku(this.configs.danmaku);
        }
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

            utils.isString(options.src) && (video.src = options.src);
            utils.isString(options.poster) && (video.src = options.poster);
            utils.isBoolean(options.controls) && (video.controls = options.controls);
            video.controls ? document.querySelector('.MPlayer-player-control').style.display = 'none' : document.querySelector('.MPlayer-player-control').style.display = 'block';
        }
    }

    _renderControl(options = {}) {

    }

    _renderDanmaku(options = {}) {

    }

    _bindEvents() {
        let play = document.querySelector('.MPlayer-control-video-play');
        let pause = document.querySelector('.MPlayer-control-video-pause');
        let reload = document.querySelector('.MPlayer-control-video-reload');
        let playPause = document.querySelectorAll('.MPlayer-control-video');
        let video = document.querySelector('.MPlayer-player-video');
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

        // click danmaku open btn
        openDanmaku.addEventListener('click', function () {
            this.classList.add('MPlayer-control-not-active');
            closeDanmaku.classList.remove('MPlayer-control-not-active');
        }, false);

        // click danmaku close btn
        closeDanmaku.addEventListener('click', function () {
            this.classList.add('MPlayer-control-not-active');
            openDanmaku.classList.remove('MPlayer-control-not-active');
        }, false);

        // click full screen btn
        fullScreen.addEventListener('click', function () {
            this.classList.add('MPlayer-control-not-active');
            middleScreen.classList.remove('MPlayer-control-not-active');
        }, false);

        // click middle screen btn
        middleScreen.addEventListener('click', function () {
            this.classList.add('MPlayer-control-not-active');
            fullScreen.classList.remove('MPlayer-control-not-active');
        }, false);
    }

    _isWeChat() {
        let ua = navigator.userAgent.toLowerCase();
        return ua.indexOf('micromessenger') > -1;
    }
};

export default mPlayerCore;