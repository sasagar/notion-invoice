import { headers } from 'next/headers';
import './print.css';

export async function generateMetadata() {
    const headersList = headers();

    const url = headersList.get("x-url") || null;
    const pathName = url.replace(/\\/g, '/').replace(/^[^/]*\/\/[^/]*/, '').replace(/[?#].*?$/, '');
    const pathNameArray = pathName.split("/");

    return {
        title: `Invoice #${pathNameArray[3]} | BKTSK Notion Invoice`,
        robots: {
            index: false,
        }
    }
}

const invoicePrintLayout = ({
    children
}) => {
    return (
        <>
            <main className="">
                {children}
            </main>
        </>
    )
}

export default invoicePrintLayout;