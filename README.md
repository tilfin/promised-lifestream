Promised Lifestream
===================

Creating promisified stream pipeline for Node.js

## Feature

* If an error occurred at any stream, it rejects with the error.
* If last stream is not Writable, it pushes auto-generated writer.

## Install

```
$ npm install -save promised-lifestream
```

## How to use

**PromisedLifestream(streams, [options])**

* `streams` `<Array<Stream>>` streams composes pipeline
* `options` `<Object>`
  * `needResult` `<Boolean>` Whether the last stream result is resolved or not. Defaults to false


## Example

```javascript
'use strict';

const fs = require('fs');
const stream = require('stream');
const es = require('event-stream');
const PromisedLifestream = require('../lib/main');

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
