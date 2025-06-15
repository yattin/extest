import ExtensionTestFramework from '../src';
import path from 'path';
import { TestContext } from '../src/core/types';

beforeAll(async () => {
  global.testFramework = new ExtensionTestFramework();
  
  const extensionPath = path.join(__dirname, 'fixtures/test-extension');
  console.log(`Using extension path: ${extensionPath}`);
  global.testContext = await global.testFramework.setup({
    extensionPath,
    headless: process.env.CI === 'true',
    timeout: 5000,
    mockServerPort: 9000,
  });
  console.log('Test context setup complete:');
}, 60000);

afterAll(async () => {
  if (global.testFramework) {
    await global.testFramework.teardown();
  }
}, 30000);