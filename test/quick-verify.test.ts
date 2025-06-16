import { ExtensionTestFramework, ChromeLauncher, ExtensionDriverImpl, TargetManager, MockServerImpl } from '../src';

describe('Framework Quick Verification', () => {
  test('should load framework without errors', () => {
    expect(ExtensionTestFramework).toBeDefined();
    expect(typeof ExtensionTestFramework).toBe('function');
  });

  test('should create framework instance', () => {
    const framework = new ExtensionTestFramework();
    expect(framework).toBeDefined();
    expect(typeof framework.setup).toBe('function');
    expect(typeof framework.teardown).toBe('function');
  });

  test('should export all required types and classes', () => {
    expect(ChromeLauncher).toBeDefined();
    expect(ExtensionDriverImpl).toBeDefined();
    expect(TargetManager).toBeDefined();
    expect(MockServerImpl).toBeDefined();
  });
});