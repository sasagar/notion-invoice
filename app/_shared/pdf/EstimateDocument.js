import { Document, Page, View, Text, Image } from '@react-pdf/renderer';
import { styles, colors } from './styles';

const EstimateDocument = ({
  sanitizedInvoice,
  customer,
  account,
  rows,
  dateFormat,
  plain_text,
}) => {
  return (
    <Document>
      <Page size='A4' style={styles.page}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>見積書</Text>
          <View style={styles.headerInfo}>
            <Text>#ES-{sanitizedInvoice.id}</Text>
            <Text>発行日: {dateFormat(sanitizedInvoice.created_at)}</Text>
          </View>
        </View>

        {/* メインコンテンツ */}
        <View style={styles.mainContent}>
          {/* 左カラム - 顧客情報 */}
          <View style={styles.leftColumn}>
            <Text style={styles.customerName}>
              {plain_text(customer.properties['社名/個人名'])}{' '}
              {plain_text(customer.properties.敬称)}
            </Text>

            {/* 顧客住所 */}
            {customer.properties.住所 && plain_text(customer.properties.住所) && (
              <Text style={styles.customerInfo}>
                {plain_text(customer.properties.住所)}
              </Text>
            )}

            {/* 担当者 */}
            {customer.properties.担当者名 &&
              plain_text(customer.properties.担当者名) && (
                <Text style={styles.customerInfo}>
                  担当: {plain_text(customer.properties.担当者名)}
                </Text>
              )}

            <Text style={{ fontSize: 9, marginTop: 12, marginBottom: 12 }}>
              お世話になっております。下記の通りお見積もりいたします。
            </Text>

            {/* 見積額ボックス */}
            <View style={styles.amountBox}>
              <View style={[styles.amountRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.amountLabel}>御見積額</Text>
                <Text style={styles.amountValue}>
                  ¥ {sanitizedInvoice.invoice_sum.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          {/* 右カラム - 自社情報 */}
          <View style={styles.rightColumn}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.companyName}>
                  {plain_text(account.properties.会社名)}
                </Text>
                <Text style={styles.companyInfo}>
                  {plain_text(account.properties.住所)}
                </Text>
                <Text style={styles.companyInfo}>
                  {plain_text(account.properties.担当者名)}
                </Text>
              </View>
              {account.properties.印鑑画像?.files?.[0]?.file?.url && (
                <Image
                  src={account.properties.印鑑画像.files[0].file.url}
                  style={styles.sealImage}
                />
              )}
            </View>
          </View>
        </View>

        {/* 見積明細 */}
        <View style={{ paddingHorizontal: 12, marginBottom: 12 }}>
          <Text style={styles.sectionTitle}>見積明細</Text>
          <View style={styles.table}>
            {/* ヘッダー */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 3 }]}>項目</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>
                単価{sanitizedInvoice.tax_incl ? '\n\n(税込)' : ''}
              </Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>数量</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>
                小計{sanitizedInvoice.tax_incl ? '\n\n(税込)' : ''}
              </Text>
              <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}>税率</Text>
            </View>
            {/* 行 */}
            {rows.map((row, index) => {
              const subtotal = row.properties.小計.formula.number;

              return (
                <View style={styles.tableRow} key={index}>
                  <Text style={[styles.tableCell, { flex: 3 }]}>
                    {plain_text(row.properties.名前)}
                  </Text>
                  <Text style={[styles.tableCellRight, { flex: 1 }]}>
                    ¥{' '}
                    {row.properties.単価.rollup.array[0].number.toLocaleString()}
                  </Text>
                  <Text style={[styles.tableCellRight, { flex: 1 }]}>
                    {row.properties.数量.number.toLocaleString()}{' '}
                    {plain_text(row.properties.単位)}
                  </Text>
                  <Text style={[styles.tableCellRight, { flex: 1 }]}>
                    ¥ {subtotal.toLocaleString()}
                  </Text>
                  <Text style={[styles.tableCellCenter, { flex: 0.5 }]}>
                    {plain_text(row.properties.税率)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 消費税・源泉徴収セクション */}
        <View style={styles.taxSection}>
          {/* 消費税テーブル */}
          <View style={styles.taxTable}>
            <Text style={{ fontSize: 10, fontWeight: 700, marginBottom: 6 }}>
              消費税
            </Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { flex: 2 }]}>項目</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>
                  対象額{sanitizedInvoice.tax_incl ? '\n\n(税込)' : ''}
                </Text>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>
                  {sanitizedInvoice.tax_incl ? '\n\n内税額' : '税額'}
                </Text>
              </View>
              {sanitizedInvoice.tax10 > 0 && (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    消費税（10%）
                  </Text>
                  <Text style={[styles.tableCellRight, { flex: 1 }]}>
                    ¥ {sanitizedInvoice.tax10.toLocaleString()}
                  </Text>
                  <Text style={[styles.tableCellRight, { flex: 1 }]}>
                    {sanitizedInvoice.tax_incl ? '\n\n(' : ''}¥{' '}
                    {Math.round(
                      sanitizedInvoice.tax10 -
                        sanitizedInvoice.tax10 / 1.1,
                    ).toLocaleString()}
                    {sanitizedInvoice.tax_incl ? '\n\n)' : ''}
                  </Text>
                </View>
              )}
              {sanitizedInvoice.tax8 > 0 && (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    消費税（8%）
                  </Text>
                  <Text style={[styles.tableCellRight, { flex: 1 }]}>
                    ¥ {sanitizedInvoice.tax8.toLocaleString()}
                  </Text>
                  <Text style={[styles.tableCellRight, { flex: 1 }]}>
                    {sanitizedInvoice.tax_incl ? '\n\n(' : ''}¥{' '}
                    {Math.round(
                      sanitizedInvoice.tax8 -
                        sanitizedInvoice.tax8 / 1.08,
                    ).toLocaleString()}
                    {sanitizedInvoice.tax_incl ? '\n\n)' : ''}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* 源泉徴収テーブル */}
          {sanitizedInvoice.withholding !== 0 && (
            <View style={styles.taxTable}>
              <Text style={{ fontSize: 10, fontWeight: 700, marginBottom: 6 }}>
                源泉徴収
              </Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, { flex: 2 }]}>項目</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>金額</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    源泉徴収額（10.21%）
                  </Text>
                  <Text style={[styles.tableCellRight, { flex: 1 }]}>
                    ▲ ¥ {Math.abs(sanitizedInvoice.withholding).toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* 見積額・備考 */}
        <View style={[styles.footer, styles.bottomBorder]}>
          {/* 見積額テーブル */}
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>見積額</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { flex: 2 }]}>項目</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>小計</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>見積額</Text>
                <Text style={[styles.tableCellRight, { flex: 1 }]}>
                  ¥ {sanitizedInvoice.sum.toLocaleString()}
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>
                  消費税{sanitizedInvoice.tax_incl ? '\n\n(内税額)' : ''}
                </Text>
                <Text style={[styles.tableCellRight, { flex: 1 }]}>
                  {sanitizedInvoice.tax_incl ? '\n\n(' : ''}¥{' '}
                  {sanitizedInvoice.tax.toLocaleString()}
                  {sanitizedInvoice.tax_incl ? '\n\n)' : ''}
                </Text>
              </View>
              {sanitizedInvoice.withholding !== 0 && (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>源泉徴収額</Text>
                  <Text style={[styles.tableCellRight, { flex: 1 }]}>
                    ▲ ¥{' '}
                    {Math.abs(sanitizedInvoice.withholding).toLocaleString()}
                  </Text>
                </View>
              )}
              <View style={styles.tableFooter}>
                <Text style={[styles.tableFooterCell, { flex: 2 }]}>
                  見積額合計
                </Text>
                <Text style={[styles.tableFooterValue, { flex: 1 }]}>
                  ¥ {sanitizedInvoice.invoice_sum.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          {/* 備考 */}
          <View style={styles.noteBox}>
            <Text style={styles.noteTitle}>備考</Text>
            <Text style={styles.noteText}>
              {sanitizedInvoice.note}
              {sanitizedInvoice.tax_incl
                ? '\n\nこの見積書は内税にて計算をしております。'
                : ''}
              
この見積書の有効期限は、発行日より30日です。（期間内の発注を以て有効とするものです。）
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default EstimateDocument;
