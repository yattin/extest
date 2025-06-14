import { Browser, Page, CDPSession } from 'puppeteer-core';
import { ExtensionDriver, ExtensionTargets } from './types';
import { TargetManager } from './target-manager';

export class ExtensionDriverImpl implements ExtensionDriver {
  private targets: ExtensionTargets;
  private targetManager: TargetManager;
  private backgroundSession: CDPSession | null = null;
  private mockingEnabled = false;

  constructor(
    private browser: Browser,
    targets: ExtensionTargets
  ) {
    this.targets = targets;
    this.targetManager = new TargetManager(browser);
  }

  getExtensionId(): string {
    return this.targets.extensionId;
  }

  async background(): Promise<CDPSession> {
    if (this.backgroundSession) {
      return this.backgroundSession;
    }

    if (!this.targets.backgroundTarget) {
      throw new Error('Background target not found');
    }

    this.backgroundSession = await this.targets.backgroundTarget.createCDPSession();
    await this.backgroundSession.send('Runtime.enable');
    return this.backgroundSession;
  }

  async openPopup(): Promise<Page> {
    const popupUrl = `chrome-extension://${this.targets.extensionId}/popup.html`;
    const page = await this.browser.newPage();
    await page.goto(popupUrl);
    await page.waitForSelector('body');
    return page;
  }

  async openOptions(): Promise<Page> {
    const optionsUrl = `chrome-extension://${this.targets.extensionId}/options.html`;
    const page = await this.browser.newPage();
    await page.goto(optionsUrl);
    await page.waitForSelector('body');
    return page;
  }

  async createContentPage(url = 'about:blank'): Promise<Page> {
    const page = await this.browser.newPage();
    if (url !== 'about:blank') {
      await page.goto(url);
    }
    return page;
  }

  async enableNetworkMocking(): Promise<void> {
    if (this.mockingEnabled) return;

    const pages = await this.browser.pages();
    for (const page of pages) {
      await page.setRequestInterception(true);
    }
    this.mockingEnabled = true;
  }

  async mockRequest(pattern: string, response: any): Promise<void> {
    await this.enableNetworkMocking();
    
    const pages = await this.browser.pages();
    for (const page of pages) {
      page.on('request', request => {
        if (request.url().includes(pattern)) {
          request.respond({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response),
          });
        } else {
          request.continue();
        }
      });
    }
  }

  async getCoverage(): Promise<any> {
    const coverage: { background: any; pages: any[] } = { background: null, pages: [] };

    // 获取 background 覆盖率
    if (this.backgroundSession) {
      try {
        const result = await this.backgroundSession.send('Runtime.evaluate', {
          expression: 'typeof __coverage__ !== "undefined" ? __coverage__ : null',
        });
        coverage.background = result.result.value;
      } catch (error) {
        console.warn('Failed to get background coverage:', error);
      }
    }

    // 获取页面覆盖率
    const pages = await this.browser.pages();
    for (const page of pages) {
      try {
        const pageCoverage = await page.evaluate(() => 
          (window as any).__coverage__ || null
        );
        if (pageCoverage) {
          coverage.pages.push(pageCoverage);
        }
      } catch (error) {
        console.warn('Failed to get page coverage:', error);
      }
    }

    return coverage;
  }

  async cleanup(): Promise<void> {
    if (this.backgroundSession) {
      await this.backgroundSession.detach();
      this.backgroundSession = null;
    }

    const pages = await this.browser.pages();
    for (const page of pages) {
      try {
        await page.close();
      } catch (error) {
        console.warn('Failed to close page:', error);
      }
    }
  }
}