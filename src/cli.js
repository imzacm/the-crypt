#!/usr/bin/env node

import { resolve } from 'path'
import { createInterface } from 'readline'

import { getCrypt } from './crypt'

const ask = (question, muted) => new Promise(resolve => {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout
  })
  readline.question(question, result => {
    readline.close()
    resolve(result)
  })
  readline._writeToOutput = str => {
    readline.output.write(muted ? '*' : str)
  }
})

const run = async () => {
  const keyFile = await ask('Key File: ', true)
  const ivFile = await ask('IV File: ', true)
  const cryptFile = await ask('Crypt File: ', true)

  const crypt = getCrypt({
    keyFile: resolve(keyFile),
    ivFile: resolve(ivFile),
    cryptFile: resolve(cryptFile)
  })

  while (true) {
    const action = await ask('Action (get(name), set(name, value), remove(name), names(), exit()): ')
    const actionWord = action.split(' ').join('').split('(')[0]
    const actionParams = action.substring(action.indexOf('(') + 1, action.indexOf(')')).split(',').map(a => a.trim())

    if (actionWord === 'exit') {
      break
    }

    if (actionWord === 'names') {
      const names = await crypt.names()
      console.log(names.join(', '))
    }

    if (actionWord === 'get') {
      const [ name ] = actionParams
      if (!name) {
        console.error('get(name) must be called with a name')
      }
      else {
        const value = await crypt.get(name)
        console.log(value ? value.toString('utf8') : null)
      }
    }

    if (actionWord === 'set') {
      const [ name, value ] = actionParams
      if (!name || !value) {
        console.error('set(name, value) must be called with a name and a value')
      }
      else {
        await crypt.set(name, value)
      }
    }

    if (actionWord === 'remove') {
      const [ name ] = actionParams
      if (!name) {
        console.error('remove(name) must be called with a name')
      }
      else {
        await crypt.remove(name)
      }
    }
  }
}

run().catch(error => {
  console.error(error)
  process.exit(1)
})
