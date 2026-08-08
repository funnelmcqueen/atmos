/**
 * Route-mode gate.
 *
 *   pnpm check:routes                 # builds, then checks
 *   pnpm check:routes build.log       # checks an existing build log instead
 *
 * Builds the app, parses the route table Next prints, and compares it against
 * `scripts/route-modes.ts`. Exits non-zero on any disagreement.
 *
 * The expectations live in that file, not this one — adding a page should be one
 * obvious edit, not a hunt through parsing code.
 *
 * Passing a log path skips the build. That is for CI, where `pnpm build` has
 * already run and building twice is a few wasted minutes: pipe the build output
 * to a file and hand it here.
 */
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import {
  EXPECTED_ROUTE_MODES,
  MODE_BY_SYMBOL,
  type RouteMode,
} from './route-modes'

/**
 * Top-level rows of Next's route table:
 *
 *   ┌ ◐ /
 *   ├ ƒ /api/graphql
 *   └ ○ /my-route
 *
 * The box-drawing character must be the FIRST character. Individual prerendered
 * paths are listed underneath their route and start with `│`, so anchoring here
 * skips them — those are per-param entries, not routes, and there can be
 * hundreds of them.
 */
const ROUTE_ROW = /^[┌├└]\s+([○◐ƒ])\s+(\S+)/

/** Next omits colour when its output is piped, but a TTY-forcing CI would not. */
const stripAnsi = (s: string): string => s.replace(/\[[0-9;]*m/g, '')

const parseRouteTable = (output: string): Map<string, RouteMode> => {
  const found = new Map<string, RouteMode>()

  for (const raw of stripAnsi(output).split(/\r?\n/)) {
    const match = raw.match(ROUTE_ROW)
    if (!match) continue

    const [, symbol, route] = match
    const mode = MODE_BY_SYMBOL[symbol]
    // A symbol the table uses but this script does not know is a Next upgrade
    // introducing a new rendering mode. Say so rather than skipping the row.
    if (!mode) {
      console.error(`Unrecognised rendering symbol ${symbol} for ${route}.`)
      console.error('Next may have added a rendering mode — update scripts/route-modes.ts.')
      process.exit(1)
    }
    found.set(route, mode)
  }

  return found
}

const runBuild = (): string => {
  console.log('Building to read the route table…\n')
  const result = spawnSync('pnpm', ['build'], {
    shell: true, // resolves pnpm.cmd on Windows
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })

  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
  if (result.status !== 0) {
    console.error(output)
    console.error('\nBuild failed, so there is no route table to check.')
    process.exit(1)
  }
  return output
}

const main = () => {
  const logPath = process.argv[2]
  const output = logPath ? readFileSync(logPath, 'utf8') : runBuild()
  const actual = parseRouteTable(output)

  if (actual.size === 0) {
    console.error('No route table found in the build output.')
    console.error('If Next changed its output format, update the ROUTE_ROW pattern.')
    process.exit(1)
  }

  const wrongMode: string[] = []
  const missing: string[] = []
  const unexpected: string[] = []

  for (const [route, mode] of actual) {
    const expected = EXPECTED_ROUTE_MODES[route]
    if (!expected) unexpected.push(`${route}  (built as ${mode})`)
    else if (expected !== mode) wrongMode.push(`${route}\n      expected ${expected}, built as ${mode}`)
  }

  for (const route of Object.keys(EXPECTED_ROUTE_MODES)) {
    if (!actual.has(route)) missing.push(route)
  }

  if (wrongMode.length === 0 && missing.length === 0 && unexpected.length === 0) {
    console.log(`✓ ${actual.size} routes render as expected.`)
    return
  }

  console.error('\nRoute modes do not match scripts/route-modes.ts.\n')

  if (wrongMode.length > 0) {
    console.error('  Wrong rendering mode:')
    for (const line of wrongMode) console.error(`    - ${line}`)
    console.error(
      '\n    A page that dropped to `dynamic` reads the request outside a Suspense\n' +
        '    boundary — see docs/13-caching.md. Fix the page, not the expectation.\n',
    )
  }

  if (unexpected.length > 0) {
    console.error('  Built but not listed:')
    for (const line of unexpected) console.error(`    - ${line}`)
    console.error('\n    Add these to EXPECTED_ROUTE_MODES in scripts/route-modes.ts.\n')
  }

  if (missing.length > 0) {
    console.error('  Listed but not built:')
    for (const route of missing) console.error(`    - ${route}`)
    console.error('\n    Remove these from EXPECTED_ROUTE_MODES in scripts/route-modes.ts.\n')
  }

  process.exit(1)
}

main()
