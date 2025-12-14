import puppeteer from 'puppeteer';

/**
 * Puppeteerを使用してPDFを生成する
 * @param {string} host - ホスト名
 * @param {string} printPath - 印刷ページのパス（例: 'invoice/123' or 'estimate/123'）
 * @returns {Promise<Buffer>} PDF データ
 */
export const generatePdf = async (host, printPath) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    page.setExtraHTTPHeaders({
      bktsk_notion_invoice: process.env.PUPPETEER_API_KEY,
    });
    await page.goto(`http://${host}/print/${printPath}`);
    await page.emulateMediaType('print');

    const pdf = await page.pdf({
      format: 'A4',
      landscape: false,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
    });

    return pdf;
  } finally {
    await browser.close();
  }
};
