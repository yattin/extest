import { launch } from 'chrome-launcher';
import puppeteer from 'puppeteer-core';
import { ExtensionTestConfig, ChromeInstance } from './types';

export class ChromeLauncher {
  private static instance: ChromeInstance | null = null;

  static async start(config: ExtensionTestConfig): Promise<ChromeInstance> {
    if (this.instance) {
      return this.instance;
    }

    const chromeFlags = [
      config.headless ? '--headless=new' : '',
      `--disable-extensions-except=${config.extensionPath}`,
      `--load-extension=${config.extensionPath}`,
      // `--remote-debugging-port=${config.debugPort || 9222}`,
      // '--no-sandbox',
      // '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      // '--disable-web-security',
      // '--disable-features=TranslateUI',
      // '--disable-ipc-flooding-protection',
      ...(config.chromeFlags || [])
    ].filter(Boolean);

    const chrome = await launch({
      chromeFlags,
      handleSIGINT: false,
    });

    console.log(`Chrome launched with PID: ${chrome.pid} on port: ${chrome.port}`);

    const browser = await puppeteer.connect({
      browserURL: `http://localhost:${chrome.port}`,
      defaultViewport: null,
    });

    console.log(`Connected to Chrome browser at http://localhost:${chrome.port}`);

    this.instance = {
      process: chrome.process,
      port: chrome.port,
      browser,
    };

    return this.instance;
  }

  static async stop(): Promise<void> {
    if (this.instance) {
      try {
        await this.instance.browser.disconnect();
        this.instance.process.kill('SIGTERM');
      } catch (error) {
        console.warn('Error stopping Chrome:', error);
      }
      this.instance = null;
    }
  }

  static getInstance(): ChromeInstance | null {
    return this.instance;
  }
}