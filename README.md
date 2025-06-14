# Browser Extension Test Framework

基于 Chrome DevTools Protocol (CDP) 的浏览器扩展集成测试框架。

## 特性

- ✅ 真正的浏览器环境测试（非模拟）
- ✅ 直接使用 CDP 协议，无需 Selenium
- ✅ 支持 Background/Service Worker 测试
- ✅ 支持 Popup/Options UI 测试
- ✅ 支持 Content Script 交互测试
- ✅ 支持 DevTools Panel 测试
- ✅ 内置 Mock 服务器
- ✅ 网络请求拦截和模拟
- ✅ 代码覆盖率收集
- ✅ CI/CD 集成支持

## 安装

```bash
pnpm install
```

## 项目结构

```
browser-extension-test-framework/
├── package.json
├── tsconfig.json
├── jest.config.js
├── .github/workflows/test.yml
├── src/
│   ├── core/
│   │   ├── launcher.ts          # Chrome 启动器
│   │   ├── driver.ts            # 扩展驱动器
│   │   ├── target-manager.ts    # 目标管理器
│   │   └── types.ts             # 类型定义
│   ├── utils/
│   │   └── mock-server.ts       # Mock 服务器
│   └── index.ts                 # 主入口
├── test/
│   ├── setup.ts                 # 测试设置
│   ├── teardown.ts              # 测试清理
│   ├── fixtures/test-extension/ # 测试用扩展
│   └── examples/                # 示例测试用例
└── README.md
```

## 快速开始

### 1. 构建框架

```bash
pnpm run build
```

### 2. 准备测试扩展

将你的扩展放在 `test/fixtures/` 目录下，或修改 `test/setup.ts` 中的路径：

```typescript
const extensionPath = path.join(__dirname, 'fixtures/your-extension');
```

### 3. 运行测试

```bash
# 运行所有测试
pnpm test

# 监视模式
pnpm run test:watch

# 生成覆盖率报告
pnpm run test:coverage
```

## API 使用示例

### 基础设置

```typescript
import ExtensionTestFramework from 'browser-extension-test-framework';

const framework = new ExtensionTestFramework();
const context = await framework.setup({
  extensionPath: './path/to/extension',
  headless: true,
  timeout: 30000,
});
```

### Background Script 测试

```typescript
test('background storage operations', async () => {
  const { driver } = global.testContext;
  const bg = await driver.background();
  
  // 执行背景脚本代码
  await bg.send('Runtime.evaluate', {
    expression: 'chrome.storage.local.set({key: "value"})'
  });
  
  // 验证结果
  const result = await bg.send('Runtime.evaluate', {
    expression: `
      new Promise(resolve => {
        chrome.storage.local.get('key', data => resolve(data.key));
      })
    `,
    awaitPromise: true
  });
  
  expect(result.result.value).toBe('value');
});
```

### Popup UI 测试

```typescript
test('popup interactions', async () => {
  const { driver } = global.testContext;
  const popup = await driver.openPopup();
  
  // 等待元素并交互
  await popup.waitForSelector('#my-button');
  await popup.click('#my-button');
  
  // 验证 UI 状态
  const isActive = await popup.$eval('#my-button', 
    el => el.classList.contains('active')
  );
  expect(isActive).toBe(true);
  
  await popup.close();
});
```

### Content Script 测试

```typescript
test('content script injection', async () => {
  const { driver, mockServer } = global.testContext;
  const page = await driver.createContentPage(`${mockServer.url}/test-page`);
  
  // 等待 content script 注入
  await page.waitForSelector('.extension-injected');
  
  // 验证注入的内容
  const injectedText = await page.$eval('.extension-injected', 
    el => el.textContent
  );
  expect(injectedText).toBe('Expected Text');
  
  await page.close();
});
```

### 网络请求模拟

```typescript
test('api calls with mocking', async () => {
  const { driver } = global.testContext;
  
  // 启用网络模拟
  await driver.enableNetworkMocking();
  await driver.mockRequest('/api/data', { 
    success: true, 
    data: 'mocked' 
  });
  
  const page = await driver.createContentPage('https://example.com');
  
  // 测试模拟的 API 响应
  const response = await page.evaluate(async () => {
    const resp = await fetch('/api/data');
    return resp.json();
  });
  
  expect(response.success).toBe(true);
  expect(response.data).toBe('mocked');
});
```

## CI/CD 集成

### GitHub Actions

项目已包含 GitHub Actions 配置（`.github/workflows/test.yml`）：

```yaml
- name: Run tests
  run: pnpm run test:ci
  env:
    CI: true
```

### 本地 CI 模拟

```bash
# 模拟 CI 环境运行
CI=true pnpm run test:ci
```

## 高级配置

### 自定义 Chrome 启动参数

```typescript
const context = await framework.setup({
  extensionPath: './extension',
  headless: false,
  debugPort: 9223,
  chromeFlags: [
    '--disable-web-security',
    '--allow-running-insecure-content'
  ]
});
```

### 自定义 Mock 服务器

```typescript
const { mockServer } = context;
console.log(`Mock server running at: ${mockServer.url}`);

// 访问内置路由
// GET /test-page - 基础测试页面
// GET /api/test - 模拟 API 端点
// POST /api/data - 数据提交端点
```

## 代码覆盖率

框架支持收集扩展代码的覆盖率：

```typescript
test('coverage collection', async () => {
  const { driver } = global.testContext;
  
  // 执行一些测试操作...
  
  // 收集覆盖率数据
  const coverage = await driver.getCoverage();
  console.log('Background coverage:', coverage.background);
  console.log('Pages coverage:', coverage.pages);
});
```

## 故障排除

### 常见问题

1. **扩展未加载**
   - 检查扩展路径是否正确
   - 确保 manifest.json 格式正确
   - 查看控制台错误信息

2. **Target 未找到**
   - 等待更长时间让扩展初始化
   - 检查扩展是否正确注册了 background script

3. **测试超时**
   - 增加测试超时时间
   - 检查是否在 headless 模式下运行

### 调试模式

```typescript
const context = await framework.setup({
  extensionPath: './extension',
  headless: false,  // 显示浏览器窗口
  debugPort: 9222,
});
```

然后访问 http://localhost:9222 查看 DevTools。

## 开发指南

### 添加新功能

1. 在 `src/core/` 下添加新的核心功能
2. 在 `src/utils/` 下添加工具函数
3. 更新 `src/core/types.ts` 中的类型定义
4. 在 `test/examples/` 下添加示例测试

### 运行开发环境

```bash
# 监视文件变化并重新构建
pnpm run build --watch

# 运行测试并监视变化
pnpm run test:watch
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 相关项目

- [puppeteer-core](https://github.com/puppeteer/puppeteer)
- [chrome-launcher](https://github.com/GoogleChrome/chrome-launcher)
- [jest](https://jestjs.io/)