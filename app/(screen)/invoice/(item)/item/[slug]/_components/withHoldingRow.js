const WithHoldingRow = ({ sanitizedInvoice }) => {
  if (
    !sanitizedInvoice.withholding_flag ||
    sanitizedInvoice.withholding !== 0
  ) {
    return (
      <tr>
        <td>源泉徴収</td>
        <td className='text-right'>
          ▲ &yen; {(sanitizedInvoice.withholding * -1).toLocaleString()}
        </td>
      </tr>
    );
  }
};

export default WithHoldingRow;
