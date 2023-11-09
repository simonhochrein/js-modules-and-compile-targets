(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./helpers/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util = require("./helpers/util"); // due to node module resolution, paths must be relative or they will be treated as node_modules. This can be changed by setting `moduleResolution` in tsconfig.json
    util.doSomething();
});
