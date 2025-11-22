import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";

// Create the Express app
const app = express();

// Setup body parsing middleware
app.use(express.json({ limit: '50mb' }));

// For urlencoded, check if it exists (some bundling scenarios may not include it)
if (typeof (express as any).urlencoded === 'function') {
  app.use((express as any).urlencoded({ extended: false, limit: '50mb' }));
}

// CORS
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check endpoints
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString()
  });
});

// Initialization flag to ensure routes are registered only once
let _routesRegistered = false;
let _serverPromise: Promise<any> | null = null;

// Register routes on first request
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

// Middleware to ensure routes are registered before handling requests
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureRoutesRegistered();
    next();
  } catch (error) {
    console.error('Route initialization error:', error);
    res.status(500).json({ message: "Service initialization error" });
  }
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(`Error ${status}:`, err);
  res.status(status).json({ message });
});

// Export as Vercel serverless function handler
// Use ES module export for compatibility with package.json type: "module"
export default app;
