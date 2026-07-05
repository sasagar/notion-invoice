import process from "node:process";
import { auth } from "../src/lib/auth";

const email = process.env.SEED_ADMIN_EMAIL;
const password = process.env.SEED_ADMIN_PASSWORD;
if (!email || !password) {
  console.error("SEED_ADMIN_EMAIL と SEED_ADMIN_PASSWORD が必要です");
  process.exit(1);
}

// headers を渡さない呼び出しは admin セッション検査をバイパスする（初期管理者の作成用）。
const created = await auth.api.createUser({
  body: { email, password, name: "Admin", role: "admin" },
});
console.log("✓ 管理者を作成しました:", created.user.email);
process.exit(0);
