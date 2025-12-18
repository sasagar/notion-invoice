import { StyleSheet, Font } from '@react-pdf/renderer';

// 日本語フォント登録（Google Fonts - Noto Sans JP）
Font.register({
  family: 'NotoSansJP',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/notosansjp/v55/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj75s.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/notosansjp/v55/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFPYk75s.ttf',
      fontWeight: 700,
    },
  ],
});

// Kent Blue カラーパレット（元のCSSと同じ）
export const colors = {
  kentBlue50: '#f0f6fa',
  kentBlue100: '#dce8f2',
  kentBlue200: '#afc7e0',
  kentBlue300: '#85a2cc',
  kentBlue400: '#425fa8',
  kentBlue500: '#112382',
  kentBlue600: '#0e1f75',
  kentBlue700: '#0a1761',
  kentBlue800: '#06104f',
  kentBlue900: '#040a3b',
  kentBlue950: '#020526',
};

// 元のCSS: font-size: 12px, margin: 10mm
// @react-pdf: 1pt ≈ 1.333px, 1mm ≈ 2.83pt
// 12px ≈ 9pt
export const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansJP',
    fontSize: 9, // 12px ≈ 9pt
    padding: 28, // 10mm ≈ 28pt
    color: colors.kentBlue800,
  },
  // ヘッダーセクション（border-t-[5mm] border-b-[2mm]）
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 14, // 5mm ≈ 14pt
    borderBottomWidth: 6, // 2mm ≈ 6pt
    borderTopColor: colors.kentBlue500,
    borderBottomColor: colors.kentBlue500,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22, // text-3xl ≈ 30px ≈ 22pt
    fontWeight: 700,
  },
  headerInfo: {
    textAlign: 'right',
    fontSize: 9, // text-sm ≈ 14px
  },
  // メインコンテンツエリア
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 24,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    width: 160,
  },
  // 顧客情報
  customerName: {
    fontSize: 13, // text-lg ≈ 18px ≈ 13pt
    fontWeight: 700,
    marginBottom: 6,
  },
  customerInfo: {
    fontSize: 9,
    marginBottom: 3,
  },
  greeting: {
    fontSize: 9,
    marginTop: 18,
    marginBottom: 12,
  },
  // 二重線ボックス（double-border）
  doubleBox: {
    position: 'relative',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.kentBlue400,
    marginTop: 4,
  },
  // 請求額ボックス
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'baseline',
    gap: 30,
    borderBottomWidth: 2,
    borderBottomColor: colors.kentBlue500,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  amountLabel: {
    fontSize: 15, // text-xl
  },
  amountValue: {
    fontSize: 18, // text-2xl
    fontWeight: 700,
  },
  dueRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'baseline',
    gap: 30,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  dueLabel: {
    fontSize: 13, // text-lg
  },
  dueValue: {
    fontSize: 13,
    fontWeight: 700,
  },
  // 自社情報
  companySection: {
    flexDirection: 'row',
    gap: 6,
  },
  companyName: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 3,
  },
  companyInfo: {
    fontSize: 9,
    marginBottom: 2,
  },
  sealImage: {
    width: 56,
    height: 56,
  },
  // 振込先ボックス
  bankBox: {
    position: 'relative',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.kentBlue400,
    marginTop: 9,
  },
  bankTitle: {
    fontSize: 13,
    fontWeight: 700,
    borderBottomWidth: 2,
    borderBottomColor: colors.kentBlue500,
    marginBottom: 6,
    paddingBottom: 3,
  },
  bankInfo: {
    fontSize: 9,
  },
  // セクションタイトル（border-b-2）
  sectionTitle: {
    fontSize: 18, // text-2xl
    fontWeight: 700,
    borderBottomWidth: 2,
    borderBottomColor: colors.kentBlue500,
    paddingVertical: 9,
    marginBottom: 9,
  },
  // テーブル
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.kentBlue300,
  },
  tableHeaderCell: {
    padding: 6,
    fontSize: 9,
    fontWeight: 700,
    textAlign: 'center',
  },
  tableBody: {
    borderBottomWidth: 2,
    borderBottomColor: colors.kentBlue300,
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.kentBlue300,
  },
  tableCell: {
    padding: 6,
    fontSize: 9,
  },
  tableCellRight: {
    padding: 6,
    fontSize: 9,
    textAlign: 'right',
  },
  tableCellCenter: {
    padding: 6,
    fontSize: 9,
    textAlign: 'center',
  },
  tableFooter: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: colors.kentBlue300,
  },
  tableFooterCell: {
    padding: 6,
    fontSize: 9,
    fontWeight: 700,
  },
  tableFooterValue: {
    padding: 6,
    fontSize: 18, // text-2xl
    fontWeight: 700,
    textAlign: 'right',
  },
  // 税金セクション（border-b-2）
  taxSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 24,
    paddingVertical: 12,
    marginHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.kentBlue500,
  },
  taxTable: {
    flex: 1,
  },
  taxTableTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 6,
  },
  // フッターセクション（border-b-[5mm]）
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 24,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 14, // 5mm ≈ 14pt
    borderBottomColor: colors.kentBlue500,
  },
  footerLeft: {
    flex: 1,
  },
  // 備考ボックス
  noteBox: {
    position: 'relative',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.kentBlue400,
    flex: 1,
    marginVertical: 9,
  },
  noteTitle: {
    fontSize: 9,
    fontWeight: 700,
    borderBottomWidth: 2,
    borderBottomColor: colors.kentBlue500,
    marginBottom: 6,
    paddingBottom: 3,
  },
  noteText: {
    fontSize: 9,
  },
  // 請求明細セクション
  detailSection: {
    paddingBottom: 12,
    paddingHorizontal: 12,
  },
});

export default styles;
