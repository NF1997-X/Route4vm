import dotenv from 'dotenv';
dotenv.config();

import { getDb } from './server/db.js';
import { globalSettings } from './shared/schema.js';

async function truncateGlobalSettings() {
  try {
    const db = getDb();
    
    console.log('🗑️ Truncating global settings table...');
    
    // Delete all global settings
    await db.delete(globalSettings);
    console.log('✅ Global settings table cleared');
    
    console.log('🎉 Global settings truncated successfully!');
  } catch (error) {
    console.error('❌ Error truncating global settings:', error);
  }
  process.exit(0);
}

truncateGlobalSettings();