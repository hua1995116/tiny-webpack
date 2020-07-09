(function(modules) {
  // webpackBootstrap
  function webpackJsonpCallback(data) {
    var chunkIds = data[0];
    var moreModules = data[1];

    // add "moreModules" to the modules object,
    // then flag all "chunkIds" as loaded and fire callback
    var moduleId,
      chunkId,
      i = 0,
      resolves = [];
    for (; i < chunkIds.length; i++) {
      chunkId = chunkIds[i];
      if (
        Object.prototype.hasOwnProperty.call(installedChunks, chunkId) &&
        installedChunks[chunkId]
      ) {
        resolves.push(installedChunks[chunkId][0]);
      }
      installedChunks[chunkId] = 0;
    }
    for (moduleId in moreModules) {
      if (Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
        modules[moduleId] = moreModules[moduleId];
      }
    }

    while (resolves.length) {
      resolves.shift()();
    }
  }
  // The module cache
  var installedModules = {};

  var installedChunks = {};

  // The require function
  function require(moduleId) {
    // Check if module is in cache
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }
    // Create a new module (and put it into the cache)
    var module = (installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {},
    });

    // Execute the module function
    modules[moduleId].call(module.exports, module, module.exports, require);

    // Flag the module as loaded
    module.l = true;

    // Return the exports of the module
    return module.exports;
  }
  function jsonpScriptSrc(chunkId) {
    return `${chunkId}_chunk.js`;
  }
  require.e = function requireEnsure(chunkId) {
    var promises = [];

    // JSONP chunk loading for javascript

    var installedChunkData = installedChunks[chunkId];
    if (installedChunkData !== 0) {
      // 0 means "already installed".

      // a Promise means "currently loading".
      if (installedChunkData) {
        promises.push(installedChunkData[2]);
      } else {
        // setup Promise in chunk cache
        var promise = new Promise(function(resolve, reject) {
          installedChunkData = installedChunks[chunkId] = [resolve, reject];
        });
        promises.push((installedChunkData[2] = promise));

        // start chunk loading
        var script = document.createElement("script");
        var onScriptComplete;

        script.charset = "utf-8";
        script.timeout = 120;
        script.src = jsonpScriptSrc(chunkId);

        // create error before stack unwound to get useful stacktrace later
        var error = new Error();
        onScriptComplete = function(event) {
          // avoid mem leaks in IE.
          script.onerror = script.onload = null;
          clearTimeout(timeout);
          var chunk = installedChunks[chunkId];
          if (chunk !== 0) {
            if (chunk) {
              var errorType =
                event && (event.type === "load" ? "missing" : event.type);
              var realSrc = event && event.target && event.target.src;
              error.message =
                "Loading chunk " +
                chunkId +
                " failed.\n(" +
                errorType +
                ": " +
                realSrc +
                ")";
              error.name = "ChunkLoadError";
              error.type = errorType;
              error.request = realSrc;
              chunk[1](error);
            }
            installedChunks[chunkId] = undefined;
          }
        };
        var timeout = setTimeout(function() {
          onScriptComplete({ type: "timeout", target: script });
        }, 120000);
        script.onerror = script.onload = onScriptComplete;
        document.head.appendChild(script);
      }
    }
    return Promise.all(promises);
  };
  var jsonpArray = (window["webpackJsonp"] = window["webpackJsonp"] || []);
  jsonpArray.push = webpackJsonpCallback;
  require("./example/index.js");
})({
  "./example/index.js": function(module, exports, require) {
    "use strict";

    var _b = _interopRequireDefault(require("./b.js"));

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }

    var a = require("./a.js");

    console.log(a());
    (0, _b["default"])();

    require
      .e(0)
      .then(require.bind(null, "./foo/bar.js"))
      .then(function(res) {
        console.log(res["default"]());
      });
  },
  "./a.js": function(module, exports, require) {
    "use strict";

    // const bar = require('./foo/bar.js');
    module.exports = function() {
      return "aaaaa";
    };
  },
  "./b.js": function(module, exports, require) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true,
    });
    exports["default"] = _default;

    function _default() {
      console.log("b");
    }
  },
});
