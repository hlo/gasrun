/*
 *  Copyright (C) 2011, 2012 Research In Motion Limited. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *  NOTE: Taken from the Ripple-UI project
 *        https://github.com/blackberry/Ripple-UI/
 *
 *  MODIFICATIONS
 *      - renamed 'on' apis/methods to 'emit'
 *      - removed getEventSubscribers/eventHasSubscriber methods
 *      - remove usage of ripple's exception/utils modules
 */
var error = require('js/error'),
    _listeners = {};

function on(type, listener, once, paramMatch) {
    paramMatch = paramMatch || [];
    if (!type) {
        throw "type must be truthy";
    }
    if (!listener || listener === null || typeof listener !== 'function') {
        throw "Could not add listener for event '" + type + "' " + (listener ? "this listener isn't a function" : "this listener is undefined");
    }
    _listeners[type] = _listeners[type] || [];
    for (var i = 0; i < _listeners[type].length; i++) {
        if (_listeners[type][i] && _listeners[type][i].origFunc === listener) {
            console.warn("Could not add listener for event '" + type + "' this listener is already registered on this event");
            return;
        }
    }
    if (_listeners[type].length === 0) {
        module.exports.emit('event.type.added', [type], true);
    }
    _listeners[type].push({
        origFunc: listener,
        func: error.wrap(listener, type),
        once: !!once,
        paramMatch: paramMatch,
    });
}

function emit(listener, args, sync) {
    if (sync) {
        listener.func.apply(undefined, args);
    } else {
        setTimeout(function () {
            listener.func.apply(undefined, args);
        }, 1);
    }
}

exports = {
    on: function (type, listener, paramMatch) {
        on(type, listener, false, paramMatch);
    },

    once: function (type, listener, paramMatch) {
        on(type, listener, true, paramMatch);
    },

    emit: function (type, args, sync) {
        args = args || [];
        // Default value for sync is true.
        sync = sync || sync === undefined;

        if (_listeners[type]) {
            _listeners[type].forEach(function (listener, indexOfArray, array) {
                var paramMatches = listener.paramMatch.every(function (param, index) {
                    if (args[index] && args[index].webviewId && param) {
                        return param.webviewId === args[index].webviewId;
                    }
                    return param === args[index] || param === module.exports.FILTER_ANY;
                });
                if (!paramMatches) {
                    return;
                }
                emit(listener, args, sync);
                if (listener.once) {
                    delete array[indexOfArray];
                }
            });
        }
    },

    clear: function (type) {
        if (type) {
            delete _listeners[type];
        }
    },

    un: function (type, callback) {
        if (type && callback && _listeners[type]) {
            _listeners[type] = _listeners[type].filter(function (listener) {
                return !((listener.func === callback || listener.origFunc === callback) && _listeners[type].indexOf(listener) !== -1);
            });
            if (_listeners[type].length === 0) {
                module.exports.emit('event.type.removed', [type], true);
            }
        }
    },

    isOn: function (type) {
        if (!_listeners[type]) {
            return false;
        }
        return typeof _listeners[type] !== "undefined" && _listeners[type].length !== 0;
    },

    FILTER_ANY: {} // This is a sentinel value that allows wildcard matching in pre-filerted events.
};
