# Serverless (Vercel) 500 Error Fixes

## Problem Analysis

Your Vercel deployment was experiencing 500 errors on multiple API endpoints:
- `/api/global-settings/footerCompanyName`
- `/api/global-settings/footerCompanyUrl`
- `/api/table-columns`
- `/api/table-rows`
- `/api/pages`

**Root Causes:**
1. **Eager Database Initialization**: The `DatabaseStorage` class was instantiated at module load time, causing database connection attempts before environment variables were properly loaded in serverless environment
2. **Serverless Environment Differences**: Vercel's serverless functions have different lifecycle patterns - the `/api/index.js` handler is called fresh for each request, but module-level initialization happens before the handler executes
3. **Connection Pool Issues**: The default connection pool settings weren't optimized for serverless constraints
4. **Duplicate Route Definitions**: The `server/vercel.ts` file had duplicate route definitions instead of reusing the main `registerRoutes` function

## Implemented Solutions

### 1. Lazy Storage Initialization (`server/storage.ts`)

**Before:**
```typescript
export const storage = new DatabaseStorage();
```

**After:**
```typescript
let _storage: DatabaseStorage | null = null;

export function getStorage(): DatabaseStorage {
  if (!_storage) {
    _storage = new DatabaseStorage();
  }
  return _storage;
}

export const storage = new Proxy({} as DatabaseStorage, {
  get(_target, prop) {
    return (getStorage() as any)[prop];
  }
});
```

**Benefit:** Storage is now initialized on first use, not at module load time. This prevents premature database connection attempts.

### 2. Improved Database Connection Pool (`server/db.ts`)

**Key Changes:**
- Added `max: 1` connection limit for serverless (prevents connection exhaustion)
- Added `idleTimeoutMillis: 10000` to clean up idle connections
- Implemented promise-based initialization to prevent race conditions
- Added graceful handling of connection failures
- Test connection after pool creation for early error detection

**Why This Matters:** Serverless functions have strict resource constraints. A single connection is sufficient since each request is isolated.

### 3. Enhanced Error Handling (`server/routes.ts`)

Added graceful fallbacks for database connection failures in global settings endpoints:

```typescript
app.get("/api/global-settings/:key", async (req, res) => {
  try {
    const key = req.params.key;
    try {
      const setting = await storage.getGlobalSetting(key);
      if (!setting) {
        // Return defaults instead of 404
        if (key === 'footerCompanyName') {
          return res.json({ key, value: 'Vending Machine' });
        }
        if (key === 'footerCompanyUrl') {
          return res.json({ key, value: '' });
        }
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (dbError: any) {
      // Catch database-specific errors
      if (dbError?.message?.includes('DATABASE_URL') || dbError?.code === 'ECONNREFUSED') {
        console.error('Database connection error in global settings:', dbError);
        // Return defaults on connection failure
        if (key === 'footerCompanyName') {
          return res.json({ key, value: 'Vending Machine' });
        }
        if (key === 'footerCompanyUrl') {
          return res.json({ key, value: '' });
        }
        return res.status(503).json({ message: "Database temporarily unavailable" });
      }
      throw dbError;
    }
  } catch (error) {
    console.error("Get global setting error:", error);
    res.status(500).json({ message: "Failed to fetch global setting" });
  }
});
```

**Benefits:**
- Returns sensible defaults for critical settings (footer company name/URL)
- Returns 503 status instead of 500 when database is temporarily unavailable
- Allows UI to function even during database connection issues

### 4. Fixed Vercel Serverless Handler (`server/vercel.ts`)

**Before:** Duplicate route definitions (hard to maintain, large bundle size)

**After:** Reuses the main `registerRoutes` function with lazy initialization:

```typescript
let _routesRegistered = false;
let _serverPromise: Promise<any> | null = null;

async function ensureRoutesRegistered() {
  if (_routesRegistered) return;
  
  if (_serverPromise) {
    await _serverPromise;
    return;
  }

  _serverPromise = (async () => {
    if (!_routesRegistered) {
      try {
        await registerRoutes(app);
        _routesRegistered = true;
        console.log('Routes registered successfully for Vercel');
      } catch (error) {
        console.error('Error registering routes:', error);
        _serverPromise = null;
        throw error;
      }
    }
  })();

  await _serverPromise;
}

// Middleware ensures routes registered before handling requests
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureRoutesRegistered();
    next();
  } catch (error) {
    console.error('Route initialization error:', error);
    res.status(500).json({ message: "Service initialization error" });
  }
});
```

**Benefits:**
- Single source of truth for routes (no duplication)
- Routes registered on first request, preventing cold start issues
- Thread-safe registration with promise-based coordination
- Clear error reporting for initialization failures

## Testing the Fixes

### Health Check (Should always work)
```bash
curl https://routesvm.vercel.app/health
# Returns: {"status":"ok","timestamp":"2025-11-19T..."}
```

### Global Settings (Should return defaults if DB unavailable)
```bash
curl https://routesvm.vercel.app/api/global-settings/footerCompanyName
# Returns: {"key":"footerCompanyName","value":"Vending Machine"}
```

### Table Data (Should work once DB is available)
```bash
curl https://routesvm.vercel.app/api/table-rows
# Returns: [list of table rows]
```

## Environment Variables

Ensure these are set in Vercel project settings:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `IMGBB_API_KEY` - Optional, for image uploads

## Monitoring & Debugging

1. **Check Vercel Logs**: View real-time logs in Vercel dashboard under project settings
2. **Monitor Database Connections**: Check Neon dashboard for connection count and status
3. **Cold Start Performance**: First request may take 1-2 seconds for initialization
4. **Subsequent Requests**: Should be fast (< 100ms) once initialized

## Future Improvements

1. **Connection Pooling**: Consider using `@vercel/postgres` wrapper for better integration
2. **Caching**: Add Redis/Memcached for frequently accessed settings
3. **Database Warm-up**: Implement health check pings to prevent connection timeout during idle periods
4. **Error Monitoring**: Integrate Sentry or similar for production error tracking

## Summary of Changed Files

1. **`server/storage.ts`** - Added lazy initialization pattern
2. **`server/db.ts`** - Improved connection pool configuration
3. **`server/routes.ts`** - Added graceful fallbacks for database errors
4. **`server/vercel.ts`** - Fixed serverless handler with lazy route registration

All changes maintain backward compatibility while fixing the 500 errors in serverless environments.
