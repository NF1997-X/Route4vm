import { Pool, neonConfig, type PoolConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let _pool: Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;
let _initPromise: Promise<ReturnType<typeof drizzle>> | null = null;

function createPoolWithRetry(maxRetries = 3): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  const poolConfig: PoolConfig = {
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
    // Add more aggressive pool settings for serverless
    max: 1, // Limit connections for serverless
    idleTimeoutMillis: 10000,
  };
  
  return new Pool(poolConfig);
}

export function initDb() {
  if (_db) return Promise.resolve(_db);
  
  // Ensure only one initialization happens at a time
  if (_initPromise) return _initPromise;
  
  _initPromise = (async () => {
    try {
      if (!_db) {
        _pool = createPoolWithRetry();
        _db = drizzle({ client: _pool, schema });
        
        // Test the connection
        try {
          await _db.execute("SELECT 1");
          console.log("Database connection established successfully");
        } catch (testError) {
          console.warn("Initial database test query failed, but continuing:", testError);
          // Don't throw here - the connection might work when actually used
        }
      }
      return _db;
    } catch (error) {
      _db = null;
      _pool = null;
      _initPromise = null;
      throw error;
    }
  })();
  
  return _initPromise;
}

export function getDb() {
  if (!_db) {
    // Return a proxy that will initialize on first use
    return new Proxy({} as ReturnType<typeof drizzle>, {
      get(_target, prop) {
        if (!_db) {
          // Force synchronous initialization - this will throw if DB_URL is not set
          if (!process.env.DATABASE_URL) {
            throw new Error(
              "DATABASE_URL must be set. Did you forget to provision a database?",
            );
          }
          if (!_pool) {
            _pool = createPoolWithRetry();
          }
          if (!_db) {
            _db = drizzle({ client: _pool, schema });
          }
        }
        return (_db as any)[prop];
      }
    });
  }
  return _db;
}

// Lazy getters for backward compatibility
export const pool = new Proxy({} as Pool, {
  get(_target, prop) {
    if (!_pool) {
      if (!process.env.DATABASE_URL) {
        throw new Error(
          "DATABASE_URL must be set. Did you forget to provision a database?",
        );
      }
      _pool = createPoolWithRetry();
    }
    return (_pool as any)[prop];
  }
});

export const db = getDb();
