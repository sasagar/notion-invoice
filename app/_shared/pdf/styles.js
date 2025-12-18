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

// 共通スタイル（元のHTML/CSSテンプレートを再現）
export const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansJP',
    fontSize: 12,
    padding: 30,
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
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 700,
  },
  headerInfo: {
    textAlign: 'right',
    fontSize: 12,
  },
  // メインコンテンツエリア
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 32,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    width: 180,
  },
  // 顧客情報
  customerName: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 8,
  },
  customerInfo: {
    fontSize: 12,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  // 二重線ボックス（double-border）
  doubleBox: {
    position: 'relative',
    padding: 16,
    borderWidth: 1,
    borderColor: colors.kentBlue400,
    marginTop: 4,
  },
  doubleBoxInner: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    borderWidth: 1,
    borderColor: colors.kentBlue300,
  },
  // 請求額ボックス
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'baseline',
    gap: 40,
    borderBottomWidth: 2,
    borderBottomColor: colors.kentBlue500,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  amountLabel: {
    fontSize: 20,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: 700,
  },
  dueRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'baseline',
    gap: 40,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dueLabel: {
    fontSize: 18,
  },
  dueValue: {
    fontSize: 18,
    fontWeight: 700,
  },
  // 自社情報
  companySection: {
    flexDirection: 'row',
    gap: 8,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 4,
  },
  companyInfo: {
    fontSize: 12,
    marginBottom: 2,
  },
  sealImage: {
    width: 80,
    height: 80,
  },
  // 振込先ボックス
  bankBox: {
    position: 'relative',
    padding: 16,
    borderWidth: 1,
    borderColor: colors.kentBlue400,
    marginTop: 12,
  },
  bankTitle: {
    fontSize: 18,
    fontWeight: 700,
    borderBottomWidth: 2,
    borderBottomColor: colors.kentBlue500,
    marginBottom: 8,
    paddingBottom: 4,
  },
  bankInfo: {
    fontSize: 12,
  },
  // セクションタイトル（border-b-2）
  sectionTitle: {
    fontSize: 24,
    fontWeight: 700,
    borderBottomWidth: 2,
    borderBottomColor: colors.kentBlue500,
    paddingVertical: 12,
    marginBottom: 12,
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
    padding: 8,
    fontSize: 12,
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
    padding: 8,
    fontSize: 12,
  },
  tableCellRight: {
    padding: 8,
    fontSize: 12,
    textAlign: 'right',
  },
  tableCellCenter: {
    padding: 8,
    fontSize: 12,
    textAlign: 'center',
  },
  tableFooter: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: colors.kentBlue300,
  },
  tableFooterCell: {
    padding: 8,
    fontSize: 12,
    fontWeight: 700,
  },
  tableFooterValue: {
    padding: 8,
    fontSize: 24,
    fontWeight: 700,
    textAlign: 'right',
  },
  // 税金セクション（border-b-2）
  taxSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 32,
    paddingVertical: 16,
    marginHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.kentBlue500,
  },
  taxTable: {
    flex: 1,
  },
  taxTableTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 8,
  },
  // フッターセクション（border-b-[5mm]）
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 32,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 14, // 5mm ≈ 14pt
    borderBottomColor: colors.kentBlue500,
  },
  footerLeft: {
    flex: 1,
  },
  // 備考ボックス
  noteBox: {
    position: 'relative',
    padding: 16,
    borderWidth: 1,
    borderColor: colors.kentBlue400,
    flex: 1,
    marginVertical: 12,
  },
  noteTitle: {
    fontSize: 12,
    fontWeight: 700,
    borderBottomWidth: 2,
    borderBottomColor: colors.kentBlue500,
    marginBottom: 8,
    paddingBottom: 4,
  },
  noteText: {
    fontSize: 12,
  },
  // 請求明細セクション
  detailSection: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
});

export default styles;
