# 测试目录结构说明

## 目录结构

```
test/
├── fixtures/                          # 测试用的固定资源
│   ├── test-extension/                 # 基础测试插件
│   │   ├── manifest.json
│   │   ├── background.js
│   │   ├── content.js
│   │   ├── popup.html
│   │   └── popup.js
│   └── test-extension-tests/           # 基础插件的测试套件
│       ├── background.test.ts
│       ├── content-script.test.ts
│       ├── integration.test.ts
│       └── popup.test.ts
├── dami/                               # 达秘插件相关
│   ├── dami-tools/                     # 编译后的达秘插件
│   ├── dami-tools-src/                 # 达秘插件源代码
│   └── dynamic-lib/                    # 达秘动态库测试套件
│       ├── setup.ts                    # 达秘插件专用测试设置
│       ├── README.md
│       ├── run-tests.js
│       ├── integration/                # 集成测试
│       ├── functional/                 # 功能测试
│       └── unit/                       # 单元测试
├── mocks/                              # 模拟数据
├── __mocks__/                          # Jest 模拟
├── setup.ts                           # 框架全局测试设置
├── teardown.ts                         # 框架全局测试清理
├── global.d.ts                         # 全局类型声明
├── example.ts                          # 使用示例
└── quick-verify.test.ts                # 快速验证测试
```

## 插件测试设置

### 基础测试插件 (test-extension)
- **插件位置**: `test/fixtures/test-extension/`
- **测试位置**: `test/fixtures/test-extension-tests/`
- **测试设置**: 使用根目录的 `test/setup.ts`

### 达秘插件 (dami-tools)
- **插件位置**: `test/dami/dami-tools/` (编译后)
- **源代码位置**: `test/dami/dami-tools-src/`
- **测试位置**: `test/dami/dynamic-lib/`
- **测试设置**: 使用专用的 `test/dami/dynamic-lib/setup.ts`

## 测试配置说明

### 1. 框架全局设置 (`test/setup.ts`)
```typescript
// 为基础测试插件配置
const extensionPath = path.join(__dirname, 'fixtures/test-extension');
```

### 2. 达秘插件设置 (`test/dami/dynamic-lib/setup.ts`)
```typescript
// 为达秘插件配置
const extensionPath = path.join(__dirname, '../dami-tools');
```

## 运行测试

### 运行基础插件测试
```bash
# 运行特定测试文件
npm test test/fixtures/test-extension-tests/

# 或使用 Jest 模式匹配
npm test -- --testPathPattern="fixtures/test-extension-tests"
```

### 运行达秘插件测试
```bash
# 运行达秘动态库测试
npm test test/dami/dynamic-lib/

# 或使用自定义脚本
node test/dami/dynamic-lib/run-tests.js
```

## 避免混淆的设计原则

1. **插件分离**: 每个插件有独立的目录结构
2. **测试分离**: 测试文件与插件源码分开存放
3. **配置分离**: 每个插件有独立的测试设置文件
4. **端口分离**: 不同插件使用不同的 mockServer 端口
   - 基础插件: 端口 9000
   - 达秘插件: 端口 9001

这样的结构确保了不同插件的测试互不干扰，同时保持了清晰的组织结构。