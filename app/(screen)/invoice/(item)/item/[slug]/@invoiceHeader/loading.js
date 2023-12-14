const InvoiceHeaderLoading = () => {
    return (
        <section className="rounded border border-slate-600 bg-slate-900 px-6 py-4 flex justify-between items-center mb-5 gap-6">
            <div className="">
                <div className="flex justify-start items-center gap-5 flex-wrap">
                    <div className="skeleton rounded h-8 w-60"></div>
                    <div className="skeleton rounded-full h-7 w-32"></div>
                </div>
                <div className="mt-5">
                    <div className="skeleton rounded h-8 w-48"></div>
                </div>
            </div>
            <div className="flex flex-col items-end gap-2">
                <div className="skeleton rounded-full h-4 w-32"></div>
                <div className="skeleton rounded-full h-4 w-60"></div>
            </div>
        </section>
    )
}

export default InvoiceHeaderLoading;