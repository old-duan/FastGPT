# FastGPT 二次开发备份与环境规范

## 🎯 核心原则

**备份不是可选项，而是必选项！**

开发前必须建立「代码 + 数据 + 环境」的三层防护体系，确保：
- ✅ 可随时回滚到纯净的开源版状态
- ✅ 可追溯每一次代码变更
- ✅ 数据误操作可恢复
- ✅ 官方更新可无冲突合并

---

## 📊 三层备份体系

### 层级 1：代码层（Git 版本控制）

#### 分支策略

```
main 分支 ─────────────────────────────────────────
    ↓ (纯净，仅同步官方更新)
    ↓
dev 分支 ──────────────────────────────────────────
    ↓ (日常开发主分支)
    ↓
    ├── feature/payment ───────── (支付系统开发)
    ├── feature/oauth ─────────── (社交登录开发)
    ├── feature/coupon ────────── (优惠券系统)
    └── bugfix/xxx ────────────── (Bug 修复)
```

#### 初始化步骤

```bash
# ========================================
# 步骤 1: 克隆官方仓库（作为原始备份）
# ========================================
git clone https://github.com/labring/FastGPT.git
cd FastGPT

# 查看当前状态
git status
git log --oneline -5

# ========================================
# 步骤 2: 创建私有仓库（重要！）
# ========================================
# 在 GitHub/GitLab/Gitee 创建私有仓库
# 例如: https://github.com/your-username/FastGPT-Private

# 添加私有仓库为远程源
git remote add private https://github.com/your-username/FastGPT-Private.git

# 推送所有分支到私有仓库
git push private main --tags

# 验证远程仓库
git remote -v
# 输出应该有：
# origin    https://github.com/labring/FastGPT.git (官方)
# private   https://github.com/your-username/FastGPT-Private.git (私有)

# ========================================
# 步骤 3: 创建开发分支（核心！）
# ========================================
# 创建 dev 分支（日常开发主分支）
git checkout -b dev
git push private dev

# 设置 dev 为默认推送分支
git branch --set-upstream-to=private/dev

# ========================================
# 步骤 4: 打基准标签（重要里程碑）
# ========================================
git tag -a v0.0-baseline -m "纯净的开源版基准"
git push private --tags

# ========================================
# 步骤 5: 创建功能分支（开发时使用）
# ========================================
# 基于 dev 创建功能分支
git checkout -b feature/payment dev
# 开发完成后合并回 dev
git checkout dev
git merge feature/payment
git push private dev
```

#### 日常开发工作流

```bash
# ----------------------------------------
# 场景 1: 开始新功能开发
# ----------------------------------------
# 1. 确保在 dev 分支并拉取最新代码
git checkout dev
git pull private dev

# 2. 创建功能分支
git checkout -b feature/payment

# 3. 开发并提交（遵循提交规范）
git add .
git commit -m "feat: 添加支付宝充值接口"
git push private feature/payment

# 4. 功能完成，合并回 dev
git checkout dev
git merge feature/payment --no-ff  # 保留分支历史
git push private dev

# 5. 删除功能分支（可选）
git branch -d feature/payment
git push private --delete feature/payment

# ----------------------------------------
# 场景 2: 紧急 Bug 修复
# ----------------------------------------
git checkout dev
git checkout -b bugfix/payment-callback
# 修复 Bug
git commit -m "fix: 修复支付回调签名验证错误"
git checkout dev
git merge bugfix/payment-callback
git push private dev

# ----------------------------------------
# 场景 3: 重要里程碑（打标签）
# ----------------------------------------
# Phase 1 完成
git tag -a v1.0-phase1 -m "Phase 1: 基础设施完善"
git push private --tags

# 支付系统完成
git tag -a v1.1-payment -m "支付系统上线"
git push private --tags

# ----------------------------------------
# 场景 4: 同步官方更新
# ----------------------------------------
# 1. 切换到 main 分支
git checkout main

# 2. 拉取官方最新代码
git pull origin main

# 3. 推送到私有仓库的 main 分支
git push private main

# 4. 合并到 dev 分支
git checkout dev
git merge main

# 5. 解决冲突（如果有）
# 手动编辑冲突文件
git add .
git commit -m "merge: 合并官方 v4.8.5 更新"
git push private dev

# ----------------------------------------
# 场景 5: 回滚到某个版本
# ----------------------------------------
# 查看所有标签
git tag -l

# 回滚到 Phase 1 状态
git checkout v1.0-phase1

# 基于该标签创建新分支
git checkout -b rollback-phase1
```

#### Git 提交规范

```bash
# 使用语义化提交（Conventional Commits）

# 功能开发
git commit -m "feat: 添加支付宝充值功能"
git commit -m "feat(payment): 添加微信支付支持"

# Bug 修复
git commit -m "fix: 修复余额扣费计算错误"
git commit -m "fix(auth): 修复 GitHub 登录回调失败"

# 文档更新
git commit -m "docs: 更新部署文档"

# 代码重构
git commit -m "refactor: 优化支付回调处理逻辑"

# 性能优化
git commit -m "perf: 优化数据库查询性能"

# 测试相关
git commit -m "test: 添加支付流程单元测试"

# 构建/部署
git commit -m "build: 更新 Docker 配置"
git commit -m "ci: 添加 GitHub Actions 自动部署"

# 样式调整
git commit -m "style: 统一代码格式"

# 其他
git commit -m "chore: 更新依赖版本"
```

---

### 层级 2：数据层（分环境备份）

#### 环境隔离策略

| 环境 | 数据库 | Redis | 用途 | 备份频率 |
|-----|--------|-------|------|---------|
| **原始环境** | `fastgpt_baseline` | `redis_baseline` | 纯净开源版数据，永不修改 | 初始化后立即备份（一次性） |
| **开发环境** | `fastgpt_dev` | `redis_dev` | 日常开发调试 | 每天自动备份（保留7天） |
| **测试环境** | `fastgpt_test` | `redis_test` | 功能测试 | 每周全量备份 |
| **生产环境** | `fastgpt_prod` | `redis_prod` | 线上运行（未来） | 实时增量备份 + 异地备份 |

#### 数据库备份脚本

##### MongoDB 备份

```bash
#!/bin/bash
# 文件: scripts/backup-mongodb.sh

# ========================================
# MongoDB 自动备份脚本
# ========================================

# 配置
BACKUP_DIR="/backup/mongodb"
MONGO_HOST="localhost"
MONGO_PORT="27017"
MONGO_DB="fastgpt_dev"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/$TIMESTAMP"

# 创建备份目录
mkdir -p "$BACKUP_PATH"

# 执行备份
echo "开始备份 MongoDB: $MONGO_DB"
mongodump \
  --host "$MONGO_HOST" \
  --port "$MONGO_PORT" \
  --db "$MONGO_DB" \
  --out "$BACKUP_PATH" \
  --gzip

# 检查备份是否成功
if [ $? -eq 0 ]; then
  echo "✅ 备份成功: $BACKUP_PATH"
  
  # 压缩备份文件
  cd "$BACKUP_DIR"
  tar -czf "${TIMESTAMP}.tar.gz" "$TIMESTAMP"
  rm -rf "$TIMESTAMP"
  
  echo "✅ 压缩完成: ${TIMESTAMP}.tar.gz"
else
  echo "❌ 备份失败"
  exit 1
fi

# 清理旧备份（保留最近7天）
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete
echo "✅ 清理旧备份完成"

# 备份文件大小
du -sh "$BACKUP_DIR/${TIMESTAMP}.tar.gz"
```

##### MongoDB 恢复

```bash
#!/bin/bash
# 文件: scripts/restore-mongodb.sh

# ========================================
# MongoDB 恢复脚本
# ========================================

# 参数检查
if [ -z "$1" ]; then
  echo "用法: ./restore-mongodb.sh <备份文件>"
  echo "示例: ./restore-mongodb.sh 20260109_120000.tar.gz"
  exit 1
fi

BACKUP_FILE="$1"
BACKUP_DIR="/backup/mongodb"
MONGO_HOST="localhost"
MONGO_PORT="27017"
MONGO_DB="fastgpt_dev"

# 解压备份文件
cd "$BACKUP_DIR"
tar -xzf "$BACKUP_FILE"

# 获取备份目录名
BACKUP_NAME=$(basename "$BACKUP_FILE" .tar.gz)

# 恢复数据库
echo "开始恢复 MongoDB: $MONGO_DB"
mongorestore \
  --host "$MONGO_HOST" \
  --port "$MONGO_PORT" \
  --db "$MONGO_DB" \
  --drop \
  --gzip \
  "$BACKUP_DIR/$BACKUP_NAME/$MONGO_DB"

if [ $? -eq 0 ]; then
  echo "✅ 恢复成功"
  rm -rf "$BACKUP_DIR/$BACKUP_NAME"
else
  echo "❌ 恢复失败"
  exit 1
fi
```

##### Redis 备份

```bash
#!/bin/bash
# 文件: scripts/backup-redis.sh

# ========================================
# Redis 自动备份脚本
# ========================================

BACKUP_DIR="/backup/redis"
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_RDB="/var/lib/redis/dump.rdb"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# 触发 Redis 保存快照
echo "触发 Redis BGSAVE"
redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" bgsave

# 等待保存完成
sleep 5

# 检查保存状态
while [ $(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" lastsave) -eq 0 ]; do
  echo "等待 BGSAVE 完成..."
  sleep 2
done

# 复制 RDB 文件
if [ -f "$REDIS_RDB" ]; then
  cp "$REDIS_RDB" "$BACKUP_DIR/${TIMESTAMP}_dump.rdb"
  echo "✅ Redis 备份成功: ${TIMESTAMP}_dump.rdb"
  
  # 压缩
  gzip "$BACKUP_DIR/${TIMESTAMP}_dump.rdb"
  
  # 清理旧备份（保留7天）
  find "$BACKUP_DIR" -name "*.rdb.gz" -mtime +7 -delete
  echo "✅ 清理旧备份完成"
else
  echo "❌ Redis RDB 文件不存在"
  exit 1
fi
```

##### 自动备份（Cron 定时任务）

```bash
# 编辑 crontab
crontab -e

# 添加定时任务
# 每天凌晨 2 点备份 MongoDB
0 2 * * * /path/to/scripts/backup-mongodb.sh >> /var/log/mongodb-backup.log 2>&1

# 每天凌晨 3 点备份 Redis
0 3 * * * /path/to/scripts/backup-redis.sh >> /var/log/redis-backup.log 2>&1

# 每周日凌晨 1 点全量备份（测试环境）
0 1 * * 0 /path/to/scripts/backup-all.sh >> /var/log/backup-all.log 2>&1
```

#### 配置文件备份

```bash
#!/bin/bash
# 文件: scripts/backup-config.sh

# ========================================
# 配置文件备份脚本
# ========================================

BACKUP_DIR="/backup/config"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/$TIMESTAMP"

mkdir -p "$BACKUP_PATH"

# 备份配置文件（排除敏感信息）
echo "备份配置文件..."

# .env 文件（加密备份）
if [ -f ".env" ]; then
  # 使用 GPG 加密（需要先生成密钥）
  gpg --output "$BACKUP_PATH/.env.gpg" --encrypt --recipient your-email@example.com .env
  echo "✅ .env 已加密备份"
fi

# Docker 配置
cp docker-compose.yml "$BACKUP_PATH/"
cp -r deploy/ "$BACKUP_PATH/"

# Nginx 配置（如果有）
if [ -d "/etc/nginx/sites-available" ]; then
  cp -r /etc/nginx/sites-available "$BACKUP_PATH/nginx"
fi

# 支付密钥（加密）
if [ -f "keys/alipay_private_key.pem" ]; then
  gpg --output "$BACKUP_PATH/alipay_key.gpg" \
    --encrypt --recipient your-email@example.com \
    keys/alipay_private_key.pem
fi

# 压缩
cd "$BACKUP_DIR"
tar -czf "${TIMESTAMP}_config.tar.gz" "$TIMESTAMP"
rm -rf "$TIMESTAMP"

echo "✅ 配置备份完成: ${TIMESTAMP}_config.tar.gz"

# 清理旧备份（保留30天）
find "$BACKUP_DIR" -name "*_config.tar.gz" -mtime +30 -delete
```

---

### 层级 3：环境层（物理隔离）

#### 环境配置

##### 原始环境（基准）

```yaml
# docker-compose.baseline.yml
version: '3'
services:
  fastgpt-baseline:
    image: registry.cn-hangzhou.aliyuncs.com/fastgpt/fastgpt:latest
    container_name: fastgpt-baseline
    ports:
      - "3100:3000"
    environment:
      - MONGODB_URI=mongodb://mongo-baseline:27017/fastgpt_baseline
      - REDIS_URI=redis://redis-baseline:6379
      - PORT=3000
    depends_on:
      - mongo-baseline
      - redis-baseline
    networks:
      - fastgpt-baseline

  mongo-baseline:
    image: mongo:6.0
    container_name: mongo-baseline
    ports:
      - "27117:27017"
    volumes:
      - mongo-baseline-data:/data/db
    networks:
      - fastgpt-baseline

  redis-baseline:
    image: redis:7-alpine
    container_name: redis-baseline
    ports:
      - "6479:6379"
    volumes:
      - redis-baseline-data:/data
    networks:
      - fastgpt-baseline

volumes:
  mongo-baseline-data:
  redis-baseline-data:

networks:
  fastgpt-baseline:
```

##### 开发环境

```yaml
# docker-compose.dev.yml
version: '3'
services:
  fastgpt-dev:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: fastgpt-dev
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo-dev:27017/fastgpt_dev
      - REDIS_URI=redis://redis-dev:6379
      - NODE_ENV=development
      - PORT=3000
    volumes:
      - ./:/app  # 代码热更新
      - /app/node_modules
    depends_on:
      - mongo-dev
      - redis-dev
    networks:
      - fastgpt-dev

  mongo-dev:
    image: mongo:6.0
    container_name: mongo-dev
    ports:
      - "27017:27017"
    volumes:
      - mongo-dev-data:/data/db
      - ./backup/mongodb:/backup  # 挂载备份目录
    networks:
      - fastgpt-dev

  redis-dev:
    image: redis:7-alpine
    container_name: redis-dev
    ports:
      - "6379:6379"
    volumes:
      - redis-dev-data:/data
      - ./backup/redis:/backup  # 挂载备份目录
    networks:
      - fastgpt-dev

volumes:
  mongo-dev-data:
  redis-dev-data:

networks:
  fastgpt-dev:
```

##### 测试环境

```yaml
# docker-compose.test.yml
version: '3'
services:
  fastgpt-test:
    image: fastgpt:test
    container_name: fastgpt-test
    ports:
      - "3200:3000"
    environment:
      - MONGODB_URI=mongodb://mongo-test:27017/fastgpt_test
      - REDIS_URI=redis://redis-test:6379
      - NODE_ENV=test
    depends_on:
      - mongo-test
      - redis-test
    networks:
      - fastgpt-test

  mongo-test:
    image: mongo:6.0
    container_name: mongo-test
    ports:
      - "27217:27017"
    volumes:
      - mongo-test-data:/data/db
    networks:
      - fastgpt-test

  redis-test:
    image: redis:7-alpine
    container_name: redis-test
    ports:
      - "6479:6379"
    volumes:
      - redis-test-data:/data
    networks:
      - fastgpt-test

volumes:
  mongo-test-data:
  redis-test-data:

networks:
  fastgpt-test:
```

#### 环境管理脚本

```bash
#!/bin/bash
# 文件: scripts/env-manager.sh

# ========================================
# 环境管理脚本
# ========================================

function start_baseline() {
  echo "启动原始环境..."
  docker-compose -f docker-compose.baseline.yml up -d
  echo "✅ 原始环境已启动: http://localhost:3100"
}

function start_dev() {
  echo "启动开发环境..."
  docker-compose -f docker-compose.dev.yml up -d
  echo "✅ 开发环境已启动: http://localhost:3000"
}

function start_test() {
  echo "启动测试环境..."
  docker-compose -f docker-compose.test.yml up -d
  echo "✅ 测试环境已启动: http://localhost:3200"
}

function stop_all() {
  echo "停止所有环境..."
  docker-compose -f docker-compose.baseline.yml down
  docker-compose -f docker-compose.dev.yml down
  docker-compose -f docker-compose.test.yml down
  echo "✅ 所有环境已停止"
}

function backup_dev() {
  echo "备份开发环境数据..."
  ./scripts/backup-mongodb.sh
  ./scripts/backup-redis.sh
  echo "✅ 开发环境备份完成"
}

function restore_dev() {
  if [ -z "$1" ]; then
    echo "用法: ./env-manager.sh restore_dev <备份文件>"
    exit 1
  fi
  echo "恢复开发环境数据..."
  ./scripts/restore-mongodb.sh "$1"
  echo "✅ 开发环境恢复完成"
}

# 主菜单
case "$1" in
  baseline)
    start_baseline
    ;;
  dev)
    start_dev
    ;;
  test)
    start_test
    ;;
  stop)
    stop_all
    ;;
  backup)
    backup_dev
    ;;
  restore)
    restore_dev "$2"
    ;;
  *)
    echo "用法: ./env-manager.sh {baseline|dev|test|stop|backup|restore}"
    exit 1
esac
```

---

## 📋 必备份内容清单

### ✅ 必须备份

- [x] **代码仓库**
  - 所有分支（main, dev, feature/*）
  - 所有标签（里程碑版本）
  - 提交历史

- [x] **数据库**
  - MongoDB 数据
  - Redis 数据
  - 数据库索引配置

- [x] **配置文件（加密）**
  - .env 环境变量
  - 支付密钥（支付宝/微信）
  - OAuth 密钥（GitHub/微信）
  - SSL 证书（如果有）
  - Nginx 配置

- [x] **文档**
  - 开发计划
  - API 文档
  - 数据库 Schema 设计
  - 部署文档

### ⭐ 建议备份

- [ ] **日志文件**
  - 应用日志（最近30天）
  - Nginx 访问日志
  - 错误日志

- [ ] **用户上传文件**
  - 知识库文档
  - 头像图片

### ❌ 无需备份

- node_modules/（依赖包）
- .next/（构建产物）
- dist/（构建产物）
- temp/（临时文件）

---

## 🔄 备份验证流程

### 定期验证（每月一次）

```bash
#!/bin/bash
# 文件: scripts/verify-backup.sh

# ========================================
# 备份验证脚本
# ========================================

echo "开始验证备份..."

# 1. 验证代码仓库
echo "1. 验证代码仓库..."
git fsck --full
if [ $? -eq 0 ]; then
  echo "✅ 代码仓库完整"
else
  echo "❌ 代码仓库损坏"
  exit 1
fi

# 2. 验证 MongoDB 备份
echo "2. 验证 MongoDB 备份..."
LATEST_BACKUP=$(ls -t /backup/mongodb/*.tar.gz | head -1)
echo "最新备份: $LATEST_BACKUP"

# 尝试恢复到临时数据库
mongorestore \
  --host localhost \
  --port 27017 \
  --db fastgpt_verify \
  --drop \
  --gzip \
  --archive="$LATEST_BACKUP"

if [ $? -eq 0 ]; then
  echo "✅ MongoDB 备份可恢复"
  # 删除验证数据库
  mongo fastgpt_verify --eval "db.dropDatabase()"
else
  echo "❌ MongoDB 备份无法恢复"
  exit 1
fi

# 3. 验证 Redis 备份
echo "3. 验证 Redis 备份..."
LATEST_REDIS=$(ls -t /backup/redis/*.rdb.gz | head -1)
echo "最新备份: $LATEST_REDIS"

if [ -f "$LATEST_REDIS" ]; then
  echo "✅ Redis 备份文件存在"
else
  echo "❌ Redis 备份文件不存在"
  exit 1
fi

# 4. 验证配置文件
echo "4. 验证配置文件..."
LATEST_CONFIG=$(ls -t /backup/config/*_config.tar.gz | head -1)
if [ -f "$LATEST_CONFIG" ]; then
  echo "✅ 配置文件备份存在"
else
  echo "❌ 配置文件备份不存在"
  exit 1
fi

echo ""
echo "================================================"
echo "✅ 所有备份验证通过"
echo "================================================"
```

---

## 📊 备份成本估算

### 存储需求

| 内容 | 单次大小 | 保留时间 | 总空间需求 |
|-----|---------|---------|-----------|
| 代码仓库 | 500MB | 永久 | 500MB |
| MongoDB 备份 | 1GB/天 | 7天 | 7GB |
| Redis 备份 | 100MB/天 | 7天 | 700MB |
| 配置文件 | 10MB/月 | 12个月 | 120MB |
| **总计** | - | - | **约 8.5GB** |

### 时间成本

| 任务 | 频率 | 单次时间 | 月度时间 |
|-----|------|---------|---------|
| 初始化 Git 仓库 | 一次性 | 30分钟 | - |
| 配置自动备份 | 一次性 | 1小时 | - |
| 日常 Git 提交 | 每天 | 5分钟 | 2.5小时 |
| 验证备份 | 每月 | 30分钟 | 30分钟 |
| **总计** | - | - | **约 3小时/月** |

---

## 🚀 立即执行（第一天任务）

### 任务清单

```bash
# ========================================
# Day 1 上午：代码备份（2小时）
# ========================================

# 1. Fork 官方仓库到 GitHub/GitLab
#    - 创建私有仓库：FastGPT-Private
#    - 或者直接克隆

# 2. 克隆到本地
git clone https://github.com/labring/FastGPT.git
cd FastGPT

# 3. 添加私有仓库
git remote add private <your-private-repo-url>
git push private main --tags

# 4. 创建 dev 分支
git checkout -b dev
git push private dev

# 5. 打基准标签
git tag -a v0.0-baseline -m "纯净的开源版基准 - 2026-01-09"
git push private --tags

# ========================================
# Day 1 下午：数据备份（2小时）
# ========================================

# 1. 创建备份目录
mkdir -p /backup/{mongodb,redis,config}

# 2. 复制备份脚本
cp docs/scripts/backup-*.sh scripts/
chmod +x scripts/backup-*.sh

# 3. 启动原始环境
docker-compose -f docker-compose.baseline.yml up -d

# 4. 等待初始化完成（5分钟）
sleep 300

# 5. 立即备份原始数据
./scripts/backup-mongodb.sh
./scripts/backup-redis.sh

# 6. 停止原始环境
docker-compose -f docker-compose.baseline.yml down

# ========================================
# Day 1 晚上：配置自动备份（1小时）
# ========================================

# 1. 配置 crontab
crontab -e

# 添加：
# 0 2 * * * /path/to/scripts/backup-mongodb.sh >> /var/log/mongodb-backup.log 2>&1
# 0 3 * * * /path/to/scripts/backup-redis.sh >> /var/log/redis-backup.log 2>&1

# 2. 测试备份脚本
./scripts/backup-mongodb.sh
./scripts/backup-redis.sh

# 3. 验证备份文件
ls -lh /backup/mongodb/
ls -lh /backup/redis/
```

---

## 📚 补充说明

### 常见问题

**Q1: 为什么不能直接在 main 分支开发？**
- main 分支应保持与官方同步，作为纯净备份
- 如果直接开发，后续无法合并官方更新
- 分支隔离可以随时回滚到纯净状态

**Q2: 备份多久一次合适？**
- 代码：每次提交自动备份（推送到私有仓库）
- 数据库：开发环境每天备份，生产环境实时备份
- 配置：每次修改后立即备份

**Q3: 备份文件存储在哪里？**
- 代码：GitHub/GitLab 私有仓库（免费）
- 数据库：本地 + 云存储（OSS/COS）双备份
- 配置：加密后上传云存储

**Q4: 如何测试备份是否可用？**
- 每月执行一次恢复演练
- 使用临时数据库/环境进行恢复测试
- 记录恢复时间（RTO）和数据完整性

### 风险提示

⚠️ **高风险操作**（必须先备份）：
- 数据库表结构变更
- 删除知识库/用户数据
- 支付相关代码修改
- 权限系统变更

⚠️ **禁止操作**：
- 直接修改生产环境数据库
- 删除 main 分支
- 删除所有备份
- 在原始环境中开发

---

## ✅ 验收标准

### 代码层验收

- [ ] 私有 Git 仓库已创建并推送
- [ ] main 分支保持纯净（仅同步官方）
- [ ] dev 分支已创建并设为默认
- [ ] 基准标签已打（v0.0-baseline）
- [ ] 可以正常 push/pull

### 数据层验收

- [ ] MongoDB 备份脚本可执行
- [ ] Redis 备份脚本可执行
- [ ] 自动备份已配置（crontab）
- [ ] 备份文件可正常恢复
- [ ] 原始环境数据已备份

### 环境层验收

- [ ] 原始环境可独立启动
- [ ] 开发环境可独立启动
- [ ] 测试环境可独立启动
- [ ] 环境之间数据隔离
- [ ] 端口无冲突

---

**文档版本：** v1.0  
**创建时间：** 2026-01-09  
**适用场景：** FastGPT 二次开发  
**预计执行时间：** 1天

**核心理念：** 备份先行，风险可控，开发无忧 🛡️
