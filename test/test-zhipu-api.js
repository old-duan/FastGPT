/**
 * 测试智谱AI API连接
 * 验证GLM-4模型和Embedding-2模型是否正常工作
 */

const https = require('https');

// 配置
const API_KEY = 'fc4e2397c7a9420b8d6a136c901c29b0.td3MNrZjRR9l1LLC';
const BASE_URL = 'https://open.bigmodel.cn/api/paas/v4';

// 测试Chat API
async function testChatAPI() {
  console.log('\n=== 测试 GLM-4 Chat API ===');
  
  const data = JSON.stringify({
    model: 'glm-4',
    messages: [
      {
        role: 'user',
        content: 'Hello, please introduce yourself briefly'
      }
    ]
  });

  const options = {
    hostname: 'open.bigmodel.cn',
    port: 443,
    path: '/api/paas/v4/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (res.statusCode === 200) {
            console.log('✅ Chat API 测试成功');
            console.log('模型:', response.model);
            console.log('回复:', response.choices[0].message.content.substring(0, 100));
            console.log('Token使用:', JSON.stringify(response.usage));
            resolve(response);
          } else {
            console.log('❌ Chat API 测试失败');
            console.log('状态码:', res.statusCode);
            console.log('错误信息:', body);
            reject(new Error(body));
          }
        } catch (error) {
          console.log('❌ 解析响应失败:', error.message);
          console.log('原始响应:', body);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ 请求错误:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// 测试Embedding API
async function testEmbeddingAPI() {
  console.log('\n=== 测试 Embedding-2 API ===');
  
  const data = JSON.stringify({
    model: 'embedding-2',
    input: 'Test text vectorization function'
  });

  const options = {
    hostname: 'open.bigmodel.cn',
    port: 443,
    path: '/api/paas/v4/embeddings',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (res.statusCode === 200) {
            console.log('✅ Embedding API 测试成功');
            console.log('模型:', response.model);
            console.log('向量维度:', response.data[0].embedding.length);
            console.log('Token使用:', JSON.stringify(response.usage));
            resolve(response);
          } else {
            console.log('❌ Embedding API 测试失败');
            console.log('状态码:', res.statusCode);
            console.log('错误信息:', body);
            reject(new Error(body));
          }
        } catch (error) {
          console.log('❌ 解析响应失败:', error.message);
          console.log('原始响应:', body);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ 请求错误:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// 运行所有测试
async function runTests() {
  console.log('========================================');
  console.log('FastGPT 智谱AI API 测试');
  console.log('========================================');
  
  try {
    await testChatAPI();
    await testEmbeddingAPI();
    
    console.log('\n========================================');
    console.log('✅ 所有测试通过!');
    console.log('========================================');
    console.log('\n接下来你可以:');
    console.log('1. 访问 http://localhost:3000 登录系统');
    console.log('   用户名: root');
    console.log('   密码: 123456');
    console.log('2. 创建知识库并导入文档');
    console.log('3. 创建应用并配置工作流');
    console.log('4. 测试对话功能');
  } catch (error) {
    console.log('\n========================================');
    console.log('❌ 测试失败');
    console.log('========================================');
    process.exit(1);
  }
}

// 执行测试
runTests();
