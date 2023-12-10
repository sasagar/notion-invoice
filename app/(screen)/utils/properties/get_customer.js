import { Client } from "@notionhq/client";
import { plain_text } from "./plain_text";

export const get_customer = async (pageId) => {
    const notion = new Client({ auth: process.env.NOTION_API_KEY })
    const customer = await notion.pages.retrieve({ page_id: pageId })
    return plain_text(customer.properties['会社名'])
}
