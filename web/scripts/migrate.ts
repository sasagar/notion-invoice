import process from "node:process";
import { getMigrations } from "better-auth/db/migration";
import { auth } from "../src/lib/auth";
import { db } from "../src/lib/db";
import { applyAppSchema } from "../src/lib/schema";

const { runMigrations } = await getMigrations(auth.options);
await runMigrations();
console.log("✓ better-auth migrations applied");

// アプリ表は user を FK 参照するため、better-auth migration の後に適用する。
applyAppSchema(db);
console.log("✓ app schema applied");
process.exit(0);
