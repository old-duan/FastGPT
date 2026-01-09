# FastGPT 白屏问题诊断和解决方案

## 问题现象

1. Next.js显示 `✓ Ready in X.Xs` 但立即退出(exit code 1)
2. 端口3000无法连接
3. 浏览器访问显示白屏或无法连接

## 根本原因

Next.js在Windows环境下的hostname绑定问题:
- 默认情况下Next.js可能只绑定到localhost/127.0.0.1
- 需要明确指定 `-H 0.0.0.0` 才能正确监听
- 服务初始化后由于某些异步错误导致进程退出

## 解决方案

### 方案1: 直接使用next命令(推荐)

```powershell
cd d:\FastGPT\projects\app
pnpm exec next dev -H 0.0.0.0 -p 3000
```

这会跳过npm scripts包装,直接启动Next.js

###方案2: 修改package.json(已完成)

已将 `projects/app/package.json` 中的dev脚本修改为:
```json
"dev": "npm run build:workers && next dev -H 0.0.0.0"
```

然后使用:
```powershell
cd d:\FastGPT
pnpm --filter app dev
```

### 方案3: 使用环境变量

在 `.env.local` 中添加:
```
HOSTNAME=0.0.0.0
PORT=3000
```

### 方案4: 生产模式运行

如果开发模式持续有问题,可以尝试生产模式:

```powershell
# 构建
cd d:\FastGPT\projects\app
pnpm build

# 启动
pnpm start
```

## 常见错误排查

### 1. 端口被占用

```powershell
# 查看3000端口占用
netstat -ano | findstr ":3000"

# 杀死占用进程
taskkill /PID <进程ID> /F
```

### 2. 进程残留

```powershell
# 查找所有node进程
Get-Process | Where-Object { $_.ProcessName -eq "node" }

# 强制停止所有node进程
Get-Process | Where-Object { $_.ProcessName -eq "node" } | Stop-Process -Force
```

### 3. 缓存问题

```powershell
cd d:\FastGPT\projects\app

# 清理Next.js缓存
Remove-Item -Recurse -Force .next

# 重新安装依赖
pnpm install
```

### 4. 检查日志

查看终端输出中是否有以下错误:
- MongoDB连接失败
- PostgreSQL连接失败  
- Redis连接失败
- 端口冲突
- 模块加载失败

## 验证服务是否正常

```powershell
# 1. 检查端口
Test-NetConnection -ComputerName localhost -Port 3000

# 2. 测试HTTP
curl http://localhost:3000

# 3. 在浏览器访问
# http://localhost:3000
```

## 备选解决方案

如果上述方法都不奏效,可以考虑:

1. **使用Docker部署**
   ```powershell
   cd d:\FastGPT\deploy\docker\cn
   docker-compose up -d
   ```

2. **检查防火墙设置**
   确保Windows防火墙没有阻止3000端口

3. **使用不同端口**
   修改为3001或其他端口:
   ```powershell
   pnpm exec next dev -H 0.0.0.0 -p 3001
   ```

4. **检查系统资源**
   - 确保有足够的内存
   - 确保磁盘空间充足
   - 关闭不必要的程序

## 最终建议

当前最稳定的启动方式:

```powershell
# 1. 确保Docker服务运行
docker ps

# 2. 清理环境
cd d:\FastGPT\projects\app
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# 3. 启动服务
pnpm exec next dev -H 0.0.0.0 -p 3000

# 4. 等待30-60秒让服务完全启动

# 5. 在浏览器访问
# http://localhost:3000
```

**注意**: 首次访问时Next.js需要编译页面,可能需要20-30秒才能看到内容。

## 已知问题

1. Next.js在Windows下的hostname绑定不稳定
2. `pnpm --filter app dev` 在某些情况下无法正确传递参数
3. 服务初始化成功后可能因异步错误退出

建议直接使用 `pnpm exec next dev -H 0.0.0.0 -p 3000` 命令。
