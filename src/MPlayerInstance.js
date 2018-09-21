import MPlayerCore from "./MPlayerCore.js";
import utils from "./utils.js";

let mPlayerInstance = new class MPlayerInstance {
    set(id) {
        id && utils.isString(id) && (this[id] = new MPlayerCore(id));
    }
};

export default mPlayerInstance;