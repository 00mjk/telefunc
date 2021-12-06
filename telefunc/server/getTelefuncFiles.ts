import type { ViteDevServer } from 'vite'
import type { TelefuncFiles, TelefuncFilesUntyped } from './types'
import { join } from 'path'
import { statSync } from 'fs'
import { loadTelefuncFilesWithVite } from '../plugin/vite/loadTelefuncFilesWithVite'
import { loadTelefuncFilesWithWebpack } from '../plugin/webpack/loadTelefuncFilesWithWebpack'
import { assert } from '../shared/utils'

export { getTelefuncFiles }

type BundlerName = 'webpack' | 'nextjs' | 'vite' | 'unknown'

async function getTelefuncFiles(callContext: {
  _root: string
  _viteDevServer?: ViteDevServer
  _telefuncFilesProvidedByUser: null | TelefuncFiles
  _isProduction: boolean
}): Promise<TelefuncFilesUntyped | null> {
  const bundlerName = getBundlerName(callContext)

  if (callContext._telefuncFilesProvidedByUser) {
    return callContext._telefuncFilesProvidedByUser
  }

  if (bundlerName === 'vite' || bundlerName === 'unknown') {
    return loadTelefuncFilesWithVite(callContext)
  }

  if (bundlerName === 'webpack') {
    return loadTelefuncFilesWithWebpack(callContext)
  }

  if (bundlerName === 'nextjs') {
    // TODO: WIP
    return null
  }

  assert(false)
}

// TODO: rethink this
function getBundlerName({ _viteDevServer }: Record<string, unknown>): BundlerName {
  if (_viteDevServer) {
    return 'vite'
  }
  if (isWebpack()) {
    return 'webpack'
  }
  if (isNextjs()) {
    return 'nextjs'
  }
  return 'unknown'
}

function isWebpack() {
  // TODO: make this test more robust
  const webpackConfigFile = 'webpack.js'
  return pathExits(join(process.cwd(), webpackConfigFile))
}

function isNextjs() {
  return pathExits(join(process.cwd(), '.next'))
}

function pathExits(path: string) {
  try {
    // `throwIfNoEntry: false` isn't supported in older Node.js versions
    return !!statSync(path /*{ throwIfNoEntry: false }*/)
  } catch (err) {
    return false
  }
}