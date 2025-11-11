import "dotenv/config";
import { getDb } from "./server/db";
import { tableColumns, tableRows } from "./shared/schema";
import { eq } from "drizzle-orm";

async function removeKilometerColumn() {
  const db = getDb();
  
  try {
    console.log("Removing kilometer column from database...");
    
    // Delete kilometer column from table_columns
    await db
      .delete(tableColumns)
      .where(eq(tableColumns.dataKey, "kilometer"));
    
    console.log("✅ Deleted kilometer column definition");

    // Note: We don't need to delete data from table_rows since kilometer is computed
    // The kilometer field in TableRow interface will be removed from code
    
    console.log("✅ Kilometer column completely removed!");
    
  } catch (error) {
    console.error("❌ Error removing kilometer column:", error);
  }
}

removeKilometerColumn();