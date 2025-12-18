import { StyleSheet, Font } from '@react-pdf/renderer';

// 日本語フォント登録（Google Fonts - M PLUS 1）
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

// フォールバックフォント（〒などM PLUS 1に存在しない文字用）
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

// ハイフネーションを完全に無効化
// 全ての単語をそのまま返してハイフンを入れない
// 日本語対応のハイフネーション無効化
// 参考: https://github.com/diegomura/react-pdf/issues/419
Font.registerHyphenationCallback((word) =>
  Array.from(word).flatMap((char) => [char, ''])
);

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

// 単位変換メモ:
// 元CSS: font-size: 12px (root)
// 1rem = 12px = 9pt (12 * 0.75)
// text-sm = 0.875rem = 10.5px ≈ 8pt
// text-lg = 1.125rem = 13.5px ≈ 10pt
// text-xl = 1.25rem = 15px ≈ 11pt
// text-2xl = 1.5rem = 18px ≈ 14pt
// text-3xl = 1.875rem = 22.5px ≈ 17pt
//
// 罫線:
// border (1px) = 0.75pt
// border-2 (2px) = 1.5pt
//
// 5mm ≈ 14pt, 2mm ≈ 6pt, 10mm ≈ 28pt (margin)

export const styles = StyleSheet.create({
  page: {
    fontFamily: 'MPLUS1',
    fontSize: 9, // 12px base
    paddingTop: 28, // 10mm
    paddingBottom: 28,
    paddingHorizontal: 28,
    color: colors.kentBlue800, // body色
  },

  // ヘッダーセクション（border-t-[5mm] border-b-[2mm] py-4 px-4 mb-4）
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 14, // 5mm
    borderBottomWidth: 6, // 2mm
    borderTopColor: colors.kentBlue500,
    borderBottomColor: colors.kentBlue500,
    paddingVertical: 9, // py-4 = 12px
    paddingHorizontal: 9, // px-4 = 12px
    marginBottom: 9, // mb-4
  },
  headerTitle: {
    fontSize: 17, // text-3xl = 22.5px
    fontWeight: 700,
    color: colors.kentBlue800,
  },
  headerInfo: {
    alignItems: 'flex-end', // 右揃え
  },
  headerInfoText: {
    fontSize: 8, // text-sm
    color: colors.kentBlue800,
    textAlign: 'right',
  },

  // メインコンテンツエリア (flex gap-8 py-4 px-4)
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 18, // gap-8 = 24px
    paddingVertical: 9,
    paddingHorizontal: 9,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    width: 220, // min-w-fit相当
  },

  // 顧客情報（mb-6）
  customerSection: {
    marginBottom: 14, // mb-6 = 18px
  },
  customerName: {
    fontSize: 10, // text-lg
    fontWeight: 700,
    color: colors.kentBlue800,
  },
  customerInfo: {
    fontSize: 9,
    color: colors.kentBlue800,
  },

  // 挨拶文セクション（mb-6）
  greetingSection: {
    marginBottom: 14,
  },
  greeting: {
    fontSize: 9,
    color: colors.kentBlue800,
  },

  // 二重線ボックス（double-border）外枠
  // ::before = -top-1 -left-1 (top/left: -4px) border-kent-blue-400
  // ::after = top-1 left-1 (top/left: +4px) border-kent-blue-300
  // @react-pdf/rendererでは擬似要素は使えないため、ネストしたViewで再現
  doubleBoxWrapper: {
    position: 'relative',
    padding: 3, // ::beforeと::afterの差分（4px）
  },
  doubleBoxOuter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 6, // 右と下を6pt内側にずらして外側の線として表現
    bottom: 6,
    borderWidth: 0.75, // 1px
    borderColor: colors.kentBlue400, // ::before
  },
  doubleBoxInner: {
    position: 'absolute',
    top: 6, // 上と左を6ptずらして内側の線として表現
    left: 6,
    right: 0,
    bottom: 0,
    borderWidth: 0.75, // 1px
    borderColor: colors.kentBlue300, // ::after
  },
  doubleBoxContent: {
    padding: 9, // p-4
    position: 'relative',
    zIndex: 1,
  },

  // 請求額ボックス内部
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'baseline',
    gap: 22, // gap-10
    borderBottomWidth: 1.5, // border-2
    borderBottomColor: colors.kentBlue500,
    paddingHorizontal: 7, // px-3
    paddingVertical: 4, // py-2
  },
  amountLabel: {
    fontSize: 11, // text-xl
    color: colors.kentBlue800,
  },
  amountValue: {
    fontSize: 14, // text-2xl
    fontWeight: 700,
    color: colors.kentBlue800,
  },
  dueRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'baseline',
    gap: 22,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  dueLabel: {
    fontSize: 10, // text-lg
    color: colors.kentBlue800,
  },
  dueValue: {
    fontSize: 10,
    fontWeight: 700,
    color: colors.kentBlue800,
  },

  // 自社情報セクション（flex gap-2）
  companySection: {
    flexDirection: 'row',
    gap: 4, // gap-2
  },
  companyName: {
    fontSize: 10, // text-lg
    fontWeight: 700,
    color: colors.kentBlue800,
  },
  companyInfo: {
    fontSize: 9,
    color: colors.kentBlue800,
  },
  registrationNumber: {
    fontSize: 9,
    color: colors.kentBlue800,
  },
  sealImage: {
    width: 60, // w-20 = 80px
    height: 60,
  },

  // 振込先ボックス（double-border my-3）
  bankBoxWrapper: {
    position: 'relative',
    padding: 3,
    marginVertical: 7, // my-3
  },
  bankBoxContent: {
    padding: 9,
    position: 'relative',
    zIndex: 1,
  },
  bankTitle: {
    fontSize: 10, // text-lg
    fontWeight: 700,
    borderBottomWidth: 1.5, // border-2
    borderBottomColor: colors.kentBlue500,
    marginBottom: 4,
    color: colors.kentBlue800,
  },
  bankInfo: {
    fontSize: 9,
    color: colors.kentBlue800,
  },

  // セクションタイトル（text-2xl font-bold mb-3 border-b-2 py-3）
  sectionTitle: {
    fontSize: 14, // text-2xl
    fontWeight: 700,
    borderBottomWidth: 1.5, // border-2
    borderBottomColor: colors.kentBlue500,
    paddingVertical: 7, // py-3
    marginBottom: 7, // mb-3
    color: colors.kentBlue800,
  },

  // テーブル
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    borderTopWidth: 1, // border-2 を細くする
    borderBottomWidth: 1,
    borderColor: colors.kentBlue300,
  },
  tableHeaderCell: {
    paddingHorizontal: 7, // px-3
    paddingVertical: 4, // py-2
    fontSize: 9,
    fontWeight: 700,
    textAlign: 'center',
    color: colors.kentBlue800,
  },
  tableHeaderCellLeft: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    fontSize: 9,
    fontWeight: 700,
    textAlign: 'left',
    color: colors.kentBlue800,
  },
  tableBody: {
    borderBottomWidth: 1, // border-2 を細くする
    borderBottomColor: colors.kentBlue300,
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: 0.5, // border = 1px をさらに細く
    borderBottomWidth: 0.5,
    borderColor: colors.kentBlue300,
  },
  tableCell: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    fontSize: 9,
    textAlign: 'left',
    color: colors.kentBlue800,
  },
  tableCellRight: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    fontSize: 9,
    textAlign: 'right',
    color: colors.kentBlue800,
  },
  tableCellCenter: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    fontSize: 9,
    textAlign: 'center',
    color: colors.kentBlue800,
  },
  tableFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: 1, // border-2 を細くする
    borderBottomColor: colors.kentBlue300,
  },
  tableFooterCell: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    fontSize: 9,
    fontWeight: 700,
    textAlign: 'left',
    color: colors.kentBlue800,
  },
  tableFooterValue: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    fontSize: 14, // text-2xl
    fontWeight: 700,
    textAlign: 'right',
    color: colors.kentBlue800,
  },

  // 税金セクション（py-4 mx-4 border-b-2）
  taxSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 18,
    paddingVertical: 9,
    marginHorizontal: 9,
    borderBottomWidth: 1.5, // border-2
    borderBottomColor: colors.kentBlue500,
  },
  taxTable: {
    flex: 1,
  },
  taxTableTitle: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 4,
    color: colors.kentBlue800,
  },

  // フッターセクション（py-4 px-4 border-b-[5mm]）
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 18,
    paddingVertical: 9,
    paddingHorizontal: 9,
    borderBottomWidth: 14, // 5mm
    borderBottomColor: colors.kentBlue500,
  },
  footerLeft: {
    flex: 1,
  },

  // 備考ボックス（double-border my-3 flex-1）
  noteBoxWrapper: {
    position: 'relative',
    padding: 3,
    marginVertical: 7,
    flex: 1,
  },
  noteBoxContent: {
    padding: 9,
    position: 'relative',
    zIndex: 1,
  },
  noteTitle: {
    fontSize: 9,
    fontWeight: 700,
    borderBottomWidth: 1.5, // border-2
    borderBottomColor: colors.kentBlue500,
    marginBottom: 4,
    color: colors.kentBlue800,
  },
  noteText: {
    fontSize: 9,
    color: colors.kentBlue800,
  },

  // 請求明細セクション（pb-4 px-4）
  detailSection: {
    paddingBottom: 9,
    paddingHorizontal: 9,
  },
});

export default styles;
