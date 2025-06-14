// 注入标识元素
const injected = document.createElement('div');
injected.className = 'extension-injected';
injected.textContent = 'Injected by Extension';
injected.style.cssText = 'position:fixed;top:10px;right:10px;z-index:9999;background:red;color:white;padding:5px;border-radius:3px;font-size:12px;';
document.body.appendChild(injected);

// 监听按钮点击
document.addEventListener('click', (e) => {
  if (e.target.id === 'test-button') {
    const clicked = document.createElement('div');
    clicked.className = 'button-clicked';
    clicked.textContent = 'Button was clicked!';
    clicked.style.cssText = 'color: green; font-weight: bold; margin-top: 10px;';
    e.target.after(clicked);
  }
});

console.log('Content script loaded');