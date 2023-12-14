const PrintWithHoldingTable = ({ sanitizedInvoice }) => {
    if (sanitizedInvoice.withholding !== 0) {
        return (
            <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">源泉徴収</h2>
                <table className="w-full">
                    <thead>
                        <tr>
                            <th>項目</th>
                            <th>対象額 (税抜)</th>
                            <th>税額</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>源泉徴収</td>
                            <td className="text-right">&yen; {sanitizedInvoice.tax_incl ? (sanitizedInvoice.sum10 + sanitizedInvoice.sum8 - sanitizedInvoice.tax).toLocaleString() : (sanitizedInvoice.sum10 + sanitizedInvoice.sum8).toLocaleString()}</td>
                            <td className="text-right">▲ &yen; {(sanitizedInvoice.withholding * -1).toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

export default PrintWithHoldingTable;