'use strict';

const Writable = require('stream').Writable;

/**
 * PromisedLifestream
 *
 * @param {Array<Stream>} streams - streams, the first is Readable, the second or later is Transform. the last is Transform or Writable.
 * @param {Object} options - options
 * @param {Boolean} options.needResult - whether it resolves the result or not
 */
module.exports = function PromisedLifestream(streams, options) {
  if (!Array.isArray(streams) || streams.length === 0) {
    return Promise.resolve();
  }

  const opts = options || {};
  const needResult = opts.needResult || false;

  return new Promise(function(resolve, reject) {
      const lastStream = streams[streams.length - 1];
      const lastIsWriter = lastStream.writable && !lastStream.readable;
      const objectMode =  getObjectMode(lastStream);

      if (lastIsWriter) {
        if (lastStream === process.stdout || lastStream === process.stderr) {
          const prevLastStream = streams[streams.length - 2];
          if (prevLastStream.writable) {
            prevLastStream.on('finish', () => {
              setImmediate(resolve);
            });
          } else {
            prevLastStream.on('end', () => {
              setImmediate(resolve);
            });
          }
        } else {
          lastStream.on('finish', resolve);
        }
      } else {
        streams.push(createLast(objectMode, needResult, resolve));
      }

      let life = streams[0];
      life.on('error', reject);

      let next;
      for (let i = 1; i < streams.length; i++) {
        next = streams[i];
        next.on('error', reject);
        life = life.pipe(next);
      }
    });
}

function createLast(objectMode, needResult, resolve) {
  const results = [];
  let resultBuffer = new Buffer(0);

  let write;
  if (needResult) {
    if (objectMode) {
      write = function (obj, enc, cb) {
          results.push(obj);
          cb();
        };
    } else {
      write = function (chunk, enc, cb) {
          try {
            const buffer = Buffer.isBuffer(chunk) ? chunk : new Buffer(chunk, enc);
            resultBuffer = Buffer.concat([resultBuffer, buffer]);
            cb();
          } catch(err) {
            cb(err);
          }
        };
    }
  } else {
    write = function (data, enc, cb) { cb() };
  }

  const lastStream = new Writable({ objectMode, write });
  lastStream.on('finish', () => {
    if (needResult) {
      if (objectMode) {
        resolve(results);
      } else {
        resolve(resultBuffer);
      }
    } else {
      resolve();
    }
  });

  return lastStream
}

function getObjectMode(stream) {
  if ('_writableState' in stream) {
    return stream._writableState.objectMode;
  } else if ('_readableState' in stream) {
    return stream._readableState.objectMode;
  } else {
    return true;
  }
}
