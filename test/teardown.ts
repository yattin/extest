import ExtensionTestFramework from '../src';

module.exports = async () => {
  // 全局清理逻辑
  if (global.testFramework) {
    const testContext: ExtensionTestFramework = global.testFramework;
    await testContext.teardown();
  }
};