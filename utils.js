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
 * If type is one of Javascript primitive types?
 * Note: `function`, `symbol` , `undefined` are not included
 * @param type
 * @returns {boolean}
 */
exports.isPrimitiveType = function (type) {
  return ['boolean', 'number', 'string', 'object'].indexOf(type) > -1;
};

exports.noop = noop;