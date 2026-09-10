const isChromium = import.meta.env.CHROME || import.meta.env.EDGE || import.meta.env.OPERA

/**
 * Chromium 开发态先从扩展自身启动 Worker，再由本地引导脚本加载 Vite 模块。
 * Firefox 可直接加载带 CORS 响应头的 Vite 模块 Worker；经 bootstrap 二次动态导入会失败。
 */
export function createExtensionWorker(workerUrl: string): Worker {
  if (!import.meta.env.DEV) return new Worker(workerUrl)
  if (!isChromium) return new Worker(workerUrl, { type: 'module' })

  const bootstrapUrl = new URL('/dev-worker-bootstrap.js', location.href)
  bootstrapUrl.searchParams.set('url', workerUrl)
  return new Worker(bootstrapUrl, { type: 'module' })
}
