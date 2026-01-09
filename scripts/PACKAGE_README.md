# FastGPT 项目打包工具使用说明

## 🎯 功能说明

此脚本会将 FastGPT 项目打包成一个完整的可迁移包，包含：
- ✅ 完整项目代码
- ✅ 所有依赖包（可选）
- ✅ Docker 配置文件
- ✅ 环境配置模板
- ✅ 快速启动脚本
- ✅ 详细安装指南

## 🚀 使用方法

### 方法1: 使用默认设置（推荐）

```powershell
cd D:\FastGPT\scripts
.\package-for-transfer.ps1
```

这将创建一个包含 node_modules 的完整包，输出到 `D:\FastGPT-Package\`

### 方法2: 自定义输出目录

```powershell
.\package-for-transfer.ps1 -OutputDir "E:\MyBackup"
```

### 方法3: 不包含 node_modules（减小体积）

```powershell
.\package-for-transfer.ps1 -IncludeNodeModules $false
```

⚠️ **注意**: 如果不包含 node_modules，新电脑需要运行 `pnpm install` 安装依赖

## 📦 打包内容

打包后的目录结构：
```
FastGPT_Full_20260106_123456/
├── FastGPT/                    # 完整项目代码
│   ├── projects/              # 应用代码
│   ├── packages/              # 共享包
│   ├── .env.template          # 环境配置模板
│   ├── start-fastgpt.ps1      # 快速启动脚本
│   └── start-docker.ps1       # Docker 启动脚本
├── Docker/                    # Docker 配置
│   ├── docker-compose.cn.yml
│   └── docker-compose.yml
├── Docs/                      # 文档
│   └── 安装指南.md
└── README.txt                 # 快速开始指南
```

## 💾 打包大小参考

- **包含 node_modules**: 约 2-4 GB
- **不包含 node_modules**: 约 100-200 MB

## 📤 迁移到新电脑

1. **复制打包文件**
   - 将生成的 `.zip` 文件复制到新电脑
   - 或者直接复制解压后的文件夹

2. **解压并安装**
   - 解压到任意位置（建议路径不含中文）
   - 打开 `README.txt` 查看快速开始指南

3. **快速启动**
   - 右键点击 `FastGPT\start-fastgpt.ps1`
   - 选择 "使用 PowerShell 运行"

## ⚙️ 参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `-OutputDir` | string | `D:\FastGPT-Package` | 输出目录路径 |
| `-IncludeNodeModules` | bool | `$true` | 是否包含 node_modules |
| `-IncludeDatabase` | switch | `$false` | 是否包含数据库数据（未实现）|

## 🔍 示例场景

### 场景1: 完整备份（推荐）
适用于：完整迁移、备份、离线部署

```powershell
.\package-for-transfer.ps1
```

### 场景2: 轻量备份
适用于：代码分享、网络传输

```powershell
.\package-for-transfer.ps1 -IncludeNodeModules $false
```

### 场景3: 自定义位置
适用于：指定备份盘、网络驱动器

```powershell
.\package-for-transfer.ps1 -OutputDir "E:\Backup\FastGPT"
```

## ⚠️ 注意事项

1. **磁盘空间**: 确保输出目录有足够空间（至少 5GB）
2. **运行权限**: 需要以管理员权限运行 PowerShell
3. **杀毒软件**: 某些杀毒软件可能会干扰打包过程
4. **敏感信息**: `.env` 文件不会被包含，需手动配置

## 🛠️ 故障排查

### 问题1: 权限不足
```powershell
# 以管理员身份运行 PowerShell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\package-for-transfer.ps1
```

### 问题2: Robocopy 失败
检查源目录和目标目录是否可访问，路径是否正确

### 问题3: 压缩失败
即使压缩失败，解压目录仍然可用，可以手动压缩或直接复制文件夹

## 📞 获取帮助

遇到问题？查看：
- 项目文档: `docs/` 目录
- 安装指南: 打包后的 `Docs/安装指南.md`
- GitHub Issues: https://github.com/labring/FastGPT/issues

---
最后更新: 2026-01-06
