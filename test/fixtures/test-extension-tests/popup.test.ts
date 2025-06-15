/**
 * 基础测试插件 - Popup UI 测试
 * 使用框架全局设置 (test/setup.ts)
 * 测试弹窗界面的交互和状态同步功能
 */

describe('Popup UI', () => {
  test('should toggle dark mode', async () => {
    const { driver } = global.testContext;
    const popup = await driver.openPopup();
    
    // 等待UI加载
    await popup.waitForSelector('#dark-mode-toggle');
    
    // 点击切换按钮
    await popup.click('#dark-mode-toggle');
    
    // 验证UI状态
    const isDark = await popup.$eval('body', el => 
      el.classList.contains('dark-mode')
    );
    expect(isDark).toBe(true);
    
    // 验证后台状态同步
    const bg = await driver.background();
    const bgResult = await bg.send('Runtime.evaluate', {
      expression: `
        new Promise(resolve => {
          chrome.storage.local.get('darkMode', (data) => {
            resolve(data.darkMode);
          });
        })
      `,
      awaitPromise: true
    });
    
    expect(bgResult.result.value).toBe(true);
    
    await popup.close();
  });

  test('should display correct title', async () => {
    const { driver } = global.testContext;
    const popup = await driver.openPopup();
    
    const title = await popup.$eval('h1', el => el.textContent);
    expect(title).toBe('Test Popup');
    
    await popup.close();
  });
});