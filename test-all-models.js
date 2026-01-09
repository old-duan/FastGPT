const http = require('http');
const https = require('https');

// 智谱AI API配置
const ZHIPU_API_KEY = '5fafc0c80c38f1c1be0001e9ab84a0fc.u1Y5cNHIkuwk3cjk';
const ZHIPU_BASE_URL = 'https://open.bigmodel.cn/api/paas/v4';

// Ollama API配置
const OLLAMA_BASE_URL = 'http://localhost:11434';

async function testOllamaModel(model, type) {
  return new Promise((resolve) => {
    const isEmbedding = type === 'embedding';
    const path = isEmbedding ? '/v1/embeddings' : '/api/generate';
    const body = isEmbedding 
      ? JSON.stringify({ model, input: 'test' })
      : JSON.stringify({ model, prompt: 'hi', stream: false });
    
    const req = http.request({
      hostname: 'localhost',
      port: 11434,
      path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ ok: true, model });
        } else {
          resolve({ ok: false, model, error: `HTTP ${res.statusCode}` });
        }
      });
    });
    
    req.on('error', (e) => resolve({ ok: false, model, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, model, error: 'timeout' }); });
    req.write(body);
    req.end();
  });
}

async function testZhipuModel(model) {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      model,
      messages: [{ role: 'user', content: 'hi' }],
      max_tokens: 5
    });
    
    const url = new URL(ZHIPU_BASE_URL + '/chat/completions');
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ZHIPU_API_KEY}`
      },
      timeout: 15000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ ok: true, model });
        } else {
          try {
            const json = JSON.parse(data);
            resolve({ ok: false, model, error: json.error?.message || `HTTP ${res.statusCode}` });
          } catch {
            resolve({ ok: false, model, error: `HTTP ${res.statusCode}` });
          }
        }
      });
    });
    
    req.on('error', (e) => resolve({ ok: false, model, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, model, error: 'timeout' }); });
    req.write(body);
    req.end();
  });
}

async function testZhipuEmbedding(model) {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      model,
      input: 'test'
    });
    
    const url = new URL(ZHIPU_BASE_URL + '/embeddings');
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ZHIPU_API_KEY}`
      },
      timeout: 15000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ ok: true, model });
        } else {
          try {
            const json = JSON.parse(data);
            resolve({ ok: false, model, error: json.error?.message || `HTTP ${res.statusCode}` });
          } catch {
            resolve({ ok: false, model, error: `HTTP ${res.statusCode}` });
          }
        }
      });
    });
    
    req.on('error', (e) => resolve({ ok: false, model, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, model, error: 'timeout' }); });
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('🔍 验证所有模型可用性...\n');
  
  // Ollama LLM 模型
  console.log('📦 Ollama LLM 模型:');
  const ollamaLLMs = ['qwen3:8b', 'deepseek-r1:8b', 'llama3:8b', 'qwen2:7b'];
  for (const model of ollamaLLMs) {
    const result = await testOllamaModel(model, 'llm');
    console.log(`  ${result.ok ? '✅' : '❌'} ${model}${result.error ? ' - ' + result.error : ''}`);
  }
  
  // Ollama Embedding 模型
  console.log('\n📦 Ollama Embedding 模型:');
  const ollamaEmbeddings = ['bge-m3:latest', 'mxbai-embed-large:latest', 'nomic-embed-text:latest'];
  for (const model of ollamaEmbeddings) {
    const result = await testOllamaModel(model, 'embedding');
    console.log(`  ${result.ok ? '✅' : '❌'} ${model}${result.error ? ' - ' + result.error : ''}`);
  }
  
  // 智谱AI LLM 模型
  console.log('\n📦 智谱AI LLM 模型:');
  const zhipuLLMs = ['glm-4'];
  for (const model of zhipuLLMs) {
    const result = await testZhipuModel(model);
    console.log(`  ${result.ok ? '✅' : '❌'} ${model}${result.error ? ' - ' + result.error : ''}`);
  }
  
  // 智谱AI Embedding 模型
  console.log('\n📦 智谱AI Embedding 模型:');
  const zhipuEmbeddings = ['embedding-2'];
  for (const model of zhipuEmbeddings) {
    const result = await testZhipuEmbedding(model);
    console.log(`  ${result.ok ? '✅' : '❌'} ${model}${result.error ? ' - ' + result.error : ''}`);
  }
  
  // 不可用模型 (需要OpenAI API key)
  console.log('\n⚠️  需要OpenAI API key的模型 (当前不可用):');
  const openaiModels = ['gpt-5', 'gpt-4o', 'text-embedding-ada-002', 'text-embedding-3-large', 'text-embedding-3-small', 'tts-1', 'whisper-1'];
  openaiModels.forEach(m => console.log(`  ❌ ${m} - 需要OpenAI API key`));
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 总结: 可用模型列表');
  console.log('='.repeat(50));
  console.log('LLM: qwen3:8b, deepseek-r1:8b, llama3:8b, qwen2:7b, glm-4 (如果智谱API有效)');
  console.log('Embedding: bge-m3:latest, mxbai-embed-large:latest, nomic-embed-text:latest, embedding-2 (如果智谱API有效)');
}

main();
