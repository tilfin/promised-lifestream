'use strict';

const fs = require('fs');
const stream = require('stream');
const es = require('event-stream');
const PromisedLifestream = require('../lib/main');

let i = 0;

PromisedLifestream([
  new stream.Readable({
    read(size) {
      if (++i < 10) {
        this.push(String(i));
      } else {
        this.push(null);
      }
    }
  }),
  new stream.PassThrough(),
  fs.createWriteStream('out.txt')
])
.then(() => {
  const str = fs.readFileSync('out.txt', { encoding: 'ascii' });
  console.log(str);
  // 123456789
})
.catch(err => {
  console.error(err);
});
