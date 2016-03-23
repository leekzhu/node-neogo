'use strict';

var request = require('request');
var utils = require('./utils');

/**
 * constructor for Query object
 * @desc a query client for our Go service
 * @param host
 * @param path
 * @param model
 * @constructor
 */
function Query(host, path, model) {
  this.host = host;
  this.path = path;
  this.model = model;
}

/**
 * Custom query for our Go service
 * @param conditions
 * @param callback
 * @api public
 */
Query.prototype.find = function (conditions, callback) {
  var cb;
  var self = this;
  if (typeof conditions === 'function') {
    callback = conditions;
    conditions = {};
  }

  cb = function (err, response, body) {
    if (err) {
      return callback(err);
    }
    if (response.statusCode === 200) {
      body = body.map(function (el) {
        return self.model.instantiate(el);
      });
      return callback(null, body);
    }
    return callback(new Error(response.statusCode + ' error.'));
  };

  request.post({url: this.host + this.path + '/query', body: conditions, json: true}, cb);
};

/**
 * Get one piece of data by its id
 * @param id
 * @param callback
 * @api public
 * @returns {Query}
 */
Query.prototype.findById = function (id, callback) {
  var cb;
  var self = this;
  if (typeof id === 'undefined') {
    id = null;
  }
  cb = function (err, response, body) {
    if (err) {
      return callback(err);
    }
    if (response.statusCode === 200) {
      if (body.length > 0) {
        body = self.model.instantiate(body[0]);
      }
      return callback(null, body);
    }
    return callback(new Error(response.statusCode + ' error.'));
  };

  return request.get({url: this.host + this.path + '/' + id, json: true}, cb);
};

/**
 * Get one piece of data
 * @param conditions
 * @param callback
 * @api public
 */
Query.prototype.findOne = function (conditions, callback) {
  var cb;
  var self = this;
  if (typeof conditions === 'function') {
    callback = conditions;
    conditions = {};
  }

  cb = function (err, response, body) {
    if (err) {
      return callback(err);
    }
    if (response.statusCode === 200) {
      // guarantee that only one data returned
      if (body.length === 1) {
        body = self.model.instantiate(body[0]);
      } else {
        body = null;
      }
      return callback(null, body);
    }
    return callback(new Error(response.statusCode + ' error.'));
  };
  request.post({url: this.host + this.path + '/query', body: conditions, json: true}, cb);
};

/**
 * Save an object, either create it or modify it.
 * @param obj
 * @param callback
 * @returns {*}
 */
Query.prototype.save = function (obj, callback) {
  var cb;
  var self = this;
  if (!utils.isObject(obj) || obj.id == null) {
    return callback(new TypeError("Neogo error save: Invalid param."));
  }
  cb = function (err, response, body) {
    if (err) {
      return callback(err);
    }
    if (response.statusCode === 200) {
      if (body.length === 1) {
        return callback(null, self.model.instantiate(body[0]));
      } else {
        return callback(null, null);
      }
    }
    return callback(new Error(response.statusCode + ' error.'));
  };
  request.put({url: this.host + this.path + '/' + obj.id, body: obj, json: true}, cb);
};

/**
 * Create a object
 * @param obj
 * @param callback
 * @returns {*}
 */
Query.prototype.create = function (obj, callback) {
  var cb;
  var self = this;
  if (!utils.isObject(obj) || obj.id == null) {
    return callback(new TypeError("Neogo error create: Invalid param."));
  }
  cb = function (err, response, body) {
    if (err) {
      return callback(err);
    }
    if (response.statusCode === 200) {
      if (body.length === 1) {
        body = self.model.instantiate(body[0]);
      }
      return callback(null, body);
    }
    // TODO: return something else could be better?
    return callback(new TypeError('Neogo error create: More than one value returned'), null);
  };
  request.post({url: this.host + this.path, body: obj, json: true}, cb);
};

/**
 * Remove an object
 * @param id
 * @param callback
 * @returns {*}
 */
Query.prototype.remove = function (id, callback) {
  var cb;
  if (id == null || typeof id === 'function') {
    return callback(new TypeError('Invalid params'));
  }
  cb = function (err, response, body) {
    if (err) {
      return callback(err);
    }
    if (response.statusCode === 200) {
      return callback(null);
    }
    return callback(new Error('Neogo error remove: Unknown reason'));
  };
  request.delete(this.host + this.path + '/' + id, cb);
};


module.exports = exports = Query;