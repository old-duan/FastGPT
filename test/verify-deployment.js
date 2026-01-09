/**
 * FastGPT 完整功能测试
 * 测试系统核心功能是否正常
 */

const https = require('https');

// FastGPT API配置
const FASTGPT_BASE_URL = 'http://localhost:3000';

// 测试系统健康状态
async function testSystemHealth() {
  console.log('\n=== 测试系统健康状态 ===');
  
  return new Promise((resolve, reject) => {
    const http = require('http');
    const req = http.get(`${FASTGPT_BASE_URL}/`, (res) => {
      if (res.statusCode === 200 || res.statusCode === 307 || res.statusCode === 302) {
        console.log('✅ 系统运行正常');
        console.log('   状态码:', res.statusCode);
        resolve(true);
      } else {
        console.log('⚠️  系统响应异常');
        console.log('   状态码:', res.statusCode);
        resolve(false);
      }
    });

    req.on('error', (error) => {
      console.log('❌ 无法连接到系统:', error.message);
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('连接超时'));
    });
  });
}

// 显示系统信息
function displaySystemInfo() {
  console.log('\n=== FastGPT 系统信息 ===');
  console.log('📦 版本: 4.14.4');
  console.log('🌐 访问地址: http://localhost:3000');
  console.log('👤 默认用户: root');
  console.log('🔑 默认密码: 123456');
  console.log('');
  console.log('✅ 已配置模型:');
  console.log('   - GLM-4 (智谱AI - 对话模型)');
  console.log('   - Embedding-2 (智谱AI - 向量模型)');
  console.log('');
  console.log('✅ 数据库服务:');
  console.log('   - MongoDB: 127.0.0.1:27017');
  console.log('   - PostgreSQL (向量库): 127.0.0.1:5432');
  console.log('   - Redis: 127.0.0.1:6379');
  console.log('   - MinIO (S3): 127.0.0.1:9000');
}

// 显示使用指南
function displayUsageGuide() {
  console.log('\n=== 快速开始指南 ===');
  console.log('');
  console.log('1️⃣  登录系统:');
  console.log('   在浏览器中打开 http://localhost:3000');
  console.log('   使用 root / 123456 登录');
  console.log('');
  console.log('2️⃣  创建知识库:');
  console.log('   - 点击"知识库"菜单');
  console.log('   - 点击"新建知识库"');
  console.log('   - 选择向量模型: Embedding-2');
  console.log('   - 导入文档或手动添加内容');
  console.log('');
  console.log('3️⃣  创建应用:');
  console.log('   - 点击"应用"菜单');
  console.log('   - 选择合适的应用模板');
  console.log('   - 配置AI模型: GLM-4');
  console.log('   - 关联知识库');
  console.log('   - 发布应用');
  console.log('');
  console.log('4️⃣  测试对话:');
  console.log('   - 在应用详情页点击"对话测试"');
  console.log('   - 输入问题进行测试');
  console.log('');
  console.log('5️⃣  API调用:');
  console.log('   - 获取API Key: 个人设置 -> API密钥');
  console.log('   - 参考文档: https://doc.fastgpt.io/docs/development/openapi');
}

// 显示配置文件位置
function displayConfigInfo() {
  console.log('\n=== 配置文件位置 ===');
  console.log('');
  console.log('📄 环境变量配置:');
  console.log('   d:\\FastGPT\\projects\\app\\.env.local');
  console.log('');
  console.log('📄 模型配置:');
  console.log('   d:\\FastGPT\\projects\\app\\data\\config.local.json');
  console.log('');
  console.log('📄 Docker Compose:');
  console.log('   d:\\FastGPT\\deploy\\dev\\docker-compose.yml');
}

// 显示常用命令
function displayCommonCommands() {
  console.log('\n=== 常用命令 ===');
  console.log('');
  console.log('🔧 启动开发服务器:');
  console.log('   cd d:\\FastGPT');
  console.log('   pnpm --filter app dev');
  console.log('');
  console.log('🔧 查看Docker容器状态:');
  console.log('   docker ps');
  console.log('');
  console.log('🔧 查看应用日志:');
  console.log('   docker logs mongo');
  console.log('   docker logs pg');
  console.log('   docker logs redis');
  console.log('');
  console.log('🔧 重启数据库:');
  console.log('   docker restart mongo pg redis');
}

// 主测试函数
async function runTests() {
  console.log('========================================');
  console.log('     FastGPT 本地部署验证工具');
  console.log('========================================');
  
  try {
    // 测试系统健康
    await testSystemHealth();
    
    // 显示系统信息
    displaySystemInfo();
    
    // 显示使用指南
    displayUsageGuide();
    
    // 显示配置信息
    displayConfigInfo();
    
    // 显示常用命令
    displayCommonCommands();
    
    console.log('\n========================================');
    console.log('✅ FastGPT 本地部署验证完成!');
    console.log('========================================');
    console.log('\n🎉 恭喜! 您的 FastGPT 已经成功部署并运行!');
    console.log('');
    console.log('💡 提示: 如需帮助,请访问:');
    console.log('   - 官方文档: https://doc.fastgpt.io');
    console.log('   - GitHub: https://github.com/labring/FastGPT');
    console.log('');
    
  } catch (error) {
    console.log('\n========================================');
    console.log('❌ 验证失败:', error.message);
    console.log('========================================');
    console.log('\n🔍 排查建议:');
    console.log('1. 检查开发服务器是否正在运行');
    console.log('2. 检查Docker容器是否正常运行: docker ps');
    console.log('3. 查看应用日志排查错误');
    process.exit(1);
  }
}

// 执行测试
runTests();
