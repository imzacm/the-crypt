#!/usr/bin/env node

const { spawn } = require('child_process')
const { join } = require('path')

const app = spawn('node', [ require.resolve('electron').replace('index.js', 'cli.js'), 'ui/main.js' ], {
  stdio: 'inherit',
  cwd: join(__dirname, '..')
})
app.on('exit', code => process.exit(code))
