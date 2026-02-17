# Cloudflare Deployment (OpenNext)

本项目当前使用 `Next.js 16 + @opennextjs/cloudflare` 部署到 **Cloudflare Workers**。

## 1. 前置要求

- Node.js 20+
- 已安装并登录 Wrangler：`npx wrangler login`
- Cloudflare 中已存在 D1 数据库（如果你要继续保留 DB 绑定）

## 2. 本地开发

1. 安装依赖

```bash
npm install
```

2. 配置本地变量（` .dev.vars `）

必须至少填写：

```bash
ZHIPU_API_KEY=your_key
ZHIPU_BASE_URL=https://open.bigmodel.cn/api/paas/v4
ZHIPU_MODEL=glm-4.7-flash
```

3. 本地启动 Next 开发环境

```bash
npm run dev
```

4. 生成 Cloudflare Worker 构建产物

```bash
npm run cf:build
```

## 3. Cloudflare 配置

当前关键配置位于 `wrangler.toml`：

- `main = ".open-next/worker.js"`
- `assets.directory = ".open-next/assets"`
- `[[d1_databases]]` 绑定名为 `DB`
- `[[services]]` 绑定名为 `WORKER_SELF_REFERENCE`

生产环境使用 `env.production`，部署命令会默认走该环境。

## 4. 生产密钥配置

至少设置以下 Secret：

```bash
npx wrangler secret put ZHIPU_API_KEY --env production
```

可选（若你想用 secret 而不是 `wrangler.toml` 里的 vars）：

```bash
npx wrangler secret put ZHIPU_BASE_URL --env production
npx wrangler secret put ZHIPU_MODEL --env production
```

## 5. 部署命令

```bash
npm run cf:deploy
```

等价命令：

```bash
opennextjs-cloudflare build && opennextjs-cloudflare deploy --env production
```

## 6. 常用命令

```bash
npm run cf:typegen   # 基于 wrangler.toml 生成 Cloudflare 环境类型
npm run cf:preview   # 本地预览 OpenNext Worker（先构建）
```

## 7. 常见问题

1. `Missing ZHIPU_API_KEY`
- 未在 `.dev.vars`（本地）或 Cloudflare Secret（线上）中配置。

2. D1 绑定报错
- 检查 `wrangler.toml` 里 `binding = "DB"` 是否与代码一致。
- 检查 `database_id` 是否为真实值（不要用占位符）。

3. Windows 下 OpenNext 警告
- OpenNext 官方提示在 Windows 可能有兼容性问题，建议在 WSL 环境构建与部署。
