import { Browser, Page, Target, CDPSession } from 'puppeteer-core';
import { ChildProcess } from 'child_process';

export interface ExtensionTestConfig {
  extensionPath: string;
  headless?: boolean;
  debugPort?: number;
  chromeFlags?: string[];
  timeout?: number;
  mockServerPort?: number;
}

export interface ChromeInstance {
  process: ChildProcess;
  port: number;
  browser: Browser;
}

export interface ExtensionTargets {
  extensionId: string;
  backgroundTarget?: Target;
  popupTarget?: Target;
  optionsTarget?: Target;
  devtoolsTargets: Target[];
}

export interface ExtensionPages {
  background?: CDPSession;
  popup?: Page;
  options?: Page;
  devtools?: Page[];
}

export interface TestContext {
  chrome: ChromeInstance;
  driver: ExtensionDriver;
  mockServer: MockServer;
}

export interface MockServer {
  port: number;
  url: string;
  close: () => Promise<void>;
}

export interface ExtensionDriver {
  getExtensionId(): string;
  background(): Promise<CDPSession>;
  openPopup(): Promise<Page>;
  openOptions(): Promise<Page>;
  createContentPage(url?: string): Promise<Page>;
  enableNetworkMocking(): Promise<void>;
  mockRequest(pattern: string, response: any): Promise<void>;
  getCoverage(): Promise<any>;
  cleanup(): Promise<void>;
}