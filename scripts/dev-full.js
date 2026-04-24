import { spawn } from 'node:child_process'

const isWindows = process.platform === 'win32'

function run(name, command, args) {
  const child = spawn(command, args, { stdio: 'inherit', shell: isWindows })
  child.on('exit', (code) => {
    if (code && code !== 0) console.log(`${name} завершился с кодом ${code}`)
  })
  return child
}

const backend = run('backend', 'node', ['server/index.js'])
const frontend = run('frontend', 'npx', ['vite', '--host', '0.0.0.0'])

function stop() {
  backend.kill()
  frontend.kill()
  process.exit()
}

process.on('SIGINT', stop)
process.on('SIGTERM', stop)
