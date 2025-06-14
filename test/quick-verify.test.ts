describe('Framework Quick Verification', () => {
  test('should load framework without errors', () => {
    const ExtensionTestFramework = require('../dist/index.js').default;
    expect(ExtensionTestFramework).toBeDefined();
    expect(typeof ExtensionTestFramework).toBe('function');
  });

  test('should create framework instance', () => {
    const ExtensionTestFramework = require('../dist/index.js').default;
    const framework = new ExtensionTestFramework();
    expect(framework).toBeDefined();
    expect(typeof framework.setup).toBe('function');
    expect(typeof framework.teardown).toBe('function');
  });

  test('should export all required types and classes', () => {
    const exports = require('../dist/index.js');
    expect(exports.ChromeLauncher).toBeDefined();
    expect(exports.ExtensionDriverImpl).toBeDefined();
    expect(exports.TargetManager).toBeDefined();
    expect(exports.MockServerImpl).toBeDefined();
  });
});