let utils = new class Utils {
    isArray(value) {
        return Object.prototype.toString.call(value) === '[object Array]';
    }

    isString(value) {
        return Object.prototype.toString.call(value) === '[object String]';
    }

    isFunction(value) {
        return Object.prototype.toString.call(value) === '[object Function]';
    }

    isObject(value) {
        return Object.prototype.toString.call(value) === '[object Object]';
    }

    isNumber(value) {
        return Object.prototype.toString.call(value) === '[object Number]';
    }

    isBoolean(value) {
        return Object.prototype.toString.call(value) === '[object Boolean]';
    }

    isNull(value) {
        return Object.prototype.toString.call(value) === '[object Null]';
    }

    getUniqueID() {
        return (+new Date()).toString() + 'xxx9xxxy'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
};

export default utils;