'use strict';

var config = require('mech-config');

/**
 * Config Info Interface
 */

module.exports = function (req, res) {
  // TODO: Make it to reload config when file is changed or find a better lib. This one fails you
  // second time.
  res.json(config.client);
};