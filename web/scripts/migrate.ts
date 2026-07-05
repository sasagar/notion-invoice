import process from "node:process";
import { getMigrations } from "better-auth/db/migration";
import { auth } from "../src/lib/auth";

const { runMigrations } = await getMigrations(auth.options);
await runMigrations();
console.log("✓ better-auth migrations applied");
process.exit(0);
