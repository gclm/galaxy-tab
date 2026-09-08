# 构建扩展并用无头浏览器操作新标签页

这份参考说明描述 Chrome MV3 构建产物和支持命令行加载未打包扩展的 Chromium 浏览器的调试流程。完整的可复制脚本见 [examples/extension-ui-debug.mjs](../examples/extension-ui-debug.mjs)。

## 前置条件

仓库不自动安装 Playwright，也不下载浏览器。准备一个可 `require('playwright')` 的 Node 模块和一个浏览器可执行文件：

```powershell
$env:PLAYWRIGHT_MODULE = 'C:/path/to/node_modules/playwright'
$env:PLAYWRIGHT_CHROMIUM_EXECUTABLE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
pnpm build
```

`PLAYWRIGHT_MODULE` 未设置时，示例会从当前项目解析 `playwright`。`PLAYWRIGHT_CHROMIUM_EXECUTABLE` 应指向实际支持加载未打包扩展的 Chromium/Edge 可执行文件。某些新版 Chrome 可能限制 `--load-extension` 参数；遇到这种情况，换用支持该参数的 Chromium/Edge。

## 启动和加载

使用 `launchPersistentContext`，因为扩展的 Service Worker、`chrome.storage` 和 IndexedDB 属于浏览器上下文。启动参数必须同时包含：

```text
--disable-extensions-except=<构建目录绝对路径>
--load-extension=<构建目录绝对路径>
```

构建目录默认是 `.output/chrome-mv3`。使用独立临时 profile，避免污染日常浏览器数据；调试时可将 `headless` 暂时改成 `false`。

## 打开扩展新标签页

先等待 Service Worker，再从 `worker.url()` 推导扩展 ID 和 `newtab.html` 地址。不要猜测扩展 ID，也不必操作浏览器的“新建标签”按钮：在 context 中创建页面并导航到扩展内部 URL，就能获得等价的新标签页运行环境。

```js
const worker = context.serviceWorkers()[0] || (await context.waitForEvent('serviceworker'))
const newtabUrl = new URL('newtab.html', worker.url()).href
const page = await context.newPage()
await page.goto(newtabUrl)
```

## 交互和诊断

优先使用可访问角色、精确名称和稳定 class；关键异步行为等待真实状态，不用固定延时代替同步。监听 `pageerror`，并在失败时保留截图、Worker URL、页面 URL 和关键 DOM/存储状态。随附示例覆盖菜单导航和截图；其他交互按当前任务的稳定选择器补充。

## 常见失败定位

- `require('playwright')` 失败：设置 `PLAYWRIGHT_MODULE`，或确认依赖安装在当前 Node 可解析的位置。
- 浏览器启动失败：检查 `PLAYWRIGHT_CHROMIUM_EXECUTABLE` 的绝对路径和浏览器与 Playwright 的兼容性。
- 没有 Service Worker：确认构建目录包含 `manifest.json`、`background.js`，且加载参数指向目录而非 zip。
- 扩展页面打不开：打印 `worker.url()` 和 `newtabUrl`，检查 Manifest 的 `chrome_url_overrides.newtab` 及构建目标。
- 加载扩展参数被忽略：换用支持未打包扩展加载的 Chromium/Edge；不要仅凭普通网页可打开推断扩展已加载。
- 页面报错或状态未就绪：保留 `pageerror`、截图和关键 DOM/存储状态，回到实际失败交互路径排查。
