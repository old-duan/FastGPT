# FastGPT 项目文件清理清单

> **生成日期**: 2025年12月23日  
> **用途**: 标识需要删除或归档的过时文件

---

## 📁 根目录文件整理

### ✅ 保留文件 (核心)

| 文件名 | 用途 | 状态 |
|--------|------|------|
| `start-fastgpt-stable.ps1` | 稳定启动脚本 | ✅ 保留 |
| `start-dev.ps1` | 开发启动脚本 | ✅ 保留 |
| `init-models.js` | 初始化模型配置 | ✅ 保留 |
| `test-all-models.js` | 验证模型可用性 | ✅ 保留 |
| `FASTGPT_DEVELOPMENT_MANUAL.md` | 完整开发手册 | ✅ 保留 |
| `NEXT_PHASE_PLAN.md` | 下阶段任务计划 | ✅ 保留 |
| `README.md` | 项目说明 | ✅ 保留 |
| `START_HERE.md` | 快速入口 | ✅ 保留 |
| `DEVELOPMENT_GUIDE.md` | 开发指南 | ✅ 保留 |
| `PROJECT_STATUS.md` | 项目状态 | ✅ 保留 |
| `SCRIPTS_README.md` | 脚本说明 | ✅ 保留 |

### ❌ 建议删除 (临时/调试文件)

| 文件名 | 原因 | 操作建议 |
|--------|------|----------|
| `quick-start.ps1` | 功能与 start-fastgpt-stable.ps1 重复 | 删除 |
| `check-bullmq-queue.js` | 调试用临时文件 | 删除 |
| `check-collection.js` | 调试用临时文件 | 删除 |
| `check-dataset-collections.js` | 调试用临时文件 | 删除 |
| `check-dataset-status.js` | 调试用临时文件 | 删除 |
| `check-mongodb-datasets.js` | 调试用临时文件 | 删除 |
| `check-queue.js` | 调试用临时文件 | 删除 |
| `check-successful-dataset.js` | 调试用临时文件 | 删除 |
| `check-sync-result.js` | 调试用临时文件 | 删除 |
| `check-worker-status.js` | 调试用临时文件 | 删除 |
| `diagnose-worker.js` | 调试用临时文件 | 删除 |
| `fix-website-maxdepth.js` | 一次性修复脚本 | 删除 |
| `get-token.js` | 临时获取 token 脚本 | 删除 |
| `import-models.js` | 已被 init-models.js 替代 | 删除 |
| `quick-test-sync.js` | 临时测试脚本 | 删除 |
| `temp_getInitData.js` | 临时文件 | 删除 |
| `temp_models.json` | 临时文件 | 删除 |
| `temp_vector_models.json` | 临时文件 | 删除 |
| `test-url-check.js` | 临时测试脚本 | 删除 |
| `test-web-sync-fixed.js` | 临时测试脚本 | 删除 |
| `test-web-sync.js` | 临时测试脚本 | 删除 |
| `test-dataset-sync.ps1` | 临时测试脚本 | 删除 |
| `test-web-sync.ps1` | 临时测试脚本 | 删除 |
| `verify-models.js` | 功能与 test-all-models.js 重复 | 删除 |
| `advanced-patch.js` | Docker 构建相关,暂时无用 | 归档 |
| `advanced-entrypoint.sh` | Docker 构建相关,暂时无用 | 归档 |

### 📦 建议归档 (测试文件)

| 文件名 | 说明 | 归档位置 |
|--------|------|----------|
| `test-upload.txt` | 测试用文件 | `test/` |
| `test-website/` | 测试网站 | 保留或移至 `test/` |

### 🗑️ 建议删除 (日志/构建产物)

| 文件名 | 原因 |
|--------|------|
| `fastgpt-live.log` | 运行日志，不需要版本控制 |
| `pnpm-dev-logs.txt` | 开发日志 |
| `build.log` | 构建日志 |
| `build2.log` | 构建日志 |
| `build-final.log` | 构建日志 |
| `zhlint` | 空文件或临时文件 |

---

## 📁 docs/ 目录整理

### ✅ 保留

| 文件名 | 用途 |
|--------|------|
| `README.md` | 文档目录索引 |
| `LAN_ACCESS_GUIDE.md` | 局域网访问指南 |
| `WEB_SYNC_QUICK_GUIDE.md` | Web同步快速指南 |
| `MAINTENANCE.md` | 维护指南 |
| `MODEL_CONFIG_QUICK_REF.md` | 模型配置参考 |

### ❌ 建议删除/归档

| 文件名 | 原因 | 建议 |
|--------|------|------|
| `Untitled-1.md` | 临时文件 | 删除 |
| `COMMERCIAL_API_ANALYSIS.md` | 分析文档,已整合 | 归档 |
| `COMPLETE_SOLUTION.md` | 方案文档,已整合 | 归档 |
| `FINAL_FIX_REPORT.md` | 修复报告,已整合 | 归档 |
| `PRO_API_MOCK_SOLUTION.md` | 方案文档,已整合 | 归档 |
| `QUICK_TEST_WITH_AUTH.md` | 临时测试文档 | 删除 |
| `MANUAL_TEST_GUIDE.md` | 测试文档,可归档 | 归档 |
| `ADVANCED_VERSION_GUIDE.md` | 可合并到主手册 | 归档 |

---

## 📁 根目录文档整理

### ❌ 建议删除/归档

| 文件名 | 原因 | 建议 |
|--------|------|------|
| `CLEANUP_COMPLETION_REPORT.md` | 历史报告 | 删除 |
| `DOCUMENTATION_CLEANUP_PLAN.md` | 已完成的计划 | 删除 |
| `DOCKER_BUILD_EXPLANATION.md` | 可合并到手册 | 归档 |
| `SECURITY.md` | 保留 | ✅ 保留 |

---

## 🔧 执行清理命令

```powershell
# ⚠️ 执行前请确认备份!

# 删除临时调试脚本
Remove-Item "D:\FastGPT\check-*.js" -Force
Remove-Item "D:\FastGPT\diagnose-worker.js" -Force
Remove-Item "D:\FastGPT\fix-website-maxdepth.js" -Force
Remove-Item "D:\FastGPT\get-token.js" -Force
Remove-Item "D:\FastGPT\import-models.js" -Force
Remove-Item "D:\FastGPT\quick-test-sync.js" -Force
Remove-Item "D:\FastGPT\temp_*.js" -Force
Remove-Item "D:\FastGPT\temp_*.json" -Force
Remove-Item "D:\FastGPT\test-url-check.js" -Force
Remove-Item "D:\FastGPT\test-web-sync*.js" -Force
Remove-Item "D:\FastGPT\verify-models.js" -Force
Remove-Item "D:\FastGPT\quick-start.ps1" -Force
Remove-Item "D:\FastGPT\test-*.ps1" -Force

# 删除日志文件
Remove-Item "D:\FastGPT\*.log" -Force
Remove-Item "D:\FastGPT\pnpm-dev-logs.txt" -Force
Remove-Item "D:\FastGPT\zhlint" -Force

# 删除过时文档
Remove-Item "D:\FastGPT\CLEANUP_COMPLETION_REPORT.md" -Force
Remove-Item "D:\FastGPT\DOCUMENTATION_CLEANUP_PLAN.md" -Force
Remove-Item "D:\FastGPT\docs\Untitled-1.md" -Force

# 归档文档 (移动到 docs/archive/)
New-Item -ItemType Directory -Path "D:\FastGPT\docs\archive" -Force
Move-Item "D:\FastGPT\docs\COMMERCIAL_API_ANALYSIS.md" "D:\FastGPT\docs\archive\" -Force
Move-Item "D:\FastGPT\docs\COMPLETE_SOLUTION.md" "D:\FastGPT\docs\archive\" -Force
Move-Item "D:\FastGPT\docs\FINAL_FIX_REPORT.md" "D:\FastGPT\docs\archive\" -Force
Move-Item "D:\FastGPT\docs\PRO_API_MOCK_SOLUTION.md" "D:\FastGPT\docs\archive\" -Force
Move-Item "D:\FastGPT\DOCKER_BUILD_EXPLANATION.md" "D:\FastGPT\docs\archive\" -Force

Write-Host "✅ 清理完成!"
```

---

## 📊 清理前后对比

| 类型 | 清理前 | 清理后 | 减少 |
|------|--------|--------|------|
| 根目录 .js 文件 | 22 | 3 | 19 |
| 根目录 .ps1 文件 | 5 | 2 | 3 |
| 根目录 .md 文件 | 13 | 9 | 4 |
| docs/ .md 文件 | 14 | 7 | 7 |
| 日志文件 | 5 | 0 | 5 |

---

**注意**: 执行清理前请确保已提交或备份所有更改！
