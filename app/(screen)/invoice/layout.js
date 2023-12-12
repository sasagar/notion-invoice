import InvoiceSidebar from "./components/sidebar";

export const revalidate = 30 // キャッシュの有効期限30秒

export const generateMetadata = async () => {
    return {
        title: "Invoice | BKTSK Notion Invoice",
        robots: {
            index: false,
        }
    }
}

const invoiceLayout = ({
    children
}) => {
    return (
        <>
            <InvoiceSidebar />
            <section className="invoice-layout min-h-full ml-[20%] w-full">
                {children}
            </section>
        </>
    )
}

export default invoiceLayout;