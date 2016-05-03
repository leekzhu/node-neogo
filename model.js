'use strict';

var conf = require('./config');
var Query = require('./query');
var util = require('./util');

/**
 * Model Constructor
 * @param route
 * @param schema
 * @param options
 * @constructor
 */
function Model(route, schema, options) {
  this.route = route;
  this.schema = schema;
  this.options = options;
}
/**
 * Custom find query
 * @param conditions
 * @param options
 * @param callback
 */
Model.prototype.find = function (conditions, options, callback) {
  if (typeof conditions === 'function') {
    callback = conditions;
    conditions = {};
    options = null;
  } else if (typeof options === 'function') {
    callback = options;
    options = null;
  }

  var q = new Query(conf.url, this.route, this);
  q.setOptions(options);

  return q.find(conditions, callback);
};

/**
 * Find by id
 * @param id
 * @param callback
 */
Model.prototype.findById = function (id, callback) {
  var q = new Query(conf.url, this.route, this);

  return q.findById(id, callback);
};

/**
 * Find one instance
 * @param conditions
 * @param callback
 */
Model.prototype.findOne = function (conditions, callback) {
  var q = new Query(conf.url, this.route, this);

  return q.findOne(conditions, callback);
};

/**
 * Save an instance
 * @param obj
 * @param callback
 */
Model.prototype.save = function (obj, callback) {
  this.instantiate(this.__validate(obj)).save(callback);
};

/**
 * Create an instance
 * @param obj
 * @param callback
 * @returns {*|cache|Suite|{cache, hasFileChanged, analyzeFiles, getFileDescriptor, getUpdatedFiles, normalizeEntries, removeEntry, deleteCacheFile, destroy, reconcile}|{key, notFound, err}}
 */
Model.prototype.create = function (obj, callback) {
  this.instantiate(this.__validate(obj)).create(callback);
};

/**
 * Validate obj to conform to schema including virtuals
 * @param obj
 * @returns {{}}
 */
Model.prototype.__validate = function(obj) {
  var i, keys, key, type;
  var validObj = {};
  obj = obj || {};
  keys = Object.keys(obj);
  for (i = 0; i < keys.length; i++) {
    key = keys[i];
    type = this.schema.field(key);
    if (typeof obj[key] === type || Object.hasOwnProperty.call(this.schema.virtuals, key)) {
      validObj[key] = obj[key];
    }
  }
  return validObj;
};

/**
 * Remove an instance
 * @param id
 * @param callback
 * @returns {Query}
 */
Model.prototype.remove = function (id, callback) {
  var q = new Query(conf.url, this.route, this);

  return q.remove(id, callback);
};

/**
 * Create an instance of model
 * Example
 *    User = new Model('/users', UserSchema);
 *    user = User.instantiate({name: 'Jon Snow'});
 * @param obj
 * @returns {model}
 */
Model.prototype.instantiate = function (obj) {
  var self = this;
  // generate new class
  // __applyVirtuals must be called before __populate
  function ModelInstance(obj) {
    this.__applyVirtuals();
    this.__populate(obj);
    //this.__applyFilters();
  }

  /**
   * Inherit the schema's methods
   * @type {self.schema.methods}
   */
  ModelInstance.prototype = Object.create(self.schema.methods);
  ModelInstance.prototype.__populate = function (obj) {
    var i, keys, key;
    obj = obj || {};
    keys = Object.keys(obj);
    for (i = 0; i < keys.length; i++) {
      key = keys[i];
      if (self.schema.field(key) || Object.hasOwnProperty.call(this, key)) {
        this[key] = obj[key];
      }
    }
  };
  /**
   * Apply virtuals
   * @private
   */
  ModelInstance.prototype.__applyVirtuals = function () {
    var i, keys, key;
    keys = Object.keys(self.schema.virtuals);
    for (i = 0; i < keys.length; i++) {
      key = keys[i];
      Object.defineProperty(this, key, {
        get: self.schema.virtuals[key].getFn,
        set: self.schema.virtuals[key].setFn
      });
    }
  };
  /**
   * Apply filters
   * @private
   */
  ModelInstance.prototype.__applyFilters = function () {
    var i, keys;
    keys = Object.keys(self.schema.filters);
    for (i = 0; i < keys.length; i++) {
      self.schema.filters[keys[i]].call(this, this);
    }
  };

  /**
   * Drop temporary fields
   * @private
   */
  ModelInstance.prototype.__dropTempFields = function () {
    var i, keys;
    var tmpField = /^_/;
    keys = Object.keys(this);
    for (i = 0; i < keys.length; i++) {
      if (tmpField.test(keys[i])) {
        delete this[keys[i]];
      }
    }
  };

  /**
   * Save an instance, this will create one if it's not existed in db
   * @param callback
   * @returns {*}
   */
  ModelInstance.prototype.save = function (callback) {
    var q = new Query(conf.url, self.route, self);
    this.__dropTempFields();
    return q.save(this, callback);
  };

  /**
   * Create an instance in db, will fail if existing in db already
   * @param callback
   * @returns {*}
   */
  ModelInstance.prototype.create = function (callback) {
    var q = new Query(conf.url, self.route, self);
    this.__dropTempFields();
    return q.create(this, callback);
  };

  /**
   * Remove an instance in db
   * @param callback
   */
  ModelInstance.prototype.remove = function (callback) {
    self.remove(this.id, callback);
  };

  return new ModelInstance(obj);
};

/**
 * Custom ajax request
 * @param config
 * @param callback
 */
Model.prototype.ajax = function (config, callback) {
  if (!util.isObject(config)) {
    throw new TypeError('First argument is not an object.');
  }

  var q = new Query(conf.url, this.route, this);
  return q.request(config, callback);
};

Model.instantiate = Model.prototype.instantiate;

module.exports = Model;