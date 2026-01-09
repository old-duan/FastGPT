/**
 * 初始化模型配置到MongoDB
 * 将config.local.json中的模型导入到system_models集合
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const JSON5 = require('json5');

// MongoDB连接配置
const MONGODB_URI = 'mongodb://myusername:mypassword@127.0.0.1:27017/fastgpt?authSource=admin&directConnection=true';

// 读取配置文件
const configPath = path.join(__dirname, 'projects', 'app', 'data', 'config.local.json');
const configContent = fs.readFileSync(configPath, 'utf-8');
// 使用JSON5解析（支持注释）
const config = JSON5.parse(configContent);

async function initModels() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ 已连接到MongoDB');
    
    const db = client.db('fastgpt');
    const collection = db.collection('system_models');
    
    // 清空现有数据
    const deleteResult = await collection.deleteMany({});
    console.log(`🗑️  删除了 ${deleteResult.deletedCount} 个旧模型配置`);
    
    const models = [];
    
    // 处理LLM模型
    if (config.llmModels && Array.isArray(config.llmModels)) {
      for (const llm of config.llmModels) {
        const modelDoc = {
          model: llm.model,
          metadata: {
            model: llm.model,
            name: llm.name || llm.model,
            type: 'llm',
            provider: 'openai', // 使用OpenAI兼容格式
            avatar: llm.avatar || '/imgs/model/openai.svg',
            
            // 基础配置
            maxContext: llm.maxContext || 4096,
            maxResponse: llm.maxResponse || 4000,
            quoteMaxToken: llm.quoteMaxToken || 3000,
            maxTemperature: llm.maxTemperature || 1.2,
            charsPointsPrice: llm.charsPointsPrice || 0,
            inputPrice: llm.inputPrice,
            outputPrice: llm.outputPrice,
            
            // 功能配置
            censor: llm.censor || false,
            vision: llm.vision || false,
            datasetProcess: llm.datasetProcess !== false,
            usedInClassify: llm.usedInClassify !== false,
            usedInExtractFields: llm.usedInExtractFields !== false,
            usedInToolCall: llm.usedInToolCall !== false,
            usedInQueryExtension: llm.usedInQueryExtension !== false,
            toolChoice: llm.toolChoice || false,
            functionCall: llm.functionCall || false,
            
            // 提示词配置
            customCQPrompt: llm.customCQPrompt || '',
            customExtractPrompt: llm.customExtractPrompt || '',
            defaultSystemChatPrompt: llm.defaultSystemChatPrompt || '',
            
            // 默认参数
            defaultConfig: llm.defaultConfig || {},
            
            // 激活状态
            isActive: true,
            isDefault: llm.model === 'glm-4' // GLM-4设为默认
          }
        };
        models.push(modelDoc);
        console.log(`  ✓ 准备导入LLM模型: ${llm.name || llm.model} (${llm.model})`);
      }
    }
    
    // 处理Embedding模型
    if (config.vectorModels && Array.isArray(config.vectorModels)) {
      for (const emb of config.vectorModels) {
        const modelDoc = {
          model: emb.model,
          metadata: {
            model: emb.model,
            name: emb.name || emb.model,
            type: 'embedding',
            provider: 'openai',
            avatar: emb.avatar || '/imgs/model/openai.svg',
            
            charsPointsPrice: emb.charsPointsPrice || 0,
            inputPrice: emb.inputPrice,
            outputPrice: emb.outputPrice,
            defaultToken: emb.defaultToken || 700,
            maxToken: emb.maxToken || 3000,
            weight: emb.weight || 100,
            
            defaultConfig: emb.defaultConfig || {},
            dbConfig: emb.dbConfig || {},
            queryConfig: emb.queryConfig || {},
            
            isActive: true,
            isDefault: emb.model === 'embedding-2' // Embedding-2设为默认
          }
        };
        models.push(modelDoc);
        console.log(`  ✓ 准备导入Embedding模型: ${emb.name || emb.model} (${emb.model})`);
      }
    }
    
    // 处理ReRank模型
    if (config.reRankModels && Array.isArray(config.reRankModels)) {
      for (const rerank of config.reRankModels) {
        const modelDoc = {
          model: rerank.model,
          metadata: {
            model: rerank.model,
            name: rerank.name || rerank.model,
            type: 'rerank',
            provider: 'openai',
            avatar: rerank.avatar || '/imgs/model/openai.svg',
            
            charsPointsPrice: rerank.charsPointsPrice || 0,
            inputPrice: rerank.inputPrice,
            outputPrice: rerank.outputPrice,
            
            isActive: true
          }
        };
        models.push(modelDoc);
        console.log(`  ✓ 准备导入ReRank模型: ${rerank.name || rerank.model} (${rerank.model})`);
      }
    }
    
    // 处理TTS模型
    if (config.audioSpeechModels && Array.isArray(config.audioSpeechModels)) {
      for (const tts of config.audioSpeechModels) {
        const modelDoc = {
          model: tts.model,
          metadata: {
            model: tts.model,
            name: tts.name || tts.model,
            type: 'tts',
            provider: 'openai',
            
            charsPointsPrice: tts.charsPointsPrice || 0,
            voices: tts.voices || [],
            
            isActive: true
          }
        };
        models.push(modelDoc);
        console.log(`  ✓ 准备导入TTS模型: ${tts.name || tts.model} (${tts.model})`);
      }
    }
    
    // 处理STT模型
    if (config.whisperModel) {
      const stt = config.whisperModel;
      const modelDoc = {
        model: stt.model,
        metadata: {
          model: stt.model,
          name: stt.name || stt.model,
          type: 'stt',
          provider: 'openai',
          
          charsPointsPrice: stt.charsPointsPrice || 0,
          
          isActive: true
        }
      };
      models.push(modelDoc);
      console.log(`  ✓ 准备导入STT模型: ${stt.name || stt.model} (${stt.model})`);
    }
    
    if (models.length > 0) {
      const result = await collection.insertMany(models);
      console.log(`\n✅ 成功导入 ${result.insertedCount} 个模型配置`);
      
      // 显示导入的模型
      console.log('\n📋 导入的模型列表:');
      const llmCount = models.filter(m => m.metadata.type === 'llm').length;
      const embCount = models.filter(m => m.metadata.type === 'embedding').length;
      const rerankCount = models.filter(m => m.metadata.type === 'rerank').length;
      const ttsCount = models.filter(m => m.metadata.type === 'tts').length;
      const sttCount = models.filter(m => m.metadata.type === 'stt').length;
      
      console.log(`  • LLM模型: ${llmCount} 个`);
      console.log(`  • Embedding模型: ${embCount} 个`);
      if (rerankCount > 0) console.log(`  • ReRank模型: ${rerankCount} 个`);
      if (ttsCount > 0) console.log(`  • TTS模型: ${ttsCount} 个`);
      if (sttCount > 0) console.log(`  • STT模型: ${sttCount} 个`);
      
      console.log('\n🔄 请重启FastGPT服务以加载新的模型配置');
      console.log('   Stop-Process -Name node -Force');
      console.log('   cd d:\\FastGPT; .\\start-server.ps1');
    } else {
      console.log('⚠️  没有找到可导入的模型配置');
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error);
  } finally {
    await client.close();
    console.log('\n✅ 已断开MongoDB连接');
  }
}

initModels();
