'use strict';

const es = require('event-stream');
const PromisedLifestream = require('../lib/main');

PromisedLifestream([
  es.readArray([1, 2, 3]),
  es.map(function (data, callback) {
    callback(null, data * 2);
  })
], {
  needResult: true
})
.then(result => {
  console.log(result);
  // [2, 4, 6]
})
.catch(err => {
  console.error(err);
});
