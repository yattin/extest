describe('Integration Tests', () => {
  test('should work across background, popup and content script', async () => {
    const { driver, mockServer } = global.testContext;
    
    // 1. 在背景脚本中设置数据
    const bg = await driver.background();
    await bg.send('Runtime.evaluate', {
      expression: 'saveToken("integration-test-token")',
      awaitPromise: true
    });
    
    // 2. 打开popup并验证数据访问
    const popup = await driver.openPopup();
    await popup.waitForSelector('#dark-mode-toggle');
    
    // 在popup中获取token
    const tokenFromPopup = await popup.evaluate(async () => {
      return new Promise((resolve) => {
        chrome.storage.local.get('token', (data) => resolve(data.token));
      });
    });
    expect(tokenFromPopup).toBe('integration-test-token');
    
    // 3. 切换暗黑模式
    await popup.click('#dark-mode-toggle');
    await popup.close();
    
    // 4. 验证背景脚本中的状态同步
    const darkModeResult = await bg.send('Runtime.evaluate', {
      expression: 'isDarkModeEnabled()',
      awaitPromise: true
    });
    expect(darkModeResult.result.value).toBe(true);
    
    // 5. 打开content页面并验证注入
    const page = await driver.createContentPage(`${mockServer.url}/test-page`);
    await page.waitForSelector('.extension-injected');
    
    const injectedExists = await page.$('.extension-injected');
    expect(injectedExists).toBeTruthy();
    
    await page.close();
  });

  test('should handle network mocking', async () => {
    const { driver, mockServer } = global.testContext;
    
    // 启用网络模拟
    await driver.enableNetworkMocking();
    await driver.mockRequest('/api/test', { mocked: true, data: 'test' });
    
    const page = await driver.createContentPage(`${mockServer.url}/test-page`);
    
    // 测试模拟的API响应
    const response = await page.evaluate(async () => {
      const resp = await fetch('/api/test');
      return resp.json();
    });
    
    expect(response.mocked).toBe(true);
    expect(response.data).toBe('test');
    
    await page.close();
  });
});