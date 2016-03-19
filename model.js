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

  return q.save(this.$__validate(obj), callback);
};

/**
 * Create an instance
 * @param obj
 * @param callback
 * @returns {*|cache|Suite|{cache, hasFileChanged, analyzeFiles, getFileDescriptor, getUpdatedFiles, normalizeEntries, removeEntry, deleteCacheFile, destroy, reconcile}|{key, notFound, err}}
 */
Model.prototype.create = function (obj, callback) {
  var q = new Query(conf.url, this.route, this);

  return q.create(this.$__validate(obj), callback);
};

/**
 * Validate obj to conform to schema
 * @param obj
 * @returns {{}}
 */
Model.prototype.$__validate = function(obj) {
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
  function model(obj) {
    // validate the obj to conform to schema
    var i, keys, key, type;
    obj = obj || {};
    keys = Object.keys(obj);
    for (i = 0; i < keys.length; i++) {
      key = keys[i];
      type = self.schema.field(key);
      if (typeof obj[key] === type) {
        this[key] = obj[key];
      }
    }
  }

  model.prototype.__proto__ = self.schema.methods;
  model.prototype.save = function (callback) {
    self.save(this, callback);
  };

  return new model(obj);
};

Model.instantiate = Model.prototype.instantiate;

module.exports = Model;