# Quick Deployment Checklist

## Pre-Deployment
- [ ] All environment variables set in Vercel:
  - [ ] `DATABASE_URL` (Neon PostgreSQL)
  - [ ] `IMGBB_API_KEY` (optional)
- [ ] Database migrations run (`npm run db:push`)
- [ ] Build succeeds locally (`npm run build`)

## Deployment Steps
1. Commit and push changes to main branch
2. Vercel automatically deploys (no manual action needed)
3. Monitor logs in Vercel dashboard

## Post-Deployment Verification

### Test Health Check (should be instant)
```bash
curl https://routesvm.vercel.app/health
```

### Test Global Settings (graceful fallback)
```bash
curl https://routesvm.vercel.app/api/global-settings/footerCompanyName
```

### Test Data Endpoints (after cold start)
```bash
curl https://routesvm.vercel.app/api/table-rows
curl https://routesvm.vercel.app/api/table-columns
curl https://routesvm.vercel.app/api/pages
```

## Troubleshooting

### 500 Error on Specific Endpoint
1. Check Vercel Logs for the specific error
2. Verify DATABASE_URL is set correctly
3. Check database connection status in Neon dashboard
4. If database is down, endpoints return 503 (unavailable) - this is expected

### Cold Start Performance
- First request after deployment/idle: 1-2 seconds (normal)
- Subsequent requests: < 100ms (expected)

### Connection Timeouts
- Increase idle connection timeout in `server/db.ts` if needed
- Reduce connection pool size further if getting "too many connections" errors
- Check Neon dashboard for connection limits

## Key Files Modified
- `server/storage.ts` - Lazy initialization
- `server/db.ts` - Connection pool optimization
- `server/routes.ts` - Error handling
- `server/vercel.ts` - Serverless handler fix

See `SERVERLESS_FIXES.md` for detailed explanation of changes.
