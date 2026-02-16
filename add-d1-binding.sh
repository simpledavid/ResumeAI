#!/bin/bash
# 为 Cloudflare Pages 添加 D1 绑定

# 使用 Cloudflare API 添加绑定
# 注意：这通常需要通过 Dashboard 完成

echo "请在 Cloudflare Dashboard 中完成以下步骤："
echo ""
echo "1. 访问: https://dash.cloudflare.com"
echo "2. 进入: Workers & Pages > resumio"
echo "3. 点击: Settings > Functions"
echo "4. 在 'D1 database bindings' 部分，点击 'Add binding'"
echo "5. 填写:"
echo "   - Variable name: DB"
echo "   - D1 database: resumeai-db"
echo "6. 点击 'Save'"
echo ""
echo "配置完成后，刷新页面重试注册。"
