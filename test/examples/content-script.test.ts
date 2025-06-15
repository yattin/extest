describe('Content Script', () => {
  test('should inject elements into page', async () => {
    const { driver, mockServer } = global.testContext;
    const page = await driver.createContentPage(`${mockServer.url}/test-page`);
    
    // 等待content script注入
    await page.waitForSelector('.extension-injected', { timeout: 5000 });
    
    // 验证注入的元素
    const injectedText = await page.$eval('.extension-injected',
      (el: Element) => el.textContent
    );
    expect(injectedText).toBe('Injected by Extension');
    
    // 测试与页面的交互
    await page.click('#test-button');
    await page.waitForSelector('.button-clicked');
    
    const clickedElement = await page.$('.button-clicked');
    expect(clickedElement).toBeTruthy();
    
    const clickedText = await page.$eval('.button-clicked', (el: Element) => el.textContent);
    expect(clickedText).toBe('Button was clicked!');
    
    await page.close();
  });

  test('should load on test page', async () => {
    const { driver, mockServer } = global.testContext;
    const page = await driver.createContentPage(`${mockServer.url}/test-page`);
    
    // 验证页面内容
    const pageTitle = await page.$eval('h1', (el: Element) => el.textContent);
    expect(pageTitle).toBe('Test Page');
    
    const content = await page.$eval('#content', (el: Element) => el.textContent);
    expect(content).toBe('Hello World');
    
    await page.close();
  });
});