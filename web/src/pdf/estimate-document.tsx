import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import { formatDateLong } from "@/lib/format";
import { roundAmount } from "@/lib/money/sanitizer";
import type { Account, Customer, Invoice } from "@/lib/notion/types";
import { formatWithPostalMark, TextWithPostalMark } from "@/pdf/pdf-helpers";
import { styles } from "@/pdf/styles";

const yen = (n: number) => n.toLocaleString("ja-JP");

type Props = {
  invoice: Invoice;
  customer: Customer | null;
  account: Account | null;
};

export function EstimateDocument({ invoice, customer, account }: Props) {
  const { meta, rows, totals } = invoice;
  const incl = meta.taxIncluded;
  const withholdingBase = incl
    ? totals.sum10 + totals.sum8 - totals.tax
    : totals.sum10 + totals.sum8;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>見積書</Text>
          <View style={styles.headerInfo}>
            <Text style={styles.headerInfoText}>#ES-{meta.id}</Text>
            <Text style={styles.headerInfoText}>発行日: {formatDateLong(meta.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.leftColumn}>
            <View style={styles.customerSection}>
              <Text style={styles.customerName}>
                {customer?.companyName ?? ""} {customer?.honorific ?? ""}
              </Text>
              {customer?.companyInfo ? (
                <TextWithPostalMark style={styles.customerInfo}>
                  {formatWithPostalMark(customer.companyInfo)}
                </TextWithPostalMark>
              ) : null}
              {customer?.contactName ? (
                <Text style={styles.customerInfo}>担当: {customer.contactName}</Text>
              ) : null}
            </View>

            <View style={styles.greetingSection}>
              <Text style={styles.greeting}>
                お世話になっております。下記の通りお見積もりいたします。
              </Text>
            </View>

            <View style={styles.doubleBoxWrapper}>
              <View style={styles.doubleBoxOuter} />
              <View style={styles.doubleBoxInner} />
              <View style={styles.doubleBoxContent}>
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>御見積額</Text>
                  <Text style={styles.amountValue}>¥ {yen(totals.invoiceSum)}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.rightColumn}>
            <View style={styles.companySection}>
              <View style={{ flex: 1 }}>
                <Text style={styles.companyName}>{account?.companyName ?? ""}</Text>
                {account?.companyInfo ? (
                  <TextWithPostalMark style={styles.companyInfo}>
                    {formatWithPostalMark(account.companyInfo)}
                  </TextWithPostalMark>
                ) : null}
              </View>
              {account?.sealImageUrl ? (
                <Image src={account.sealImageUrl} style={styles.sealImage} />
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>見積明細</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 3, textAlign: "left" }]}>項目</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>単価{incl ? " (税込)" : ""}</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>数量</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>小計{incl ? " (税込)" : ""}</Text>
              <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}>税率</Text>
            </View>
            <View style={styles.tableBody}>
              {rows.map((row, index) => {
                const subtotal = roundAmount(row.amounts.subtotal);
                return (
                  <View style={styles.tableRow} key={index}>
                    <Text style={[styles.tableCell, { flex: 3 }]}>{row.name}</Text>
                    <Text style={[styles.tableCellRight, { flex: 1 }]}>¥ {yen(row.unitPrice)}</Text>
                    <Text style={[styles.tableCellRight, { flex: 1 }]}>
                      {yen(row.quantity)} {row.unit}
                    </Text>
                    <Text style={[styles.tableCellRight, { flex: 1 }]}>¥ {yen(subtotal)}</Text>
                    <Text style={[styles.tableCellCenter, { flex: 0.5 }]}>{row.taxRate}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.taxSection}>
          {totals.tax !== 0 && (
            <View style={styles.taxTable}>
              <Text style={styles.taxTableTitle}>消費税</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: "left" }]}>項目</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>
                    対象額{incl ? "(税込)" : ""}
                  </Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>
                    {incl ? "内税額" : "税額"}
                  </Text>
                </View>
                <View style={styles.tableBody}>
                  {totals.sum10 !== 0 && (
                    <View style={styles.tableRow}>
                      <Text style={[styles.tableCell, { flex: 2 }]}>消費税（10%）</Text>
                      <Text style={[styles.tableCellRight, { flex: 1 }]}>
                        ¥ {yen(totals.sum10)}
                      </Text>
                      <Text style={[styles.tableCellRight, { flex: 1 }]}>
                        {incl ? "(" : ""}¥ {yen(totals.tax10)}
                        {incl ? ")" : ""}
                      </Text>
                    </View>
                  )}
                  {totals.sum8 !== 0 && (
                    <View style={styles.tableRow}>
                      <Text style={[styles.tableCell, { flex: 2 }]}>消費税（8%）</Text>
                      <Text style={[styles.tableCellRight, { flex: 1 }]}>¥ {yen(totals.sum8)}</Text>
                      <Text style={[styles.tableCellRight, { flex: 1 }]}>
                        {incl ? "(" : ""}¥ {yen(totals.tax8)}
                        {incl ? ")" : ""}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

          {totals.withholding !== 0 && (
            <View style={styles.taxTable}>
              <Text style={styles.taxTableTitle}>源泉徴収</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: "left" }]}>項目</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>対象額(税抜)</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>税額</Text>
                </View>
                <View style={styles.tableBody}>
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 2 }]}>源泉徴収</Text>
                    <Text style={[styles.tableCellRight, { flex: 1 }]}>
                      ¥ {yen(withholdingBase)}
                    </Text>
                    <Text style={[styles.tableCellRight, { flex: 1 }]}>
                      ▲ ¥ {yen(Math.abs(totals.withholding))}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.sectionTitle}>見積額</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: "left" }]}>項目</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>小計</Text>
              </View>
              <View style={styles.tableBody}>
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>見積額</Text>
                  <Text style={[styles.tableCellRight, { flex: 1 }]}>¥ {yen(totals.sum)}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    消費税{incl ? "(内税額)" : ""}
                  </Text>
                  <Text style={[styles.tableCellRight, { flex: 1 }]}>
                    {incl ? "(" : ""}¥ {yen(totals.tax)}
                    {incl ? ")" : ""}
                  </Text>
                </View>
                {totals.withholding !== 0 && (
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 2 }]}>源泉徴収額</Text>
                    <Text style={[styles.tableCellRight, { flex: 1 }]}>
                      ▲ ¥ {yen(Math.abs(totals.withholding))}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.tableFooter}>
                <Text style={[styles.tableFooterCell, { flex: 2, textAlign: "center" }]}>
                  見積額合計
                </Text>
                <Text style={[styles.tableFooterValue, { flex: 1 }]}>
                  ¥ {yen(totals.invoiceSum)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.noteBoxWrapper}>
            <View style={styles.doubleBoxOuter} />
            <View style={styles.doubleBoxInner} />
            <View style={styles.noteBoxContent}>
              <Text style={styles.noteTitle}>備考</Text>
              <Text style={styles.noteText}>
                {meta.note}
                {incl ? "\n\nこの見積書は内税にて計算をしております。" : ""}
                {"\n"}
                この見積書の有効期限は、発行日より30日です。（期間内の発注を以て有効とするものです。）
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
