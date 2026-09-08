# AGENTS.md

这是一个基于 WXT、Vue 3 与 TypeScript 的浏览器新标签页扩展。

## 定位代码

- 产品与开发说明：[README.md](README.md)；英文说明：[README_en.md](README_en.md)；发布历史：[docs/CHANGELOG.md](docs/CHANGELOG.md)。
- 后台 Service Worker：[entrypoints/background/index.ts](entrypoints/background/index.ts)。
- 新标签页启动顺序：[entrypoints/newtab/init.ts](entrypoints/newtab/init.ts) → [entrypoints/newtab/main.ts](entrypoints/newtab/main.ts)；UI 根组件：[entrypoints/newtab/App.vue](entrypoints/newtab/App.vue)。
- 共享域：设置 [shared/settings](shared/settings)、同步 [shared/sync](shared/sync)、主题 [shared/theme](shared/theme)。
- i18n 运行时：[shared/i18n.ts](shared/i18n.ts)；语言资源：[locales](locales)。
- Manifest、权限与浏览器差异集中在 [wxt.config.ts](wxt.config.ts)。

## 变更约束

- 优先使用 Vue SFC 的 `script setup` 与 TypeScript；复用 `@/*`、`@newtab/*` 路径别名。
- 变更保持小而聚焦；先检查工作区和暂存区，保留不属于当前任务的改动。
- 样式优先使用 class 选择器和现代 CSS；尽量避免 `scoped`、标签名与 ID 选择器。仅在现代 CSS 无法等价表达时少量使用 SCSS 特性。
- 以简洁、高效、低复杂度为优先，避免过度设计、抽象和冗余；若修补会堆叠大量条件或临时兼容层，优先重写受影响的局部实现。
- 不手动编辑生成声明：[types/auto-imports.d.ts](types/auto-imports.d.ts)、[types/components.d.ts](types/components.d.ts)。
- 新增或重命名 i18n 键时，同步更新 [locales](locales) 中所有语言，并保持 `newtab`、`settings`、`sync`、`faq` 命名空间一致。

## 设置与后台边界

- 设置项删除或改名时，同步更新当前 Schema、存储迁移注册、迁移实现与默认值：
  [shared/settings/current.ts](shared/settings/current.ts)、[shared/settings/settingsStorage.ts](shared/settings/settingsStorage.ts)、[shared/settings/migrate](shared/settings/migrate)、[shared/settings/default.ts](shared/settings/default.ts)。新增设置项不升级配置版本。
- 保持 [shared/settings/bootstrap.ts](shared/settings/bootstrap.ts) 的启动兼容逻辑稳定。
- 后台同步以最新快照为语义，修改时保持 [entrypoints/background/index.ts](entrypoints/background/index.ts) 的合并行为。

## 验证

- 测试只在能覆盖真实风险、回归场景或关键行为时编写；断言应能在目标行为被破坏时失败，不为测试数量或通过率添加必然通过的测试。
- TypeScript/Vue 改动：运行 `pnpm type-check`。
- 静态检查优先使用 `pnpm lint:check`；需要自动修复时运行 `pnpm lint` 后复查其附带改动。
- 修改 Manifest、构建或浏览器差异时，运行对应的 `pnpm build`、`pnpm build:edge` 或 `pnpm build:firefox`。
- 验证真实扩展 UI、Service Worker、`chrome.storage`、IndexedDB 或新标签页交互时，使用 [extension-browser-debugging Skill](.agents/skills/extension-browser-debugging/SKILL.md)。它以独立临时浏览器 profile 加载构建产物；源码级 Vite 测试与真实扩展 UI 测试的边界见该 Skill。

## 提交

提交信息以 gitmoji 开头，后接简短中文描述；按独立功能拆分提交，避免混入格式化或无关改动。
