'use strict';

var toString = Object.prototype.toString;
var noop = function(){};

/**
 * If object is an object?
 * @param obj
 * @returns {boolean}
 */
exports.isObject = function (obj) {
  return toString.call(obj) === '[object Object]';
};

/**
 * Short version of Object.prototype.hasOwnProperty
 * @param obj
 * @param prop
 * @returns {boolean}
 */
exports.hasOwnProperty = function (obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};

/**
 * If type is one of Javascript primitive types?
 * Note: `function`, `symbol` , `undefined` are not included
 * @param type
 * @returns {boolean}
 */
exports.isPrimitiveType = function (type) {
  return ['boolean', 'number', 'string', 'object'].indexOf(type) > -1;
};

/**
 * Built-in default values of primitive types
 * @param type
 * @returns {*}
 */
exports.defaultOfType = function (type) {
  return {
    'boolean' : false,
    'number': 0,
    'string': '',
    'object': null
  }[type];
};

exports.noop = noop;