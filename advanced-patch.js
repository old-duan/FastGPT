// FastGPT 高级版运行时补丁
// 在容器启动时自动将 isPlus 设置为 true

const originalInitSystemConfig = require('./service/common/system/index').initSystemConfig;

// 覆盖 initSystemConfig 函数
require('./service/common/system/index').initSystemConfig = async function() {
  await originalInitSystemConfig();
  
  // 强制设置为商业版
  if (global.feConfigs) {
    global.feConfigs.isPlus = true;
    global.feConfigs.show_dataset_enhance = true;
    global.feConfigs.show_batch_eval = true;
    console.log('[高级版补丁] 已启用所有商业版功能');
  }
};

console.log('[高级版补丁] 补丁已加载');
