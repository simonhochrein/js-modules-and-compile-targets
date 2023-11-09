# JavaScript Module Systems and Compile Targets

Table of Contents:
* Why Modules?
* Module Systems
    - RequireJS/AMD
    - CommonJS
    - Interlude - UMD
    - ES Modules
    - System
* Compile Targets
    - ES5
    - ES6
    - ES2018
    - ESNext
* Bonus
    - `package.json` entry points
* Additional Reading

---

# Why Modules?

Previously, JavaScript source files were loaded sequentially through HTML `<script>` tags. As the amount of client-side functionality increased, JavaScript files became larger.

As codebases grew in size, the need for organization became apparent. Functionality was broken into individual units of code, modules.

Modules also solved the important issue of namespace pollution, where multiple libraries would create the same global variables, competing and breaking functionality.

---

# Modules Systems

## History:

Prior to the release of RequireJS in 2009, most frontend projects reliant on JavaScript would use global variables to expose methods and values for use in other files. Files were concatenated or loaded sequentially by `<script>` tags in the browser.

RequireJS allowed the developer to presere a clean file structure, only include required files, and utilize a unified api for importing and working with modules.

This solution was not perfect however, and over the following years there were several main attempts to solve the JavaScript module problem, with varying degrees of success and popularity.

---

# RequireJS

RequireJS was the first popular JavaScript module system, gaining popularity in the years followings its release. Though it's not as commonly used anymore, it is still a significant advancement in code organization for websites.

RequireJS uses the AMD (Asynchronous Module Definition) module API, relying on `require`, `define` calls to compose the module tree.

AMD works by wrapping each module inside a `define` call that takes in dependent modules as the first parameter, and a function as the second parameter which received the required modules as arguments.

Code can be broken into multiple files and folders to group code by function or purpose.

```
~~~graph-easy --as=boxart
[HTML] --> [RequireJS Loader]
[RequireJS Loader] --> { start: front,0; } [Module A], [Module B]
[Module A] --> [Submodule A1]
[Module B] --> [Submodule B1]
~~~
```

`main.ts`
```typescript
import * as util from 'helpers/util';

util.doSomething();
```
`helper/util.ts`
```typescript
export function doSomething() {
  console.log('Doing something...');
}
```

**TSC - `"module": "AMD"`**

`main.js`
```javascript
define(["require", "exports", "helpers/util"], function (require, exports, util) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    util.doSomething();
});
```
`helpers/util.js`
```javascript
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.doSomething = void 0;
    function doSomething() {
        console.log('Doing something...');
    }
    exports.doSomething = doSomething;
});
```

---

# CommonJS

Introduced as ServerJS in 2009 by a Mozilla Engineer, CommonJS was popularized by NodeJS and was made available for use in the browser with the `browserify` compiler.

Despite slow compilation times for the browser, the ability to use node_modules both on client and server-side drew many developers to adopt the new module system.

With modern alternatives such as webpack, vite, esbuild, rollup, parcel, and others the compilation speeds are much faster than the original browserify approach.

```
~~~graph-easy --as=boxart
[main.js] --> { start: front,0; } [require('./moduleA')], [require('./moduleB')]
[moduleA.js] --> { minlen: 2; } [require('library')]
~~~
```

Pipeline `tsc -> browserify`

`main.ts`
```typescript
import * as util from './helpers/util'; // due to node module resolution, paths must be relative or they will be treated as node_modules. This can be changed by setting `moduleResolution` in tsconfig.json

util.doSomething();
```
`helpers/util.ts`
```typescript
export function doSomething() {
  console.log('Doing something...');
}
```

**TSC - `"module": "CommonJS"`, before browserify**

`main.js`
```javascript
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("./helpers/util"); // due to node module resolution, paths must be relative or they will be treated as node_modules. This can be changed by setting `moduleResolution` in tsconfig.json
util.doSomething();
```

`helpers/util.js`
```javascript
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doSomething = void 0;
function doSomething() {
    console.log('Doing something...');
}
exports.doSomething = doSomething;
```
**Final bundle (prettier)**
(`///` comments added for clarity.)

---

`bundle.js`
```javascript
(function () {
  function r(e, n, t) {   /// Internal implementation
    function o(i, f) {
      if (!n[i]) {
        if (!e[i]) {
          var c = "function" == typeof require && require;
          if (!f && c) return c(i, !0);
          if (u) return u(i, !0);
          var a = new Error("Cannot find module '" + i + "'");
          throw ((a.code = "MODULE_NOT_FOUND"), a);
        }
        var p = (n[i] = { exports: {} });
        e[i][0].call(
          p.exports,
          function (r) {
            var n = e[i][1][r];
            return o(n || r);
          },
          p, p.exports, r, e, n, t,
        );
      }
      return n[i].exports;
    }
    for (var u = "function" == typeof require && require, i = 0; i < t.length; i++)
      o(t[i]);
    return o;
  }
  return r;
})()(
  {
    1: [
      function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.doSomething = void 0;
        function doSomething() {
          console.log("Doing something...");
        }
        exports.doSomething = doSomething;
      },
      {},
    ],
    2: [
      function (require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        var util = require("./helpers/util"); // due to node module resolution, paths must be relative or they will be treated as node_modules. This can be changed by setting `moduleResolution` in tsconfig.json
        util.doSomething();
      },
      { "./helpers/util": 1 }, /// multiple paths can refer to the same file, so filenames are converted to numbers.
    ],
  },
  {},
  [2], /// Run module 2
);
```

---

# Interlude - Universal Module Definition (UMD)

An attempt to reconcile AMD and CommonJS, UMD is a compatibility layer to allow a library to support whichever module system required it.

```
~~~graph-easy --as=boxart
[RequireJS] - "AMD Loader" -> [UMD Module]
[Node.js] - "CommonJS require" -> [UMD Module]
~~~
```

**TSC - `"module": "UMD"`**

`helpers/util.js`
```javascript
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.doSomething = void 0;
    function doSomething() {
        console.log('Doing something...');
    }
    exports.doSomething = doSomething;
});
```

---

# ES Modules

Along with classes, async await, template literals, arrow functions, and more, ES6 released a new official module system for JavaScript called ES Modules.

ES Modules use the same syntax as typescript, can run in modern browsers without compilation, and are supported by most bundlers with interop for CommonJS.

In compilation targets older than ES6 (ECMAScript 2015), ES Module syntax is not supported and is usually replaced by CommonJS module at compile time.

```
~~~graph-easy --as=boxart
[moduleA.js] - import \{ foo \} from 'moduleB' -> [moduleB.js]
[moduleB.js] - export const foo -> [moduleA.js]
[HTML] - \<script type="module" src="moduleA.js"\> -> [moduleA.js]
~~~
```

**TSC - `"module": "ES6"`**

`main.js`
```javascript
import * as util from './helpers/util'; // due to node module resolution, paths must be relative or they will be treated as node_modules. This can be changed by setting `moduleResolution` in tsconfig.json
util.doSomething();
```

`helpers/util.ts`
```javascript
export function doSomething() {
    console.log('Doing something...');
}
```

As TypeScript syntax is based on ES6, most compiled code will match the source with the key exception of types.

For `node_modules` imports, an import map can be defined in the browser describing import aliases.

Example:
```html
<script type="importmap">
  {
    "imports": {
      "square": "./module/shapes/square.js",
      "circle": "https://example.com/shapes/circle.js"
    }
  }
</script>
```

---

# SystemJS

SystemJS is a module built to emulate the ES Module system on older browsers for better compatibility, and has a very minimal overhead.

The compiled code resembles the AMD module system, with the main difference being that System is a compilation target, not a framework meant to be used directly during development.

Though SystemJS works more universally than ES Modules, it does come at a performance cost.

The SystemJS loader library is required to be loaded before the bundle file is executed.

```
~~~graph-easy --as=boxart
[SystemJS Loader] -> { start: front,0; } [Module A], [Module B]
[Module A] - import from 'Module B' -> [Module B]
~~~
```

**TSC - `"module": "System"`**

Optional parameter `"outFile"` tells TSC to output all source files into a single file, and is a feature exclusive to the System & AMD module options.

`bundle.js`
```javascript
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
```

---

# Compile Targets

We've covered module types, now what about targets?

Targets determine the version of javascript targeted by the TypeScript compiler, as well as which features are native and which will be polyfilled.

While modern JavaScript has support in every major browser, applications targeting IE11 and older browsers require a prior version of JavaScript.

Polyfills to the rescue! TypeScript has a number of built in polyfills for async await, classes, decorators, and more that can work in browsers that don't implement the latest JavaScript APIs.

---
# Commonly used versions

## ES5

This is the version of JavaScript used in IE11. It has no built in support for `class`es, `async`/`await`, `Promise`, `() => {}` arrow functions, or most of the features we use everyday.

## ES6

ES6 introduced a modern form of JavaScript with many of the QOL features in other languages. TypeScript's syntax is based on ES6.

## ES2018

ES2018 introduced `...` spread operators, a better pattern for variadic functions, asynchronous iteration, `RegEx` improvements, and more.

## ESNext
The current working version of JavaScript, including new features which may or may not be supported yet natively.

---

# Bonus: `package.json` entry points

## `"main"`

Points to the entry point of a module, typically an index file that re-exports all the methods of the module.
On a side note, in projects that utilize TypeScript or Flow, this field must point to a compiled file that exists in the published package.

## `"bin"`

Describes the executable scripts installed by this module.

Single string or object map depending on if the module exports multiple executables.

Single program with name of module:
```json
{
    "bin": "./path/to/script.js"
}
```
Multiple:
```json
{
    "bin": {
        "programA": "./path/to/programA.js",
        "programB": "./path/to/programB.js"
    }
}
```

**Note:** All executable scripts must begin with `#!/usr/bin/env node` or an equivalent shebang. NPM will take care of linking the script into the path and making it executable.

## `"types"`

This points to the primary `.d.ts` file generated by the TypeScript compiler in the build step.

## `"module"`

Legacy entry point for ES Module generated from TypeScript. Used by ES Module bundlers.

As Node tends to be all-or-nothing when it comes to esmodule usage, this field is still used in combination with a CommonJS `"main"` field.

---

# Additional Reading

* [XKCD](https://xkcd.com/927/)
* [RequireJS](https://requirejs.org/)
* [CommonJS](https://nodejs.org/docs/latest/api/modules.html)
* [UMD](https://github.com/umdjs/umd)
* [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
    - [Import Maps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#importing_modules_using_import_maps)
* [SystemJS](https://github.com/systemjs/systemjs)
* [`package.json` documentation](https://docs.npmjs.com/cli/v10/configuring-npm/package-json)
* [TypeScript `package.json` extensions](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html#including-declarations-in-your-npm-package)

这花了太长时间

Simon Hochrein @ ExCo 2023
