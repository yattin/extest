import { ChromeLauncher } from './core/launcher';
import { TargetManager } from './core/target-manager';
import { ExtensionDriverImpl } from './core/driver';
import { MockServerImpl } from './utils/mock-server';
import { ExtensionTestConfig, TestContext } from './core/types';

export class ExtensionTestFramework {
  private context: TestContext | null = null;

  async setup(config: ExtensionTestConfig): Promise<TestContext> {
    // 启动 Chrome
    const chrome = await ChromeLauncher.start(config);
    
    // 启动 Mock 服务器
    const mockServer = new MockServerImpl(config.mockServerPort);
    
    // 查找扩展目标
    const targetManager = new TargetManager(chrome.browser);
    const targets = await targetManager.findExtensionTargets();
    
    // 创建驱动器
    const driver = new ExtensionDriverImpl(chrome.browser, targets);
    
    this.context = {
      chrome,
      driver,
      mockServer,
    };

    return this.context;
  }

  async teardown(): Promise<void> {
    if (this.context) {
      await this.context.driver.cleanup();
      await this.context.mockServer.close();
      await ChromeLauncher.stop();
      this.context = null;
    }
  }

  getContext(): TestContext | null {
    return this.context;
  }
}

// 导出所有类型和类
export * from './core/types';
export * from './core/launcher';
export * from './core/driver';
export * from './core/target-manager';
export * from './utils/mock-server';

// 默认导出
export default ExtensionTestFramework;