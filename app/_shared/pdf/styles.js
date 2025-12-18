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

// Kent Blue カラーパレット
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

// 共通スタイル
export const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansJP',
    fontSize: 10,
    padding: 30,
    color: colors.kentBlue800,
  },
  // ヘッダーセクション
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 5,
    borderBottomWidth: 2,
    borderColor: colors.kentBlue500,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 700,
  },
  headerInfo: {
    textAlign: 'right',
    fontSize: 9,
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
    width: 200,
  },
  // 顧客情報
  customerName: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 4,
  },
  customerInfo: {
    fontSize: 9,
    marginBottom: 8,
  },
  // 請求額ボックス
  amountBox: {
    borderWidth: 1,
    borderColor: colors.kentBlue400,
    padding: 8,
    marginTop: 16,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'baseline',
    gap: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.kentBlue500,
    paddingVertical: 6,
  },
  amountLabel: {
    fontSize: 14,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: 700,
  },
  dueRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'baseline',
    gap: 16,
    paddingVertical: 6,
  },
  // 自社情報
  companyName: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 4,
  },
  companyInfo: {
    fontSize: 9,
  },
  sealImage: {
    width: 60,
    height: 60,
  },
  // 振込先
  bankBox: {
    borderWidth: 1,
    borderColor: colors.kentBlue400,
    padding: 8,
    marginTop: 12,
  },
  bankTitle: {
    fontSize: 12,
    fontWeight: 700,
    borderBottomWidth: 2,
    borderBottomColor: colors.kentBlue500,
    marginBottom: 6,
    paddingBottom: 4,
  },
  bankInfo: {
    fontSize: 9,
  },
  // セクションタイトル
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    borderBottomWidth: 2,
    borderBottomColor: colors.kentBlue500,
    paddingVertical: 8,
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
    backgroundColor: colors.kentBlue50,
  },
  tableHeaderCell: {
    padding: 6,
    fontSize: 9,
    fontWeight: 700,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.kentBlue300,
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
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.kentBlue300,
    backgroundColor: colors.kentBlue50,
  },
  tableFooterCell: {
    padding: 6,
    fontSize: 9,
    fontWeight: 700,
  },
  tableFooterValue: {
    padding: 6,
    fontSize: 14,
    fontWeight: 700,
    textAlign: 'right',
  },
  // 税金テーブル
  taxSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 24,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.kentBlue500,
  },
  taxTable: {
    flex: 1,
  },
  // 備考
  noteBox: {
    borderWidth: 1,
    borderColor: colors.kentBlue400,
    padding: 8,
    flex: 1,
  },
  noteTitle: {
    fontSize: 10,
    fontWeight: 700,
    borderBottomWidth: 2,
    borderBottomColor: colors.kentBlue500,
    marginBottom: 6,
    paddingBottom: 4,
  },
  noteText: {
    fontSize: 9,
  },
  // 下部ボーダー
  bottomBorder: {
    borderBottomWidth: 5,
    borderBottomColor: colors.kentBlue500,
    paddingBottom: 12,
  },
  // フッター
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 24,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
});

export default styles;
