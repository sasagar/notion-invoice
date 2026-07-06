import { describe, expect, test } from "vitest";
import { splitForWrap } from "@/components/status-stamp";

describe("splitForWrap", () => {
  test("既知の語尾(済み/済/予定/中)の直前で区切る", () => {
    expect(splitForWrap("見積送付済み")).toEqual(["見積送付", "済み"]);
    expect(splitForWrap("請求書送付済み")).toEqual(["請求書送付", "済み"]);
    expect(splitForWrap("支払済み")).toEqual(["支払", "済み"]);
    expect(splitForWrap("入金確認中")).toEqual(["入金確認", "中"]);
  });

  test("短い文字列(4文字未満)で語尾が無ければ区切らない", () => {
    expect(splitForWrap("ドラフト")).toEqual(["ドラフト", null]);
  });

  test("語尾が無い長い文字列は中央で区切る", () => {
    expect(splitForWrap("検収完了確認")).toEqual(["検収完", "了確認"]);
  });

  test("語尾一致だけで先頭が空になる場合は区切らない", () => {
    expect(splitForWrap("済み")).toEqual(["済み", null]);
  });
});
