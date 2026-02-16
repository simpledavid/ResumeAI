# Cloudflare Workers & D1 Migration Guide

This guide explains how to complete the migration of ResumeAI to Cloudflare Workers and D1.

## What's Been Done

✅ Installed Cloudflare packages (@cloudflare/next-on-pages, wrangler)
✅ Created wrangler.toml configuration
✅ Set up D1 database migration files
✅ Created D1 database service layer (lib/db.ts)
✅ Updated authentication routes to use D1
✅ Added Cloudflare Workers TypeScript types
✅ Updated package.json with deployment scripts

## Next Steps

### 1. Create D1 Database

First, you need to create a D1 database on Cloudflare:

```bash
# Login to Cloudflare (if not already logged in)
npx wrangler login

# Create the D1 database
npx wrangler d1 create resumeai-db
```

After running this command, copy the `database_id` from the output and update [wrangler.toml](wrangler.toml):

```toml
[[d1_databases]]
binding = "DB"
database_name = "resumeai-db"
database_id = "YOUR_DATABASE_ID_HERE"  # Replace with actual ID
```

### 2. Run Database Migrations

Apply the database schema to your D1 database:

```bash
# Apply migration
npx wrangler d1 execute resumeai-db --file=./migrations/0001_initial_schema.sql
```

### 3. Update Environment Variables

Create a `.dev.vars` file in the project root for local development:

```env
AUTH_SECRET=your-auth-secret-here
COS_REGION=your-cos-region
COS_SECRET_ID=your-cos-secret-id
COS_SECRET_KEY=your-cos-secret-key
COS_BUCKET=your-cos-bucket
COS_DOMAIN=your-cos-domain
TENCENT_MAP_KEY=your-tencent-map-key
```

For production, add these secrets to Cloudflare:

```bash
npx wrangler secret put AUTH_SECRET
npx wrangler secret put COS_REGION
npx wrangler secret put COS_SECRET_ID
npx wrangler secret put COS_SECRET_KEY
# ... add other secrets
```

### 4. Important Compatibility Notes

#### Next.js Version Compatibility

⚠️ **IMPORTANT**: The current project uses Next.js 16.1.6, but `@cloudflare/next-on-pages` only supports Next.js up to version 15.5.2. You have two options:

**Option A: Downgrade Next.js (Recommended)**
```bash
npm install next@15.4.0 --legacy-peer-deps
```

**Option B: Use OpenNext (Future-proof)**
The `@cloudflare/next-on-pages` package is deprecated and recommends using OpenNext instead. See: https://opennext.js.org/cloudflare

#### Runtime Compatibility Issues

Some Node.js features are not available in Cloudflare Workers:
- `Buffer` - Use `Uint8Array` or polyfills
- `fs` module - Not available
- `crypto` - Use Web Crypto API instead
- `process.env` - Use Cloudflare environment bindings

Files that may need updates:
- `lib/avatar-storage.ts` (uses Tencent COS SDK - may need to switch to R2)
- Any file using Node.js-specific APIs

### 5. Consider Switching to Cloudflare R2

Currently, the app uses Tencent Cloud COS for file storage. Consider migrating to Cloudflare R2:

Add R2 binding to [wrangler.toml](wrangler.toml):
```toml
[[r2_buckets]]
binding = "STORAGE"
bucket_name = "resumeai-storage"
```

### 6. Build and Deploy

#### Local Development

```bash
# Build the Next.js app for Cloudflare Pages
npm run pages:build

# Run locally with wrangler
npm run pages:dev
```

#### Deploy to Cloudflare Pages

```bash
# Deploy to production
npm run pages:deploy
```

Or set up continuous deployment:
1. Push your code to GitHub
2. Go to Cloudflare Dashboard > Pages
3. Create a new project from your GitHub repo
4. Set build command: `npm run pages:build`
5. Set build output directory: `.vercel/output/static`
6. Add environment variables in Pages settings

### 7. Post-Migration Testing

Test these features after deployment:
- [ ] User registration
- [ ] User login
- [ ] Session management
- [ ] Avatar upload (may need R2 migration)
- [ ] Dashboard functionality
- [ ] API endpoints

## Remaining Work

### High Priority
1. **Test the build** - Run `npm run pages:build` to check for compatibility issues
2. **Update avatar storage** - Migrate from Tencent COS to Cloudflare R2
3. **Environment setup** - Configure all environment variables in Cloudflare

### Medium Priority
4. **Update lib/auth.ts** - Verify JWT handling works in Workers runtime
5. **Test all API routes** - Ensure they work with D1 and Workers constraints
6. **Update middleware** - If any middleware exists, ensure it's Workers-compatible

### Low Priority
7. **Remove Prisma dependencies** - Clean up unused Prisma files
8. **Update README** - Document the new Cloudflare deployment process
9. **Set up CI/CD** - Automate deployments through GitHub Actions

## Common Issues

### Issue: "Unable to resolve dependency tree"
**Solution**: Use `--legacy-peer-deps` flag for npm installs due to Next.js version mismatch.

### Issue: "D1 database binding not found"
**Solution**: Make sure you're running with wrangler and the binding is configured in wrangler.toml.

### Issue: Build fails with module errors
**Solution**: Check for Node.js-specific APIs that need polyfills or alternatives in Workers runtime.

## Useful Commands

```bash
# Check D1 database contents
npx wrangler d1 execute resumeai-db --command "SELECT * FROM User"

# Tail logs from deployed Workers
npx wrangler tail

# Preview deployment locally
npx wrangler pages dev .vercel/output/static --d1 DB=resumeai-db

# Deploy to production
npx wrangler pages deploy
```

## Resources

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [OpenNext Cloudflare Adapter](https://opennext.js.org/cloudflare)
