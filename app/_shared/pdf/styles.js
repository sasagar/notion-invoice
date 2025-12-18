import { StyleSheet, Font } from '@react-pdf/renderer';

// 日本語フォント登録（Google Fonts - M PLUS 1）元のプロジェクトと同じ
Font.register({
  family: 'MPLUS1',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/mplus1/v15/R70EjygA28ymD4HgBUGzkN5Eyoj-WpW5VSa78g.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/mplus1/v15/R70EjygA28ymD4HgBUGzkN5Eyoj-WpW5siG78g.ttf',
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

// 元のCSS: font-size: 12px (root), margin: 10mm
export const styles = StyleSheet.create({
  page: {
    fontFamily: 'MPLUS1',
    fontSize: 9,
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 28,
    color: colors.kentBlue800,
  },
  // ヘッダーセクション（border-t-[5mm] border-b-[2mm]）
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 14,
    borderBottomWidth: 6,
    borderTopColor: colors.kentBlue500,
    borderBottomColor: colors.kentBlue500,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 700,
  },
  headerInfo: {
    textAlign: 'right',
    fontSize: 10,
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
    minWidth: 170,
  },
  // 顧客情報（mb-6）
  customerSection: {
    marginBottom: 18,
  },
  customerName: {
    fontSize: 13,
    fontWeight: 700,
  },
  customerInfo: {
    fontSize: 9,
  },
  // 挨拶文（mb-6）
  greetingSection: {
    marginBottom: 18,
  },
  greeting: {
    fontSize: 9,
  },
  // 二重線ボックス（double-border）- 相対位置で疑似的に再現
  doubleBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: colors.kentBlue400,
  },
  doubleBoxOuter: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: 3,
    bottom: 3,
    borderWidth: 1,
    borderColor: colors.kentBlue300,
  },
  // 請求額ボックス内部
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
    fontSize: 15,
  },
  amountValue: {
    fontSize: 18,
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
    fontSize: 13,
  },
  dueValue: {
    fontSize: 13,
    fontWeight: 700,
  },
  // 自社情報セクション（flex gap-2）
  companySection: {
    flexDirection: 'row',
    gap: 6,
  },
  companyName: {
    fontSize: 13,
    fontWeight: 700,
  },
  companyInfo: {
    fontSize: 9,
  },
  registrationNumber: {
    fontSize: 9,
  },
  sealImage: {
    width: 56,
    height: 56,
  },
  // 振込先ボックス（double-border my-3）
  bankBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: colors.kentBlue400,
    marginVertical: 9,
  },
  bankTitle: {
    fontSize: 13,
    fontWeight: 700,
    borderBottomWidth: 2,
    borderBottomColor: colors.kentBlue500,
    marginBottom: 6,
  },
  bankInfo: {
    fontSize: 9,
  },
  // セクションタイトル（text-2xl font-bold mb-3 border-b-2 py-3）
  sectionTitle: {
    fontSize: 18,
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
    paddingHorizontal: 9,
    paddingVertical: 6,
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
    paddingHorizontal: 9,
    paddingVertical: 6,
    fontSize: 9,
  },
  tableCellRight: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    fontSize: 9,
    textAlign: 'right',
  },
  tableCellCenter: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    fontSize: 9,
    textAlign: 'center',
  },
  tableFooter: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: colors.kentBlue300,
  },
  tableFooterCell: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    fontSize: 9,
    fontWeight: 700,
  },
  tableFooterValue: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    fontSize: 18,
    fontWeight: 700,
    textAlign: 'right',
  },
  // 税金セクション（py-4 mx-4 border-b-2）
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
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 6,
  },
  // フッターセクション（py-4 px-4 border-b-[5mm]）
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 24,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 14,
    borderBottomColor: colors.kentBlue500,
  },
  footerLeft: {
    flex: 1,
  },
  // 備考ボックス（double-border my-3 flex-1）
  noteBox: {
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
  },
  noteText: {
    fontSize: 9,
  },
  // 請求明細セクション（pb-4 px-4）
  detailSection: {
    paddingBottom: 12,
    paddingHorizontal: 12,
  },
});

export default styles;
