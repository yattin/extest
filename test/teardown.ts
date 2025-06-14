module.exports = async () => {
  // 全局清理逻辑
  if (global.testFramework) {
    await global.testFramework.teardown();
  }
};