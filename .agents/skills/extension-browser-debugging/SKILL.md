---
name: extension-browser-debugging
description: 调试本 WXT 浏览器扩展的构建产物和新标签页 UI，使用 Playwright 启动无头浏览器、加载未打包扩展、打开扩展页面并执行可观察的交互验证。
metadata:
  short-description: 使用无头 Playwright 调试扩展新标签页
---

# 扩展浏览器调试

当任务需要验证或诊断本扩展的真实 UI、扩展存储、Service Worker、`chrome-extension://` 页面或新标签页行为时使用本 Skill。优先复用 Skill 自带的示例和当前项目稳定选择器；纯 TypeScript/业务逻辑测试不需要启动扩展浏览器。

## 两种调试路径

- 源码级浏览器测试：启动 Vite 测试页，在真实浏览器中执行 IndexedDB、迁移、事务或合并逻辑；只替换不属于目标逻辑的扩展 API。
- 构建产物 UI 测试：使用 `pnpm build` 生成的 `.output/chrome-mv3`，以独立持久化上下文加载未打包扩展，直接打开扩展新标签页并操作 UI。

需要真实扩展运行时、页面交互或截图时，阅读 [references/headless-extension-ui.md](references/headless-extension-ui.md)，并按需复制或改造 [examples/extension-ui-debug.mjs](examples/extension-ui-debug.mjs)。需要理解 Vite 测试页和 mock 边界时，阅读 [references/source-browser-tests.md](references/source-browser-tests.md) 及 [examples/source-browser-vite.mjs](examples/source-browser-vite.mjs)。

## 工作约束

1. UI 测试前先确认目标浏览器可执行文件和构建目标；构建产物路径默认是 `.output/chrome-mv3`，不要把 `.output` 当作源码编辑位置。
2. 使用 `launchPersistentContext` 而不是普通 `browser.newPage()`：扩展后台 Service Worker、`chrome.storage` 和 IndexedDB 需要持久化上下文。
3. 扩展加载参数必须同时包含 `--disable-extensions-except=<绝对路径>` 和 `--load-extension=<绝对路径>`。路径使用绝对路径并保持独立临时 profile，避免污染用户的日常浏览器数据。
4. 等待 `context.serviceWorkers()` 或 `serviceworker` 事件后，再从 Worker URL 推导扩展 ID 和新标签页 URL；不要猜测扩展 ID。
5. 用可访问名称、稳定 class 或明确的状态条件操作页面。页面打开后监听 `pageerror`，关键异步行为用 `waitForFunction`、定位器等待或 DOM 状态等待，不用固定延时代替状态同步。
6. 测试完成后关闭 context；截图和 profile 可留在系统临时目录供诊断，但不要把它们加入仓库。
7. 只报告实际覆盖到的运行时边界。构建、类型检查和静态测试通过，不等于已验证真实浏览器、多标签页、WebDAV 或其他未运行场景。

## 推荐调试闭环

先复现并记录页面、Worker、控制台错误和关键状态；再用最小的 Playwright 操作验证根因假设；修改代码后重新构建并重复同一场景。若扩展无法加载，先检查浏览器版本、Manifest、构建目录和启动参数，再检查页面代码。
