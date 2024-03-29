import { join } from 'path'
import { unlink } from 'fs'
import { randomBytes } from 'crypto'

import { getCrypt } from './crypt'

const files = {
  keyFile: join(__dirname, 'keyStore'),
  ivFile: join(__dirname, 'ivStore'),
  cryptFile: join(__dirname, 'cryptStore')
}

describe('Crypt', () => {
  afterEach(() => Promise.all(
    Object.values(files).map(filepath =>
      new Promise(resolve => unlink(filepath, resolve)))
  ))

  it('correctly encrypts and decrypts a value', async () => {
    const crypt = getCrypt(files)
    const testText = 'ABC'
    const testBuffer = Buffer.from(testText, 'utf8')

    await crypt.set('test1', testText)
    await crypt.set('test2', testBuffer)

    const test1Value = await crypt.get('test1')
    const test2Value = await crypt.get('test2')

    expect(test1Value.toString('utf8')).toBe(testText)
    expect(test2Value.toString('utf8')).toBe(testText)
    expect(testBuffer.compare(test1Value)).toBe(0)
    expect(testBuffer.compare(test2Value)).toBe(0)
  })

  it('correctly removes a value', async () => {
    const crypt = getCrypt(files)
    const testText = 'ABC'

    await crypt.set('test', testText)
    await crypt.remove('test')
    const removedValue = await crypt.get('test')
    expect(removedValue).toBeUndefined()
  })

  it('correctly lists all names', async () => {
    const crypt = getCrypt(files)
    const names = []
    for (let i = 0; i < 100; ++i) {
      names.push(randomBytes(12).toString('hex'))
    }
    for (const name of names) {
      await crypt.set(name, 'abc')
    }
    const foundNames = await crypt.names()
    expect(foundNames).toEqual(names)
  })
})
