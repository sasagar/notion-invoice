import { describe, expect, test } from "vitest";
import { computeTotals, roundAmount, withholdingTax } from "@/lib/money/sanitizer";

const row = (a: Partial<import("@/lib/money/sanitizer").LineAmounts>) => ({
  amount10: 0,
  amount8: 0,
  amount0: 0,
  subtotal: 0,
  ...a,
});

describe("roundAmount", () => {
  test("四捨五入・0から離れる方向", () => {
    expect(roundAmount(1.4)).toBe(1);
    expect(roundAmount(1.5)).toBe(2);
    expect(roundAmount(2.5)).toBe(3);
    expect(roundAmount(-1.5)).toBe(-2);
    expect(roundAmount(-2.5)).toBe(-3);
    expect(roundAmount(0)).toBe(0);
    expect(roundAmount(Number.NaN)).toBe(0);
  });
});

describe("computeTotals（旧invoiceSanitizerと一致）", () => {
  test("A: 外税10%・源泉なし", () => {
    const t = computeTotals({
      rows: [row({ amount10: 10000, subtotal: 10000 })],
      taxIncluded: false,
      withholdingExempt: true,
    });
    expect(t).toEqual({
      sum10: 10000,
      sum8: 0,
      sum0: 0,
      tax10: 1000,
      tax8: 0,
      tax: 1000,
      sum: 10000,
      withholding: 0,
      invoiceSum: 11000,
    });
  });

  test("B: 外税10%・源泉あり", () => {
    const t = computeTotals({
      rows: [row({ amount10: 100000, subtotal: 100000 })],
      taxIncluded: false,
      withholdingExempt: false,
    });
    expect(t.tax10).toBe(10000);
    expect(t.withholding).toBe(-10210);
    expect(t.invoiceSum).toBe(99790);
  });

  test("C: 内税10%・源泉なし", () => {
    const t = computeTotals({
      rows: [row({ amount10: 11000, subtotal: 11000 })],
      taxIncluded: true,
      withholdingExempt: true,
    });
    expect(t.tax10).toBe(1000);
    expect(t.sum).toBe(11000);
    expect(t.invoiceSum).toBe(11000);
  });

  test("D: 内税10%・源泉あり（110000/1.1 の浮動小数誤差で 1 円ずれない）", () => {
    // 110000/1.1 は JS で 99999.999… になる。整数比で計算して税抜 100000 を保つ。
    const t = computeTotals({
      rows: [row({ amount10: 110000, subtotal: 110000 })],
      taxIncluded: true,
      withholdingExempt: false,
    });
    expect(t.tax10).toBe(10000);
    expect(t.withholding).toBe(-10210);
    expect(t.invoiceSum).toBe(99790);
  });

  test("D2: 内税の税抜額は整数演算（BigInt）の floor(x*10/11)・floor(x*100/108) と全額で一致", () => {
    for (let x = 1; x <= 300_000; x++) {
      const t10 = computeTotals({
        rows: [row({ amount10: x, subtotal: x })],
        taxIncluded: true,
        withholdingExempt: true,
      });
      const t8 = computeTotals({
        rows: [row({ amount8: x, subtotal: x })],
        taxIncluded: true,
        withholdingExempt: true,
      });
      const n = BigInt(x);
      if (x - t10.tax10 !== Number((n * 10n) / 11n) || x - t8.tax8 !== Number((n * 100n) / 108n)) {
        throw new Error(`mismatch at ${x}`);
      }
    }
  });

  test("E: 外税8%", () => {
    const t = computeTotals({
      rows: [row({ amount8: 10000, subtotal: 10000 })],
      taxIncluded: false,
      withholdingExempt: true,
    });
    expect(t.tax8).toBe(800);
    expect(t.invoiceSum).toBe(10800);
  });

  test("F: 非課税+値引き+小数丸め・外税・源泉あり", () => {
    const t = computeTotals({
      rows: [
        row({ amount0: 5000, subtotal: 5000 }),
        row({ amount10: 3333.4, subtotal: 3333.4 }),
        row({ amount10: -1000, subtotal: -1000 }),
      ],
      taxIncluded: false,
      withholdingExempt: false,
    });
    expect(t.sum0).toBe(5000);
    expect(t.sum10).toBe(2333); // round(3333.4)+round(-1000)=3333-1000
    expect(t.sum).toBe(7333); // 5000+3333-1000
    expect(t.tax10).toBe(233); // floor(2333*0.1)
    expect(t.withholding).toBe(-238); // floor(2333*0.1021)*-1
    expect(t.invoiceSum).toBe(7328); // 7333+233+0-238
  });
});

describe("roundAmount の丸め方式", () => {
  test("floor: 絶対値の切り捨て（負数は0方向へ対称）", () => {
    expect(roundAmount(1000.9, "floor")).toBe(1000);
    expect(roundAmount(1000.1, "floor")).toBe(1000);
    expect(roundAmount(-1000.9, "floor")).toBe(-1000);
  });

  test("ceil: 絶対値の切り上げ（負数は0から遠ざかる方向へ対称）", () => {
    expect(roundAmount(1000.1, "ceil")).toBe(1001);
    expect(roundAmount(-1000.1, "ceil")).toBe(-1001);
    expect(roundAmount(1000, "ceil")).toBe(1000);
  });

  test("round: 既定（従来挙動と同一）", () => {
    expect(roundAmount(1000.5)).toBe(1001);
    expect(roundAmount(-1000.5)).toBe(-1001);
    expect(roundAmount(1000.5, "round")).toBe(roundAmount(1000.5));
  });
});

describe("computeTotals の丸め方式", () => {
  const rows = [
    row({ amount10: 1000.5, subtotal: 1000.5 }),
    row({ amount10: 2000.4, subtotal: 2000.4 }),
  ];

  test("rounding 省略時は四捨五入（従来挙動）", () => {
    const t = computeTotals({ rows, taxIncluded: false, withholdingExempt: true });
    expect(t.sum).toBe(3001 + 0); // round(1000.5)=1001, round(2000.4)=2000
    expect(t.sum10).toBe(3001);
  });

  test("floor 指定で行ごとに切り捨ててから合算", () => {
    const t = computeTotals({
      rows,
      taxIncluded: false,
      withholdingExempt: true,
      rounding: "floor",
    });
    expect(t.sum10).toBe(3000); // 1000+2000
    expect(t.invoiceSum).toBe(3000 + 300); // +floor(3000*0.1)
  });

  test("ceil 指定で行ごとに切り上げてから合算", () => {
    const t = computeTotals({
      rows,
      taxIncluded: false,
      withholdingExempt: true,
      rounding: "ceil",
    });
    expect(t.sum10).toBe(3002); // 1001+2001
    expect(t.invoiceSum).toBe(3002 + 300); // +floor(3002*0.1)
  });
});

describe("computeTotals の行別丸め（行の上書き→請求書既定の順で解決）", () => {
  test("行に rounding があれば請求書既定より優先される", () => {
    const t = computeTotals({
      rows: [
        { ...row({ amount10: 1000.9, subtotal: 1000.9 }), rounding: "floor" },
        { ...row({ amount10: 2000.1, subtotal: 2000.1 }), rounding: "ceil" },
      ],
      taxIncluded: false,
      withholdingExempt: true,
      rounding: "round", // 既定は四捨五入だが行の上書きが勝つ
    });
    expect(t.sum10).toBe(1000 + 2001); // floor(1000.9)+ceil(2000.1)
    expect(t.sum).toBe(3001);
  });

  test("行に rounding が無ければ請求書既定（input.rounding）を継承", () => {
    const t = computeTotals({
      rows: [
        row({ amount10: 1000.9, subtotal: 1000.9 }), // 継承 → floor
        { ...row({ amount10: 2000.9, subtotal: 2000.9 }), rounding: "round" }, // 上書き
      ],
      taxIncluded: false,
      withholdingExempt: true,
      rounding: "floor",
    });
    expect(t.sum10).toBe(1000 + 2001); // floor(1000.9)+round(2000.9)
  });

  test("行別丸めが混在しても行ごとに丸めてから合算する（手計算と一致）", () => {
    const t = computeTotals({
      rows: [
        { ...row({ amount8: 100.4, subtotal: 100.4 }), rounding: "floor" }, // 100
        { ...row({ amount8: 100.4, subtotal: 100.4 }), rounding: "ceil" }, // 101
        row({ amount8: 100.4, subtotal: 100.4 }), // 継承(round) → 100
      ],
      taxIncluded: false,
      withholdingExempt: true,
      rounding: "round",
    });
    expect(t.sum8).toBe(301); // 100+101+100
    expect(t.tax8).toBe(24); // floor(301*0.08)=24
  });
});

describe("withholdingTax（100 万円超は超過分 20.42%）", () => {
  test("100 万円以下は 10.21%（1 円未満切り捨て）", () => {
    expect(withholdingTax(0)).toBe(0);
    expect(withholdingTax(47200)).toBe(4819);
    expect(withholdingTax(1_000_000)).toBe(102100);
  });

  test("100 万円超は 102,100 円 ＋ 超過分の 20.42%", () => {
    expect(withholdingTax(1_000_001)).toBe(102100); // 0.2042 円 → 切り捨て
    expect(withholdingTax(1_000_005)).toBe(102101);
    expect(withholdingTax(1_500_000)).toBe(102100 + 102100);
    expect(withholdingTax(2_000_000)).toBe(306300);
  });

  test("100 万円以下は従来の floor(x * 0.1021) と全額で一致（既存請求書の金額が変わらない）", () => {
    for (let x = 0; x <= 1_000_000; x++) {
      if (withholdingTax(x) !== Math.floor(x * 0.1021)) {
        throw new Error(`mismatch at ${x}`);
      }
    }
  });

  test("computeTotals: 外税 120 万円は税抜 120 万円に対して計算", () => {
    const t = computeTotals({
      rows: [row({ amount10: 1_200_000, subtotal: 1_200_000 })],
      taxIncluded: false,
      withholdingExempt: false,
    });
    expect(t.withholding).toBe(-(102100 + 40840));
    expect(t.invoiceSum).toBe(1_200_000 + 120_000 - 142940);
  });

  test("computeTotals: 内税 132 万円は税抜 120 万円に対して計算", () => {
    const t = computeTotals({
      rows: [row({ amount10: 1_320_000, subtotal: 1_320_000 })],
      taxIncluded: true,
      withholdingExempt: false,
    });
    expect(t.tax10).toBe(120_000);
    expect(t.withholding).toBe(-142940);
  });
});
