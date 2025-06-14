import ExtensionTestFramework from '../src';
import path from 'path';

declare global {
  var testFramework: ExtensionTestFramework;
  var testContext: any;
}

beforeAll(async () => {
  global.testFramework = new ExtensionTestFramework();
  
  const extensionPath = path.join(__dirname, 'fixtures/test-extension');
  global.testContext = await global.testFramework.setup({
    extensionPath,
    headless: process.env.CI === 'true',
    timeout: 30000,
  });
}, 60000);

afterAll(async () => {
  if (global.testFramework) {
    await global.testFramework.teardown();
  }
}, 30000);