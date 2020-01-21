"use strict";

var _path = require("path");

var _fs = require("fs");

var _crypto = require("crypto");

var _crypt = require("./crypt");

const files = {
  keyFile: (0, _path.join)(__dirname, 'keyStore'),
  ivFile: (0, _path.join)(__dirname, 'ivStore'),
  cryptFile: (0, _path.join)(__dirname, 'cryptStore')
};
describe('Crypt', () => {
  afterEach(() => Promise.all(Object.values(files).map(filepath => new Promise(resolve => (0, _fs.unlink)(filepath, resolve)))));
  it('correctly encrypts and decrypts a value', async () => {
    const crypt = (0, _crypt.getCrypt)(files);
    const testText = 'ABC';
    const testBuffer = Buffer.from(testText, 'utf8');
    await crypt.set('test1', testText);
    await crypt.set('test2', testBuffer);
    const test1Value = await crypt.get('test1');
    const test2Value = await crypt.get('test2');
    expect(test1Value.toString('utf8')).toBe(testText);
    expect(test2Value.toString('utf8')).toBe(testText);
    expect(testBuffer.compare(test1Value)).toBe(0);
    expect(testBuffer.compare(test2Value)).toBe(0);
  });
  it('correctly removes a value', async () => {
    const crypt = (0, _crypt.getCrypt)(files);
    const testText = 'ABC';
    await crypt.set('test', testText);
    await crypt.remove('test');
    const removedValue = await crypt.get('test');
    expect(removedValue).toBeUndefined();
  });
  it('correctly lists all names', async () => {
    const crypt = (0, _crypt.getCrypt)(files);
    const names = [];

    for (let i = 0; i < 100; ++i) {
      names.push((0, _crypto.randomBytes)(12).toString('hex'));
    }

    for (const name of names) {
      await crypt.set(name, 'abc');
    }

    const foundNames = await crypt.names();
    expect(foundNames).toEqual(names);
  });
});