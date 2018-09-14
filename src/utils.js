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

    mergeObject(target, source) {
        if (utils.isObject(target) && utils.isObject(source)) {
            for (let key in source) {
                target[key] = target[key] && utils.isObject(target[key]) ? this.mergeObject(target[key], source[key]) : source[key];
            }
        }
        return target;
    }
};

export default utils;