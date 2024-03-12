const TaxRow = ({ sanitizedInvoice, num }) => {
  if (sanitizedInvoice[`sum${num}`] !== 0) {
    return (
      <tr>
        <td>消費税（{num}%）</td>
        <td className='text-right'>
          &yen; {sanitizedInvoice[`sum${num}`].toLocaleString()}
        </td>
        <td className='text-right'>
          {sanitizedInvoice.tax_incl ? '(' : ''}&yen;{' '}
          {sanitizedInvoice[`tax${num}`].toLocaleString()}
          {sanitizedInvoice.tax_incl ? ')' : ''}
        </td>
      </tr>
    );
  }
};

export default TaxRow;
