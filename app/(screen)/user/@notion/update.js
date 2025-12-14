"use server"
import { cookies } from 'next/headers'
import { createClient } from "../../_utils/supabase/server"
import cryptoCredentials from "../../_utils/crypto/cryptoCredentials";

export const updateNotion = async (formData) => {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const notion_db_id = formData.get("notion_db_id");
    const notion_api_key = formData.get("notion_api_key");

    const { db_id, api_key } = cryptoCredentials({ db_id: notion_db_id, api_key: notion_api_key });

    const { data, error } = await supabase.from("notion").upsert({ db_id, api_key });
    if (error) {
        console.error(error);
        return;
    }
    if (data) {
        console.log("[data]");
        console.log(data);
    }
}

