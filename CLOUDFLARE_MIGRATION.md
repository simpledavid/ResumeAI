# Cloudflare Migration Notes

## 状态

已完成从旧 `next-on-pages` 路线迁移到 **OpenNext**。

## 当前部署栈

- Next.js: `16.1.6`
- OpenNext adapter: `@opennextjs/cloudflare`
- Runtime: Cloudflare Workers (`nodejs_compat`)

## 关键文件

- `wrangler.toml`
- `open-next.config.ts`
- `next.config.ts`
- `package.json` (`cf:*` 脚本)

## 当前命令

```bash
npm run cf:build
npm run cf:preview
npm run cf:deploy
```

## 说明

- 本项目不再使用 `@cloudflare/next-on-pages`。
- 部署与预览请使用 `opennextjs-cloudflare`。
