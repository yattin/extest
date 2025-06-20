# Extest - 浏览器扩展测试框架

一个基于 Chrome DevTools Protocol (CDP) 的浏览器扩展端到端测试框架，专为 Manifest V3 设计。

## 特性

- ✅ **真实浏览器环境**：在真实的 Chrome 浏览器中运行测试，而非模拟环境。
- ✅ **Manifest V3 支持**：专为现代浏览器扩展设计，支持 Service Worker。
- ✅ **轻量级与高性能**：直接使用 CDP 协议，无需 Selenium 或 WebDriver。
- ✅ **全面的测试覆盖**：
  - Background (Service Worker)
  - Popup & Options 页面
  - 内容脚本 (Content Scripts)
  - DevTools 面板
- ✅ **内置 Mock 服务器**：轻松模拟后端 API 和服务。
- ✅ **网络请求拦截**：拦截、修改和模拟网络请求。
- ✅ **代码覆盖率**：开箱即用的代码覆盖率收集。
- ✅ **CI/CD 友好**：轻松集成到 GitHub Actions 或其他 CI/CD 流程中。

## 安装

```bash
pnpm install
```

## 在其他项目中使用

此框架被设计为 npm 包，可以在其他浏览器扩展项目中作为开发依赖项使用。

### 方式一：发布到 npm（生产环境）

1. **构建并发布框架**

   ```bash
   # 在 extest 项目目录中
   pnpm run build
   npm publish
   ```

2. **在你的扩展项目中安装**

   ```bash
   # 在你的浏览器扩展项目中
   pnpm add -D extest
   ```

### 方式二：本地链接（开发环境）

推荐在开发阶段使用 `pnpm link`，这样可以实时查看框架的修改效果。

1. **在 extest 项目中创建全局链接**

   ```bash
   # 在 extest 项目目录中
   cd path/to/extest
   pnpm link --global
   ```

2. **在你的扩展项目中使用链接**

   ```bash
   # 在你的浏览器扩展项目目录中
   cd path/to/your-extension-project
   pnpm link --global extest
   ```

3. **取消链接（可选）**

   当完成开发后，可以取消链接并安装正式版本：

   ```bash
   # 在你的浏览器扩展项目中
   pnpm unlink extest
   pnpm add -D extest
   ```

### 在其他项目中的配置

安装完成后，需要在你的扩展项目中进行配置：

1. **配置 Jest**

   创建或修改 `jest.config.js`：

   ```javascript
   module.exports = {
     testEnvironment: 'node',
     globalSetup: './test/setup.js',
     globalTeardown: './test/teardown.js',
     testTimeout: 30000,
   };
   ```

2. **创建测试设置文件**

   创建 `test/setup.js`：

   ```javascript
   const path = require('path');
   const { ExtensionTestFramework } = require('extest');

   module.exports = async () => {
     const framework = new ExtensionTestFramework();
     const context = await framework.setup({
       extensionPath: path.join(__dirname, '../dist'), // 你的扩展构建目录
       mockServerPort: 9000,
     });

     global.testContext = context;
     global.framework = framework;
   };
   ```

   创建 `test/teardown.js`：

   ```javascript
   module.exports = async () => {
     if (global.framework) {
       await global.framework.teardown();
     }
   };
   ```

3. **编写测试用例**

   ```javascript
   describe('Extension Tests', () => {
     const { driver } = global.testContext;

     test('should test popup functionality', async () => {
       const popup = await driver.openPopup();
       // 你的测试逻辑
       await popup.close();
     });
   });
   ```

## 快速开始

### 1. 准备测试

在 `test/setup.ts` 中配置你的扩展路径：

```typescript
// test/setup.ts
import path from 'path';

const extensionPath = path.join(__dirname, 'fixtures/your-extension');

// ...
```

### 2. 编写测试

创建一个新的测试文件，例如 `test/my-feature.test.ts`：

```typescript
describe('My Feature', () => {
  // 从全局上下文中获取驱动程序
  const { driver } = global.testContext;

  test('should perform an action in the popup', async () => {
    const popup = await driver.openPopup();
    await popup.click('#my-button');
    const text = await popup.$eval('#status', el => el.textContent);
    expect(text).toBe('Clicked!');
    await popup.close();
  });
});
```

### 3. 运行测试

```bash
# 运行所有测试
pnpm test

# 运行单个测试文件
pnpm test test/my-feature.test.ts

# 监视模式
pnpm run test:watch

# 生成覆盖率报告
pnpm run test:coverage
```

## API 使用示例

### Background Script 测试

```typescript
test('should access background script functions', async () => {
  const { driver } = global.testContext;
  const bg = await driver.background();
  
  // 直接调用背景脚本中的全局函数
  const result = await bg.send('Runtime.evaluate', {
    expression: 'myGlobalFunction()',
    awaitPromise: true,
  });
  
  expect(result.result.value).toBe('expected-result');
});
```

### Content Script 测试

```typescript
test('should interact with the page via content script', async () => {
  const { driver, mockServer } = global.testContext;
  const page = await driver.createContentPage(`${mockServer.url}/test-page`);
  
  // 等待内容脚本注入的元素
  await page.waitForSelector('.extension-injected-element');
  
  const text = await page.$eval('.extension-injected-element', el => el.textContent);
  expect(text).toContain('Injected by');
  
  await page.close();
});
```

### 网络请求模拟

```typescript
test('should mock API requests', async () => {
  const { driver, mockServer } = global.testContext;
  
  // 启用网络模拟并定义 mock 响应
  await driver.mockRequest('/api/user', { id: 1, name: 'Test User' });
  
  const page = await driver.createContentPage();
  
  // 在页面中发起请求
  const data = await page.evaluate(async (apiUrl) => {
    const response = await fetch(apiUrl);
    return response.json();
  }, `${mockServer.url}/api/user`);
  
  expect(data.name).toBe('Test User');
  
  await page.close();
});
```

## 故障排除

### 测试超时

- **原因**: 异步操作未在规定时间内完成。
- **解决方案**:
  - 检查 `await` 是否被正确使用。
  - 在 `jest.config.js` 中增加 `testTimeout` 的值。
  - 确保内容脚本有足够的时间注入，尤其是在复杂的页面上。

### Target 未找到

- **原因**: 扩展的背景、Popup 或其他页面未被正确加载。
- **解决方案**:
  - 验证 `manifest.json` 中的路径是否正确。
  - 确保 `waitForTarget` 的超时时间足够长。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT