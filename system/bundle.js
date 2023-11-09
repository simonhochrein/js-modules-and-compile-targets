System.register("helpers/util", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function doSomething() {
        console.log('Doing something...');
    }
    exports_1("doSomething", doSomething);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("main", ["helpers/util"], function (exports_2, context_2) {
    "use strict";
    var util;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [
            function (util_1) {
                util = util_1;
            }
        ],
        execute: function () {
            util.doSomething();
        }
    };
});
