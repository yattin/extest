// 简单的框架测试脚本
console.log('🧪 测试浏览器扩展测试框架...\n');

async function testFramework() {
  try {
    // 测试基本导入
    console.log('1️⃣ 测试模块导入...');
    const ExtensionTestFramework = require('./dist/index.js').default;
    const { ChromeLauncher, MockServerImpl } = require('./dist/index.js');
    
    console.log('✅ 模块导入成功');
    console.log(`   - ExtensionTestFramework: ${typeof ExtensionTestFramework}`);
    console.log(`   - ChromeLauncher: ${typeof ChromeLauncher}`);
    console.log(`   - MockServerImpl: ${typeof MockServerImpl}`);
    
    // 测试实例创建
    console.log('\n2️⃣ 测试实例创建...');
    const framework = new ExtensionTestFramework();
    console.log('✅ ExtensionTestFramework 实例创建成功');
    
    // 测试 Mock 服务器
    console.log('\n3️⃣ 测试 Mock 服务器...');
    const mockServer = new MockServerImpl();
    console.log(`✅ Mock 服务器启动成功，端口：${mockServer.port}`);
    console.log(`   URL: ${mockServer.url}`);
    
    // 清理
    await mockServer.close();
    console.log('✅ Mock 服务器已关闭');
    
    console.log('\n🎉 所有基础测试通过！');
    console.log('\n📖 框架使用指南：');
    console.log('1. 确保已安装 Chrome 浏览器');
    console.log('2. 将扩展代码放在 test/fixtures/test-extension/ 目录');
    console.log('3. 运行 pnpm test 开始测试');
    console.log('4. 查看 README.md 获取详细使用说明');
    
  } catch (error) {
    console.error('❌ 测试失败：', error.message);
    process.exit(1);
  }
}

testFramework();