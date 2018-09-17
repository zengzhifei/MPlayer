import pkg from "../package.json";
import utils from "./utils.js";
import mPlayerCore from "./MPlayerCore.js";

class MPlayer {
    constructor(options = {}) {
        if (!!this.hasInit()) {
            console.log('MPlayer is already init');
            return;
        }

        this.version = pkg.version;
        this.MPlayer_ID = mPlayerCore.MPlayer_ID;

        if (options.el && utils.isString(options.el)) {
            mPlayerCore.initPlayer(options);
        }
    }

    hasInit() {
        return document.querySelector(mPlayerCore.MPlayer_ID);
    }

    config(name = null, value = null) {
        if (utils.isNull(name) || (utils.isString(name) && utils.isNull(value))) {
            return utils.isNull(name) ? mPlayerCore.configs : mPlayerCore.configs[name];
        } else {
            mPlayerCore.setOptions(name, value);
        }
    }

    extend(iconType, iconClass, iconEvent) {
        if (!utils.isString(iconType) || !mPlayerCore.icons.hasOwnProperty(iconType)) {
            return mPlayerCore.icons;
        } else {
            return mPlayerCore.setExtension(iconType, iconClass, iconEvent);
        }
    }

    addExtension(icon, iconEvent) {
        return mPlayerCore.addExtension(icon, iconEvent);
    }

    on(eventName, event) {
        mPlayerCore.on(eventName, event);
    }


}

export default MPlayer;