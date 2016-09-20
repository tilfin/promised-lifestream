Promised Lifestream
===================

[![NPM Version][npm-image]][npm-url]
[![Build Status](https://travis-ci.org/tilfin/promised-lifestream.svg?branch=master)](https://travis-ci.org/tilfin/promised-lifestream)
[![Coverage Status](https://coveralls.io/repos/github/tilfin/promised-lifestream/badge.svg?branch=master)](https://coveralls.io/github/tilfin/promised-lifestream?branch=master)
[![dependencies Status](https://david-dm.org/tilfin/promised-lifestream/status.svg)](https://david-dm.org/tilfin/promised-lifestream)

Creating promisified stream pipeline for Node.js

## Feature

* Streams are pipelined and it resolves when last stream have finished.
* If an error occurred at any stream, it rejects with the error.
* If last stream is Readable or Transform, it appends auto-generated writer to streams.
* Last stream must raise `finish` event. `process.stdout` doesn't raise it.

## Install

```
$ npm install -save promised-lifestream
```

## How to use

**PromisedLifestream(streams, [options])**

* `streams` `<Array<Stream>>` streams composes pipeline. The first stream must be Readable. The second and any later stream must be Writable. The last stream can be Transform.
* `options` `<Object>`
  * `needResult` `<Boolean>` Whether the last stream result is resolved or not. Defaults to false


## Example

```javascript
'use strict';

const fs = require('fs');
const stream = require('stream');
const es = require('event-stream');
const PromisedLifestream = require('promised-lifestream');

var i = 0;

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
```

### Get last result

```javascript

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
```

## License

  [MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/promised-lifestream.svg
[npm-url]: https://npmjs.org/package/promised-lifestream
