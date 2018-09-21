import pkg from "../package.json";
import utils from "./utils.js";
import mPlayerInstance from "./MPlayerInstance.js";

class MPlayer {
    constructor(options = {}) {
        if (typeof $ === 'undefined' && typeof jQuery === 'undefined') {
            throw new Error('MPlayer must depend on jQuery');
        } else {
            window.$ = utils.isFunction($) ? $ : jQuery;
        }

        this.version = pkg.version;
        this.id = '#MPlayer-' + utils.getUniqueID();

        if (options.el && utils.isString(options.el)) {
            mPlayerInstance.set(this.id);
            mPlayerInstance[this.id].initPlayer(options);
        }
    }

    addDanmaku(options = []) {
        mPlayerInstance[this.id].addDanmaku(options);
    }

    config(name = null, value = null) {
        if (utils.isNull(name)) {
            return mPlayerInstance[this.id].configs;
        } else if (name && utils.isString(name) && utils.isNull(value)) {
            return mPlayerInstance[this.id].configs[name];
        } else {
            return mPlayerInstance[this.id].setConfig(name, value);
        }
    }

    extend(type, icon = null, fn = null) {
        return mPlayerInstance[this.id].extend(type, icon, fn);
    }

    addExtender(icon, fn = null) {
        return mPlayerInstance[this.id].addExtender(icon, fn);
    }

    on(event, fn = null) {
        mPlayerInstance[this.id].on(event, fn);
    }

    getDanmakuStatus() {
        return mPlayerInstance[this.id].danmaku.danmakuSwitch;
    }
}

export default MPlayer;