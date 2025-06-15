import ExtensionTestFramework from '../src';
import path from 'path';

beforeAll(async () => {
  global.testFramework = new ExtensionTestFramework();
  const extensionPath = path.join(__dirname, 'fixtures/test-extension');
  global.testContext = await global.testFramework.setup({
    extensionPath,
    headless: process.env.CI === 'true',
    timeout: 5000,
    mockServerPort: 9000,
  });
}, 60000);

afterAll(async () => {
  if (global.testFramework) {
    await global.testFramework.teardown();
  }
}, 30000);