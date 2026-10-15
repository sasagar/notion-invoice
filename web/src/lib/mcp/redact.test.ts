import { describe, expect, test } from "vitest";
import { redactFullInvoice, withoutSealImage } from "@/lib/mcp/redact";
import type { FullInvoice } from "@/lib/notion/types";

const account = {
  contactName: "担当",
  companyName: "自社",
  sealImageUrl: `data:image/png;base64,${"A".repeat(100_000)}`,
  companyInfo: "",
  bankInfo: "",
  registrationNumber: "",
  slug: "s",
};

describe("withoutSealImage", () => {
  test("印影の data URI を外して有無だけ返す", () => {
    const r = withoutSealImage(account);
    expect(r).not.toHaveProperty("sealImageUrl");
    expect(r.hasSealImage).toBe(true);
    expect(r.companyName).toBe("自社");
  });

  test("印影なしは hasSealImage=false", () => {
    expect(withoutSealImage({ ...account, sealImageUrl: null }).hasSealImage).toBe(false);
    expect(withoutSealImage({ ...account, sealImageUrl: "" }).hasSealImage).toBe(false);
  });
});

describe("redactFullInvoice", () => {
  test("account の印影だけを外し、他はそのまま", () => {
    const full = { invoice: { x: 1 }, customer: null, account } as unknown as FullInvoice;
    const r = redactFullInvoice(full);
    expect(JSON.stringify(r).length).toBeLessThan(1000);
    expect(r.invoice).toBe(full.invoice);
    expect(r.account?.hasSealImage).toBe(true);
  });

  test("account が null でも落ちない", () => {
    const full = { invoice: {}, customer: null, account: null } as unknown as FullInvoice;
    expect(redactFullInvoice(full).account).toBeNull();
  });
});
