# 🎯 文件上传问题 - 快速修复指南

## 问题症状
- ❌ Web端上传文件失败
- ❌ 页面出现倒退、闪退
- ❌ 报错："Failed to create post presigned url"

## ✅ 解决方案（1分钟修复）

### 1. 修改配置文件

打开 `deploy/docker/cn/docker-compose.pg.yml`，找到第15-16行：

```yaml
# 修改前（错误）
S3_EXTERNAL_BASE_URL: http://fastgpt-minio:9000
S3_ENDPOINT: fastgpt-minio

# 修改后（正确）
S3_EXTERNAL_BASE_URL: http://localhost:9000
S3_ENDPOINT: host.docker.internal
```

### 2. 重启服务

```powershell
cd D:\FastGPT\deploy\docker\cn
docker-compose -f docker-compose.pg.yml restart fastgpt
```

### 3. 验证修复

```powershell
# 检查配置
docker exec fastgpt env | Select-String "S3_EXTERNAL_BASE_URL"
# 应显示: S3_EXTERNAL_BASE_URL=http://localhost:9000

# 访问测试
curl http://localhost:3000  # Web服务
curl http://localhost:9000/minio/health/live  # MinIO服务
```

### 4. 浏览器测试

1. 打开 http://localhost:3000
2. 登录系统
3. 进入知识库 → 创建/选择知识库
4. 点击"上传文件"
5. 选择文件上传
6. ✅ 应该可以正常上传

## 🌐 局域网访问配置

如需局域网其他设备访问：

```yaml
# 使用局域网IP
S3_EXTERNAL_BASE_URL: http://172.26.240.1:9000
```

## ❓ 为什么要这样修改？

### S3_EXTERNAL_BASE_URL (浏览器访问)

| 配置 | 说明 | 浏览器是否能访问 |
|------|------|-----------------|
| `http://fastgpt-minio:9000` | 容器内部地址 | ❌ 不能 |
| `http://localhost:9000` | 本机地址 | ✅ 可以 |
| `http://192.168.x.x:9000` | 局域网地址 | ✅ 可以 |

### S3_ENDPOINT (容器访问主机)

| 配置 | 说明 | 容器是否能访问主机 |
|------|------|--------------------|
| `fastgpt-minio` | 容器网络地址 | ❌ 不能访问主机 |
| `host.docker.internal` | Docker 主机特殊域名 | ✅ 可以 |
| `localhost` | 容器内部回环 | ❌ 指向容器自己 |

**核心原理：**
1. **浏览器上传** → 需要访问 `localhost:9000`
2. **FastGPT 生成预签名 URL** → 需要通过 `host.docker.internal:9000` 连接 MinIO
3. **两者必须都能访问** → 预签名 URL 才能正确生成

## 📝 详细文档

查看完整修复报告：`docs/FILE_UPLOAD_FIX.md`

---
**修复时间：** 2025年12月17日  
**适用版本：** FastGPT v4.14.4
