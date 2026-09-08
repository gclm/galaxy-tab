import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

import { createServer } from 'vite'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const projectRoot = fileURLToPath(new URL('../../../', import.meta.url))
const skillRoot = fileURLToPath(new URL('../', import.meta.url))
const browserTestModule = process.env.BROWSER_TEST_MODULE
if (!browserTestModule) throw new Error('Set BROWSER_TEST_MODULE to a browser test module URL')

const server = await createServer({
  configFile: false,
  optimizeDeps: { noDiscovery: true, include: ['idb'] },
  root: projectRoot,
  resolve: {
    alias: [
      { find: '@/shared/settings', replacement: `${skillRoot}examples/browser-settings-mock.ts` },
      { find: '#imports', replacement: `${skillRoot}examples/browser-storage-mock.ts` },
      { find: 'wxt/browser', replacement: `${skillRoot}examples/browser-storage-mock.ts` },
      { find: '@', replacement: projectRoot },
    ],
  },
  server: { host: '127.0.0.1', port: 0 },
})

let browser
try {
  await server.listen()
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
  })
  const page = await browser.newPage()
  await page.goto(`${server.resolvedUrls.local[0]}__browser-tests`)
  const results = await page.evaluate(async (moduleUrl) => {
    return (await import(moduleUrl)).runBrowserTests()
  }, browserTestModule)
  for (const result of results) console.log(`PASS ${result}`)
} finally {
  await browser?.close()
  await server.close()
}
