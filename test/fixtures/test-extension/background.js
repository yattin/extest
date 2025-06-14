chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  chrome.storage.local.set({initialized: true});
});

chrome.action.onClicked.addListener((tab) => {
  console.log('Action clicked for tab:', tab.id);
});

// 测试用的工具函数
function saveToken(token) {
  return new Promise((resolve) => {
    chrome.storage.local.set({token}, () => resolve());
  });
}

function getToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get('token', (data) => resolve(data.token));
  });
}

function isDarkModeEnabled() {
  return new Promise((resolve) => {
    chrome.storage.local.get('darkMode', (data) => resolve(data.darkMode || false));
  });
}

// 导出供测试使用
if (typeof globalThis !== 'undefined') {
  globalThis.saveToken = saveToken;
  globalThis.getToken = getToken;
  globalThis.isDarkModeEnabled = isDarkModeEnabled;
}