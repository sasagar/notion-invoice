import { NextResponse } from "next/server";

import puppeteer from "puppeteer";

export const GET = async (req) => {
    const origin = req.nextUrl.origin;
    const path = req.nextUrl.pathname.split("/");

    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    page.setExtraHTTPHeaders({
        'bktsk_notion_invoice': process.env.NOTION_API_KEY,
    })
    await page.goto(origin + "/print/invoice/" + path[path.length - 1]);
    await page.emulateMediaType("print");

    const pdf = await page.pdf({ format: "A4", landscape: false, margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" } });
    const headers = new Headers();

    headers.set("Content-Type", "application/pdf");

    await browser.close();
    // res.send("ok");
    return new NextResponse(pdf, { status: 200, statusText: "OK", headers });
}

