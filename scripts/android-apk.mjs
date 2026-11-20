import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const androidDir = path.join(repoRoot, 'android')
const isWindows = process.platform === 'win32'

function readJavaProperties(filePath) {
  if (!fs.existsSync(filePath)) return {}
  const out = {}
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/)
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || line.startsWith('!')) continue
    const idx = line.indexOf('=')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const val = line
      .slice(idx + 1)
      .trim()
      .replace(/\\:/g, ':')
      .replace(/\\\\/g, '\\')
    out[key] = val
  }
  return out
}

function hasJavaBin(dir) {
  if (!dir) return false
  const bin = path.join(dir, 'bin', isWindows ? 'java.exe' : 'java')
  return fs.existsSync(bin)
}

function resolveJavaHome() {
  if (hasJavaBin(process.env.JAVA_HOME)) return process.env.JAVA_HOME

  const gradleConfig = readJavaProperties(
    path.join(androidDir, '.gradle', 'config.properties')
  )
  if (hasJavaBin(gradleConfig['java.home'])) return gradleConfig['java.home']

  const candidates = []
  const userJdksDir = path.join(os.homedir(), '.jdks')
  if (fs.existsSync(userJdksDir)) {
    for (const entry of fs.readdirSync(userJdksDir)) {
      candidates.push(path.join(userJdksDir, entry))
    }
  }
  candidates.push(
    'C:\\Program Files\\Android\\Android Studio\\jbr',
    'D:\\Android\\Android Studio\\jbr'
  )

  for (const candidate of candidates) {
    if (hasJavaBin(candidate)) return candidate
  }
  return null
}

function resolveAndroidSdk() {
  if (process.env.ANDROID_HOME && fs.existsSync(process.env.ANDROID_HOME)) {
    return process.env.ANDROID_HOME
  }
  if (
    process.env.ANDROID_SDK_ROOT &&
    fs.existsSync(process.env.ANDROID_SDK_ROOT)
  ) {
    return process.env.ANDROID_SDK_ROOT
  }
  const localProps = readJavaProperties(path.join(androidDir, 'local.properties'))
  if (localProps['sdk.dir'] && fs.existsSync(localProps['sdk.dir'])) {
    return localProps['sdk.dir']
  }
  const defaultSdk = path.join(os.homedir(), 'AppData', 'Local', 'Android', 'Sdk')
  if (fs.existsSync(defaultSdk)) return defaultSdk
  return null
}

function runStep(cmd, args, opts = {}) {
  const needsCmdShell =
    isWindows &&
    (cmd === 'npm' ||
      cmd === 'npx' ||
      cmd.toLowerCase().endsWith('.bat') ||
      cmd.toLowerCase().endsWith('.cmd'))

  const res = needsCmdShell
    ? spawnSync('cmd.exe', ['/d', '/s', '/c', cmd, ...args], {
        stdio: 'inherit',
        ...opts,
      })
    : spawnSync(cmd, args, {
        stdio: 'inherit',
        ...opts,
      })
  if (res.error) {
    console.error(`[RITME Android] Failed to run ${cmd}:`, res.error.message)
    process.exit(1)
  }
  if (res.status !== 0) {
    process.exit(res.status ?? 1)
  }
}

const mode = (process.argv[2] || 'debug').toLowerCase()
const skipWebBuild = process.argv.includes('--skip-web-build')

if (!['debug', 'release', 'run'].includes(mode)) {
  console.error('Usage: node scripts/android-apk.mjs [debug|release|run] [--skip-web-build]')
  process.exit(1)
}

const javaHome = resolveJavaHome()
if (!javaHome) {
  console.error(
    '[RITME Android] JDK 21 tidak ditemukan. Set JAVA_HOME atau pasang JDK lewat Android Studio.'
  )
  process.exit(1)
}

const androidSdk = resolveAndroidSdk()
if (!androidSdk) {
  console.error(
    '[RITME Android] Android SDK tidak ditemukan. Pastikan android/local.properties berisi sdk.dir yang valid.'
  )
  process.exit(1)
}

const env = {
  ...process.env,
  JAVA_HOME: javaHome,
  ANDROID_HOME: androidSdk,
  ANDROID_SDK_ROOT: androidSdk,
  PATH: `${path.join(javaHome, 'bin')}${path.delimiter}${path.join(androidSdk, 'platform-tools')}${path.delimiter}${process.env.PATH || ''}`,
}

console.log(`[RITME Android] JAVA_HOME   = ${javaHome}`)
console.log(`[RITME Android] ANDROID_SDK = ${androidSdk}`)

if (!skipWebBuild) {
  console.log('\n[1/3] Building web bundle (npm run build)...')
  runStep('npm', ['run', 'build'], { cwd: repoRoot, env })

  console.log('\n[2/3] Syncing Capacitor Android (npx cap sync android)...')
  runStep('npx', ['cap', 'sync', 'android'], { cwd: repoRoot, env })
}

const gradleCmd = isWindows ? path.join(androidDir, 'gradlew.bat') : './gradlew'
const gradleTask = mode === 'release' ? 'assembleRelease' : 'assembleDebug'

console.log(`\n[3/3] Building Android APK (${gradleTask})...`)
runStep(gradleCmd, [gradleTask], { cwd: androidDir, env })

const apkPath =
  mode === 'release'
    ? path.join(
        androidDir,
        'app',
        'build',
        'outputs',
        'apk',
        'release',
        'app-release-unsigned.apk'
      )
    : path.join(
        androidDir,
        'app',
        'build',
        'outputs',
        'apk',
        'debug',
        'app-debug.apk'
      )

if (fs.existsSync(apkPath)) {
  const sizeMb = (fs.statSync(apkPath).size / (1024 * 1024)).toFixed(2)
  console.log(`\n[RITME Android] APK siap: ${apkPath} (${sizeMb} MB)`)
}

if (mode === 'run') {
  const adbBin = path.join(
    androidSdk,
    'platform-tools',
    isWindows ? 'adb.exe' : 'adb'
  )
  if (!fs.existsSync(adbBin)) {
    console.error('[RITME Android] adb tidak ditemukan di Android SDK platform-tools.')
    process.exit(1)
  }

  const devicesCheck = spawnSync(adbBin, ['devices'], { encoding: 'utf8', env })
  const deviceLines = (devicesCheck.stdout || '')
    .split(/\r?\n/)
    .slice(1)
    .map((l) => l.trim())
    .filter((l) => l.endsWith('\tdevice') || /\sdevice$/.test(l))

  if (deviceLines.length === 0) {
    console.log(
      '\n[RITME Android] Tidak ada perangkat/emulator Android aktif terdeteksi oleh adb.'
    )
    console.log(
      'Hubungkan HP Android (USB Debugging aktif) atau jalankan Emulator di Android Studio, lalu jalankan kembali: npm run android:run'
    )
    console.log(`Atau salin & pasang manual APK: ${apkPath}`)
    process.exit(0)
  }

  console.log('\n[RITME Android] Installing APK ke perangkat/emulator...')
  runStep(adbBin, ['install', '-r', apkPath], { cwd: repoRoot, env })

  console.log('[RITME Android] Launching RITME (com.ritme.app/.MainActivity)...')
  runStep(
    adbBin,
    ['shell', 'am', 'start', '-n', 'com.ritme.app/.MainActivity'],
    { cwd: repoRoot, env }
  )
  console.log('[RITME Android] Aplikasi berhasil dijalankan!')
}
