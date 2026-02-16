# Resumio 部署说明

## 🎉 项目已部署到 Cloudflare Pages

- **生产 URL**: https://resumio.pages.dev
- **最新部署**: https://cbecd148.resumio.pages.dev
- **项目名称**: resumio

## ⚙️ 配置 D1 数据库绑定

### 方法 1: 通过 Cloudflare Dashboard（推荐）

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 导航到 **Workers & Pages** → **resumio**
3. 点击 **Settings** → **Functions**
4. 在 **D1 database bindings** 部分，点击 **Add binding**
5. 配置绑定：
   - **Variable name**: `DB`
   - **D1 database**: 选择 `resumeai-db`
6. 点击 **Save**

### 方法 2: 通过 wrangler.toml（已配置）

D1 绑定已在 `wrangler.toml` 中配置：

```toml
[[d1_databases]]
binding = "DB"
database_name = "resumeai-db"
database_id = "f45c484f-8178-409b-9b91-70fdee561767"
```

## 🔐 配置环境变量

### 通过 Dashboard 配置

1. 访问 **Settings** → **Environment variables**
2. 添加以下变量：

#### 生产环境（Production）

必需变量：
```
AUTH_SECRET = <生成一个强随机字符串>
NODE_ENV = production
```

可选变量（如果使用腾讯云服务）：
```
COS_REGION = <您的区域>
COS_SECRET_ID = <您的密钥ID>
COS_SECRET_KEY = <您的密钥>
COS_BUCKET = <您的存储桶>
COS_DOMAIN = <您的域名>
TENCENT_MAP_KEY = <您的地图API密钥>
GITHUB_TOKEN = <可选，用于GitHub API>
```

### 通过命令行配置（Production）

```bash
# 设置 AUTH_SECRET
npx wrangler pages secret put AUTH_SECRET --project-name=resumio

# 设置其他敏感变量
npx wrangler pages secret put COS_SECRET_KEY --project-name=resumio
```

注意：`wrangler pages secret` 用于敏感信息，这些值会被加密存储。

对于非敏感的环境变量，在 Dashboard 中配置即可。

## 🚀 重新部署

配置完成后，重新部署以应用更改：

```bash
npm run build
npx wrangler pages deploy .vercel/output/static --project-name=resumio --commit-dirty=true
```

## 🧪 本地开发

### 使用本地 D1 数据库

```bash
# 启动本地开发服务器（使用 Next.js dev）
npm run dev

# 或使用 wrangler pages dev（需要先构建）
npm run build
npx wrangler pages dev .vercel/output/static --d1 DB=resumeai-db
```

### 本地环境变量

本地开发使用 `.dev.vars` 文件（已创建）：

```env
AUTH_SECRET=your-local-secret-change-this-in-production
NODE_ENV=development
```

## 📊 查看部署状态

```bash
# 查看项目信息
npx wrangler pages project list

# 查看最近的部署
npx wrangler pages deployment list --project-name=resumio

# 查看实时日志（需要部署 ID）
npx wrangler pages deployment tail <deployment-id>
```

## 🔄 CI/CD 集成

### GitHub Actions 示例

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: pages deploy .vercel/output/static --project-name=resumio
```

## 🐛 故障排查

### 数据库连接失败

如果看到 "Database not available" 错误：

1. 确认 D1 绑定已正确配置（变量名必须是 `DB`）
2. 检查数据库 ID 是否正确
3. 重新部署应用

### 环境变量未生效

1. 确认在 Dashboard 中正确配置了环境变量
2. 检查是否选择了正确的环境（Production/Preview）
3. 重新部署以应用更改

### 本地开发问题

如果本地运行失败：

```bash
# 清理缓存重试
rm -rf .next .vercel node_modules
npm install
npm run dev
```

## 📝 数据库操作

### 查询数据库

```bash
# 查询远程数据库
npx wrangler d1 execute resumeai-db --remote --command "SELECT * FROM User LIMIT 10"

# 查询本地数据库
npx wrangler d1 execute resumeai-db --command "SELECT * FROM User LIMIT 10"
```

### 运行迁移

```bash
# 在远程数据库运行迁移
npx wrangler d1 execute resumeai-db --remote --file=./migrations/<migration-file>.sql
```

## 🔗 有用的链接

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [D1 数据库文档](https://developers.cloudflare.com/d1/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Next.js on Cloudflare](https://developers.cloudflare.com/pages/framework-guides/nextjs/)

## 📞 支持

如有问题，请访问：
- [Cloudflare Discord](https://discord.gg/cloudflaredev)
- [GitHub Issues](https://github.com/cloudflare/workers-sdk/issues)
