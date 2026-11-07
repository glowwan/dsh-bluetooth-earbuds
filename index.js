/**
 * Host half of "Bluetooth earbud keys".
 *
 * A small Windows helper (compiled from helper/EarbudHelper.cs with the in-box
 * C# compiler) installs a low-level keyboard hook. It recognizes the media
 * keys that Bluetooth earbuds send, swallows the configured ones, and injects
 * Win+H (Windows voice typing) or Backspace into the focused application.
 *
 * The Host owns the helper lifecycle, keeps the learned mapping in a small
 * JSON state file, and exposes status/calibration/test operations both to the
 * settings page (through a local HTTP route) and to the agent (through a tool).
 */
import { spawn, spawnSync } from 'node:child_process'
import {
  existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync,
} from 'node:fs'
import { createRequire } from 'node:module'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
let electron
try {
  electron = require('electron')
} catch {
  electron = undefined
}
const globalShortcut = electron && electron.globalShortcut ? electron.globalShortcut : undefined

const HERE = dirname(fileURLToPath(import.meta.url))
const ROUTE_PREFIX = '/bluetooth-earbuds'
const HELPER_SOURCE = join(HERE, 'helper', 'EarbudHelper.cs')
const HELPER_EXE = join(HERE, 'helper', 'EarbudHelper.exe')
const CSC = 'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe'

const DEFAULT_CONFIG = Object.freeze({
  enabled: true,
  leftKey: 'VolumeDown',
  rightKey: 'VolumeUp',
  leftAction: 'voice',
  rightAction: 'backspace',
  backspaceCount: 1,
  swallow: true,
})

const KEY_NAMES = new Set([
  'MediaPlayPause', 'MediaNextTrack', 'MediaPrevTrack', 'MediaStop', 'MediaSelect',
  'VolumeMute', 'VolumeDown', 'VolumeUp', 'BrowserBack', 'BrowserForward',
  'Enter', 'Space', 'Tab', 'Escape', 'Backspace', 'Delete',
])
const ACTIONS = new Set(['voice', 'backspace', 'enter', 'space', 'tab', 'escape', 'delete', 'none'])
const SIDES = new Set(['left', 'right'])
const MAX_RECENT = 14

function statePath() {
  const home = process.env.DSH_HOME || join(homedir(), '.dsh')
  return join(home, 'plugin-data', 'bluetooth-earbuds.json')
}

function clampInt(value, min, max, fallback) {
  const number = typeof value === 'number' ? value : Number.parseInt(String(value ?? ''), 10)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, Math.round(number)))
}

function normalizeKey(value) {
  if (typeof value !== 'string') return undefined
  const key = value.trim().slice(0, 64)
  if (KEY_NAMES.has(key)) return key
  if (/^vk:(?:0x[0-9a-f]+|\d+)$/i.test(key)) return key.toLowerCase().startsWith('vk:0x') ? `vk:${Number.parseInt(key.slice(5), 16)}` : key
  return undefined
}

function normalizeAction(value) {
  return typeof value === 'string' && ACTIONS.has(value) ? value : undefined
}

function sanitize(candidate, fallback) {
  const next = { ...fallback }
  if (candidate && typeof candidate === 'object') {
    if (typeof candidate.enabled === 'boolean') next.enabled = candidate.enabled
    if (typeof candidate.swallow === 'boolean') next.swallow = candidate.swallow
    const leftKey = normalizeKey(candidate.leftKey)
    const rightKey = normalizeKey(candidate.rightKey)
    if (leftKey) next.leftKey = leftKey
    if (rightKey) next.rightKey = rightKey
    const leftAction = normalizeAction(candidate.leftAction)
    const rightAction = normalizeAction(candidate.rightAction)
    if (leftAction) next.leftAction = leftAction
    if (rightAction) next.rightAction = rightAction
    next.backspaceCount = clampInt(candidate.backspaceCount, 1, 20, next.backspaceCount)
  }
  return next
}

function loadState(defaults) {
  const fallback = sanitize(defaults, DEFAULT_CONFIG)
  try {
    const raw = JSON.parse(readFileSync(statePath(), 'utf8'))
    return sanitize(raw, fallback)
  } catch {
    return fallback
  }
}

function persistState(config) {
  const path = statePath()
  mkdirSync(dirname(path), { recursive: true })
  const temporary = `${path}.${process.pid}.tmp`
  writeFileSync(temporary, JSON.stringify(config, null, 2), 'utf8')
  renameSync(temporary, path)
}

function ensureHelper() {
  if (!existsSync(HELPER_SOURCE)) {
    throw new Error(`Helper source is missing: ${HELPER_SOURCE}`)
  }
  let needsCompile = !existsSync(HELPER_EXE)
  if (!needsCompile) {
    try {
      needsCompile = statSync(HELPER_SOURCE).mtimeMs > statSync(HELPER_EXE).mtimeMs
    } catch {
      needsCompile = true
    }
  }
  if (needsCompile) {
    if (!existsSync(CSC)) throw new Error(`The Windows C# compiler was not found at ${CSC}`)
    const result = spawnSync(CSC, [
      '/nologo', '/target:exe', '/platform:anycpu', '/optimize+',
      '/r:System.Windows.Forms.dll', '/r:System.Drawing.dll',
      `/out:${HELPER_EXE}`, HELPER_SOURCE,
    ], { windowsHide: true, encoding: 'utf8', timeout: 30_000 })
    if (result.status !== 0) {
      const detail = (result.stderr || result.stdout || '').trim() || `exit ${String(result.status)}`
      throw new Error(`Could not compile the earbud helper: ${detail}`)
    }
  }
  return HELPER_EXE
}

class EarbudService {
  constructor(ctx, defaults) {
    this.ctx = ctx
    this.state = loadState(defaults)
    this.child = undefined
    this.running = false
    this.pid = undefined
    this.startedAt = undefined
    this.lastError = undefined
    this.compileError = undefined
    this.hookInstalled = undefined
    this.hookError = undefined
    this.rawInput = undefined
    this.volumeAvailable = undefined
    this.volumeLevel = undefined
    this.volumeAt = undefined
    this.lastEvent = undefined
    this.lastLearned = undefined
    this.lastClientError = undefined
    this.pendingLearn = undefined
    this.learnTimer = undefined
    this.recent = []
    this.restartTimer = undefined
    this.killTimer = undefined
    this.restartAttempts = 0
    this.stopping = false
    this.lines = undefined
  }

  config() {
    return { ...this.state }
  }

  log(message) {
    try { console.log(`[bluetooth-earbuds] ${message}`) } catch {}
  }

  status() {
    return {
      ok: true,
      platform: process.platform,
      supported: process.platform === 'win32',
      helper: {
        running: this.running,
        pid: this.pid,
        startedAt: this.startedAt,
        error: this.lastError,
        compileError: this.compileError,
        hook: this.hookInstalled,
        hookError: this.hookError,
        rawInput: this.rawInput,
        volume: this.volumeAvailable,
        volumeLevel: this.volumeLevel,
        volumeAt: this.volumeAt,
      },
      config: this.config(),
      conflict: this.state.leftKey === this.state.rightKey,
      pendingLearn: this.pendingLearn,
      lastEvent: this.lastEvent,
      lastLearned: this.lastLearned,
      lastClientError: this.lastClientError,
      recent: this.recent,
      voiceShortcut: 'Win+H',
      stateFile: statePath(),
      runtime: {
        electron: process.versions.electron || null,
        processType: process.type || null,
        globalShortcut: Boolean(globalShortcut),
      },
    }
  }

  start() {
    if (this.child || process.platform !== 'win32') return
    this.stopping = false
    clearTimeout(this.restartTimer)
    this.restartTimer = undefined
    let exe
    try {
      exe = ensureHelper()
      this.compileError = undefined
    } catch (error) {
      this.compileError = error instanceof Error ? error.message : String(error)
      this.lastError = this.compileError
      this.log(this.compileError)
      return
    }
    this.log(`starting helper: ${exe}`)
    let child
    try {
      child = spawn(exe, [], {
        windowsHide: true,
        stdio: ['pipe', 'pipe', 'pipe'],
      })
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : String(error)
      this.log(`spawn failed: ${this.lastError}`)
      return
    }
    this.child = child
    this.running = true
    this.startedAt = new Date().toISOString()
    this.lastError = undefined

    this.lines = createInterface({ input: child.stdout, crlfDelay: Infinity })
    this.lines.on('line', (line) => this.handleLine(line))

    let stderr = ''
    child.stderr.on('data', (chunk) => {
      stderr = (stderr + chunk.toString('utf8')).slice(-4000)
    })

    child.on('error', (error) => {
      this.lastError = error instanceof Error ? error.message : String(error)
      this.log(`helper error: ${this.lastError}`)
    })

    child.on('exit', (code, signal) => {
      if (this.child !== child) return
      this.child = undefined
      this.running = false
      this.pid = undefined
      this.lines?.close()
      this.lines = undefined
      clearTimeout(this.killTimer)
      this.killTimer = undefined
      if (this.stopping) return
      const tail = stderr.trim()
      this.lastError = tail || `The earbud helper stopped (${signal ?? `exit ${String(code)}`}).`
      this.log(`helper exited: ${this.lastError}`)
      if (this.restartAttempts < 5) {
        this.restartAttempts += 1
        this.restartTimer = setTimeout(() => {
          this.restartTimer = undefined
          this.start()
        }, 2000)
      } else {
        this.lastError = 'The earbud helper keeps stopping. Open the settings page and press Restart.'
      }
    })

    this.send({ type: 'config', ...this.config() })
  }

  stop() {
    this.stopping = true
    clearTimeout(this.restartTimer)
    this.restartTimer = undefined
    clearTimeout(this.learnTimer)
    this.learnTimer = undefined
    this.pendingLearn = undefined
    const child = this.child
    if (!child) return
    this.send({ type: 'stop' })
    this.killTimer = setTimeout(() => {
      try { child.kill() } catch {}
    }, 1200)
  }

  send(payload) {
    if (!this.child || !this.child.stdin.writable) return false
    try {
      this.child.stdin.write(`${JSON.stringify(payload)}\n`)
      return true
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : String(error)
      return false
    }
  }

  sendConfig() {
    return this.send({ type: 'config', ...this.config() })
  }

  handleLine(line) {
    let message
    try {
      message = JSON.parse(line)
    } catch {
      return
    }
    if (!message || typeof message !== 'object') return
    if (message.type === 'ready') {
      this.running = true
      this.pid = typeof message.pid === 'number' ? message.pid : undefined
      this.hookInstalled = message.hook === true
      this.hookError = typeof message.hookError === 'number' ? message.hookError : undefined
      this.rawInput = message.raw === true
      this.volumeAvailable = message.volume === true
      this.restartAttempts = 0
      this.lastError = undefined
      this.sendConfig()
      return
    }
    if (message.type === 'capabilities') {
      if (typeof message.volume === 'boolean') this.volumeAvailable = message.volume
      return
    }
    if (message.type === 'volume') {
      if (typeof message.level === 'number') {
        this.volumeLevel = message.level
        this.volumeAt = new Date().toISOString()
      }
      return
    }
    if (message.type === 'event') {      const event = {
        side: message.side === 'right' ? 'right' : 'left',
        key: typeof message.key === 'string' ? message.key : 'unknown',
        action: typeof message.action === 'string' ? message.action : 'none',
        at: new Date().toISOString(),
      }
      this.lastEvent = event
      this.recent = [event, ...this.recent].slice(0, MAX_RECENT)
      return
    }
    if (message.type === 'learning') {
      this.pendingLearn = { side: message.side === 'right' ? 'right' : 'left', at: new Date().toISOString() }
      return
    }
    if (message.type === 'learned') {
      this.finishLearn(message)
      return
    }
    if (message.type === 'error') {
      this.lastError = typeof message.message === 'string' ? message.message : 'The helper reported an error.'
      return
    }
    if (message.type === 'configured') {
      return
    }
    if (message.type === 'stopped') {
      this.running = false
    }
  }

  finishLearn(message) {
    if (!message || !SIDES.has(message.side)) return
    const side = message.side
    const key = normalizeKey(message.key)
    if (!key) {
      this.lastError = `The helper reported an unsupported key: ${String(message.key)}`
      this.pendingLearn = undefined
      clearTimeout(this.learnTimer)
      return
    }
    const other = side === 'left' ? this.state.rightKey : this.state.leftKey
    if (key === other) {
      this.lastLearned = { side, key, at: new Date().toISOString(), conflict: true }
      this.lastError = 'Both earbuds sent the same key. Windows cannot tell left from right for that gesture; choose a different gesture for one side in the earbud app.'
      this.pendingLearn = undefined
      clearTimeout(this.learnTimer)
      this.learnTimer = undefined
      return
    }
    this.state[side === 'left' ? 'leftKey' : 'rightKey'] = key
    this.lastLearned = { side, key, at: new Date().toISOString(), conflict: false }
    this.lastError = undefined
    this.pendingLearn = undefined
    clearTimeout(this.learnTimer)
    this.learnTimer = undefined
    try {
      persistState(this.state)
    } catch (error) {
      this.lastError = `The mapping works now but could not be saved: ${error instanceof Error ? error.message : String(error)}`
    }
    this.sendConfig()
  }

  learn(side) {
    if (!SIDES.has(side)) return { ok: false, error: 'Choose left or right.' }
    if (process.platform !== 'win32') return { ok: false, error: 'This plugin needs Windows.' }
    if (!this.running) {
      this.start()
      if (!this.running) return { ok: false, error: this.lastError || 'The earbud helper is not running.' }
    }
    clearTimeout(this.learnTimer)
    this.pendingLearn = { side, at: new Date().toISOString() }
    this.lastError = undefined
    if (!this.send({ type: 'learn', side })) {
      this.pendingLearn = undefined
      return { ok: false, error: 'Could not ask the earbud helper to listen.' }
    }
    this.learnTimer = setTimeout(() => {
      if (this.pendingLearn?.side !== side) return
      this.pendingLearn = undefined
      this.send({ type: 'cancel-learn' })
      this.lastError = 'No earbud key arrived. Touch the earbud again, or check that it is connected and sends media keys to Windows.'
    }, 60_000)
    return { ok: true, pendingLearn: this.pendingLearn }
  }

  update(patch) {
    if (!patch || typeof patch !== 'object') return { ok: false, error: 'No settings were supplied.' }
    const candidate = sanitize(patch, this.state)
    if (candidate.leftKey === candidate.rightKey) {
      return { ok: false, error: 'Left and right already use the same key. Windows cannot distinguish them; learn a different gesture for one side.' }
    }
    this.send({ type: 'cancel-learn' })
    this.pendingLearn = undefined
    clearTimeout(this.learnTimer)
    this.learnTimer = undefined
    this.state = candidate
    try {
      persistState(this.state)
    } catch (error) {
      return { ok: false, error: `The setting is live but could not be saved: ${error instanceof Error ? error.message : String(error)}` }
    }
    this.sendConfig()
    return { ok: true, config: this.config() }
  }

  test(side) {
    if (!SIDES.has(side)) return { ok: false, error: 'Choose left or right.' }
    if (!this.running) return { ok: false, error: this.lastError || 'The earbud helper is not running.' }
    const action = side === 'left' ? this.state.leftAction : this.state.rightAction
    const delayMs = action === 'voice' ? 2500 : 250
    if (!this.send({ type: 'action', side, delayMs })) {
      return { ok: false, error: 'Could not reach the earbud helper.' }
    }
    return { ok: true, side, action, delayMs }
  }

  simulate(side) {
    if (!SIDES.has(side)) return { ok: false, error: 'Choose left or right.' }
    if (!this.running) return { ok: false, error: this.lastError || 'The earbud helper is not running.' }
    const key = side === 'left' ? this.state.leftKey : this.state.rightKey
    const action = side === 'left' ? this.state.leftAction : this.state.rightAction
    if (!this.send({ type: 'simulate', side })) {
      return { ok: false, error: 'Could not reach the earbud helper.' }
    }
    return { ok: true, side, key, action, note: 'The helper injected the configured media key as a test; its hook should record an event and perform the action.' }
  }

  restart() {
    const wasRunning = this.running
    this.stop()
    this.restartAttempts = 0
    setTimeout(() => {
      this.stopping = false
      this.start()
    }, wasRunning ? 1500 : 50)
    return { ok: true }
  }
}

function allowedOrigin(origin, ownOrigin) {
  if (!origin) return true
  if (ownOrigin && origin === ownOrigin) return true
  return /^https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?$/i.test(origin)
}

async function readJsonBody(req) {
  let size = 0
  const chunks = []
  for await (const chunk of req) {
    size += chunk.length
    if (size > 64 * 1024) throw new Error('Request body is too large.')
    chunks.push(chunk)
  }
  if (chunks.length === 0) return {}
  const text = Buffer.concat(chunks).toString('utf8')
  if (!text.trim()) return {}
  return JSON.parse(text)
}

function respond(res, status, body) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  })
  res.end(payload)
}

function createRouteHandler(service, ownOrigin) {
  return async function route(req, res) {
    try {
      if (!allowedOrigin(req.headers.origin, ownOrigin)) {
        respond(res, 403, { ok: false, error: 'Origin not allowed.' })
        return
      }
      const url = new URL(req.url ?? '/', 'http://localhost')
      if (!url.pathname.startsWith(ROUTE_PREFIX)) {
        respond(res, 404, { ok: false, error: 'Not found.' })
        return
      }
      const suffix = url.pathname.slice(ROUTE_PREFIX.length) || '/'
      if (req.method === 'GET' && suffix === '/status') {
        respond(res, 200, service.status())
        return
      }
      if (req.method !== 'POST') {
        respond(res, 405, { ok: false, error: 'Use GET /status or POST an action.' })
        return
      }
      if (req.headers['x-dsh-earbuds'] !== '1') {
        respond(res, 403, { ok: false, error: 'Missing the plugin request header.' })
        return
      }
      let body
      try {
        body = await readJsonBody(req)
      } catch (error) {
        respond(res, 400, { ok: false, error: error instanceof Error ? error.message : 'Invalid JSON.' })
        return
      }
      if (suffix === '/learn') {
        respond(res, 200, service.learn(body.side))
        return
      }
      if (suffix === '/config') {
        respond(res, 200, service.update(body))
        return
      }
      if (suffix === '/test') {
        respond(res, 200, service.test(body.side))
        return
      }
      if (suffix === '/simulate') {
        respond(res, 200, service.simulate(body.side))
        return
      }
      if (suffix === '/restart') {
        respond(res, 200, service.restart())
        return
      }
      if (suffix === '/client-error') {
        service.lastClientError = {
          message: typeof body.message === 'string' ? body.message.slice(0, 4000) : 'Unknown client error',
          stack: typeof body.stack === 'string' ? body.stack.slice(0, 8000) : undefined,
          at: new Date().toISOString(),
        }
        respond(res, 200, { ok: true })
        return
      }
      respond(res, 404, { ok: false, error: 'Unknown action.' })
    } catch (error) {
      respond(res, 500, { ok: false, error: error instanceof Error ? error.message : String(error) })
    }
  }
}

function toolResult(value) {
  return {
    content: [{ type: 'text', text: JSON.stringify(value, null, 2) }],
  }
}

export function apply(ctx, config = {}) {
  if (process.platform !== 'win32') {
    console.log('[bluetooth-earbuds] This plugin is Windows-only and will stay idle on this platform.')
    return
  }

  const service = new EarbudService(ctx, config)
  service.start()

  ctx.effect(() => () => service.stop())

  const webServer = ctx.get('webServer')
  if (webServer) {
    let ownOrigin
    try { ownOrigin = webServer.getOrigin() } catch {}
    const handler = createRouteHandler(service, ownOrigin)
    ctx.effect(() => webServer.register({
      kind: 'prefix',
      path: ROUTE_PREFIX,
      handler,
    }))
  }

  const tools = ctx.get('tools')
  if (tools) {
    ctx.effect(() => tools.register({
      name: 'bluetooth_earbuds',
      description: 'Inspect, calibrate, test, or change the Bluetooth earbud shortcut mapping. Left earbud normally starts Windows voice typing (Win+H); right earbud sends Backspace. Learning waits for the next physical earbud key, so this operation only starts the listener — the user must touch the earbud afterwards.',
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          action: {
            type: 'string',
            enum: ['status', 'learn', 'set', 'test', 'simulate', 'restart'],
            description: 'status: read state; learn: wait for one earbud key; set: update mapping; test: perform an action; simulate: inject the configured key as if the earbud sent it; restart: restart the helper.',
          },
          side: { type: 'string', enum: ['left', 'right'], description: 'Earbud side for learn/test.' },
          leftKey: { type: 'string', description: 'Key name for the left earbud, for example MediaPlayPause or vk:179.' },
          rightKey: { type: 'string', description: 'Key name for the right earbud, for example MediaNextTrack or vk:176.' },
          leftAction: { type: 'string', enum: ['voice', 'backspace', 'enter', 'space', 'tab', 'escape', 'delete', 'none'] },
          rightAction: { type: 'string', enum: ['voice', 'backspace', 'enter', 'space', 'tab', 'escape', 'delete', 'none'] },
          backspaceCount: { type: 'integer', minimum: 1, maximum: 20 },
          swallow: { type: 'boolean', description: 'Block the original media key so music does not also react.' },
          enabled: { type: 'boolean' },
        },
        required: ['action'],
      },
      output: {
        schema: { type: 'object', additionalProperties: true },
        render(_args, value) {
          return [{ type: 'text', text: JSON.stringify(value, null, 2) }]
        },
      },
      async execute(args) {
        const input = args && typeof args === 'object' ? args : {}
        switch (input.action) {
          case 'status':
            return toolResult(service.status())
          case 'learn':
            return toolResult(service.learn(input.side))
          case 'set':
            return toolResult(service.update(input))
          case 'test':
            return toolResult(service.test(input.side))
          case 'simulate':
            return toolResult(service.simulate(input.side))
          case 'restart':
            return toolResult(service.restart())
          default:
            return toolResult({ ok: false, error: 'Unknown action.' })
        }
      },
    }))
  }
}
