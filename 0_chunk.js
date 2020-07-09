(window["webpackJsonp"] = window["webpackJsonp"] || []).push([
  [0],
  {
    "./foo/bar.js": function(module, exports, require) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true,
      });
      exports["default"] = void 0;

      var _default = function _default() {
        console.log("bar");
        return "aa";
      };

      exports["default"] = _default;
    },
  },
]);
