// 简单的构建验证脚本
const fs = require('fs');
const path = require('path');

console.log('🔍 验证项目构建结果...\n');

// 检查dist目录
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  console.log('✅ dist目录存在');
  
  // 检查主要构建文件
  const files = ['index.js', 'index.d.ts'];
  files.forEach(file => {
    const filePath = path.join(distPath, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} 构建成功`);
    } else {
      console.log(`❌ ${file} 缺失`);
    }
  });
  
  // 检查核心模块
  const coreDir = path.join(distPath, 'core');
  if (fs.existsSync(coreDir)) {
    console.log('✅ core模块构建成功');
  } else {
    console.log('❌ core模块缺失');
  }
  
  const utilsDir = path.join(distPath, 'utils');
  if (fs.existsSync(utilsDir)) {
    console.log('✅ utils模块构建成功');
  } else {
    console.log('❌ utils模块缺失');
  }
} else {
  console.log('❌ dist目录不存在');
}

// 检查测试扩展
const testExtensionPath = path.join(__dirname, 'test/fixtures/test-extension');
if (fs.existsSync(testExtensionPath)) {
  console.log('✅ 测试扩展存在');
  
  const requiredFiles = ['manifest.json', 'background.js', 'popup.html', 'popup.js', 'content.js'];
  requiredFiles.forEach(file => {
    const filePath = path.join(testExtensionPath, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ 测试扩展文件 ${file} 存在`);
    } else {
      console.log(`❌ 测试扩展文件 ${file} 缺失`);
    }
  });
} else {
  console.log('❌ 测试扩展目录不存在');
}

console.log('\n🎉 项目构建验证完成！');
console.log('\n📋 可用的命令：');
console.log('  pnpm run build        - 构建项目');
console.log('  pnpm test             - 运行测试');
console.log('  pnpm run test:watch   - 监视模式运行测试');
console.log('  pnpm run test:coverage - 生成覆盖率报告');
console.log('  pnpm run test:ci      - CI模式运行测试');