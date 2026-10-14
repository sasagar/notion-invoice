/**
 * MCP（AI エージェント）からの書き込みを許すかどうかの方針。
 * 現在は画面と同じく、どの状態の請求書でも AI からの変更を全面的に許可する。
 * 制限が必要になったら、ここで状態遷移ごとに拒否理由を返す。
 */

/**
 * 既存請求書への AI からの変更（内容更新・ステータス変更）を許可するか判定する。
 *
 * @param currentStatus 変更前のステータス（INVOICE_STATUSES のいずれか）
 * @param nextStatus    変更後のステータス（内容更新のみでステータスを変えない場合は currentStatus と同じ）
 * @returns 拒否する場合はその理由（AI にそのまま返る日本語メッセージ）、許可なら null
 */
export function agentWriteDenialReason(_currentStatus: string, _nextStatus: string): string | null {
  // 方針: すべて許可（送付済み・支払い済み・キャンセルを含む）。
  return null;
}
