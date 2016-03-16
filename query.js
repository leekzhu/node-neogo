'use strict';

var request = require('request');
var utils = require('./utils');

/**
 * constructor for Query object
 * @desc a query client for our Go service
 * @param api
 * @param route
 * @param model
 * @constructor
 */
function Query(api, route, model) {
  this.api = api;
  this.route = route;
  this.model = model;
  this.schema = model.schema;
  this.$__constructor__ = function (data) {
    data = data || {};
    var i, keys, key, type;
    keys = Object.keys(data);
    for (i = 0; i < keys.length; i++) {
      key = keys[i];
      type = model.schema.field(key);
      if (typeof data[key] === type) {
        this[key] = data[key];
      }
    }
  };
  this.$__constructor__.prototype = model.schema.methods;
}

/**
 * Custom query for our Go service
 * @param conditions
 * @param callback
 * @api public
 */
Query.prototype.find = function (conditions, callback) {
  var cb;
  var key;
  var queryString = '';
  var self = this;
  if (typeof conditions === 'function') {
    callback = conditions;
    conditions = {};
  }

  cb = function (err, response, data) {
    if (err) {
      return callback(err);
    }
    if (response.statusCode === 200) {
      data = data.map(function (el) {
        return new self.$__constructor__(el);
      });
      return callback(null, data);
    }
    return callback(new Error(response.statusCode + ' error.'));
  };

  request.post({url: this.api + this.route, body: conditions, json: true}, cb);
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
  cb = function (err, response, data) {
    if (err) {
      return callback(err);
    }
    if (response.statusCode === 200) {
      if (data.length > 0) {
        data = self.model.instantiate(data[0]);
      }
      return callback(null, data);
    }
    return callback(new Error(response.statusCode + ' error.'));
  };

  return request.get({url: this.api + this.route + '/' + id, json: true}, cb);
};

/**
 * Get one piece of data
 * @param conditions
 * @param callback
 * @api public
 */
Query.prototype.findOne = function (conditions, callback) {
  var cb;
  var key;
  var queryString = '';
  var self = this;
  if (typeof conditions === 'function') {
    callback = conditions;
    conditions = {};
  }

  cb = function (err, response, data) {
    if (err) {
      return callback(err);
    }
    if (response.statusCode === 200) {
      // guarantee that only one data returned
      if (data.length === 1) {
        data = new self.model.instantiate(data[0]);
      } else {
        data = null;
      }
      return callback(null, data);
    }
    return callback(new Error(response.statusCode + ' error.'));
  };
  request.post({url: this.api + this.route, body: conditions, json: true}, cb);
};

Query.prototype.save = function (obj, callback) {
  var cb;
  if (!utils.isObject(obj) || obj.id == null) {
    return callback(new TypeError("Neogo error save: Invalid param."));
  }
  cb = function (err, response, body) {
    if (err) {
      return callback(err);
    }
    return callback(null);
  };
  request.put({url: this.api + this.route + '/' + obj.id, body: obj, json: true}, cb);
};

//var Model = require('./model');
//var q = new Query('http://localhost:8888', '/users',
//  new Model('/users/',{
//    schema: {
//      field: function(key) {
//        var a = {
//          name: 'string',
//          email: 'string',
//          role: 'string',
//          hashedPassword: 'string',
//          salt: 'string',
//          id: 'string'
//        };
//        return a[key];
//      },
//      methods: {
//        haha: "SAdad",
//        sayhaha: function() {console.log("hahasdfsdfdsf");}
//      }
//    }
//  }));
//
//console.log('from qureyquery...');
//q.findById('416228cc-978d-4bd0-98ad-228c48cce2af',function(err,user){
//  console.warn(err);
//  console.log(user);
//});
//q.save({id:"14c55fa7-60e6-4bbe-897f-72d3012eca51",name:"LeoMessi",email:"leeo@leo.com",role:"test",hashedPassword:"sadsad",salt:""},
//function (err) {
//  console.warn(err);
//});

module.exports = exports = Query;