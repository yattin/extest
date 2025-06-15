import { Browser, Page, CDPSession } from 'puppeteer-core';
import { ExtensionDriver, ExtensionTargets } from './types';
import { TargetManager } from './target-manager';

export class ExtensionDriverImpl implements ExtensionDriver {
  private targets: ExtensionTargets;
  private targetManager: TargetManager;
  private backgroundSession: CDPSession | null = null;
  private mockingEnabled = false;
  private mockResponses: Map<string, any> = new Map();

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
      await page.goto(url, { waitUntil: 'networkidle0' });
    }
    return page;
  }

  async enableNetworkMocking(): Promise<void> {
    if (this.mockingEnabled) return;

    this.browser.on('targetcreated', async target => {
      const page = await target.page();
      if (page) {
        await this.setupRequestInterception(page);
      }
    });

    const pages = await this.browser.pages();
    for (const page of pages) {
      await this.setupRequestInterception(page);
    }
    this.mockingEnabled = true;
  }

  private async setupRequestInterception(page: Page): Promise<void> {
    await page.setRequestInterception(true);
    page.on('request', request => {
      for (const [pattern, response] of this.mockResponses.entries()) {
        if (request.url().includes(pattern)) {
          return request.respond({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response),
          });
        }
      }
      return request.continue();
    });
  }

  async mockRequest(pattern: string, response: any): Promise<void> {
    await this.enableNetworkMocking();
    this.mockResponses.set(pattern, response);
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
      if (!page.isClosed()) {
        try {
          await page.close({ runBeforeUnload: false });
        } catch (error) {
          console.warn(`Failed to close page: ${page.url()}`, error);
        }
      }
    }
  }
}