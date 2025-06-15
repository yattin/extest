import ExtensionTestFramework from '../src';
import { TestContext } from '../src/core/types';

declare global {
  var testFramework: ExtensionTestFramework;
  var testContext: TestContext;
}