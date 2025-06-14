import { Browser, Target } from 'puppeteer-core';
import { ExtensionTargets } from './types';

export class TargetManager {
  constructor(private browser: Browser) {}

  async findExtensionTargets(): Promise<ExtensionTargets> {
    const targets = await this.browser.targets();
    
    // 查找 background target
    const backgroundTarget = targets.find(target => {
      const url = target.url();
      const type = target.type();
      return (type === 'background_page' || type === 'service_worker') &&
             url.startsWith('chrome-extension://');
    });

    if (!backgroundTarget) {
      throw new Error('Extension background target not found');
    }

    // 提取 extension ID
    const extensionId = this.extractExtensionId(backgroundTarget.url());
    
    // 查找其他相关 targets
    const popupTarget = targets.find(target => 
      target.url().includes(`chrome-extension://${extensionId}/popup.html`)
    );
    
    const optionsTarget = targets.find(target => 
      target.url().includes(`chrome-extension://${extensionId}/options.html`)
    );

    const devtoolsTargets = targets.filter(target => 
      target.type() === 'other' && 
      target.url().includes('devtools://devtools/bundled')
    );

    return {
      extensionId,
      backgroundTarget,
      popupTarget,
      optionsTarget,
      devtoolsTargets,
    };
  }

  private extractExtensionId(url: string): string {
    const match = url.match(/chrome-extension:\/\/([a-z]+)/);
    if (!match) {
      throw new Error(`Cannot extract extension ID from URL: ${url}`);
    }
    return match[1];
  }

  async waitForTarget(predicate: (target: Target) => boolean, timeout = 5000): Promise<Target> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Target wait timeout'));
      }, timeout);

      const checkTargets = async () => {
        const targets = await this.browser.targets();
        const target = targets.find(predicate);
        if (target) {
          clearTimeout(timeoutId);
          resolve(target);
        } else {
          setTimeout(checkTargets, 100);
        }
      };

      checkTargets();
    });
  }
}