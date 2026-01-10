import { sql } from "kysely";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // 1. Trigger Environment Variable Validation
    // This will throw an error if any variables are missing/invalid
    const { env } = await import("./env.mjs");
    console.log("✅ Environment variables validated.");

    // 2. Database Connectivity Check (Ping)
    try {
      const { db } = await import("./lib/db");

      // Perform a simple query to verify connection
      await sql`SELECT 1`.execute(db);

      console.log("✅ Database connection established successfully.");
    } catch (error) {
      console.error(
        "❌ CRITICAL: Failed to connect to the database at startup.",
      );
      console.error(error instanceof Error ? error.message : String(error));

      // Force the application to fail to start in production/development
      // to avoid running in an unstable state.
      process.exit(1);
    }
  }
}
