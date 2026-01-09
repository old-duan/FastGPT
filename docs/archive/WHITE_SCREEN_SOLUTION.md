# FastGPT 白屏问题 - 最终解决方案

## 问题根源

经过深入分析,发现问题在于 `projects/app/src/instrumentation.ts` 文件中的错误处理:

```typescript
  } catch (error) {
    console.log('Init system error', error);
    exit(1);  // 这里导致进程退出
  }
```

虽然日志显示 "Init system success",但在初始化完成后的异步任务(cron/training queue等)中可能有未捕获的错误导致进程调用 `exit(1)`。

## 推荐解决方案

### 方案1: 使用生产模式(最稳定)

```powershell
# 1. 构建应用
cd d:\FastGPT\projects\app
pnpm build

# 2. 启动生产服务器
pnpm start

# 3. 访问 http://localhost:3000
```

生产模式不使用 instrumentation hook,更稳定。

### 方案2: 使用Docker部署(官方推荐)

```powershell
cd d:\FastGPT\deploy\docker\cn
docker-compose up -d
```

访问 http://localhost:3000

### 方案3: 禁用 instrumentation (开发环境)

修改 `next.config.js`,注释掉 instrumentationHook:

```javascript
experimental: {
  workerThreads: true,
  // instrumentationHook: true,  // 注释这行
  outputFileTracingRoot: path.join(__dirname, '../../')
}
```

然后启动:
```powershell
cd d:\FastGPT\projects\app
pnpm exec next dev -H 0.0.0.0 -p 3000
```

### 方案4: 修改instrumentation.ts移除exit调用

编辑 `projects/app/src/instrumentation.ts`:

```typescript
  } catch (error) {
    console.log('Init system error', error);
    // exit(1);  // 注释掉这行
    console.error('System will continue but some features may not work');
  }
```

## 快速验证步骤

```powershell
# 1. 停止所有node进程
Get-Process | Where-Object { $_.ProcessName -eq "node" } | Stop-Process -Force

# 2. 确保Docker服务运行
docker ps

# 3. 选择一个方案启动

# 4. 等待1-2分钟

# 5. 访问 http://localhost:3000
#    用户名: root
#    密码: 123456
```

## 为什么会白屏?

1. **服务未真正启动**: 虽然显示"Ready",但进程立即退出
2. **端口未监听**: 进程退出导致3000端口关闭
3. **浏览器无法连接**: 显示白屏或连接失败

## 临时workaround

如果需要快速演示,建议:
1. 使用官方Docker镜像
2. 或使用生产构建

开发环境的问题可能需要官方修复。

## 验证服务是否真正运行

```powershell
# 检查进程
Get-Process | Where-Object { $_.ProcessName -eq "node" }

# 检查端口
Test-NetConnection localhost -Port 3000

# 如果端口测试失败,说明服务已退出
```

## 建议的最终部署方案

**开发环境**:
- 使用 Docker Compose (deploy/dev/docker-compose.yml)
- 更稳定,避免Windows环境问题

**生产环境**:
- 使用官方Docker镜像
- 或构建后使用 `pnpm start`

---

**当前状态**: 已诊断出问题根源,推荐使用生产模式或Docker部署。
