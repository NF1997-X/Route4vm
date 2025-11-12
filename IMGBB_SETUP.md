# ImgBB API Setup Guide

## ✅ API Key Baru - UPDATED!
API key baru telah ditetapkan: `4042c537845e8b19b443add46f4a859c`

### Status
- ✅ API Key tested dan berfungsi!
- ✅ Local .env updated
- ⏳ Perlu update di Vercel Production

## Cara Update di Vercel Production

### Method 1: Vercel Dashboard (RECOMMENDED)
1. Buka: https://vercel.com/nasruls-projects-9e0ce16a/routesvm/settings/environment-variables
2. Cari `IMGBB_API_KEY`
3. Click **Edit** button
4. Update value kepada: `4042c537845e8b19b443add46f4a859c`
5. Click **Save**
6. **Important:** Redeploy untuk apply changes:
   ```bash
   vercel --prod
   ```

### Method 2: Vercel CLI (Alternative)
```bash
# Remove old key
vercel env rm IMGBB_API_KEY production

# Add new key
echo "4042c537845e8b19b443add46f4a859c" | vercel env add IMGBB_API_KEY production

# Redeploy
vercel --prod
```

## Test Upload After Deployment
```bash
# Test di production
curl -X POST https://your-deployment-url.vercel.app/api/upload-image \
  -H "Content-Type: application/json" \
  -d '{"image":"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="}'
```

## Cara Dapatkan API Key Baru (Untuk Rujukan)

### 1. Daftar Akaun ImgBB (PERCUMA)
- Pergi ke: https://api.imgbb.com/
- Klik "Get API Key"
- Sign up dengan email atau login dengan Google/Facebook/Twitter
- Percuma dan tidak perlu kad kredit

### 2. Dapatkan API Key
- Selepas login, pergi ke: https://api.imgbb.com/
- API key anda akan dipaparkan di dashboard
- Copy API key tersebut

### 3. Update Environment Variable

#### Untuk Development (Local)
```bash
# Edit file .env
IMGBB_API_KEY=your_new_api_key_here
```

#### Untuk Production (Vercel)
```bash
# Tambah ke Vercel menggunakan command line
vercel env add IMGBB_API_KEY production

# Atau tambah melalui Vercel Dashboard:
# 1. Pergi ke https://vercel.com/nasruls-projects-9e0ce16a/routesvm
# 2. Klik "Settings"
# 3. Klik "Environment Variables"
# 4. Add New Variable:
#    - Name: IMGBB_API_KEY
#    - Value: your_new_api_key_here
#    - Environment: Production (check)
# 5. Klik "Save"
# 6. Redeploy: vercel --prod
```

### 4. Test API Key
```bash
# Test dengan curl (ganti YOUR_API_KEY dengan key baru)
curl "https://api.imgbb.com/1/upload?key=YOUR_API_KEY" \
  -F "image=iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
```

Jika berjaya, anda akan dapat response JSON dengan URL image.

## Alternative: Gunakan Service Lain

Jika tidak mahu guna ImgBB, boleh guna service lain:
- **Cloudinary** (Free tier: 25GB storage, 25GB bandwidth/month)
- **Imgur** (Free, unlimited)
- **Upload.io** (Free tier tersedia)

## Status Semasa
- ✅ Database (Neon PostgreSQL) - BERFUNGSI
- ❌ Image Upload (ImgBB) - PERLU API KEY BARU
- ✅ Frontend - BERFUNGSI
- ✅ API Routes - BERFUNGSI

## Selepas Update API Key
1. Update `.env` file di local
2. Update environment variable di Vercel
3. Deploy semula: `vercel --prod`
4. Test upload foto di aplikasi
