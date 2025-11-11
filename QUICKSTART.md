# 🚀 Quick Vercel Deployment Commands

## First Time Setup

```bash
# 1. Login to Vercel
vercel login

# 2. Deploy (will ask for project configuration)
vercel

# 3. Add environment variables
vercel env add DATABASE_URL
# Paste your Neon PostgreSQL URL when prompted
# Select: Production

vercel env add IMGBB_API_KEY
# Paste your ImgBB API key when prompted (get from https://api.imgbb.com/)
# Select: Production

# 4. Deploy to production
vercel --prod
```

## Update Existing Deployment

```bash
# Just push changes and deploy
git add .
git commit -m "Update app"
git push
vercel --prod
```

## Environment Variables

You need these two variables in Vercel:

1. **DATABASE_URL**
   - Your Neon PostgreSQL connection string
   - Format: `postgresql://user:pass@host/dbname?sslmode=require`

2. **IMGBB_API_KEY**
   - Get FREE key at: https://api.imgbb.com/
   - Sign up → Dashboard → Get API Key

## Useful Commands

```bash
# View deployment logs
vercel logs

# List all deployments
vercel ls

# Open project in Vercel Dashboard
vercel open

# Remove a deployment
vercel rm [deployment-url]

# Check deployment status
vercel inspect [deployment-url]
```

## Common Issues

### "Missing DATABASE_URL"
```bash
vercel env add DATABASE_URL production
```

### "Missing IMGBB_API_KEY"
```bash
vercel env add IMGBB_API_KEY production
```

### Build fails
```bash
# Test build locally first
npm run build

# Check TypeScript
npm run check
```

## Your App URLs

After deployment, you'll get:
- **Production**: `https://your-app.vercel.app`
- **Preview**: `https://your-app-preview.vercel.app` (for each deployment)

## Next Steps After Deploy

1. ✅ Visit your app URL
2. ✅ Test the health endpoint: `/health`
3. ✅ Try uploading an image
4. ✅ Check all features work
5. ✅ Add custom domain (optional)

---

**Need help?** Check `DEPLOYMENT.md` for detailed guide!
