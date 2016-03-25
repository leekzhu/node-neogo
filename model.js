'use strict';

var conf = require('./config');
var Query = require('./query');

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
 * @param callback
 */
Model.prototype.find = function (conditions, callback) {
  var q = new Query(conf.url, this.route, this);

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
  var q = new Query(conf.url, this.route, this);

  return q.save(this.__validate(obj), callback);
};

/**
 * Create an instance
 * @param obj
 * @param callback
 * @returns {*|cache|Suite|{cache, hasFileChanged, analyzeFiles, getFileDescriptor, getUpdatedFiles, normalizeEntries, removeEntry, deleteCacheFile, destroy, reconcile}|{key, notFound, err}}
 */
Model.prototype.create = function (obj, callback) {
  var q = new Query(conf.url, this.route, this);

  return q.create(this.__validate(obj), callback);
};

/**
 * Validate obj to conform to schema
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
    if (typeof obj[key] === type) {
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
    this.__applyFilters();
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
  ModelInstance.prototype.save = function (callback) {
    self.save(this, callback);
  };

  return new ModelInstance(obj);
};

Model.instantiate = Model.prototype.instantiate;

module.exports = Model;