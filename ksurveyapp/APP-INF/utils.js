/**
 * Safe split a value to array. Will return null if value is null
 * @param {*} val
 * @returns {Null|Array}
 */
function safeSplit(val) {
    if (isNull(val)) {
        return null;
    } else {
        return val.split(',');
    }
}

/**
 * Convert JSONArray object to JavaScript Array object
 * @param {JSONArray} data
 * @returns {Array}
 */
function toJsArray(data) {
    if (isNotNull(data)) {
        var array = [];

        for (var key in data) {
            array[key] = data[key];
        }

        return array;
    } else {
        return [];
    }
}

/**
 * Join array
 * @param {Array} arr
 * @param {String} p
 * @returns {String}
 */
function joinArray(arr, p) {
    var a = '';

    for (var s in arr) {
        if (a === '') {
            a = a + arr[s];
        } else {
            a = a + p + arr[s];
        }
    }

    return a;
}

/**
 * Remove an item of array with specified index
 * @param {Array} arr
 * @param {Number} at
 * @returns {Array}
 */
function removeAt(arr, at) {
    var a = [];
    for (var i in arr) {
        if (i != at) {
            a.push(arr[i]);
        }
    }

    return a;
}

/**
 * Merge 2 objects
 * @param {Object} a
 * @param {Object} b
 * @returns {Object}
 */
var merge = function (a, b) {
    for (var key in b) {
        if (b.hasOwnProperty(key)) {
            a[key] = b[key];
        }
    }

    return a;
};

/**
 * Get random text
 * @param {Number} length
 * @returns {String}
 */
var generateRandomText = function (length) {
    length = length || 8;
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var text = '';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
};

/**
 * Check value is blank or not
 * @param {String} val
 * @returns {Boolean}
 */
function isBlank(val) {
    return !isNotBlank(val);
}

/**
 * Check value is not blank or not
 * @param {String} val
 * @returns {Boolean}
 */
function isNotBlank(val) {
    return trimToNull(val) !== null;
}

/**
 * Check value is null/undefined or not
 * @param {String} val
 * @returns {Boolean}
 */
function isNull(val) {
    return val === null || typeof (val) === 'undefined';
}

/**
 * Check value is not null/undefined or not
 * @param {String} val
 * @returns {Boolean}
 */
function isNotNull(val) {
    return val !== null && typeof (val) !== 'undefined';
}

/**
 * Trim value, if after trimming, the length of string is '0' will return 'null'
 * @param {String} val
 * @returns {Null|String}
 */
function trimToNull(val) {
    if (val !== null) {
        val = val.toString().trim();

        if (val.length === 0) {
            return null;
        }
    }

    return val;
}

/**
 * Remove all characters are not a-z A-Z 0-9 to '-' character
 * @param {String} s
 * @returns {string|*}
 */
function replaceYuckyChars(s) {
    s = s.toLowerCase().replace('/', '');
    s = s.replace(/[^A-Za-z0-9]/g, '-');

    while (s.contains('--')) {
        s = s.replace('--', '-');
    }

    if (s.endsWith('-')) {
        s = s.substring(0, s.length - 1);
    }

    return s;
}

/**
 * Format string safely
 * @param {*} val
 * @returns {String}
 */
function safeString(val) {
    if (isNull(val)) {
        return '';
    }

    return formatter.format(val);
}

/**
 * Parse value to int safely. If value is null, will return 0
 * @param {*} val
 * @returns {Number}
 */
function safeInt(val) {
    if (isNull(val)) {
        return 0;
    }

    return parseInt(val, 10);
}

/**
 * Parse value to boolean safely
 * @param {*} val
 * @returns {Boolean}
 */
function safeBoolean(val) {
    if (isNull(val)) {
        return false;
    }

    var b = formatter.toBool(val);
    if (b === null) {
        return false;
    }

    return b.booleanValue();
}

/**
 * Split string to an array
 * @param {String} val
 * @param {String} p
 * @returns {Array}
 */
function safeArray(val, p) {
    if (isNull(val)) {
        return [];
    }

    if (isNull(p)) {
        p = ',';
    }

    return val.split(p);
}

/**
 * Escape HTML characters
 * @param {String} string
 * @returns {String}
 */
function escapeHtml(string) {
    return string.replace(/\>/g, '&gt;').replace(/\</g, '&lt;');
}

/**
 * Split string to an array. Remove all empty items or duplicated items
 * @param {String} val
 * @param {String} p
 * @return {Array}
 */
function splitToCleanArray(val, p) {
    var arr = safeArray(val, p);
    var cleanArr = [];

    for (var i = 0; i < arr.length; i++) {
        var item = arr[i].trim();

        if (isNotBlank(item) && cleanArr.indexOf(item) === -1) {
            cleanArr.push(item);
        }
    }

    return cleanArr;
}

/**
 * Flatten an object to query string
 * @param {Object} obj
 * @returns {String}
 */
function objectToParam(obj) {
    var arr = [];

    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            arr.push(encodeURIComponent(prop) + '=' + encodeURIComponent(obj[prop]));
        }
    }

    return arr.join('&');
}

/**
 * Sort an object by item's key
 * @param {Object} obj
 * @returns {Object}
 */
function sortObjectByKey(obj) {
    var sorted = {};
    var prop;
    var arr = [];

    for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            arr.push(prop);
        }
    }

    arr.sort();

    for (prop = 0; prop < arr.length; prop++) {
        sorted[arr[prop]] = obj[arr[prop]];
    }

    return sorted;
}
