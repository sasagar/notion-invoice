import TaxRow from "./taxRow";

const TaxTable = ({ sanitizedInvoice }) => {
    if ((sanitizedInvoice.tax10 + sanitizedInvoice.tax8) !== 0) {
        return (
            <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">消費税</h2>
                <table className="w-full">
                    <thead>
                        <tr>
                            <th>項目</th>
                            <th>対象額 {sanitizedInvoice.tax_incl ? "(税込)" : ""}</th>
                            <th>{sanitizedInvoice.tax_incl ? "内税額" : "税額"}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <TaxRow sanitizedInvoice={sanitizedInvoice} num="10" />
                        <TaxRow sanitizedInvoice={sanitizedInvoice} num="8" />
                    </tbody>
                </table>
            </div>
        )
    }

}

export default TaxTable;