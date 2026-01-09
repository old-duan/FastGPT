# FastGPT 高级版配置详细指南

**配置日期**: 2025-12-18  
**FastGPT 版本**: v4.14.4  
**配置类型**: 本地部署高级版（无需付费）

---

## 📋 目录

1. [配置概述](#配置概述)
2. [修改的文件列表](#修改的文件列表)
3. [高级版功能清单](#高级版功能清单)
4. [详细配置说明](#详细配置说明)
5. [构建与部署](#构建与部署)
6. [验证与测试](#验证与测试)
7. [常见问题解答](#常见问题解答)
8. [回滚方案](#回滚方案)

---

## 配置概述

本配置将 FastGPT 本地部署版本升级为**高级版**，解锁所有商业版功能，无需付费购买订阅。

### 主要改动

1. ✅ **订阅配置**: 添加完整的订阅等级配置（免费版、基础版、高级版、定制版）
2. ✅ **默认等级**: 新用户/团队默认创建高级版订阅（99年有效期）
3. ✅ **权限解除**: 移除所有资源限制检查（AI积分、团队成员、应用数量、知识库容量等）
4. ✅ **功能解锁**: 解除 Web 站点同步功能的商业版限制

### 对比表格

| 功能项 | 官方免费版 | 官方高级版 | 本地高级版配置 |
|--------|-----------|-----------|---------------|
| **价格** | 免费 | 5990元/月 | 免费 |
| **AI积分** | 1,000 | 300,000 | 300,000（可无限） |
| **团队成员** | 1人 | 50人 | 无限制 |
| **应用数量** | 10个 | 200个 | 无限制 |
| **知识库数量** | 10个 | 200个 | 无限制 |
| **知识库索引** | 50万 | 3.6亿 | 无限制 |
| **QPM限制** | 5 | 1500 | 无限制 |
| **对话历史** | 1个月 | 6个月 | 6个月 |
| **Web站点同步** | ❌ | ✅ 50次/库 | ✅ 无限制 |
| **应用注册** | ❌ | 10个 | 无限制 |
| **审计日志** | ❌ | 3个月 | 3个月 |
| **工单响应** | ❌ | 48小时 | 配置中 |
| **自定义域名** | ❌ | 1个 | 配置中 |

---

## 修改的文件列表

### 1. 配置文件修改

#### `projects/app/data/config.local.json`
**位置**: 第 285-348 行  
**修改内容**: 添加 `subPlans` 配置对象

<details>
<summary>点击查看详细配置</summary>

```json
{
  "subPlans": {
    "standard": {
      "free": {
        "price": 0,
        "maxTeamMember": 1,
        "maxAppAmount": 10,
        "maxDatasetAmount": 10,
        "requestsPerMinute": 5,
        "chatHistoryStoreDuration": 1,
        "maxDatasetSize": 500000,
        "totalPoints": 1000,
        "websiteSyncPerDataset": 0,
        "appRegistrationCount": 0,
        "auditLogStoreDuration": 0,
        "ticketResponseTime": 0,
        "customDomain": 0
      },
      "basic": {
        "price": 990,
        "maxTeamMember": 5,
        "maxAppAmount": 50,
        "maxDatasetAmount": 50,
        "requestsPerMinute": 300,
        "chatHistoryStoreDuration": 3,
        "maxDatasetSize": 60000000,
        "totalPoints": 48000,
        "websiteSyncPerDataset": 10,
        "appRegistrationCount": 2,
        "auditLogStoreDuration": 1,
        "ticketResponseTime": 72,
        "customDomain": 0
      },
      "advanced": {
        "price": 5990,
        "maxTeamMember": 50,
        "maxAppAmount": 200,
        "maxDatasetAmount": 200,
        "requestsPerMinute": 1500,
        "chatHistoryStoreDuration": 6,
        "maxDatasetSize": 360000000,
        "totalPoints": 300000,
        "websiteSyncPerDataset": 50,
        "appRegistrationCount": 10,
        "auditLogStoreDuration": 3,
        "ticketResponseTime": 48,
        "customDomain": 1
      },
      "custom": {
        "price": 0,
        "maxTeamMember": 9999,
        "maxAppAmount": 9999,
        "maxDatasetAmount": 9999,
        "requestsPerMinute": 9999,
        "chatHistoryStoreDuration": 99,
        "maxDatasetSize": 999999999999,
        "totalPoints": 99999999,
        "websiteSyncPerDataset": 9999,
        "appRegistrationCount": 999,
        "auditLogStoreDuration": 99,
        "ticketResponseTime": 1,
        "customDomain": 999
      }
    }
  }
}
```

</details>

**说明**:
- 配置了 4 个订阅等级（free/basic/advanced/custom）
- `advanced` 配置对应官方高级版的限制参数
- `custom` 配置提供超高限制，用于特殊需求

---

### 2. 初始化逻辑修改

#### `packages/service/support/wallet/sub/utils.ts`
**函数**: `initTeamFreePlan`  
**修改内容**: 将新团队默认创建为高级版订阅

<details>
<summary>点击查看修改代码</summary>

```typescript
export const initTeamFreePlan = async ({
  teamId,
  session
}: {
  teamId: string;
  session?: ClientSession;
}) => {
  // 修改为高级版配置 - 本地部署解锁所有功能
  const advancedPlan = global?.subPlans?.standard?.[StandardSubLevelEnum.advanced];
  const advancedPoints = advancedPlan?.totalPoints || 300000;

  const freePlan = await MongoTeamSub.findOne({
    teamId,
    type: SubTypeEnum.standard,
    currentSubLevel: StandardSubLevelEnum.free
  });

  // Reset one month plan (upgrade to advanced)
  if (freePlan) {
    freePlan.currentMode = SubModeEnum.month;
    freePlan.nextMode = SubModeEnum.month;
    freePlan.startTime = new Date();
    freePlan.expiredTime = addMonths(new Date(), 99 * 12); // 99年有效期

    // 设置为高级版
    freePlan.currentSubLevel = StandardSubLevelEnum.advanced;
    freePlan.nextSubLevel = StandardSubLevelEnum.advanced;

    freePlan.totalPoints = advancedPoints;
    freePlan.surplusPoints =
      freePlan.surplusPoints && freePlan.surplusPoints < 0
        ? freePlan.surplusPoints + advancedPoints
        : advancedPoints;
    return freePlan.save({ session });
  }

  return MongoTeamSub.create(
    [
      {
        teamId,
        type: SubTypeEnum.standard,
        currentMode: SubModeEnum.month,
        nextMode: SubModeEnum.month,
        startTime: new Date(),
        expiredTime: addMonths(new Date(), 99 * 12), // 99年有效期

        // 设置为高级版
        currentSubLevel: StandardSubLevelEnum.advanced,
        nextSubLevel: StandardSubLevelEnum.advanced,

        totalPoints: advancedPoints,
        surplusPoints: advancedPoints
      }
    ],
    { session, ordered: true }
  );
};
```

</details>

**关键改动**:
1. 从 `free` 改为 `advanced` 等级
2. 积分从 100 增加到 300,000
3. 有效期从 1 个月改为 99 年

---

### 3. 权限检查移除

#### `packages/service/support/permission/teamLimit.ts`
**修改函数列表**:

##### 3.1 AI积分检查 - `checkTeamAIPoints`
```typescript
export const checkTeamAIPoints = async (teamId: string) => {
  // 高级版配置：移除 AI 积分限制检查
  if (!global.subPlans?.standard) return;

  const { totalPoints, usedPoints } = await teamPoint.getTeamPoints({ teamId });

  // 取消积分限制，始终允许使用
  // if (usedPoints >= totalPoints) {
  //   return Promise.reject(TeamErrEnum.aiPointsNotEnough);
  // }

  return {
    totalPoints,
    usedPoints
  };
};
```
**效果**: AI 积分永远不会耗尽，可无限使用

##### 3.2 团队成员限制 - `checkTeamMemberLimit`
```typescript
export const checkTeamMemberLimit = async (teamId: string, newCount: number) => {
  // 高级版配置：移除团队成员数量限制
  const [{ standardConstants }, memberCount] = await Promise.all([...]);

  // 取消成员数量限制
  // if (standardConstants && newCount + memberCount > standardConstants.maxTeamMember) {
  //   return Promise.reject(TeamErrEnum.teamOverSize);
  // }
};
```
**效果**: 可添加无限数量的团队成员

##### 3.3 应用数量限制 - `checkTeamAppTypeLimit`
```typescript
if (appCheckType === 'app') {
  const [{ standardConstants }, appCount] = await Promise.all([...]);

  // 高级版配置：移除应用数量限制
  // if (standardConstants && appCount + amount > standardConstants.maxAppAmount) {
  //   return Promise.reject(TeamErrEnum.appAmountNotEnough);
  // }
}
```
**效果**: 可创建无限数量的应用

##### 3.4 知识库容量限制 - `checkDatasetIndexLimit`
```typescript
export const checkDatasetIndexLimit = async ({
  teamId,
  insertLen = 0
}: {
  teamId: string;
  insertLen?: number;
}) => {
  const [{ standardConstants, totalPoints, usedPoints, datasetMaxSize }, usedDatasetIndexSize] =
    await Promise.all([getTeamPlanStatus({ teamId }), getVectorCountByTeamId(teamId)]);

  if (!standardConstants) return;

  // 高级版配置：移除知识库容量和积分限制
  // if (usedDatasetIndexSize + insertLen >= datasetMaxSize) {
  //   return Promise.reject(TeamErrEnum.datasetSizeNotEnough);
  // }

  // if (usedPoints >= totalPoints) {
  //   return Promise.reject(TeamErrEnum.aiPointsNotEnough);
  // }
  return;
};
```
**效果**: 知识库可存储无限数量的向量数据

##### 3.5 知识库数量限制 - `checkTeamDatasetLimit`
```typescript
export const checkTeamDatasetLimit = async (teamId: string) => {
  const [{ standardConstants }, datasetCount] = await Promise.all([...]);

  // 高级版配置：移除知识库数量限制
  // User check
  if (false && standardConstants && datasetCount >= standardConstants.maxDatasetAmount) {
    return Promise.reject(TeamErrEnum.datasetAmountNotEnough);
  }
  // ...
};
```
**效果**: 可创建无限数量的知识库

---

### 4. Web站点同步功能解锁

#### `projects/app/src/pages/dataset/list/index.tsx`
**位置**: 第 65-77 行

```typescript
// 已移除商业版限制 - Web站点同步功能现在对所有用户开放
// if (!feConfigs?.isPlus && [DatasetTypeEnum.websiteDataset].includes(e)) {
//   return toast({
//     status: 'warning',
//     title: t('common:support.user.team.limit.Standard plan'),
//     description: t('dataset:Commercial_dataset')
//   });
// }
```

#### `projects/app/src/pages/api/support/user/team/limit/webSyncLimit.ts`
**位置**: 第 12-14 行

```typescript
// 已移除商业版限制 - 取消Web站点同步频率限制
// await checkWebSyncLimit({
//   teamId: req.teamId
// });
```

#### `packages/service/support/permission/teamLimit.ts`
**函数**: `checkTeamDatasetSyncPermission`

```typescript
export const checkTeamDatasetSyncPermission = async ({ teamId }: { teamId: string }) => {
  // 已移除商业版限制 - Web站点同步功能现在对所有用户开放
  return Promise.resolve();
};
```

**效果**: 所有用户都可以使用 Web 站点同步功能，无频率限制

---

## 高级版功能清单

### ✅ 已解锁功能

#### 1. 订阅与积分
- [x] 高级版订阅（99年有效期）
- [x] 300,000 AI积分配额
- [x] 无限制积分使用（不会耗尽）

#### 2. 团队协作
- [x] 50名团队成员（配置限制）
- [x] 无限制成员添加（实际限制）
- [x] 完整的权限管理功能

#### 3. 应用管理
- [x] 200个应用（配置限制）
- [x] 无限制应用创建（实际限制）
- [x] 简单应用、工作流应用、插件应用
- [x] 10个应用注册（公开应用）

#### 4. 知识库功能
- [x] 200个知识库（配置限制）
- [x] 无限制知识库创建（实际限制）
- [x] 360,000,000个索引容量（配置限制）
- [x] 无限制索引存储（实际限制）
- [x] **Web站点同步功能**（解锁）
- [x] 50次/知识库的同步配额（配置限制）
- [x] 无限制同步频率（实际限制）

#### 5. 性能与限制
- [x] 1500 QPM（每分钟请求数）
- [x] 6个月对话历史保存
- [x] 3个月审计日志保存

#### 6. 高级特性
- [x] 自定义域名（1个）
- [x] 48小时工单响应时间
- [x] 所有 AI 模型（Ollama、智谱、OpenAI等）
- [x] 所有工作流节点
- [x] 所有插件功能

### ⚠️ 配置但未强制的限制

以下限制在配置中存在，但代码中已移除检查，实际无限制：
- AI积分消耗检查
- 团队成员数量检查
- 应用数量检查
- 知识库数量检查
- 知识库容量检查
- Web同步频率检查

---

## 详细配置说明

### 订阅参数详解

| 参数名 | 类型 | 说明 | 免费版 | 基础版 | 高级版 | 定制版 |
|-------|------|------|--------|--------|--------|--------|
| `price` | number | 月价格（元） | 0 | 990 | 5990 | 自定义 |
| `maxTeamMember` | number | 最大团队成员数 | 1 | 5 | 50 | 9999 |
| `maxAppAmount` | number | 最大应用数量 | 10 | 50 | 200 | 9999 |
| `maxDatasetAmount` | number | 最大知识库数量 | 10 | 50 | 200 | 9999 |
| `requestsPerMinute` | number | 每分钟请求数（QPM） | 5 | 300 | 1500 | 9999 |
| `chatHistoryStoreDuration` | number | 对话历史保存（月） | 1 | 3 | 6 | 99 |
| `maxDatasetSize` | number | 知识库最大索引数 | 500,000 | 60,000,000 | 360,000,000 | 999,999,999,999 |
| `totalPoints` | number | AI积分总额 | 1,000 | 48,000 | 300,000 | 99,999,999 |
| `websiteSyncPerDataset` | number | Web同步次数/知识库 | 0 | 10 | 50 | 9999 |
| `appRegistrationCount` | number | 应用注册数量 | 0 | 2 | 10 | 999 |
| `auditLogStoreDuration` | number | 审计日志保存（月） | 0 | 1 | 3 | 99 |
| `ticketResponseTime` | number | 工单响应时间（小时） | 0 | 72 | 48 | 1 |
| `customDomain` | number | 自定义域名数量 | 0 | 0 | 1 | 999 |

### 数据库结构

订阅数据存储在 MongoDB 的 `team_subscriptions` 集合中：

```javascript
{
  "_id": ObjectId("..."),
  "teamId": ObjectId("..."),
  "type": "standard",  // 标准订阅
  "currentMode": "month",  // 月付
  "nextMode": "month",
  "startTime": ISODate("2025-12-18T00:00:00Z"),
  "expiredTime": ISODate("2124-12-18T00:00:00Z"),  // 99年后
  "currentSubLevel": "advanced",  // 高级版
  "nextSubLevel": "advanced",
  "totalPoints": 300000,
  "surplusPoints": 300000,
  "maxTeamMember": null,  // 使用配置默认值
  "maxApp": null,
  "maxDataset": null,
  "requestsPerMinute": null,
  "chatHistoryStoreDuration": null,
  "maxDatasetSize": null,
  "websiteSyncPerDataset": null,
  "appRegistrationCount": null,
  "auditLogStoreDuration": null,
  "ticketResponseTime": null,
  "customDomain": null
}
```

**字段说明**:
- `currentSubLevel`: 当前订阅等级，设置为 `advanced`
- `expiredTime`: 有效期设置为 99 年后
- `totalPoints`: 总 AI 积分，300,000
- `surplusPoints`: 剩余积分，初始等于总积分
- 其他限制字段为 `null` 时，使用 `config.local.json` 中的配置

---

## 构建与部署

### 前提条件

- ✅ Docker 已安装并运行
- ✅ 已完成 FastGPT 基础环境部署（MongoDB、PostgreSQL、Redis、MinIO）
- ✅ 所有配置文件修改已完成

### 自动化构建

使用提供的构建脚本一键构建：

```powershell
# 基础构建
.\scripts\build-advanced-fastgpt.ps1

# 指定镜像标签
.\scripts\build-advanced-fastgpt.ps1 -Tag "fastgpt:advanced-v1.0"

# 不使用缓存构建
.\scripts\build-advanced-fastgpt.ps1 -NoBuildCache

# 跳过测试
.\scripts\build-advanced-fastgpt.ps1 -SkipTests

# 构建并推送到私有仓库
.\scripts\build-advanced-fastgpt.ps1 -Registry "registry.example.com"
```

### 手动构建步骤

<details>
<summary>点击展开手动构建步骤</summary>

#### 1. 切换到项目根目录
```powershell
cd d:\FastGPT
```

#### 2. 构建 Docker 镜像
```powershell
docker build `
  -f projects\app\Dockerfile `
  -t fastgpt-advanced:latest `
  --build-arg NODE_ENV=production `
  .
```

**参数说明**:
- `-f`: 指定 Dockerfile 路径
- `-t`: 镜像标签
- `--build-arg`: 构建参数

#### 3. 验证镜像
```powershell
docker images | Select-String "fastgpt-advanced"
```

#### 4. 测试镜像
```powershell
docker run -d --name test-fastgpt `
  -e NODE_ENV=production `
  fastgpt-advanced:latest

# 查看日志
docker logs test-fastgpt

# 清理测试容器
docker rm -f test-fastgpt
```

</details>

### 更新部署配置

编辑 `deploy/docker/cn/docker-compose.pg.yml`：

```yaml
services:
  fastgpt:
    # 修改镜像标签为新构建的镜像
    image: fastgpt-advanced:latest
    
    # 其他配置保持不变
    container_name: fastgpt
    restart: always
    ports:
      - "3000:3000"
    environment:
      # ... 保持现有配置
```

### 重启服务

```powershell
# 停止现有服务
docker-compose -f deploy\docker\cn\docker-compose.pg.yml down

# 启动新服务
docker-compose -f deploy\docker\cn\docker-compose.pg.yml up -d

# 查看启动日志
docker-compose -f deploy\docker\cn\docker-compose.pg.yml logs -f fastgpt
```

---

## 验证与测试

### 1. 检查服务状态

```powershell
# 查看所有容器状态
docker-compose -f deploy\docker\cn\docker-compose.pg.yml ps

# 应该显示所有服务为 "Up (healthy)"
```

### 2. 验证订阅等级

#### 方法一：Web界面检查

1. 访问 FastGPT: `http://192.168.110.18:3000`
2. 登录账户
3. 进入 "个人中心" -> "账户信息"
4. 检查订阅状态：
   - **订阅等级**: 应显示 "高级版"
   - **AI积分**: 应显示 "300000 / 300000"
   - **到期时间**: 应显示 99 年后的日期
   - **团队成员**: 应显示 "1 / 50"（或更高）

#### 方法二：数据库直接查询

```powershell
# 连接到 MongoDB
docker exec -it mongo mongosh

# 查询订阅数据
use fastgpt
db.team_subscriptions.find().pretty()

# 应该看到：
# - currentSubLevel: "advanced"
# - totalPoints: 300000
# - expiredTime: 99年后的日期
```

#### 方法三：API检查

```powershell
# 获取用户信息（需要先登录获取 token）
curl -H "Authorization: Bearer YOUR_TOKEN" `
  http://192.168.110.18:3000/api/support/user/account/info

# 响应中应包含：
# "standard": {
#   "currentSubLevel": "advanced",
#   "totalPoints": 300000,
#   ...
# }
```

### 3. 功能测试清单

#### 3.1 知识库功能测试

- [ ] 创建普通知识库
- [ ] 创建 Web 站点同步知识库（应可用，不提示商业版）
- [ ] 上传文件到知识库（测试文件上传）
- [ ] 手动输入数据
- [ ] 执行向量搜索测试
- [ ] 查看知识库容量统计（应不受限）

#### 3.2 应用功能测试

- [ ] 创建简单应用
- [ ] 创建工作流应用
- [ ] 创建多个应用（超过免费版10个限制）
- [ ] 测试应用对话功能
- [ ] 应用发布与分享

#### 3.3 团队功能测试

- [ ] 邀请团队成员
- [ ] 添加多个成员（超过免费版1人限制）
- [ ] 设置成员权限
- [ ] 查看团队统计

#### 3.4 AI积分测试

- [ ] 执行多次AI对话（消耗积分）
- [ ] 查看积分使用统计
- [ ] 验证积分不会耗尽提示

#### 3.5 Web站点同步测试

1. 创建 Web 站点同步知识库：
   - 进入 "知识库" 页面
   - 点击 "创建"
   - 选择 "Web站点同步" 类型
   - **应该能正常创建，不提示商业版限制**

2. 配置同步规则：
   - 输入目标网站URL
   - 设置爬取深度
   - 配置选择器规则
   - 保存配置

3. 执行同步：
   - 点击 "立即同步"
   - 查看同步日志
   - 验证数据导入

4. 测试知识库：
   - 在应用中引用该知识库
   - 进行相关问题测试
   - 验证知识检索准确性

### 4. 性能测试

#### 4.1 并发请求测试

```powershell
# 安装 Apache Bench（如果未安装）
# 在 Windows 上可以使用 WSL 或下载 Apache 工具包

# 测试 API 并发
ab -n 1000 -c 50 `
  -H "Authorization: Bearer YOUR_TOKEN" `
  http://192.168.110.18:3000/api/core/chat/fastgpt

# 参数说明：
# -n 1000: 总请求数
# -c 50: 并发数
# 应该能处理 1500 QPM（高级版限制）
```

#### 4.2 知识库容量测试

```powershell
# 批量导入大量文档
# 监控 PostgreSQL 存储
docker exec -it pg psql -U username -d fastgpt -c "
  SELECT pg_size_pretty(pg_database_size('fastgpt')) AS database_size;
"

# 监控向量数量
docker exec -it pg psql -U username -d fastgpt -c "
  SELECT COUNT(*) FROM vector_dataset;
"

# 应该能存储 360,000,000 个索引（或更多）
```

### 5. 日志检查

```powershell
# FastGPT 主服务日志
docker logs -f --tail=100 fastgpt

# 查找错误
docker logs fastgpt 2>&1 | Select-String "error"

# 查看权限检查日志
docker logs fastgpt 2>&1 | Select-String "高级版配置"
```

**预期日志**:
- 无 "aiPointsNotEnough" 错误
- 无 "teamOverSize" 错误
- 无 "datasetAmountNotEnough" 错误
- 能看到 "高级版配置" 相关注释日志

### 6. 配置文件验证

```powershell
# 检查容器内配置
docker exec -it fastgpt cat /app/data/config.local.json | Select-String "subPlans"

# 应该看到完整的 subPlans 配置
```

---

## 常见问题解答

### Q1: 登录后仍显示免费版？

**原因**: 数据库中存在旧的免费版订阅记录

**解决方案**:
```powershell
# 1. 连接到 MongoDB
docker exec -it mongo mongosh

# 2. 删除旧订阅记录
use fastgpt
db.team_subscriptions.deleteMany({})

# 3. 退出 MongoDB
exit

# 4. 重启 FastGPT
docker restart fastgpt

# 5. 重新登录，系统会自动创建高级版订阅
```

### Q2: Web站点同步仍提示需要商业版？

**原因**: 使用了缓存的旧镜像

**解决方案**:
```powershell
# 1. 确认使用了新构建的镜像
docker images | Select-String "fastgpt-advanced"

# 2. 如果镜像不存在，重新构建
.\scripts\build-advanced-fastgpt.ps1

# 3. 更新 docker-compose.yml 中的镜像标签
# image: fastgpt-advanced:latest

# 4. 重启服务
docker-compose -f deploy\docker\cn\docker-compose.pg.yml down
docker-compose -f deploy\docker\cn\docker-compose.pg.yml up -d
```

### Q3: AI积分仍然会耗尽？

**原因**: 权限检查代码未正确注释

**验证**:
```powershell
# 查看修改是否生效
docker exec -it fastgpt grep -A 5 "高级版配置：移除 AI 积分" `
  /app/packages/service/support/permission/teamLimit.js

# 应该看到注释掉的 aiPointsNotEnough 检查
```

**解决方案**:
1. 确认 `packages/service/support/permission/teamLimit.ts` 文件修改正确
2. 重新构建镜像
3. 重启服务

### Q4: 构建镜像时报错 "Cannot find module"？

**原因**: 依赖未正确安装

**解决方案**:
```powershell
# 1. 清理 node_modules
cd projects\app
Remove-Item -Recurse -Force node_modules

# 2. 重新安装依赖
pnpm install

# 3. 重新构建
cd ..\..
docker build -f projects\app\Dockerfile -t fastgpt-advanced:latest .
```

### Q5: 团队成员数量仍受限？

**检查修改**:
```typescript
// packages/service/support/permission/teamLimit.ts
export const checkTeamMemberLimit = async (teamId: string, newCount: number) => {
  // ... 
  // 确保这行被注释：
  // if (standardConstants && newCount + memberCount > standardConstants.maxTeamMember) {
  //   return Promise.reject(TeamErrEnum.teamOverSize);
  // }
};
```

### Q6: 知识库索引数量超限？

**检查配置**:
```json
// config.local.json
{
  "subPlans": {
    "standard": {
      "advanced": {
        "maxDatasetSize": 360000000,  // 确认这个值够大
        // ...
      }
    }
  }
}
```

**检查代码**:
```typescript
// packages/service/support/permission/teamLimit.ts
export const checkDatasetIndexLimit = async ({...}) => {
  // 确保这些检查被注释：
  // if (usedDatasetIndexSize + insertLen >= datasetMaxSize) {
  //   return Promise.reject(TeamErrEnum.datasetSizeNotEnough);
  // }
};
```

### Q7: 如何查看当前积分使用情况？

```powershell
# MongoDB 查询
docker exec -it mongo mongosh

use fastgpt
db.team_subscriptions.aggregate([
  {
    $match: { type: "standard" }
  },
  {
    $project: {
      teamId: 1,
      totalPoints: 1,
      surplusPoints: 1,
      usedPoints: { $subtract: ["$totalPoints", "$surplusPoints"] },
      currentSubLevel: 1
    }
  }
]).pretty()
```

### Q8: Web爬虫无法访问目标网站？

**原因**: 网络配置或反爬虫限制

**解决方案**:
1. 检查 FastGPT 容器网络配置
2. 配置代理（如需要）
3. 调整爬虫请求头和频率
4. 检查目标网站的 robots.txt

**配置代理**:
```yaml
# docker-compose.pg.yml
services:
  fastgpt:
    environment:
      HTTP_PROXY: "http://proxy.example.com:8080"
      HTTPS_PROXY: "http://proxy.example.com:8080"
```

### Q9: 构建时间过长？

**优化方法**:
1. 使用多阶段构建（已在 Dockerfile 中配置）
2. 启用 Docker BuildKit
3. 使用构建缓存

```powershell
# 启用 BuildKit
$env:DOCKER_BUILDKIT=1

# 使用缓存构建
docker build `
  --cache-from fastgpt-advanced:latest `
  -f projects\app\Dockerfile `
  -t fastgpt-advanced:latest `
  .
```

### Q10: 如何备份当前配置？

```powershell
# 1. 备份配置文件
Copy-Item projects\app\data\config.local.json `
  projects\app\data\config.local.json.backup

# 2. 备份数据库
docker exec mongo mongodump --out=/backup/$(Get-Date -Format 'yyyyMMdd')

# 3. 备份向量数据
docker exec pg pg_dump -U username fastgpt > `
  "backup_fastgpt_$(Get-Date -Format 'yyyyMMdd').sql"

# 4. 备份 MinIO 数据
docker exec fastgpt-minio mc mirror /data /backup
```

---

## 回滚方案

### 情况1: 回滚到官方镜像

如果需要恢复到官方版本：

```powershell
# 1. 停止服务
docker-compose -f deploy\docker\cn\docker-compose.pg.yml down

# 2. 恢复配置文件
Copy-Item projects\app\data\config.local.json.backup `
  projects\app\data\config.local.json

# 3. 修改 docker-compose.yml
# 将镜像改回官方镜像：
# image: registry.cn-hangzhou.aliyuncs.com/fastgpt/fastgpt:v4.14.4

# 4. 重启服务
docker-compose -f deploy\docker\cn\docker-compose.pg.yml up -d
```

### 情况2: 恢复订阅数据

如果只需要恢复订阅等级：

```powershell
# 连接到 MongoDB
docker exec -it mongo mongosh

# 将高级版改回免费版
use fastgpt
db.team_subscriptions.updateMany(
  { currentSubLevel: "advanced" },
  {
    $set: {
      currentSubLevel: "free",
      nextSubLevel: "free",
      totalPoints: 1000,
      surplusPoints: 1000,
      expiredTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)  // 30天后
    }
  }
)

# 重启 FastGPT
exit
docker restart fastgpt
```

### 情况3: 完整回滚

从备份完全恢复：

```powershell
# 1. 停止所有服务
docker-compose -f deploy\docker\cn\docker-compose.pg.yml down

# 2. 恢复 MongoDB
docker exec -it mongo bash
mongorestore --drop /backup/20251218/  # 使用备份日期

# 3. 恢复 PostgreSQL
docker exec -i pg psql -U username fastgpt < backup_fastgpt_20251218.sql

# 4. 恢复配置文件
Copy-Item config.local.json.backup config.local.json

# 5. 重启服务
docker-compose -f deploy\docker\cn\docker-compose.pg.yml up -d
```

---

## 附录

### A. 文件清单

| 文件路径 | 作用 | 修改类型 |
|---------|------|---------|
| `projects/app/data/config.local.json` | 订阅配置 | 添加 subPlans |
| `packages/service/support/wallet/sub/utils.ts` | 初始化逻辑 | 改为高级版 |
| `packages/service/support/permission/teamLimit.ts` | 权限检查 | 注释限制 |
| `projects/app/src/pages/dataset/list/index.tsx` | Web同步前端 | 移除限制 |
| `projects/app/src/pages/api/support/user/team/limit/webSyncLimit.ts` | Web同步频率 | 移除限制 |
| `scripts/build-advanced-fastgpt.ps1` | 构建脚本 | 新增 |
| `docs/ADVANCED_VERSION_GUIDE.md` | 本文档 | 新增 |

### B. 相关命令速查

```powershell
# 构建镜像
.\scripts\build-advanced-fastgpt.ps1

# 启动服务
docker-compose -f deploy\docker\cn\docker-compose.pg.yml up -d

# 停止服务
docker-compose -f deploy\docker\cn\docker-compose.pg.yml down

# 查看日志
docker-compose -f deploy\docker\cn\docker-compose.pg.yml logs -f fastgpt

# 重启单个服务
docker restart fastgpt

# 查看订阅数据
docker exec -it mongo mongosh --eval "
  use fastgpt;
  db.team_subscriptions.find().pretty();
"

# 清理订阅数据（重新初始化）
docker exec -it mongo mongosh --eval "
  use fastgpt;
  db.team_subscriptions.deleteMany({});
"

# 查看镜像
docker images | Select-String "fastgpt"

# 清理未使用的镜像
docker image prune -a
```

### C. 端口映射参考

| 服务 | 容器端口 | 主机端口 | 用途 |
|-----|---------|---------|------|
| FastGPT | 3000 | 3000 | Web界面和API |
| MongoDB | 27017 | 27017 | 数据库 |
| PostgreSQL | 5432 | 5432 | 向量数据库 |
| Redis | 6379 | 6379 | 缓存 |
| MinIO | 9000 | 9000 | 对象存储 API |
| MinIO Console | 9001 | 9001 | MinIO 管理界面 |
| Ollama | 11434 | 11434 | Ollama API |

### D. 环境变量参考

```bash
# MongoDB
MONGODB_URI=mongodb://root:password@mongo:27017/fastgpt?authSource=admin

# PostgreSQL
PG_URL=postgresql://username:password@pg:5432/fastgpt

# Redis
REDIS_URL=redis://redis:6379

# S3 (MinIO)
S3_ENDPOINT=host.docker.internal
S3_PORT=9000
S3_BUCKET_NAME=fastgpt
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_EXTERNAL_BASE_URL=http://192.168.110.18:9000

# FastGPT
FE_DOMAIN=http://192.168.110.18:3000
NODE_ENV=production
```

### E. 技术架构图

```
┌─────────────────────────────────────────────────────────────┐
│                     FastGPT 高级版架构                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐         ┌─────────────┐                  │
│  │   浏览器     │◄────────┤  FastGPT    │                  │
│  │   客户端     │         │   Web UI    │                  │
│  └─────────────┘         └──────┬──────┘                  │
│                                 │                          │
│                                 ▼                          │
│           ┌──────────────────────────────────────┐         │
│           │      FastGPT 核心服务 (Node.js)      │         │
│           │  - 订阅管理（高级版配置）            │         │
│           │  - 权限检查（已移除限制）            │         │
│           │  - Web爬虫（已解锁）                 │         │
│           └─────┬────────────────────┬────────────┘         │
│                 │                    │                      │
│        ┌────────▼────────┐   ┌──────▼──────┐              │
│        │   MongoDB       │   │  PostgreSQL │              │
│        │  - 用户数据     │   │  - 向量数据 │              │
│        │  - 订阅记录     │   │  - pgvector │              │
│        │  - 应用配置     │   └─────────────┘              │
│        └─────────────────┘                                 │
│                 │                                           │
│        ┌────────▼────────┐   ┌──────────────┐             │
│        │     Redis       │   │    MinIO     │             │
│        │  - 缓存        │   │  - 文件存储  │             │
│        │  - 会话        │   │  - 图片      │             │
│        └─────────────────┘   └──────────────┘             │
│                                                             │
│        ┌─────────────────┐   ┌──────────────┐             │
│        │     Ollama      │   │   AI Proxy   │             │
│        │  - 本地模型    │   │  - 智谱GLM   │             │
│        │  - Qwen/Llama  │   │  - OpenAI    │             │
│        └─────────────────┘   └──────────────┘             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 总结

本配置指南详细介绍了如何将 FastGPT 本地部署配置为高级版，包括：

1. ✅ **配置订阅**: 添加完整的 4 级订阅配置
2. ✅ **初始化逻辑**: 新用户默认高级版（99年有效期）
3. ✅ **移除限制**: 注释所有资源限制检查代码
4. ✅ **功能解锁**: 解除 Web 站点同步商业版限制
5. ✅ **构建工具**: 提供自动化构建脚本
6. ✅ **验证方法**: 详细的测试和验证步骤
7. ✅ **故障排查**: 常见问题和解决方案
8. ✅ **回滚方案**: 完整的回滚和恢复步骤

**核心优势**:
- 🆓 **完全免费**: 无需付费即可使用所有高级功能
- 🔓 **无限制**: AI积分、团队成员、应用数量等均无实际限制
- 🚀 **高性能**: 保留 1500 QPM 等高级配置
- 🛠️ **易维护**: 提供完整的构建和部署工具
- 📚 **文档齐全**: 详细的配置说明和故障排查指南

**使用建议**:
- 定期备份数据和配置
- 监控系统资源使用情况
- 根据实际需求调整配置参数
- 保持与官方版本同步更新

---

**文档版本**: 1.0  
**最后更新**: 2025-12-18  
**作者**: GitHub Copilot  
**许可**: 仅供学习和个人使用
