'use strict';

const stream = require('stream');
const es = require('event-stream');
const chai = require('chai');
const assert = chai.assert;
const PromisedLifestream = require('../lib/main');


describe('PromisedLifestream', () => {

  context('whose objectMode is true', () => {
    context('composed of reader with needResult', () => {
      it('resolves result', () => {
        const data = [1, 'A', 2, 'B'];

        return PromisedLifestream([
            es.readArray(data)
          ], {
            needResult: true
          })
          .then(result => {
            assert.deepEqual(result, data);
          });
      });
    });

    context('composed of reader without needResult', () => {
      it('resolves result', () => {
        const data = [1, 'A', 2, 'B'];

        return PromisedLifestream([
            es.readArray(data)
          ], {
            needResult: false
          })
          .then(result => {
            assert.isUndefined(result);
          });
      });
    });

    context('composed of reader and writer', () => {
      it('resolves', () => {
        let cnt = 0;
        return PromisedLifestream([
            es.readArray([1, 2, 3, 4]),
            new stream.Writable({
              objectMode: true,
              write: function (chunk, enc, cb) {
                assert.equal(chunk, ++cnt);
                cb();
              }
            })
          ])
          .then(result => {
            assert.isUndefined(result);
          });
      });
    });

    context('composed of reader and transformer', () => {
      it('resolves', () => {
        const data = [1, 'A', 2, 'B'];

        return PromisedLifestream([
            es.readArray(data),
            new stream.PassThrough({ objectMode: true })
          ])
          .then(result => {
            assert.isUndefined(result);
          });
      });
    });

    context('composed of reader and transformer with needResult', () => {
      it('resolves result', () => {
        const data = [1, 'A', 2, 'B'];

        return PromisedLifestream([
            es.readArray(data),
            new stream.PassThrough({ objectMode: true })
          ], {
            needResult: true
          })
          .then(result => {
            assert.deepEqual(result, data);
          });
      });
    });

    context('composed of reader and transformer without needResult', () => {
      it('resolves', () => {
        const data = [1, 'A', 2, 'B'];

        return PromisedLifestream([
            es.readArray(data),
            new stream.PassThrough({ objectMode: true })
          ], {
            needResult: false
          })
          .then(result => {
            assert.isUndefined(result);
          });
      });
    });

    context('composed of reader, transformer and writer', () => {
      it('resolves', () => {
        let cnt = 0;
        return PromisedLifestream([
            es.readArray([1, 2, 3]),
            new stream.PassThrough({ objectMode: true }),
            new stream.Writable({
              objectMode: true,
              write: function (chunk, enc, cb) {
                assert.equal(chunk, ++cnt);
                cb();
              }
            })
          ])
          .then(result => {
            assert.isUndefined(result);
          });
      });
    });

    context('error occurred at reader', () => {
      it('rejects', () => {
        const ERR_MSG = 'Error occurred at Reader';

        return PromisedLifestream([
            new stream.Readable({
              read(size) {
                process.nextTick(() => {
                  this.emit('error', new Error(ERR_MSG));
                });
              }
            }),
            new stream.PassThrough({ objectMode: true })
          ])
          .catch(err => {
            assert.equal(err.message, ERR_MSG);
          });
      });
    });

    context('error occurred at transform', () => {
      it('rejects', () => {
        const ERR_MSG = 'Error occurred at Transform';

        return PromisedLifestream([
            es.readArray(['A', 'B']),
            es.map(function (data, callback) {
              callback(new Error(ERR_MSG));
            })
          ])
          .catch(err => {
            assert.equal(err.message, ERR_MSG);
          });
      });
    });

    context('error occurred at writer', () => {
      it('rejects', () => {
        const ERR_MSG = 'Error occurred at Writer';

        return PromisedLifestream([
            es.readArray(['A', 'B']),
            new stream.Writable({
              objectMode: true,
              write: function (chunk, enc, cb) {
                cb(new Error(ERR_MSG));
              }
            })
          ])
          .catch(err => {
            assert.equal(err.message, ERR_MSG);
          });
      });
    });
  });

  context('whose objectMode is false', () => {
    context('composed of reader with needResult', () => {
      it('resolves result', () => {
        let cnt = 0;

        return PromisedLifestream([
            new stream.Readable({
              read(size) {
                if (++cnt < 10) {
                  this.push(String(cnt));
                } else {
                  this.push(null);
                }
              }
            })
          ], {
            needResult: true
          })
          .then(result => {
            assert.equal(result, '123456789');
          });
      });
    });

    context('composed of reader without needResult', () => {
      it('resolves', () => {
        let cnt = 0;

        return PromisedLifestream([
            new stream.Readable({
              read(size) {
                if (++cnt < 10) {
                  this.push(String(cnt));
                } else {
                  this.push(null);
                }
              }
            })
          ], {
            needResult: false
          })
          .then(result => {
            assert.isUndefined(result);
          });
      });
    });

    context('composed of reader and transformer with needResult', () => {
      it('resolves result', () => {
        let cnt = 0;

        return PromisedLifestream([
            new stream.Readable({
              read(size) {
                if (++cnt < 10) {
                  this.push(String(cnt));
                } else {
                  this.push(null);
                }
              }
            }),
            new stream.PassThrough()
          ], {
            needResult: true
          })
          .then(result => {
            assert.equal(result, '123456789');
          });
      });
    });

    context('composed of reader and transformer without needResult', () => {
      it('resolves', () => {
        let cnt = 0;

        return PromisedLifestream([
            new stream.Readable({
              read(size) {
                if (++cnt < 10) {
                  this.push(String(cnt));
                } else {
                  this.push(null);
                }
              }
            }),
            new stream.PassThrough()
          ], {
            needResult: false
          })
          .then(result => {
            assert.isUndefined(result)
          });
      });
    });
  });

});
