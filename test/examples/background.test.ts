describe('Background Script', () => {
  test('should initialize storage', async () => {
    const { driver } = global.testContext;
    const bg = await driver.background();
    
    // 清空存储
    await bg.send('Runtime.evaluate', {
      expression: 'chrome.storage.local.clear()'
    });
    
    // 设置数据
    await bg.send('Runtime.evaluate', {
      expression: `
        chrome.storage.local.set({testKey: 'testValue'}, () => {
          console.log('Data saved');
        });
      `
    });
    
    // 验证数据
    const result = await bg.send('Runtime.evaluate', {
      expression: `
        new Promise(resolve => {
          chrome.storage.local.get('testKey', (data) => {
            resolve(data.testKey);
          });
        })
      `,
      awaitPromise: true
    });
    
    expect(result.result.value).toBe('testValue');
  });

  test('should save and retrieve token', async () => {
    const { driver } = global.testContext;
    const bg = await driver.background();
    
    // 使用背景脚本中的函数
    await bg.send('Runtime.evaluate', {
      expression: 'saveToken("abc123")',
      awaitPromise: true
    });
    
    const result = await bg.send('Runtime.evaluate', {
      expression: 'getToken()',
      awaitPromise: true
    });
    
    expect(result.result.value).toBe('abc123');
  });
});