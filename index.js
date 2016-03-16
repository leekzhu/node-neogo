'use strict';

var Model = require('./model');
var Schema = require('./schema');

function Neogo() {
  this.Schema = Schema;
  this.Model = Model;
}

//Neogo.prototype.model = function (route, schema, options) {
//  return Model.compile(route, schema, options);
//};

module.exports = exports = new Neogo();