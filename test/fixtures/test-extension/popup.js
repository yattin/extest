document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('dark-mode-toggle');
  
  // 加载当前状态
  chrome.storage.local.get('darkMode', (data) => {
    if (data.darkMode) {
      document.body.classList.add('dark-mode');
    }
  });
  
  toggle.addEventListener('click', async () => {
    const body = document.body;
    const isDark = body.classList.toggle('dark-mode');
    
    await chrome.storage.local.set({darkMode: isDark});
    console.log('Dark mode toggled:', isDark);
  });
});