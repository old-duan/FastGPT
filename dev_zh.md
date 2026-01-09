## 前提

由于 FastGPT 采用 monorepo 方式进行管理，建议在开发时先安装 `make`。

monorepo 项目名称：

- app：主项目
-......

## 开发

```sh
# 赋予自动脚本代码执行权限（在非 Linux 系统上，可手动执行 postinstall.sh 文件内容）
chmod -R +x ./scripts/
# 在代码根目录下执行，安装根包、项目和包内的所有依赖
pnpm i

# 非 make 命令
cd projects/app
pnpm dev

# make 命令
make dev name=app
```

注意：如果 Node 版本 >= 20，运行 `pnpm i` 时需要给 Node 传递 `--no-node-snapshot` 参数

```sh
NODE_OPTIONS=--no-node-snapshot pnpm i
```

### Jest

https://fael3z0zfze.feishu.cn/docx/ZOI1dABpxoGhS7xzhkXcKPxZnDL

## 国际化（I18N）

### 安装 i18n-ally 插件

1. 在 VSCode 中打开扩展市场，搜索并安装 `i18n Ally` 插件。

### 代码优化示例

#### 在 `getServerSideProps` 中获取特定命名空间的翻译

```typescript
// pages/yourPage.tsx
export async function getServerSideProps(context: any) {
  return {
    props: {
      currentTab: context?.query?.currentTab || TabEnum.info,
      ...(await serverSideTranslations(context.locale, ['publish', 'user']))
    }
  };
}
```

#### 在页面中使用 useTranslation 钩子

```typescript
// pages/yourPage.tsx
import { useTranslation } from 'next-i18next';

const YourComponent = () => {
  const { t } = useTranslation();

  return (
    <Button
      variant="outline"
      size="sm"
      mr={2}
      onClick={() => setShowSelected(false)}
    >
      {t('common:close')}
    </Button>
  );
};

export default YourComponent;
```

#### 处理静态文件翻译

```typescript
// utils/i18n.ts
import { i18nT } from '@fastgpt/web/i18n/utils';

const staticContent = {
  id: 'simpleChat',
  avatar: 'core/workflow/template/aiChat',
  name: i18nT('app:template.simple_robot'),
};

export default staticContent;
```

### 标准化翻译格式

- 使用 t(namespace:key) 格式以确保命名一致。
- 翻译键应使用小写字母和下划线，例如：common.close。

## 审计

请填写 AuditEventEnum 并在 ts 中添加 audit 函数，同时在相应位置填写国际化内容，此外在使用日志的位置添加 addOpearationLog 函数。

## 构建

```sh
# Docker 命令：构建镜像，不使用代理
docker build -f ./projects/app/Dockerfile -t registry.cn-hangzhou.aliyuncs.com/fastgpt/fastgpt:v4.8.1 . --build-arg name=app
# make 命令：构建镜像，不使用代理
make build name=app image=registry.cn-hangzhou.aliyuncs.com/fastgpt/fastgpt:v4.8.1

# Docker 命令：构建镜像，使用代理
docker build -f ./projects/app/Dockerfile -t registry.cn-hangzhou.aliyuncs.com/fastgpt/fastgpt:v4.8.1 . --build-arg name=app --build-arg proxy=taobao
# make 命令：构建镜像，使用代理
make build name=app image=registry.cn-hangzhou.aliyuncs.com/fastgpt/fastgpt:v4.8.1 proxy=taobao
```