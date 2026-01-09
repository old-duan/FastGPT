# FastGPT 脚本使用指南

> **最后更新**: 2025年12月18日

---

## 📁 脚本分类

### 🚀 启动脚本

#### 1. `start-fastgpt-stable.ps1` ⭐ 推荐

**用途**: 开发环境稳定启动

**特点**:
- ✅ 独立窗口运行,防止意外关闭
- ✅ 完整的前置检查(端口、数据库、目录)
- ✅ 进度显示和状态验证
- ✅ 自动等待服务就绪

**使用方法**:
```powershell
.\start-fastgpt-stable.ps1
```

**适用场景**:
- 日常开发
- 长时间运行
- 稳定性要求高的场景

---

#### 2. `start-dev.ps1`

**用途**: 传统开发启动方式

**特点**:
- 在当前窗口启动
- 可以直接看到日志输出
- 支持 Ctrl+C 快速停止

**使用方法**:
```powershell
.\start-dev.ps1

# 停止服务
.\start-dev.ps1 -Stop
```

**适用场景**:
- 调试阶段
- 需要查看实时日志
- 快速启动测试

---

#### 3. `quick-start.ps1` (已废弃)

**状态**: 🔴 已废弃,建议使用 `start-fastgpt-stable.ps1`

**原因**:
- 功能与 start-fastgpt-stable.ps1 重复
- 缺少完整的前置检查
- 不推荐继续使用

---

### 🔧 功能脚本

#### 4. `scripts/enable-lan-access.ps1`

**用途**: 配置局域网访问

**功能**:
- 修改 Next.js 配置支持局域网访问
- 自动检测并配置本机 IP 地址
- 创建详细的配置指南

**使用方法**:
```powershell
.\scripts\enable-lan-access.ps1
```

**效果**:
- 可通过 `http://192.168.110.18:3000` 局域网访问
- 生成 `docs/LAN_ACCESS_GUIDE.md` 指南

---

#### 5. `scripts/configure-docker-mirror.ps1`

**用途**: 配置 Docker 镜像加速

**功能**:
- 添加国内镜像源(阿里云、腾讯云等)
- 优化 Docker 拉取速度

**使用方法**:
```powershell
.\scripts\configure-docker-mirror.ps1
```

---

#### 6. `scripts/network-diagnostic.ps1`

**用途**: 网络诊断工具

**功能**:
- 检查端口占用
- 测试数据库连接
- 验证网络配置

**使用方法**:
```powershell
.\scripts\network-diagnostic.ps1
```

---

### 🐳 Docker 构建脚本

#### 7. `scripts/build-advanced-fastgpt.ps1` (已过时)

**状态**: ⚠️ 已过时

**问题**: 构建过程存在内存不足问题

**替代方案**: 等待修复或使用 Dockerfile 直接构建

---

#### 8. `scripts/build-advanced-fastgpt-v2.ps1` (已过时)

**状态**: ⚠️ 已过时

**同上**

---

#### 9. `scripts/build-unlock-fastgpt.ps1` (已过时)

**状态**: ⚠️ 已过时

**同上**

---

### 🔄 更新脚本

#### 10. `scripts/update-fastgpt.ps1`

**用途**: 更新 FastGPT 到最新版本

**功能**:
- 拉取最新代码
- 更新依赖
- 重新构建

**使用方法**:
```powershell
.\scripts\update-fastgpt.ps1
```

---

#### 11. `scripts/start-server.ps1` (功能重复)

**状态**: 🟡 功能与 start-dev.ps1 重复

**建议**: 合并到主启动脚本

---

#### 12. `scripts/start-fastgpt.ps1` (功能重复)

**状态**: 🟡 功能与 start-fastgpt-stable.ps1 重复

**建议**: 合并到主启动脚本

---

### 🧪 测试脚本

#### 13. `test-web-sync.ps1`

**用途**: Web 站点同步功能自动化测试

**功能**:
- 7 步完整测试流程
- 服务状态检查
- API 登录测试
- 同步功能验证

**使用方法**:
```powershell
.\test-web-sync.ps1
```

**配套文档**:
- `docs/MANUAL_TEST_GUIDE.md`: 手动测试指南
- `test-website/`: 测试网站内容

---

## 📊 推荐使用的脚本

### 日常开发

```powershell
# 1. 启动数据库
cd deploy/dev
docker-compose up -d

# 2. 启动 FastGPT (稳定模式)
cd ../..
.\start-fastgpt-stable.ps1
```

### 测试验证

```powershell
# 自动化测试
.\test-web-sync.ps1

# 手动测试
# 参考 docs/MANUAL_TEST_GUIDE.md
```

### 网络配置

```powershell
# 启用局域网访问
.\scripts\enable-lan-access.ps1

# 网络诊断
.\scripts\network-diagnostic.ps1
```

---

## 🗑️ 待清理的脚本

### 建议删除 (功能重复)
- `quick-start.ps1` → 使用 `start-fastgpt-stable.ps1`
- `scripts/start-server.ps1` → 使用 `start-dev.ps1`
- `scripts/start-fastgpt.ps1` → 使用 `start-fastgpt-stable.ps1`

### 建议归档 (已过时)
- `scripts/build-advanced-fastgpt.ps1`
- `scripts/build-advanced-fastgpt-v2.ps1`
- `scripts/build-unlock-fastgpt.ps1`

移动到: `scripts/archive/` 目录

---

## 🔄 脚本整合计划

### Phase 1: 合并启动脚本

创建统一的 `start-fastgpt.ps1`:

```powershell
# 用法:
.\start-fastgpt.ps1           # 稳定模式(独立窗口)
.\start-fastgpt.ps1 -Dev      # 开发模式(当前窗口)
.\start-fastgpt.ps1 -Stop     # 停止服务
```

### Phase 2: 整合构建脚本

创建统一的 `build-docker.ps1`:

```powershell
# 用法:
.\scripts\build-docker.ps1 -Type basic      # 基础构建
.\scripts\build-docker.ps1 -Type advanced   # 高级构建
.\scripts\build-docker.ps1 -Clean           # 清理后构建
```

### Phase 3: 工具集合

创建 `tools.ps1` 工具集:

```powershell
# 用法:
.\scripts\tools.ps1 -Action diagnose    # 诊断
.\scripts\tools.ps1 -Action cleanup     # 清理
.\scripts\tools.ps1 -Action update      # 更新
```

---

## 📝 脚本开发规范

### 命名规范
- 动词开头: `start-`, `stop-`, `build-`, `test-`
- 使用连字符: `kebab-case.ps1`
- 描述清晰: 功能一目了然

### 代码规范
```powershell
# 1. 添加脚本说明
<#
.SYNOPSIS
    简短描述
.DESCRIPTION
    详细说明
.EXAMPLE
    使用示例
#>

# 2. 错误处理
$ErrorActionPreference = "Stop"
try {
    # 主要逻辑
} catch {
    Write-Host "错误: $_" -ForegroundColor Red
    exit 1
}

# 3. 用户提示
Write-Host "=== 操作描述 ===" -ForegroundColor Cyan
Write-Host "✓ 成功信息" -ForegroundColor Green
Write-Host "⚠ 警告信息" -ForegroundColor Yellow
Write-Host "✗ 错误信息" -ForegroundColor Red

# 4. 参数验证
param(
    [Parameter(Mandatory=$true)]
    [string]$Required,
    
    [Parameter(Mandatory=$false)]
    [switch]$Optional
)
```

### 文档要求
每个脚本都应该有:
1. 脚本顶部的使用说明注释
2. 在本文档中的条目说明
3. 必要时创建独立的使用文档

---

## 🔗 相关文档

- [PROJECT_STATUS.md](../PROJECT_STATUS.md): 项目进度和状态
- [DEVELOPMENT_GUIDE.md](../DEVELOPMENT_GUIDE.md): 完整开发指南
- [docs/MANUAL_TEST_GUIDE.md](../docs/MANUAL_TEST_GUIDE.md): 测试指南

---

**维护者**: FastGPT 开发团队  
**最后更新**: 2025-12-18
