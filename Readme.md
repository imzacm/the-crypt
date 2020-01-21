# The Crypt
The crypt is a program and library for storing encrypted text.

A crypt consists of three files that should be kept in separate locations for maximum security:

- Key file - stores a list of encryption keys
- IV file - stores a list of IVs
- Crypt file - stores a list of encrypted values

The theory (I'm no expert) is that without any one of these files, the data in the crypt file is useless, therefore secure.

## Command line interface
The cli takes no arguments and after requesting the paths for the three files above, will act as a shell.

### Usage
```bash
npx crypt-cli
```

## GUI
The GUI allows you to manage your crypt as easily as filling in an online form.

### Usage
```bash
npx crypt-ui
```

## JavaScript API
The JavaScript API exposes the following function:

### getCrypt({ keyFile: string, ivFile: string, cryptFile: string }): Object
This function returns an object with the following functions on it:

#### get(name: string): Buffer | undefined
This function returns the decrypted value associated with ```name``` or undefined.

#### set(name: string, value: string | Buffer): undefined
This function encrypts the value and writes the key, iv, and encrypted data to the appropriate files.

#### remove(name: string): undefined
This function removes the key, iv and encrypted data associated with ```name```.

#### names(): string[]
This function returns a list of names stored in the crypt.
