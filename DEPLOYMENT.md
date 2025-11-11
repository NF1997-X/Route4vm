# Deployment Guide for Vercel

This guide will help you deploy the Route4vm application to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. GitHub account (to connect your repository)
3. A valid ImgBB API key (get one at https://api.imgbb.com/)

## Environment Variables

Before deploying, you'll need to set up these environment variables in Vercel:

1. `DATABASE_URL` - Your Neon PostgreSQL connection string
2. `IMGBB_API_KEY` - Your ImgBB API key for image uploads

## Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add IMGBB_API_KEY
   ```
   
   When prompted, enter the values and select "Production" environment.

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import Project in Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

3. **Configure Environment Variables**
   - In the deployment settings, add:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `IMGBB_API_KEY`: Your ImgBB API key

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

## Post-Deployment

1. **Verify Deployment**
   - Visit your Vercel URL
   - Check the `/health` endpoint: `https://your-app.vercel.app/health`

2. **Test Image Upload**
   - Try uploading an image to ensure the IMGBB_API_KEY is working

3. **Database Setup**
   - Run migrations if needed:
     ```bash
     npm run db:push
     ```

## Important Notes

- **Database**: Make sure your DATABASE_URL points to a production Neon database
- **CORS**: The app is configured to allow all origins. Adjust in production if needed.
- **API Keys**: Never commit API keys to your repository
- **Build Time**: First deployment may take 2-5 minutes

## Troubleshooting

### Build Fails
- Check that all dependencies are listed in `package.json`
- Verify TypeScript compiles locally: `npm run check`

### API Routes Not Working
- Ensure environment variables are set correctly
- Check Vercel function logs in the dashboard

### Image Upload Fails
- Verify IMGBB_API_KEY is set correctly
- Check that the key is valid at https://api.imgbb.com/

### Database Connection Issues
- Verify DATABASE_URL format
- Ensure your Neon database allows connections from Vercel's IP ranges

## Custom Domain

To add a custom domain:

1. Go to your project in Vercel Dashboard
2. Navigate to Settings → Domains
3. Add your domain
4. Update DNS records as instructed

## Continuous Deployment

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: For every pull request

## Support

For issues specific to:
- **Vercel**: Check https://vercel.com/docs
- **Neon Database**: Check https://neon.tech/docs
- **ImgBB API**: Check https://api.imgbb.com/

---

**Ready to deploy?** Run `vercel` in your terminal!
