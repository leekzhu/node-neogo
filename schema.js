'use strict';

var utils = require('./utils');

function Schema(obj) {
  this.fields = {};
  this.methods = {};
  this.virtuals = {};
  this.filters = {};

  // build fields
  if (obj) {
    this.add(obj);
  }
}

// TODO: implement Array and Object literals, it's not implemented yet
/**
 * Build schema fields
 * Accept an object whose keys are field names,
 * along with values that are Javascript primitive types.
 * Ex. `number`, `string`, except for `object` which is accepted
 * with form of Javascript Object Literals or Array Literals.
 * ###Example
 *    schema.add({name: 'string', email: 'string'})
 *    schema.add({contact: {phone: 'number', address: 'string'}})
 *    schema.add({friends: ['string']})
 * @param obj
 * @param prefix
 */
Schema.prototype.add = function (obj, prefix) {
  prefix = prefix || '';
  var keys = Object.keys(obj);
  var i, key;

  for (i = 0; i < keys.length; i++) {
    key = keys[i];

    if (obj[key] == null) {
      throw new TypeError('Invalid type for schema field `' + prefix + key + '`');
    }

    if (Array.isArray(obj[key]) &&
      (obj[key].length === 0 || obj[key].length === 1 && obj[key][0] == null)) {
      throw new TypeError('Invalid Array type for schema field `' + prefix + key + '`');
    }

    if (utils.isObject(obj[key])) {
      if (Object.keys(obj[key]).length) {
        // nested object fields
        this.add(obj[key], prefix + key + '.');
      } else {
        this.field(prefix + key, obj[key]);
      }
    } else {
      this.field(prefix + key, obj[key]);
    }
  }
};

// TODO: implement Array and Object literals, it's not implemented yet
/**
 * Get or Set a field's type
 * ###Example
 *    schema.field("name")
 *    schema.field("name", 'object')
 * @param key
 * @param type
 * @returns {*}
 */
Schema.prototype.field = function (key, type) {
  if (type === undefined) {
    if (this.fields[key]) {
      return this.fields[key];
    } else {
      return null;
    }
  }

  if (typeof type === 'string') {
    if (!utils.isPrimitiveType(type)) {
      throw new TypeError('Invalid type for schema field `' + key + '`');
    }
  }

  this.fields[key] = type;
};

/**
 * Register virtual fields
 * ### Example
 *      schema.virtual('profile', function(){
 *        return {name: this.name, email: this.email};
 *      }, function(profile) {
 *        this.name = profile.name;
 *        this.email = profile.email;
 *      });
 * @param name
 * @param getFn
 * @param setFn
 */
Schema.prototype.virtual = function (name, getFn, setFn) {
  // virtuals can't override defined non-virtual fields
  if (this.field(name)) {
    throw new TypeError('Can\'t override defined non-virtual field');
  }
  if (typeof  name !== 'string') {
    throw new TypeError('Invalid virtual name');
  }

  // the second and third params must be functions
  if (getFn && typeof getFn !== 'function') {
    throw new TypeError('Invalid get function.');
  }
  if (setFn && typeof setFn !== 'function') {
    throw new TypeError('Invalid set function.');
  }

  this.virtuals[name] = {
    getFn: getFn,
    setFn: setFn
  }
};

/**
 * Set a filter on a field
 * Return a function which will be called when instantiating.
 * This will change the field of name `key` to value returned by fn
 * when model instantiates it.
 * ###Example:
 *    If you want to change the date(unix timestamp) to Javascript Date object
 *  after you query such data from database, you can do this:
 *    Schema.filter('publishDate', function () {
 *      return new Date(this.publishDate);
 *    });
 *  Or a simple value:
 *    Schema.filter('publishDate', Date.now());
 * @param key
 * @param fn
 */
Schema.prototype.filter = function (key, fn) {
  if (key === undefined || fn === undefined) {
    throw new Error('Insufficient arguments.');
  }
  if (!this.field(key)) {
    throw new Error('Set filter on undefined field.');
  }
  if (typeof fn !== 'function') {
    if (utils.isPrimitiveType(fn)) {
      throw new TypeError('A value or function expected.');
    }
    this.filters[key] = function () {
      this[key] = fn;
    };
  }
  this.filters[key] = function (self) {
    this[key] = fn.call(self);
  };
};


module.exports = exports = Schema;