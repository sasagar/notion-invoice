import { headers } from "next/headers";

export async function generateMetadata() {
    const headersList = headers();

    const url = headersList.get("x-url") || null;
    const pathName = url.replace(/\\/g, '/').replace(/^[^/]*\/\/[^/]*/, '').replace(/[?#].*?$/, '');
    const pathNameArray = pathName.split("/");

    return {
        title: `Invoice #${pathNameArray[2]} | BKTSK Notion Invoice`,
    }
}

const invoiceSlugLayout = ({
    children
}) => {
    return (
        <>
            {children}
        </>
    )
}

export default invoiceSlugLayout;