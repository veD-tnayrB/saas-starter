import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import "server-only";

import type { Database } from "./db.types";

declare global {
  // eslint-disable-next-line no-var
  var cachedDb: Kysely<Database> | undefined;
}

export let db: Kysely<Database>;

if (process.env.NODE_ENV === "production") {
  db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }),
    }),
  });
} else {
  if (!global.cachedDb) {
    global.cachedDb = new Kysely<Database>({
      dialect: new PostgresDialect({
        pool: new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
        }),
      }),
    });
  }
  db = global.cachedDb;
}
