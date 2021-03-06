import { readFile, writeFile } from 'fs'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const generateIv = () => randomBytes(16)
const generateKey = () => randomBytes(32)

const encrypt = data => {
  const iv = generateIv()
  const key = generateKey()
  const cipher = createCipheriv('aes-256-cbc', key, iv)
  const encrypted = Buffer.concat([ cipher.update(data), cipher.final() ])
  return {
    iv,
    key,
    encrypted
  }
}

const decrypt = (data, key, iv) => {
  const decipher = createDecipheriv('aes-256-cbc', key, iv)
  const decrypted = Buffer.concat([ decipher.update(data), decipher.final() ])
  return {
    iv,
    key,
    decrypted
  }
}

const readFileAsync = filePath => new Promise((resolve, reject) => {
  readFile(filePath, 'utf8', (error, file) => error ? resolve('') : resolve(file))
})

const writeFileAsync = (file, filePath) => new Promise((resolve, reject) => {
  writeFile(filePath, file, 'utf8', error => error ? reject(error) : resolve())
})

const delimiter = ';:;'
const seperator = ':;:'

const padName = name => `${ seperator }${ name }${ seperator }`

export const getCrypt = ({ keyFile, ivFile, cryptFile }) => {
  const getFiles = async () => {
    const keyStore = await readFileAsync(keyFile)
    const ivStore = await readFileAsync(ivFile)
    const cryptStore = await readFileAsync(cryptFile)

    return { keyStore, ivStore, cryptStore }
  }

  const setFiles = async ({ keyStore, ivStore, cryptStore }) => {
    await writeFileAsync(keyStore, keyFile)
    await writeFileAsync(ivStore, ivFile)
    await writeFileAsync(cryptStore, cryptFile)
  }

  return {
    async get(name) {
      const { keyStore, ivStore, cryptStore } = await getFiles()

      const extractValue = store => {
        const index = store.indexOf(padName(name))
        if (index === -1) {
          return ''
        }
        const endIndex = store.indexOf(delimiter, index)
        return store.slice(index + padName(name).length, endIndex)
      }

      const key = Buffer.from(extractValue(keyStore), 'hex')
      const iv = Buffer.from(extractValue(ivStore), 'hex')
      const encrypted = Buffer.from(extractValue(cryptStore), 'hex')

      if (key.length === 0 || iv.length === 0 || encrypted.length === 0) {
        return
      }

      const { decrypted } = decrypt(encrypted, key, iv)
      return decrypted
    },
    async set(name, value) {
      await this.remove(name)
      const { iv, key, encrypted } = encrypt(value)
      const { keyStore, ivStore, cryptStore } = await getFiles()

      const addToStore = (store, value) => `${ store }${ padName(name) }${ value }${ delimiter }`

      await setFiles({
        keyStore: addToStore(keyStore, key.toString('hex')),
        ivStore: addToStore(ivStore, iv.toString('hex')),
        cryptStore: addToStore(cryptStore, encrypted.toString('hex'))
      })
    },
    async remove(name) {
      const { keyStore, ivStore, cryptStore } = await getFiles()

      const removeExisting = store => {
        const index = store.indexOf(padName(name))
        if (index === -1) {
          return store
        }
        const endIndex = store.indexOf(delimiter, index)
        return `${ store.slice(0, index) }${ store.slice(endIndex + delimiter.length) }`
      }

      await setFiles({
        keyStore: removeExisting(keyStore),
        ivStore: removeExisting(ivStore),
        cryptStore: removeExisting(cryptStore)
      })
    },
    async names() {
      const ivStore = await readFileAsync(ivFile)
      return ivStore
        .split(delimiter)
        .map(str => {
          const match = str.match(/:;:(.+?):;:/g)
          if (!match) {
            return
          }
          return match[0].split(seperator)[1]
        })
        .filter(name => !!name)
    }
  }
}
