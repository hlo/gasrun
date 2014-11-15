module.exports = {
    /** Wraps a function in a try/catch.
      * On catch of an error it prints it out using `during` to provide context.
      * `during` may be a string or an index into the arguments array of the wrapped function.
      */
    wrap: function (f, during) {
        return function () {
            try {
                return f.apply(null, arguments);
            } catch (e) {
                var duringStr = '';
                if (during !== undefined) {
                    duringStr = ' (during "' + (during >= 0 ? arguments[during] : during) + '")';
                }
                console.error(e.name + ': ' + e.message + duringStr);
                console.log(e && e.stack || e);
            }
        };
    },

    wrapAll: function (lib, prefix) {
        for (var f in lib) {
            if (typeof lib[f] === 'function') {
                lib[f] = module.exports.wrap(lib[f], prefix ? prefix + f : f);
            }
        }
    },
};
