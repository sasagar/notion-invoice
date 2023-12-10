'use client'
import { useEffect } from "react";

import { plain_text } from "../../utils/properties/plain_text";
import { SlCloudDownload } from "react-icons/sl";

const PdfDownload = ({ number, customer, account }) => {
    return (
        <>
            <a
                href={`/api/print/${number}`}
                download={`${plain_text(customer.properties['社名/個人名'])}${plain_text(customer.properties['敬称'])}_請求書_${plain_text(account.properties['スラッグ'])}_${number}.pdf`}
                className="flex items-center justify-start gap-2 rounded-md border border-green-700 text-green-100 bg-green-600 hover:bg-green-500 px-3 py-2 w-fit transition-all"
            >
                <SlCloudDownload />ダウンロード
            </a>
        </>
    );
}

export default PdfDownload;